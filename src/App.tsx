import { SetlabProvider, useSetlab } from "./context/SetlabContext";
import { SetlistEditor } from "./components/SetlistEditor";
import { SetlistPreview } from "./components/SetlistPreview";
import { ChronoPanel } from "./components/ChronoPanel";
import { useState, useEffect, useRef, useCallback } from "react";

function AppContent() {
  const { loading } = useSetlab();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileTab, setMobileTab] = useState<"editor" | "preview" | "chrono">("editor");
  const [editorWidth, setEditorWidth] = useState(320);
  const enTrainDeRedimensionner = useRef(false);
  const xDepart = useRef(0);
  const largeurDepart = useRef(0);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Écouter l'événement d'export PDF depuis l'éditeur (mobile)
  useEffect(() => {
    const onExport = () => {
      setMobileTab("preview");
      setTimeout(() => window.print(), 100);
    };
    window.addEventListener("setlab-export-pdf", onExport);
    return () => window.removeEventListener("setlab-export-pdf", onExport);
  }, []);

  // ── Redimensionnement sidebar éditeur ──────────────────────
  const demarrerRedim = useCallback((e: React.MouseEvent) => {
    enTrainDeRedimensionner.current = true;
    xDepart.current = e.clientX;
    largeurDepart.current = editorWidth;
    e.preventDefault();
  }, [editorWidth]);

  useEffect(() => {
    const surMouvement = (e: MouseEvent) => {
      if (!enTrainDeRedimensionner.current) return;
      const delta = e.clientX - xDepart.current;
      setEditorWidth(Math.min(Math.max(largeurDepart.current + delta, 200), 450));
    };
    const surRelachement = () => { enTrainDeRedimensionner.current = false; };
    document.addEventListener("mousemove", surMouvement);
    document.addEventListener("mouseup", surRelachement);
    return () => {
      document.removeEventListener("mousemove", surMouvement);
      document.removeEventListener("mouseup", surRelachement);
    };
  }, []);

  if (loading) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "hsl(220, 15%, 50%)" }}>
        Chargement...
      </div>
    );
  }

  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", overflow: "hidden" }}>
        <div style={{ flex: 1, minHeight: 0, width: "100%", display: "flex", flexDirection: "column" }}>
          {mobileTab === "editor" && <SetlistEditor />}
          {mobileTab === "preview" && <SetlistPreview />}
          {mobileTab === "chrono" && <ChronoPanel />}
        </div>

        <div
          style={{
            display: "flex", width: "100%",
            borderTop: "1px solid hsl(220, 15%, 18%)",
            background: "hsl(222, 20%, 11%)", flexShrink: 0,
          }}
        >
          {[
{ key: "editor", label: "Éditeur" },
          { key: "preview", label: "Aperçu" },
            { key: "chrono", label: "Chrono" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setMobileTab(tab.key as typeof mobileTab)}
              style={{
                flex: 1, padding: "12px 8px", border: "none",
                background: mobileTab === tab.key ? "hsl(222, 18%, 16%)" : "transparent",
                color: mobileTab === tab.key ? "hsl(var(--tl-accent-princ))" : "hsl(220, 15%, 50%)",
                fontSize: "12px", fontWeight: 600, cursor: "pointer",
                borderTop: mobileTab === tab.key ? "2px solid hsl(210, 30%, 90%)" : "2px solid transparent",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "row", height: "100%", width: "100%", overflow: "hidden" }}>
      <div style={{ width: `${editorWidth}px`, flexShrink: 0, height: "100%", position: "relative" }}>
        <SetlistEditor />
        <div
          onMouseDown={demarrerRedim}
          style={{ position: "absolute", top: 0, right: 0, width: "4px", height: "100%", cursor: "col-resize", zIndex: 10, background: "transparent" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "hsl(var(--tl-accent-border) / 0.3)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0, height: "100%", display: "flex", flexDirection: "column" }}>
        <SetlistPreview />
      </div>
      <div style={{ width: "320px", flexShrink: 0, height: "100%" }}>
        <ChronoPanel />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <SetlabProvider>
      <AppContent />
    </SetlabProvider>
  );
}