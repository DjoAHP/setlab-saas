import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../hooks/useSubscription';
import { Link, useNavigate } from 'react-router-dom';

export function PricingPage() {
  const { user } = useAuth();
  const { plan, subscribe, manageBilling } = useSubscription();
  const navigate = useNavigate();

  const cardStyle: React.CSSProperties = {
    flex: 1,
    minWidth: '280px',
    maxWidth: '380px',
    padding: '32px 24px',
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  };

  const highlightCard: React.CSSProperties = {
    ...cardStyle,
    border: '1px solid hsl(198, 60%, 45%)',
    boxShadow: '0 0 24px rgba(61,143,168,0.15)',
  };

  const handleAction = async () => {
    if (!user) {
      navigate('/register?redirect=/tarifs');
      return;
    }
    if (plan === 'unlimited') {
      await manageBilling();
    } else {
      await subscribe();
    }
  };

  const getButtonLabel = () => {
    if (!user) return 'Créer un compte';
    if (plan === 'unlimited') return 'Gérer mon abonnement';
    return 'Passer au plan Illimité';
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'hsl(222, 25%, 7%)',
        fontFamily: 'system-ui, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 16px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '800px', marginBottom: '40px' }}>
        <Link to="/app" style={{ color: 'hsl(220, 15%, 50%)', fontSize: '13px', textDecoration: 'none' }}>
          ← Retour à l'application
        </Link>
      </div>

      <h1 style={{ color: 'hsl(210, 30%, 90%)', fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px', textAlign: 'center' }}>
        SetLab
      </h1>
      <p style={{ color: 'hsl(220, 15%, 50%)', fontSize: '14px', margin: '0 0 32px', textAlign: 'center' }}>
        Choisissez la formule qui vous convient
      </p>

      <div style={{
        display: 'flex', gap: '24px', flexWrap: 'wrap',
        justifyContent: 'center', width: '100%', maxWidth: '800px',
      }}>
        <div style={cardStyle}>
          <div>
            <h2 style={{ color: 'hsl(210, 30%, 90%)', fontSize: '18px', fontWeight: 600, margin: '0 0 4px' }}>
              Gratuit
            </h2>
            <div style={{ color: 'hsl(210, 30%, 90%)', fontSize: '32px', fontWeight: 'bold' }}>
              0 €
              <span style={{ color: 'hsl(220, 15%, 50%)', fontSize: '14px', fontWeight: 400 }}>/mois</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
            <Feature text="Setlists et édition illimitées" included />
            <Feature text="3 exports par mois (PDF, JPEG, PNG)" included />
            <Feature text="Export .tl" included={false} />
            <Feature text="Support prioritaire" included={false} />
          </div>
        </div>

        <div style={highlightCard}>
          <div>
            <div style={{
              display: 'inline-block',
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'hsl(198, 60%, 25%)',
              color: 'hsl(198, 80%, 80%)',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '8px',
            }}>
              Recommandé
            </div>
            <h2 style={{ color: 'hsl(210, 30%, 90%)', fontSize: '18px', fontWeight: 600, margin: '0 0 4px' }}>
              Illimité
            </h2>
            <div style={{ color: 'hsl(198, 80%, 80%)', fontSize: '32px', fontWeight: 'bold' }}>
              3,99 €
              <span style={{ color: 'hsl(220, 15%, 50%)', fontSize: '14px', fontWeight: 400 }}>/mois</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
            <Feature text="Setlists et édition illimitées" included />
            <Feature text="Exports illimités (PDF, JPEG, PNG)" included />
            <Feature text="Export .tl inclus" included />
            <Feature text="Annulation à tout moment" included />
          </div>

          <button
            onClick={handleAction}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: '8px',
              border: '1px solid hsl(198, 60%, 45%)',
              background: 'hsl(198, 60%, 35%)',
              color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            {getButtonLabel()}
          </button>
        </div>
      </div>

      <p style={{ color: 'hsl(220, 15%, 40%)', fontSize: '12px', marginTop: '40px', textAlign: 'center' }}>
        Paiement sécurisé par Stripe. Abonnement mensuel, annulable à tout moment depuis votre portail client.
      </p>
    </div>
  );
}

function Feature({ text, included }: { text: string; included: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{
        color: included ? 'hsl(198, 80%, 80%)' : 'hsl(220, 15%, 35%)',
        fontSize: '14px', fontWeight: 'bold', width: '20px', textAlign: 'center',
      }}>
        {included ? '✓' : '—'}
      </span>
      <span style={{
        color: included ? 'hsl(210, 30%, 85%)' : 'hsl(220, 15%, 40%)',
        fontSize: '13px',
      }}>
        {text}
      </span>
    </div>
  );
}