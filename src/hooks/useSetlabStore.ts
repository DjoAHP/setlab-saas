import { useState, useCallback, useEffect } from "react";
import { db } from "../db/schema";
import type { Setlist, Song } from "../types";

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
    setSetlist((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...miseAJour, updatedAt: maintenant() };
      db.setlists.put(updated);
      return updated;
    });
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
        const data = JSON.parse(contenuJSON) as Partial<Setlist>;
        if (!setlist) return false;
        sauvegarder({
          bandName: data.bandName ?? setlist.bandName,
          songs: data.songs ?? setlist.songs ?? [],
        });
        return true;
      } catch {
        return false;
      }
    },
    [setlist, sauvegarder]
  );

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
  };
}
