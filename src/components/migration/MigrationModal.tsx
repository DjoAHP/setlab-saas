import { useState, useEffect } from 'react';
import { db } from '../../db/schema';
import { syncService } from '../../services/syncService';
import type { Setlist } from '../../types';

interface MigrationModalProps {
  userId: string;
  onComplete: () => void;
}

export function MigrationModal({ userId, onComplete }: MigrationModalProps) {
  const [orphanedSetlists, setOrphanedSetlists] = useState<Setlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    db.setlists
      .where('userId')
      .equals(null)
      .toArray()
      .then((list) => {
        setOrphanedSetlists(list);
        setLoading(false);
      });
  }, []);

  if (loading) return null;

  if (orphanedSetlists.length === 0) {
    onComplete();
    return null;
  }

  const handleAssociate = async () => {
    setProcessing(true);
    try {
      for (const sl of orphanedSetlists) {
        const updated = { ...sl, userId };
        await db.setlists.put(updated);
        await syncService.pushSetlist(updated);
      }
      onComplete();
    } finally {
      setProcessing(false);
    }
  };

  const handleIgnore = async () => {
    setProcessing(true);
    try {
      await db.setlists.where('userId').equals(null).delete();
      onComplete();
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          width: '90%',
          maxWidth: 440,
          padding: '32px 28px',
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          textAlign: 'center',
        }}
      >
        <h2 style={{ color: 'hsl(198, 48%, 94%)', fontSize: 18, margin: '0 0 12px', fontWeight: 600 }}>
          Setlists locales détectées
        </h2>
        <p style={{ color: 'hsl(220, 15%, 60%)', fontSize: 14, lineHeight: 1.5, margin: '0 0 20px' }}>
          Nous avons trouvé {orphanedSetlists.length} setlist
          {orphanedSetlists.length > 1 ? 's' : ''} créée
          {orphanedSetlists.length > 1 ? 's' : ''} avant votre connexion.
          Que souhaitez-vous en faire ?
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={handleAssociate}
            disabled={processing}
            style={{
              padding: '12px 16px',
              borderRadius: 8,
              border: '1px solid hsl(198, 60%, 45%)',
              background: 'hsl(198, 60%, 35%)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: processing ? 'not-allowed' : 'pointer',
              opacity: processing ? 0.6 : 1,
            }}
          >
            {processing ? 'Association…' : '🔄 Associer à mon compte'}
          </button>

          <button
            onClick={handleIgnore}
            disabled={processing}
            style={{
              padding: '12px 16px',
              borderRadius: 8,
              border: '1px solid hsl(220, 15%, 22%)',
              background: 'transparent',
              color: 'hsl(220, 15%, 50%)',
              fontSize: 14,
              fontWeight: 500,
              cursor: processing ? 'not-allowed' : 'pointer',
              opacity: processing ? 0.6 : 1,
            }}
          >
            🗑️ Ignorer, repartir de zéro
          </button>
        </div>

        <p style={{ color: 'hsl(220, 15%, 40%)', fontSize: 12, marginTop: 16, lineHeight: 1.4 }}>
          Vous pourrez importer un fichier .tl ultérieurement.
        </p>
      </div>
    </div>
  );
}