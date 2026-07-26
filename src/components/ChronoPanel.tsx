import { useState, useEffect, useCallback, useRef } from "react";
import { useSetlab } from "../context/SetlabContext";
import chronoService, { type ChronoServiceState } from "../services/chronoService";
import { SyncIndicator } from "./sync/SyncIndicator";

export function ChronoPanel() {
  const { setlist, updateSong } = useSetlab();
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [display, setDisplay] = useState({ minutes: 0, seconds: 0 });
  const [selectedSongId, setSelectedSongId] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastSong, setToastSong] = useState("");
  const [songDropdownOpen, setSongDropdownOpen] = useState(false);
  const songDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (songDropdownRef.current && !songDropdownRef.current.contains(e.target as Node)) {
        setSongDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    const listener = (state: ChronoServiceState) => {
      setIsRunning(state.isRunning);
      setElapsedMs(state.elapsedMs);
      setDisplay(state.display);
    };
    chronoService.onUpdate(listener);
    return () => chronoService.offUpdate(listener);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        if (isRunning) chronoService.stop();
        else chronoService.start();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isRunning]);

  const songs = [...(setlist?.songs ?? [])].sort((a, b) => a.position - b.position);
  const selectedSong = songs.find((s) => s.id === selectedSongId);

  const handleTransfert = useCallback(() => {
    if (!selectedSongId || elapsedMs === 0) return;
    const newTime = Math.floor(elapsedMs / 1000);
    updateSong(selectedSongId, { time: newTime });
    const song = songs.find((s) => s.id === selectedSongId);
    setToastSong(song?.title ?? "");
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  }, [selectedSongId, elapsedMs, updateSong, songs]);

  const formatMs = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    return `${Math.floor(totalSec / 60).toString().padStart(2, '0')}:${(totalSec % 60).toString().padStart(2, '0')}`;
  };

  const buttonStyle: React.CSSProperties = {
    padding: "8px 16px", borderRadius: "8px", border: "1px solid",
    cursor: "pointer", fontSize: "13px", transition: "all 200ms ease-out",
  };

  return (
    <div
      style={{
        width: "100%", height: "100%",
        background: "hsl(222, 20%, 11%)",
        borderLeft: "1px solid hsl(220, 15%, 18%)",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}
    >
      {/* Sync + Profil */}
      <SyncIndicator />
      {/* En-tête */}
      <div style={{ padding: "10px 12px", borderBottom: "1px solid hsl(220, 15%, 16%)", flexShrink: 0 }}>
        <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "hsl(220, 15%, 45%)" }}>
          Chronomètre
        </span>
      </div>

      <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 12px", gap: "16px" }}>
        {/* Cercle LED compact */}
        <div
          style={{
            width: "min(200px, 70vw)", height: "min(200px, 70vw)", borderRadius: "50%",
            border: "3px solid hsl(220, 15%, 25%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "hsl(222, 20%, 10%)",
            boxShadow: "0 0 40px rgba(29, 113, 149, 0.15), inset 0 0 30px rgba(0, 0, 0, 0.3)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "monospace", fontWeight: 700, fontSize: "min(48px, 16vw)",
              letterSpacing: "2px", color: "hsl(var(--tl-accent-text))",
              textShadow: "0 0 6px hsl(var(--tl-accent-text)), 0 0 12px hsl(var(--tl-accent-text) / 0.6)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <span>{display.minutes.toString().padStart(2, "0")}</span>
            <span style={{ fontSize: "min(48px, 16vw)", margin: "0 1px" }}>:</span>
            <span>{display.seconds.toString().padStart(2, "0")}</span>
          </div>
        </div>

        {/* Indicateur état */}
        <div style={{ textAlign: "center", color: "hsl(220, 15%, 40%)", fontSize: "11px" }}>
          {isRunning ? "En cours..." : elapsedMs > 0 ? "Arrêté" : "Prêt"}
          <br />
          <span style={{ fontSize: "10px", color: "hsl(220, 15%, 30%)" }}>Espace : Démarrer / Arrêter</span>
        </div>

        {/* Contrôles */}
        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
          {!isRunning ? (
            <button
              onClick={() => chronoService.start()}
              style={{ ...buttonStyle, background: "hsl(var(--tl-accent-button))", borderColor: "hsl(var(--tl-accent-button-border))", color: "white" }}
            >
              ▶ Démarrer
            </button>
          ) : (
            <button
              onClick={() => chronoService.stop()}
              style={{ ...buttonStyle, background: "hsl(0, 60%, 35%)", borderColor: "hsl(0, 60%, 45%)", color: "white" }}
            >
              ⏸ Arrêter
            </button>
          )}
          <button
            onClick={() => chronoService.reset()}
            style={{ ...buttonStyle, background: "hsl(220, 15%, 20%)", borderColor: "hsl(220, 15%, 30%)", color: "hsl(220, 15%, 70%)" }}
          >
            ↺ Réinitialiser
          </button>
        </div>

        {/* Transfert inline */}
        <div
          style={{
            width: "100%", borderTop: "1px solid hsl(220, 15%, 18%)", paddingTop: "12px",
            display: "flex", flexDirection: "column", gap: "8px",
          }}
        >
          <span style={{ fontSize: "11px", color: "hsl(220, 15%, 50%)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Temps mesuré : <span style={{ color: "hsl(var(--tl-accent-text))", fontFamily: "monospace", fontSize: "13px" }}>{formatMs(elapsedMs)}</span>
          </span>

          <div ref={songDropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setSongDropdownOpen(!songDropdownOpen)}
              style={{
                width: "100%", padding: "8px 10px", borderRadius: "8px",
                background: "hsl(222, 18%, 14%)", border: "1px solid hsl(220, 15%, 22%)",
                color: selectedSong ? "white" : "hsl(220, 15%, 45%)",
                fontSize: "12px", cursor: "pointer", textAlign: "left",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedSong
                  ? `${selectedSong.position.toString().padStart(2, "0")}. ${selectedSong.title}`
                  : "Sélectionner un morceau..."}
              </span>
              {selectedSong && selectedSong.time ? (
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'hsl(var(--tl-accent-text))',
                  boxShadow: '0 0 6px hsl(var(--tl-accent-text))',
                  flexShrink: 0,
                }} />
              ) : null}
              <span style={{ fontSize: 10, color: 'hsl(220, 15%, 45%)' }}>{songDropdownOpen ? '▲' : '▼'}</span>
            </button>

            {songDropdownOpen && (
              <div
                style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, zIndex: 40,
                  background: 'hsl(222, 18%, 14%)', border: '1px solid hsl(220, 15%, 22%)',
                  borderRadius: 8, maxHeight: 200, overflowY: 'auto', padding: 4,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}
              >
                <button
                  onClick={() => { setSelectedSongId(""); setSongDropdownOpen(false); }}
                  style={{
                    width: '100%', padding: '8px 10px', border: 'none', borderRadius: 6,
                    background: 'transparent', color: 'hsl(220, 15%, 45%)',
                    fontSize: 12, cursor: 'pointer', textAlign: 'left',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(220, 15%, 18%)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  Sélectionner un morceau...
                </button>
                {songs.map((song) => (
                  <button
                    key={song.id}
                    onClick={() => { setSelectedSongId(song.id); setSongDropdownOpen(false); }}
                    style={{
                      width: '100%', padding: '8px 10px', border: 'none', borderRadius: 6,
                      background: selectedSongId === song.id ? 'hsl(198, 60%, 25%)' : 'transparent',
                      color: 'white', fontSize: 12, cursor: 'pointer', textAlign: 'left',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}
                    onMouseEnter={(e) => { if (selectedSongId !== song.id) e.currentTarget.style.background = 'hsl(220, 15%, 18%)'; }}
                    onMouseLeave={(e) => { if (selectedSongId !== song.id) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                      {song.position.toString().padStart(2, "0")}. {song.title}
                    </span>
                    {song.time ? (
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: 'hsl(var(--tl-accent-text))',
                        boxShadow: '0 0 6px hsl(var(--tl-accent-text))',
                        flexShrink: 0,
                      }} />
                    ) : null}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleTransfert}
            disabled={!selectedSongId || elapsedMs === 0}
            style={{
              width: "100%", padding: "8px 16px", borderRadius: "8px",
              border: "1px solid hsl(220, 15%, 22%)",
              background: (!selectedSongId || elapsedMs === 0) ? "hsl(222, 18%, 14%)" : "hsl(var(--tl-accent-button))",
              color: (!selectedSongId || elapsedMs === 0) ? "hsl(220, 15%, 30%)" : "white",
              cursor: (!selectedSongId || elapsedMs === 0) ? "not-allowed" : "pointer",
              fontSize: "13px", opacity: (!selectedSongId || elapsedMs === 0) ? 0.5 : 1,
            }}
          >
            Appliquer le temps
          </button>
        </div>
      </div>

      {/* Toast confirmation */}
      <div
        style={{
          position: "fixed", bottom: "80px", left: "50%", transform: "translateX(-50%)",
          background: "hsl(var(--tl-accent-button))", color: "white",
          padding: "8px 16px", borderRadius: "8px", fontSize: "12px",
          opacity: toastVisible ? 1 : 0, transition: "opacity 0.3s",
          pointerEvents: "none", zIndex: 200, whiteSpace: "nowrap",
        }}
      >
        ✓ Temps ajouté à « {toastSong} »
      </div>
    </div>
  );
}
