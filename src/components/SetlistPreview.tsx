import { useSetlab } from "../context/SetlabContext";
import { useRef, useEffect, useState, useCallback } from "react";

export function SetlistPreview() {
  const { setlist } = useSetlab();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [ready, setReady] = useState(false);

  const songs = [...(setlist?.songs ?? [])].sort((a, b) => a.position - b.position);
  const songCount = songs.length;

  const formatTime = (secs: number): string => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const tempsTotal = songs.reduce((acc, song) => acc + (song.time ?? 0), 0);

  const getTempsCouleur = (): string => {
    if (setlist?.stageTimeLimit == null) return "#888";
    const ratio = tempsTotal / setlist.stageTimeLimit;
    if (ratio > 1) return "#ef4444";
    if (ratio >= 0.9) return "#f59e0b";
    return "#22c55e";
  };

  const calculerDimensions = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const a4Ratio = 210 / 297;
    const paddingX = 32;
    const paddingY = 16;
    const espaceDispoLargeur = container.clientWidth - paddingX;
    const espaceDispoHauteur = container.clientHeight - paddingY;
    let newWidth = espaceDispoLargeur;
    let newHeight = newWidth / a4Ratio;
    if (newHeight > espaceDispoHauteur) {
      newHeight = espaceDispoHauteur;
      newWidth = newHeight * a4Ratio;
    }
    const a4PxLargeur = 210 * 3.78;
    const a4PxHauteur = 297 * 3.78;
    if (newWidth > a4PxLargeur || newHeight > a4PxHauteur) {
      newWidth = a4PxLargeur;
      newHeight = a4PxHauteur;
    }
    const minWidth = 300;
    if (newWidth < minWidth) {
      const ratio = minWidth / newWidth;
      newWidth = minWidth;
      newHeight = newHeight * ratio;
    }
    setDimensions({ width: Math.floor(newWidth), height: Math.floor(newHeight) });
    setReady(true);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    calculerDimensions();
    const resizeObserver = new ResizeObserver(() => calculerDimensions());
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [calculerDimensions]);

  if (!ready) {
    return (
      <div
        ref={containerRef}
        style={{ flex: 1, minWidth: 0, overflow: "auto", background: "hsl(222, 22%, 9%)" }}
      />
    );
  }
  return (
    <div
      ref={containerRef}
      style={{ flex: 1, minWidth: 0, overflow: "auto", background: "hsl(222, 22%, 9%)" }}
    >
      <div
        style={{
          display: "flex", justifyContent: "center", alignItems: "center",
          width: "100%", minHeight: "100%", padding: "8px 16px",
        }}
      >
        {/* FEUILLE A4 */}
        <div
          className="setlist-a4-container"
          style={{
            width: `${dimensions.width}px`, height: `${dimensions.height}px`,
            background: "white", borderRadius: "4px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            padding: `${Math.max(20, dimensions.height * 0.03)}px ${Math.max(30, dimensions.width * 0.06)}px`,
            display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0,
          }}
        >
          {/* Band Name */}
          <h1
            style={{
              textAlign: "center", fontSize: `${Math.max(24, dimensions.height * 0.04)}px`,
              fontWeight: "bold", color: "black", marginBottom: `${Math.max(10, dimensions.height * 0.015)}px`,
              fontFamily: "serif", flexShrink: 0,
            }}
          >
            {setlist?.bandName || "Nom du groupe"}
          </h1>

          {/* Séparation */}
          <div style={{ margin: `0 0 ${Math.max(10, dimensions.height * 0.015)}px 0`, flexShrink: 0 }}>
            <div style={{ height: "2px", background: "black" }} />
          </div>

          {/* Nombre de morceaux */}
          <div
            style={{
              textAlign: "center", fontSize: `${Math.max(10, dimensions.height * 0.012)}px`,
              color: "#888", marginBottom: `${Math.max(10, dimensions.height * 0.015)}px`,
              flexShrink: 0,
            }}
          >
            {songCount} morceau{songCount > 1 ? "x" : ""}
          </div>

          {/* Liste des morceaux */}
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {songCount > 0 ? (
              songs.map((song) => (
                <div
                  key={song.id}
                  style={{
                    flex: 1, display: "flex", alignItems: "center",
                    borderBottom: song.position < songCount ? "2px solid #ccc" : "none",
                    minHeight: 0, paddingLeft: `${Math.max(10, dimensions.width * 0.02)}px`,
                    paddingRight: `${Math.max(20, dimensions.width * 0.05)}px`,
                  }}
                >
                  {/* Tonalité (gauche) */}
                  {song.tonalite !== undefined && (
                    <span
                      style={{
                        flexShrink: 0,
                        fontSize: `${Math.max(14, dimensions.height * 0.022)}px`,
                        color: "#666", fontFamily: "monospace", fontStyle: "italic",
                        marginRight: `${Math.max(8, dimensions.width * 0.015)}px`,
                      }}
                    >
                      ({song.tonalite})
                    </span>
                  )}
                  {/* Numéro + Titre (centre, prend l'espace restant) */}
                  <span
                    style={{
                      flex: 1, textAlign: "center",
                      fontSize: `${Math.max(18, dimensions.height * 0.03)}px`,
                      color: "black", fontWeight: "600",
                      fontFamily: "sans-serif", lineHeight: "1.2",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}
                  >
                    <span style={{ color: "#888", fontWeight: "400", marginRight: "6px" }}>
                      {song.position.toString().padStart(2, '0')}.
                    </span>
                    {song.title}
                  </span>
                  {/* Durée (droite) */}
                  {song.time !== undefined && (
                    <span
                      style={{
                        flexShrink: 0, marginLeft: `${Math.max(8, dimensions.width * 0.015)}px`,
                        fontSize: `${Math.max(12, dimensions.height * 0.02)}px`,
                        color: "#888", fontFamily: "monospace",
                      }}
                    >
                      {formatTime(song.time)}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#999", fontSize: `${Math.max(14, dimensions.height * 0.015)}px`,
                  fontStyle: "italic",
                }}
              >
                Ajoutez des morceaux via le panneau de gauche
              </div>
            )}
          </div>

          {/* Temps total */}
          {songCount > 0 && (
            <div
              style={{
                textAlign: "center", fontSize: `${Math.max(12, dimensions.height * 0.014)}px`,
                color: getTempsCouleur(), padding: `${Math.max(8, dimensions.height * 0.01)}px 0`,
                borderTop: "1px solid #eee", flexShrink: 0,
              }}
            >
              Temps total : {formatTime(tempsTotal)}
              {setlist?.stageTimeLimit != null && (
                <span style={{ color: "#888", fontSize: `${Math.max(10, dimensions.height * 0.011)}px`, marginLeft: "8px" }}>
                  / {formatTime(setlist.stageTimeLimit)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CSS PRINT */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .setlist-a4-container,
          .setlist-a4-container * { visibility: visible; }
          .setlist-a4-container {
            position: absolute !important;
            left: 0; top: 0;
            width: 210mm !important;
            height: 297mm !important;
            max-width: none !important;
            max-height: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 15mm 20mm !important;
            overflow: visible !important;
          }
        }
      `}</style>
    </div>
  );
}
