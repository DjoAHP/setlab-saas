import { useState, useEffect } from 'react';
import { useSetlab } from '../context/SetlabContext';
import { useExportQuota } from '../hooks/useExportQuota';
import { useSubscription } from '../hooks/useSubscription';
import { exporterTl, exporterPdf, exporterJpeg, exporterPng } from '../services/exportService';
import { Link } from 'react-router-dom';

interface ExportModalProps {
  onClose: () => void;
}

export function ExportModal({ onClose }: ExportModalProps) {
  const { setlist } = useSetlab();
  const { plan } = useSubscription();
  const { remaining, total, loading: quotaLoading, canExport, incrementExport, refresh } = useExportQuota();
  const [exporting, setExporting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleExport = async (format: string, action: () => Promise<void> | void) => {
    setError(null);

    if (format !== 'tl') {
      const allowed = await canExport();
      if (!allowed) {
        setError('Quota mensuel atteint. Passez au plan Illimité pour exporter sans limite.');
        return;
      }
    }

    setExporting(format);
    try {
      if (format === 'tl') {
        if (setlist) exporterTl(setlist);
      } else {
        await action();
        if (format !== 'pdf') {
          await incrementExport();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'export');
    } finally {
      setExporting(null);
    }
  };

  const btnStyle = (disabled: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: disabled ? '1px solid hsl(220, 15%, 18%)' : '1px solid hsl(220, 15%, 22%)',
    background: disabled ? 'hsl(222, 18%, 12%)' : 'hsl(222, 18%, 17%)',
    color: disabled ? 'hsl(220, 15%, 30%)' : 'white',
    fontSize: '13px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background 0.15s',
    textAlign: 'left',
  });

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(10, 12, 20, 0.82)', backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'hsl(222, 22%, 12%)', border: '1px solid hsl(220, 15%, 22%)',
          borderRadius: '12px', width: 'min(90vw, 360px)',
          display: 'flex', flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid hsl(220, 15%, 18%)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ color: 'hsl(210, 30%, 90%)', fontSize: '14px', fontWeight: 600 }}>
            Exporter la setlist
          </span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'hsl(220, 15%, 45%)', cursor: 'pointer', fontSize: '16px' }}
          >
            ✕
          </button>
        </div>

        {plan === 'free' && !quotaLoading && (
          <div style={{
            padding: '10px 20px', borderBottom: '1px solid hsl(220, 15%, 16%)',
            textAlign: 'center', fontSize: '12px', color: 'hsl(220, 15%, 50%)',
          }}>
            {remaining > 0
              ? `${remaining}/${total} exports restants ce mois-ci`
              : 'Quota mensuel atteint'}
          </div>
        )}

        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            disabled={plan === 'free'}
            onClick={() => handleExport('tl', async () => {})}
            title={plan === 'free' ? 'Réservé au plan illimité' : ''}
            style={btnStyle(plan === 'free')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span style={{ flex: 1 }}>.tl</span>
            {plan === 'free' && <span style={{ fontSize: '10px', color: 'hsl(220, 15%, 40%)' }}>Réservé plan illimité</span>}
          </button>

          <button
            disabled={exporting === 'pdf'}
            onClick={() => handleExport('pdf', exporterPdf)}
            style={btnStyle(exporting === 'pdf')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            PDF
            {exporting === 'pdf' && <span style={{ marginLeft: 'auto', fontSize: '11px' }}>...</span>}
          </button>

          <button
            disabled={exporting === 'jpeg'}
            onClick={() => handleExport('jpeg', exporterJpeg)}
            style={btnStyle(exporting === 'jpeg')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            JPEG
            {exporting === 'jpeg' && <span style={{ marginLeft: 'auto', fontSize: '11px' }}>Génération...</span>}
          </button>

          <button
            disabled={exporting === 'png'}
            onClick={() => handleExport('png', exporterPng)}
            style={btnStyle(exporting === 'png')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            PNG (haute résolution)
            {exporting === 'png' && <span style={{ marginLeft: 'auto', fontSize: '11px' }}>Génération...</span>}
          </button>
        </div>

        {error && (
          <div style={{
            padding: '10px 20px', borderTop: '1px solid hsl(220, 15%, 18%)',
            textAlign: 'center',
          }}>
            <div style={{
              color: '#e57373', fontSize: '12px', marginBottom: '8px',
              padding: '8px 12px', background: 'rgba(229,115,115,0.1)', borderRadius: '6px',
            }}>
              {error}
            </div>
            {error.includes('Quota') && (
              <Link
                to="/tarifs"
                onClick={onClose}
                style={{
                  color: 'hsl(198, 80%, 80%)', fontSize: '12px', textDecoration: 'none',
                }}
              >
                Voir les offres →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}