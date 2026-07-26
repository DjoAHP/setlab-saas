export function LoadingScreen() {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'hsl(222, 25%, 7%)',
        color: 'hsl(198, 80%, 80%)',
        fontFamily: 'system-ui, sans-serif',
        gap: '24px',
      }}
    >
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="30" stroke="hsl(198, 60%, 35%)" strokeWidth="2" fill="none" />
        <text x="32" y="40" textAnchor="middle" fill="hsl(198, 80%, 80%)" fontSize="24" fontWeight="bold" fontFamily="monospace">
          SL
        </text>
      </svg>
      <div style={{ fontSize: '14px', opacity: 0.6 }}>SetLab</div>
    </div>
  );
}