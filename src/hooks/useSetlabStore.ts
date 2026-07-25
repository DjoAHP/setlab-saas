import { useState, useCallback, useEffect } from "react";
import { z } from "zod";
import { db } from "../db/schema";
import type { Setlist, Song } from "../types";

const SongSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  position: z.number().optional(),
  time: z.number().optional(),
  tonalite: z.string().optional(),
});

const SetlistImportSchema = z.object({
  bandName: z.string().optional(),
  stageTimeLimit: z.number().nullable().optional(),
  songs: z.array(SongSchema).optional(),
  setlistSongs: z.array(SongSchema).optional(),
});

function genererID(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function maintenant(): string {
  return new Date().toISOString();
}

export function useSetlabStore() {
  const [setlist, setSetlist] = useState<Setlist | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger ou créer la setlist au démarrage
  useEffect(() => {
    async function load() {
      const all = await db.setlists.toArray();
      if (all.length > 0) {
        setSetlist(all[0]);
      } else {
        const newSetlist: Setlist = {
          id: genererID(),
          bandName: "Mon groupe",
          stageTimeLimit: null,
          songs: [],
          userId: null,
          createdAt: maintenant(),
          updatedAt: maintenant(),
        };
        await db.setlists.add(newSetlist);
        setSetlist(newSetlist);
      }
      setLoading(false);
    }
    load();
  }, []);

  const sauvegarder = useCallback(async (miseAJour: Partial<Setlist>) => {
    let updated: Setlist | null = null;
    setSetlist((prev) => {
      if (!prev) return prev;
      updated = { ...prev, ...miseAJour, updatedAt: maintenant() };
      return updated;
    });
    if (updated) {
      try {
        await db.setlists.put(updated);
      } catch (err) {
        console.error("Erreur lors de la sauvegarde Dexie :", err);
      }
    }
  }, []);

  const setBandName = useCallback(
    (name: string) => sauvegarder({ bandName: name }),
    [sauvegarder]
  );

  const setStageTimeLimit = useCallback(
    (limit: number | null) => sauvegarder({ stageTimeLimit: limit }),
    [sauvegarder]
  );

  const addSong = useCallback(
    (title: string) => {
      if (!setlist) return;
      const newSong: Song = {
        id: genererID(),
        title,
        position: (setlist.songs?.length ?? 0) + 1,
      };
      sauvegarder({ songs: [...(setlist.songs ?? []), newSong] });
    },
    [setlist, sauvegarder]
  );

  const updateSong = useCallback(
    (songId: string, updates: Partial<Song>) => {
      if (!setlist?.songs) return;
      sauvegarder({
        songs: setlist.songs.map((s) => (s.id === songId ? { ...s, ...updates } : s)),
      });
    },
    [setlist, sauvegarder]
  );

  const deleteSong = useCallback(
    (songId: string) => {
      if (!setlist?.songs) return;
      sauvegarder({
        songs: setlist.songs
          .filter((s) => s.id !== songId)
          .map((s, i) => ({ ...s, position: i + 1 })),
      });
    },
    [setlist, sauvegarder]
  );

  const reorderSong = useCallback(
    (songId: string, newPosition: number) => {
      if (!setlist?.songs) return;
      const songs = [...setlist.songs];
      const songIndex = songs.findIndex((s) => s.id === songId);
      if (songIndex === -1) return;
      const [song] = songs.splice(songIndex, 1);
      songs.splice(Math.min(newPosition - 1, songs.length), 0, song);
      sauvegarder({
        songs: songs.map((s, i) => ({ ...s, position: i + 1 })),
      });
    },
    [setlist, sauvegarder]
  );

  const importerSetlist = useCallback(
    (contenuJSON: string): boolean => {
      try {
        const rawData = JSON.parse(contenuJSON);
        const result = SetlistImportSchema.safeParse(rawData);
        if (!result.success || !setlist) return false;

        const data = result.data;
        const rawSongs = data.songs ?? data.setlistSongs ?? [];
        const songsProcessed: Song[] = rawSongs.map((s, idx) => ({
          id: s.id || genererID(),
          title: s.title,
          position: s.position ?? idx + 1,
          time: s.time,
          tonalite: s.tonalite,
        }));

        sauvegarder({
          bandName: data.bandName ?? setlist.bandName,
          stageTimeLimit: data.stageTimeLimit !== undefined ? data.stageTimeLimit : setlist.stageTimeLimit,
          songs: songsProcessed,
        });
        return true;
      } catch {
        return false;
      }
    },
    [setlist, sauvegarder]
  );

  const exporterSetlist = useCallback(() => {
    if (!setlist) return;
    const exportData = {
      bandName: setlist.bandName,
      stageTimeLimit: setlist.stageTimeLimit,
      songs: setlist.songs ?? [],
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(setlist.bandName || "setlist").replace(/\s+/g, "_")}.tl`;
    a.click();
    URL.revokeObjectURL(url);
  }, [setlist]);

  return {
    setlist,
    loading,
    setBandName,
    setStageTimeLimit,
    addSong,
    updateSong,
    deleteSong,
    reorderSong,
    importerSetlist,
    exporterSetlist,
  };
}
