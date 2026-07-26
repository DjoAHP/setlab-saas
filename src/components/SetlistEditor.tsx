import { useState, useCallback, useRef, useEffect } from "react";
import { useSetlab } from "../context/SetlabContext";
import type { Song } from "../types";

const TONALITES = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
  "Cm", "C#m", "Dm", "D#m", "Em", "Fm", "F#m", "Gm", "G#m", "Am", "A#m", "Bm",
];

const timeSelectStyle: React.CSSProperties = {
    width: "58px",
    background: "hsl(222, 18%, 14%)",
    border: "1px solid hsl(220, 15%, 22%)",
    borderRadius: "4px",
    color: "hsl(220, 15%, 50%)",
    fontSize: "11px",
    padding: "2px 4px",
    textAlign: "center",
    flexShrink: 0,
    cursor: "pointer",
  };

export function SetlistEditor() {
  const {
    setlist, setBandName, setStageTimeLimit,
    addSong, updateSong, deleteSong, reorderSong, importerSetlist, exporterSetlist,
  } = useSetlab();

  const [newSongTitle, setNewSongTitle] = useState("");
  const [editingSongId, setEditingSongId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [stageMinutes, setStageMinutes] = useState("");
  const [stageSeconds, setStageSeconds] = useState("");
  const [stageEnabled, setStageEnabled] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [ordreModalOuverte, setOrdreModalOuverte] = useState(false);

  const [dragFromIndex, setDragFromIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dropPosition, setDropPosition] = useState<"before" | "after" | null>(null);
  const touchDragId = useRef<string | null>(null);
  const touchStartY = useRef(0);

  const songs = [...(setlist?.songs ?? [])].sort((a, b) => a.position - b.position);
  const songCount = songs.length;

  // Initialiser le champ temps de scène depuis les données
  useEffect(() => {
    if (setlist?.stageTimeLimit != null) {
      setStageEnabled(true);
      setStageMinutes(Math.floor(setlist.stageTimeLimit / 60).toString());
      setStageSeconds((setlist.stageTimeLimit % 60).toString());
    } else {
      setStageEnabled(false);
      setStageMinutes("");
      setStageSeconds("");
    }
  }, [setlist?.stageTimeLimit]);

  const handleAddSong = useCallback(() => {
    if (newSongTitle.trim()) {
      addSong(newSongTitle.trim());
      setNewSongTitle("");
    }
  }, [newSongTitle, addSong]);

  const handleStageToggle = useCallback((enabled: boolean) => {
    setStageEnabled(enabled);
    if (!enabled) {
      setStageMinutes("");
      setStageSeconds("");
      setStageTimeLimit(null);
    }
  }, [setStageTimeLimit]);

  const handleStageApply = useCallback(() => {
    const m = parseInt(stageMinutes, 10) || 0;
    const s = parseInt(stageSeconds, 10) || 0;
    setStageTimeLimit(m * 60 + s);
  }, [stageMinutes, stageSeconds, setStageTimeLimit]);

  const handleStartEdit = useCallback((song: Song) => {
    setEditingSongId(song.id);
    setEditTitle(song.title);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (editingSongId && editTitle.trim()) {
      updateSong(editingSongId, { title: editTitle.trim() });
    }
    setEditingSongId(null);
  }, [editingSongId, editTitle, updateSong]);

  const handleCancelEdit = useCallback(() => {
    setEditingSongId(null);
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDragFromIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (index === dragFromIndex) return;
    setDragOverIndex(index);
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    setDropPosition(e.clientY < rect.top + rect.height / 2 ? "before" : "after");
  }, [dragFromIndex]);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
    setDropPosition(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetIndex: number) => {
      e.preventDefault();
      const sourceIndex = dragFromIndex;
      if (sourceIndex === null || sourceIndex === targetIndex) {
        setDragFromIndex(null);
        setDragOverIndex(null);
        setDropPosition(null);
        return;
      }
      const ordered = [...songs];
      const [moved] = ordered.splice(sourceIndex, 1);
      let insertAt = targetIndex;
      if (dropPosition === "after") insertAt = targetIndex + 1;
      if (sourceIndex < targetIndex) insertAt = Math.max(insertAt - 1, 0);
      ordered.splice(insertAt, 0, moved);
      const reindexed = ordered.map((s, i) => ({ ...s, position: i + 1 }));
      reorderSong(reindexed);
      setDragFromIndex(null);
      setDragOverIndex(null);
      setDropPosition(null);
    },
    [songs, reorderSong, dragFromIndex, dropPosition]
  );

  const handleDragEnd = useCallback(() => {
    setDragFromIndex(null);
    setDragOverIndex(null);
    setDropPosition(null);
  }, []);

  const handleTouchStartOrdre = useCallback((e: React.TouchEvent, index: number) => {
    const song = songs[index];
    if (!song) return;
    touchDragId.current = song.id;
    touchStartY.current = e.touches[0].clientY;
    setDragFromIndex(index);
  }, [songs]);

  const handleTouchMoveOrdre = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!el) return;
    const row = (el as HTMLElement).closest("[data-order-index]") as HTMLElement | null;
    if (row) {
      const overIndex = Number(row.getAttribute("data-order-index"));
      if (!isNaN(overIndex) && overIndex !== dragFromIndex) {
        setDragOverIndex(overIndex);
        const rect = row.getBoundingClientRect();
        setDropPosition(touch.clientY < rect.top + rect.height / 2 ? "before" : "after");
      }
    }
  }, [dragFromIndex]);

  const handleTouchEndOrdre = useCallback(() => {
    const srcIndex = dragFromIndex;
    const tgtIndex = dragOverIndex;
    if (srcIndex !== null && tgtIndex !== null && srcIndex !== tgtIndex) {
      const ordered = [...songs];
      const [moved] = ordered.splice(srcIndex, 1);
      let insertAt = tgtIndex;
      if (dropPosition === "after") insertAt = tgtIndex + 1;
      if (srcIndex < tgtIndex) insertAt = Math.max(insertAt - 1, 0);
      ordered.splice(insertAt, 0, moved);
      const reindexed = ordered.map((s, i) => ({ ...s, position: i + 1 }));
      reorderSong(reindexed);
    }
    setDragFromIndex(null);
    setDragOverIndex(null);
    setDropPosition(null);
    touchDragId.current = null;
  }, [dragFromIndex, dragOverIndex, dropPosition, songs, reorderSong]);

  // ESC pour fermer les modales
  useEffect(() => {
    if (!deleteConfirmId && !ordreModalOuverte) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setDeleteConfirmId(null); setOrdreModalOuverte(false); } };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [deleteConfirmId, ordreModalOuverte]);

  const handleImporter = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".tl,.json";
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const fichier = target.files?.[0];
      if (!fichier) return;
      const lecteur = new FileReader();
      lecteur.onload = (ev) => {
        const contenu = (ev.target as FileReader).result as string;
        const success = importerSetlist(contenu);
        if (!success) {
          window.alert("Fichier invalide. Vérifiez que c'est un fichier Setlist (.tl)");
        }
      };
      lecteur.readAsText(fichier);
    };
    input.click();
  }, [importerSetlist]);

  const getMinutes = (secs: number | undefined): string => secs ? Math.floor(secs / 60).toString() : "";
  const getSeconds = (secs: number | undefined): string => secs ? (secs % 60).toString() : "";

  const inputStyle: React.CSSProperties = {
    background: "transparent",
    border: "1px solid hsl(220, 15%, 22%)",
    color: "white",
    outline: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    fontSize: "13px",
    width: "100%",
  };

  return (
    <div
      className="flex flex-col h-full flex-shrink-0"
      style={{
        width: "100%",
        height: "100%",
        background: "hsl(222, 20%, 11%)",
        borderRight: "1px solid hsl(220, 15%, 18%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* En-tête avec logo */}
      <div style={{ padding: "10px 12px", borderBottom: "1px solid hsl(220, 15%, 16%)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "hsl(220, 15%, 45%)" }}>
            Setlist
          </span>
          <span style={{ color: "hsl(220, 15%, 28%)", fontSize: "11px" }}>|</span>
          <button
            onClick={exporterSetlist}
            title="Exporter la setlist (.tl)"
            style={{
              background: "hsl(222, 18%, 17%)",
              border: "1px solid hsl(220, 15%, 22%)",
              color: "white",
              padding: "2px 8px",
              borderRadius: "6px",
              fontSize: "11px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "hsl(222, 18%, 20%)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "hsl(222, 18%, 17%)"; }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export .tl
          </button>
        </div>
        <img src="/assets/logo.svg" alt="SetLab" width="24" height="24" style={{ filter: "brightness(0) invert(1)", opacity: 0.8 }} />
      </div>

      {/* Zone défilable */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div style={{ padding: "10px", display: "flex", flexDirection: "column", gap: "10px", minHeight: 0, minWidth: 0 }}>
          {/* Input Band Name */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", color: "hsl(220, 15%, 50%)" }}>Groupe</label>
            <input
              type="text"
              value={setlist?.bandName ?? ""}
              onChange={(e) => setBandName(e.target.value)}
              placeholder="Nom du groupe..."
              style={inputStyle}
            />
          </div>

          {/* Temps de scène */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <label style={{ fontSize: "11px", color: "hsl(220, 15%, 50%)" }}>
                  Temps de scène
                </label>
                <button
                  onClick={() => handleStageToggle(!stageEnabled)}
                  style={{
                    width: "32px",
                    height: "20px",
                    borderRadius: "10px",
                    border: "none",
                    cursor: "pointer",
                    position: "relative",
                    background: stageEnabled ? "hsl(var(--tl-accent-button))" : "hsl(220, 15%, 22%)",
                    transition: "background 0.2s",
                  }}
                >
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      background: "white",
                      position: "absolute",
                      top: "2px",
                      left: stageEnabled ? "14px" : "2px",
                      transition: "left 0.2s",
                    }}
                  />
                </button>
              </div>
              </div>
            {stageEnabled && (
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <input
                  type="number"
                  min="0"
                  max="999"
                  value={stageMinutes}
                  onChange={(e) => setStageMinutes(e.target.value)}
                  onBlur={handleStageApply}
                  placeholder="MM"
                  style={{ ...inputStyle, width: "70px", textAlign: "center", fontSize: "13px" }}
                />
                <span style={{ color: "hsl(220, 15%, 45%)", fontSize: "14px" }}>:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={stageSeconds}
                  onChange={(e) => setStageSeconds(e.target.value)}
                  onBlur={handleStageApply}
                  placeholder="SS"
                  style={{ ...inputStyle, width: "70px", textAlign: "center", fontSize: "13px" }}
                />
              </div>
            )}
          </div>

          {/* Séparateur */}
          <div style={{ height: "1px", background: "hsl(220, 15%, 18%)" }} />

          {/* Input Nouveau morceau */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", color: "hsl(220, 15%, 50%)" }}>Morceau</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                value={newSongTitle}
                onChange={(e) => setNewSongTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddSong()}
                placeholder="Titre du morceau..."
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={() => setOrdreModalOuverte(true)}
                style={{
                  width: "40px",
                  height: "40px",
                  minWidth: "40px",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "hsl(222, 18%, 17%)",
                  border: "1px solid hsl(220, 15%, 22%)",
                  color: "white",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
                title="Réordonner les morceaux"
              >
                <img src="/assets/ordre.svg" alt="Ordre" width="20" height="20" style={{ filter: "brightness(0) invert(1)" }} />
              </button>
              <button
                onClick={handleAddSong}
                disabled={!newSongTitle.trim()}
                style={{
                  width: "40px", height: "40px", minWidth: "40px", padding: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: !newSongTitle.trim() ? "hsl(222, 18%, 14%)" : "hsl(var(--tl-accent-button))",
                  border: "1px solid hsl(220, 15%, 22%)",
                  color: !newSongTitle.trim() ? "hsl(220, 15%, 30%)" : "white",
                  borderRadius: "8px", fontSize: "18px", fontWeight: "bold",
                  cursor: !newSongTitle.trim() ? "not-allowed" : "pointer",
                  opacity: !newSongTitle.trim() ? 0.5 : 1,
                }}
              >
                +
              </button>
            </div>
          </div>

          {/* Compteur */}
          <div style={{ textAlign: "center", fontSize: "11px", color: "hsl(220, 15%, 40%)", padding: "4px 0" }}>
            {songCount} morceau{songCount > 1 ? "x" : ""}
          </div>

          {/* Liste des morceaux */}
          {songCount > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {songs.map((song) => (
                <div
                  key={song.id}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "6px 8px", borderRadius: "6px",
                    background: "transparent",
                    transition: "background 0.15s",
                  }}
                >
                  {/* Tonalité */}
                  <select
                    value={song.tonalite ?? ""}
                    onChange={(e) => updateSong(song.id, { tonalite: e.target.value || undefined })}
                    style={{
                      width: "42px", background: "hsl(222, 18%, 14%)",
                      border: song.tonalite ? "1px solid hsl(220, 15%, 25%)" : "1px solid hsl(220, 15%, 18%)",
                      borderRadius: "4px", color: song.tonalite ? "hsl(220, 15%, 70%)" : "hsl(220, 15%, 30%)",
                      fontSize: "10px", fontFamily: "monospace", textAlign: "center", flexShrink: 0,
                      outline: "none", cursor: "pointer", padding: "2px 0",
                    }}
                  >
                    <option value="">-</option>
                    {TONALITES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>

                  {/* Titre + temps */}
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                    {editingSongId === song.id ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", flex: 1, minWidth: 0 }}>
                        <span style={{ color: "hsl(220, 15%, 40%)", fontSize: "10px", flexShrink: 0 }}>
                          {song.position.toString().padStart(2, '0')}.
                        </span>
                        <input
                          autoFocus
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={handleSaveEdit}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit();
                            if (e.key === "Escape") handleCancelEdit();
                          }}
                          style={{
                            flex: 1, background: "transparent", border: "none",
                            borderBottom: "2px solid #333", color: "white",
                            fontSize: "12px", outline: "none",
                          }}
                        />
                      </div>
                    ) : (
                      <span
                        onClick={() => handleStartEdit(song)}
                        style={{
                          flex: 1, fontSize: "12px", color: "hsl(220, 15%, 70%)",
                          cursor: "pointer", overflow: "hidden",
                          textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}
                      >
                        <span style={{ color: "hsl(220, 15%, 40%)", marginRight: "4px", fontSize: "10px" }}>
                          {song.position.toString().padStart(2, '0')}.
                        </span>
                        {song.title}
                      </span>
                    )}

                    {/* Select temps */}
                    <div style={{ display: "flex", gap: "2px", flexShrink: 0, alignItems: "center" }}>
                      <select
                        value={getMinutes(song.time)}
                        onChange={(e) => {
                          const m = parseInt(e.target.value, 10);
                          const s = song.time ? song.time % 60 : 0;
                          updateSong(song.id, { time: m * 60 + s });
                        }}
                        style={timeSelectStyle}
                      >
                        {Array.from({ length: 31 }, (_, i) => (
                          <option key={i} value={i}>{i} min</option>
                        ))}
                      </select>
                      <span style={{ color: "hsl(220, 15%, 30%)", fontSize: "11px" }}>:</span>
                      <select
                        value={getSeconds(song.time)}
                        onChange={(e) => {
                          const s = parseInt(e.target.value, 10);
                          const m = song.time ? Math.floor(song.time / 60) : 0;
                          updateSong(song.id, { time: m * 60 + s });
                        }}
                        style={timeSelectStyle}
                      >
                        {Array.from({ length: 60 }, (_, i) => (
                          <option key={i} value={i}>{i}s</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Supprimer */}
                  <button
                    onClick={() => setDeleteConfirmId(song.id)}
                    style={{
                      background: "none", border: "none", color: "hsl(220, 15%, 30%)",
                      cursor: "pointer", padding: "2px", fontSize: "12px", flexShrink: 0,
                    }}
                    onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.color = "hsl(0, 70%, 60%)"; }}
                    onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.color = "hsl(220, 15%, 30%)"; }}
                    title="Supprimer"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Boutons en bas */}
      <div style={{ padding: "10px", borderTop: "1px solid hsl(220, 15%, 18%)", flexShrink: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
        <button
          onClick={handleImporter}
          style={{
            background: "hsl(222, 18%, 17%)", border: "1px solid hsl(220, 15%, 22%)",
            color: "white", padding: "10px 16px", borderRadius: "8px",
            fontSize: "13px", cursor: "pointer", width: "100%",
          }}
        >
          Importer .tl
        </button>
        <button
          onClick={() => {
            if (window.innerWidth < 768) {
              window.dispatchEvent(new CustomEvent("setlab-export-pdf"));
            } else {
              window.print();
            }
          }}
          style={{
            background: "hsl(var(--tl-accent-button))", border: "1px solid hsl(var(--tl-accent-button-border))",
            color: "white", padding: "10px 16px", borderRadius: "8px",
            fontSize: "13px", cursor: "pointer", width: "100%",
          }}
        >
          Exporter PDF
        </button>
      </div>

      {/* Modal ordre */}
      {ordreModalOuverte && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(10, 12, 20, 0.82)", backdropFilter: "blur(4px)",
          }}
          onClick={() => setOrdreModalOuverte(false)}
        >
          <div
            style={{
              background: "hsl(222, 22%, 12%)", border: "1px solid hsl(220, 15%, 22%)",
              borderRadius: "12px", width: "min(90vw, 360px)", maxHeight: "80vh",
              display: "flex", flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "16px 20px", borderBottom: "1px solid hsl(220, 15%, 18%)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "hsl(210, 30%, 90%)", fontSize: "14px", fontWeight: 600 }}>Ordre des morceaux</span>
              <button onClick={() => setOrdreModalOuverte(false)} style={{ background: "none", border: "none", color: "hsl(220, 15%, 45%)", cursor: "pointer", fontSize: "16px" }}>✕</button>
            </div>
            <div style={{ overflowY: "auto", flex: 1, padding: "8px 0", position: "relative" }}>
              {songs.map((song, index) => {
                const isBefore = dragOverIndex === index && dropPosition === "before" && dragFromIndex !== index;
                const isAfter = dragOverIndex === index && dropPosition === "after" && dragFromIndex !== index;
                return (
                <div
                  key={song.id}
                  data-order-index={index}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    padding: "12px 16px",
                    cursor: "grab",
                    background: dragFromIndex === index ? "rgba(255,255,255,0.02)" : "transparent",
                    opacity: dragFromIndex === index ? 0.4 : 1,
                    touchAction: "auto", userSelect: "none",
                    position: "relative",
                    borderTop: isBefore ? "2px solid hsl(var(--tl-accent-button-border))" : "2px solid transparent",
                    borderBottom: isAfter ? "2px solid hsl(var(--tl-accent-button-border))" : index < songs.length - 1 ? "1px solid hsl(220, 15%, 16%)" : "none",
                  }}
                >
                  <span
                    onTouchStart={(e) => handleTouchStartOrdre(e, index)}
                    onTouchMove={handleTouchMoveOrdre}
                    onTouchEnd={handleTouchEndOrdre}
                    style={{ display: "flex", alignItems: "center", cursor: "grab", touchAction: "none" }}
                  >
                    <svg width="18" height="28" viewBox="0 0 12 18" fill="currentColor" style={{ color: "hsl(220, 15%, 35%)", display: "block", pointerEvents: "none" }}>
                      <circle cx="3" cy="3" r="1.8" />
                      <circle cx="9" cy="3" r="1.8" />
                      <circle cx="3" cy="9" r="1.8" />
                      <circle cx="9" cy="9" r="1.8" />
                      <circle cx="3" cy="15" r="1.8" />
                      <circle cx="9" cy="15" r="1.8" />
                    </svg>
                  </span>
                  <span style={{ color: "hsl(220, 15%, 40%)", fontSize: "13px", fontFamily: "monospace", flexShrink: 0, width: "28px" }}>
                    {song.position.toString().padStart(2, '0')}.
                  </span>
                  <span style={{ flex: 1, color: "hsl(210, 30%, 85%)", fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {song.title}
                  </span>
                </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation suppression */}
      {deleteConfirmId && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(10, 12, 20, 0.82)", backdropFilter: "blur(4px)",
          }}
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            style={{
              background: "hsl(222, 22%, 12%)", border: "1px solid hsl(220, 15%, 22%)",
              borderRadius: "12px", padding: "24px", width: "280px",
              display: "flex", flexDirection: "column", gap: "16px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ color: "hsl(210, 30%, 90%)", fontSize: "14px", fontWeight: 600, textAlign: "center" }}>
              Supprimer ce morceau ?
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={() => setDeleteConfirmId(null)}
                style={{
                  flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid hsl(220, 15%, 24%)",
                  background: "hsl(222, 18%, 18%)", color: "hsl(220, 15%, 60%)", fontSize: "13px", cursor: "pointer",
                }}
              >
                Annuler
              </button>
              <button
                onClick={() => { deleteSong(deleteConfirmId); setDeleteConfirmId(null); }}
                style={{
                  flex: 1, padding: "10px", borderRadius: "8px", border: "none",
                  background: "hsl(0, 60%, 35%)", color: "white", fontSize: "13px", cursor: "pointer",
                }}
              >
                Oui
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}