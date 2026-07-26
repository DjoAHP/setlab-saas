import { useState, useRef, useEffect } from 'react';
import { useSyncStatus } from '../../hooks/useSyncStatus';
import { useAuth } from '../../context/AuthContext';
import { syncService } from '../../services/syncService';

export function SyncIndicator() {
  const { user, logout } = useAuth();
  const { status, error } = useSyncStatus();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    syncService.destroy();
    await logout();
  };

  const statusConfig: Record<string, { icon: string; text: string; color: string }> = {
    synced: {
      icon: '\u2713',
      text: 'Synchronis\u00e9',
      color: 'hsl(198, 80%, 80%)',
    },
    syncing: {
      icon: '\u27f3',
      text: 'Synchronisation\u2026',
      color: 'hsl(198, 80%, 80%)',
    },
    offline: {
      icon: '\u2298',
      text: 'Hors ligne',
      color: 'hsl(220, 15%, 50%)',
    },
    error: {
      icon: '\u26a0',
      text: error || '\u00c9chec de sync',
      color: '#e57373',
    },
  };

  const cfg = statusConfig[status] || statusConfig.offline;

  return (
    <div
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid hsl(220, 15%, 22%)',
      }}
    >
      <div ref={menuRef} style={{ position: 'relative', marginBottom: 8 }}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'none',
            border: 'none',
            color: 'hsl(198, 48%, 94%)',
            cursor: 'pointer',
            padding: 0,
            fontSize: 13,
            width: '100%',
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'hsl(198, 60%, 35%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 'bold',
              color: '#fff',
              flexShrink: 0,
            }}
          >
            {user?.email?.charAt(0).toUpperCase() || '?'}
          </div>
          <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.email || 'Utilisateur'}
          </span>
          <span style={{ fontSize: 10 }}>{menuOpen ? '\u25b2' : '\u25bc'}</span>
        </button>

        {menuOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: 4,
              background: 'hsl(222, 18%, 13%)',
              border: '1px solid hsl(220, 15%, 22%)',
              borderRadius: 8,
              padding: 4,
              zIndex: 50,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}
          >
            <div
              style={{
                padding: '8px 12px',
                fontSize: 12,
                color: 'hsl(220, 15%, 50%)',
                borderBottom: '1px solid hsl(220, 15%, 22%)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.email}
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'none',
                border: 'none',
                color: '#e57373',
                cursor: 'pointer',
                fontSize: 13,
                textAlign: 'left',
                borderRadius: 4,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(229,115,115,0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              Se d\u00e9connecter
            </button>
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          color: cfg.color,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            animation: status === 'syncing' ? 'spin 1s linear infinite' : 'none',
          }}
        >
          {cfg.icon}
        </span>
        <span>{cfg.text}</span>
      </div>

      {status === 'syncing' && (
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      )}
    </div>
  );
}