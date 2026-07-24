import { SetlabProvider, useSetlab } from "./context/SetlabContext";
import { SetlistEditor } from "./components/SetlistEditor";
import { SetlistPreview } from "./components/SetlistPreview";
import { ChronoPanel } from "./components/ChronoPanel";
import { useState, useEffect } from "react";

function AppContent() {
  const { loading } = useSetlab();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileTab, setMobileTab] = useState<"editor" | "preview" | "chrono">("editor");

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
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
                borderTop: mobileTab === tab.key ? "2px solid hsl(var(--tl-accent-border))" : "2px solid transparent",
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
      <div style={{ width: "280px", flexShrink: 0, height: "100%" }}>
        <SetlistEditor />
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