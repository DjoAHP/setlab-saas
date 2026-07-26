import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../hooks/useSubscription';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export function PricingPage() {
  const { user } = useAuth();
  const { plan, subscribe, manageBilling, loading } = useSubscription();
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState(false);

  const handleAction = async () => {
    if (!user) {
      navigate('/register?redirect=/tarifs');
      return;
    }
    setActionLoading(true);
    try {
      if (plan === 'unlimited') {
        await manageBilling();
      } else {
        await subscribe();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const getButtonLabel = () => {
    if (!user) return 'Créer un compte gratuit';
    if (plan === 'unlimited') return 'Gérer mon abonnement';
    return 'Passer au plan Illimité';
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.page}>
        {/* Navigation */}
        <div style={styles.nav}>
          <Link to="/app" style={styles.backLink}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Retour
          </Link>
          <div style={styles.logo}>SetLab</div>
        </div>

        {/* Hero */}
        <div style={styles.hero}>
          <h1 style={styles.title}>
            Trouvez la formule <span style={{ color: 'hsl(198, 80%, 80%)' }}>adaptée</span>
          </h1>
          <p style={styles.subtitle}>
            Créez, éditez et exportez vos setlists en toute liberté
          </p>
        </div>

        {/* Cartes */}
        <div style={styles.cardsRow}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardPlanIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(198, 80%, 80%)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <h2 style={styles.cardTitle}>Gratuit</h2>
              <div style={styles.priceRow}>
                <span style={styles.price}>0</span>
                <span style={styles.priceUnit}>€/mois</span>
              </div>
            </div>

            <div style={styles.featureList}>
              <Feature icon="check" text="Setlists et édition illimitées" />
              <Feature icon="check" text="3 exports par mois (PDF, JPEG, PNG)" />
              <Feature icon="cross" text="Export .tl" />
              <Feature icon="cross" text="Support prioritaire" />
            </div>

            <div style={styles.cardFooter}>
              <span style={styles.currentPlan}>
                {user && plan === 'free' ? '✔ Plan actuel' : ''}
              </span>
            </div>
          </div>

          <div style={styles.cardHighlight}>
            <div style={styles.badge}>Recommandé</div>
            <div style={styles.cardHeader}>
              <div style={styles.cardPlanIconHighlight}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <h2 style={styles.cardTitleHighlight}>Illimité</h2>
              <div style={styles.priceRow}>
                <span style={styles.priceHighlight}>3,99</span>
                <span style={styles.priceUnitHighlight}>€/mois</span>
              </div>
            </div>

            <div style={styles.featureList}>
              <Feature icon="check" text="Setlists et édition illimitées" />
              <Feature icon="check" text="Exports illimités (PDF, JPEG, PNG)" />
              <Feature icon="check" text="Export .tl inclus" />
              <Feature icon="check" text="Annulation à tout moment" />
            </div>

            <div style={styles.cardFooter}>
              <button
                onClick={handleAction}
                disabled={actionLoading || loading}
                style={{
                  ...styles.ctaButton,
                  opacity: (actionLoading || loading) ? 0.6 : 1,
                  cursor: (actionLoading || loading) ? 'not-allowed' : 'pointer',
                }}
              >
                {actionLoading ? 'Chargement...' : getButtonLabel()}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(198, 60%, 45%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
          <span>Paiement sécurisé par Stripe. Abonnement mensuel, annulable à tout moment.</span>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, text }: { icon: 'check' | 'cross'; text: string }) {
  const isCheck = icon === 'check';
  return (
    <div style={styles.featureRow}>
      <div style={{
        ...styles.featureIcon,
        background: isCheck ? 'rgba(61,143,168,0.15)' : 'rgba(255,255,255,0.04)',
        border: isCheck ? '1px solid rgba(61,143,168,0.3)' : '1px solid rgba(255,255,255,0.06)',
      }}>
        {isCheck ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(198, 80%, 80%)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(220, 15%, 35%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        )}
      </div>
      <span style={{
        color: isCheck ? 'hsl(210, 30%, 85%)' : 'hsl(220, 15%, 45%)',
        fontSize: '13px',
        lineHeight: '1.4',
      }}>
        {text}
      </span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: '100vh',
    background: 'hsl(222, 25%, 7%)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    overflow: 'auto',
  },
  page: {
    maxWidth: '860px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100vh',
  },
  nav: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 0',
    flexShrink: 0,
  },
  backLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: 'hsl(220, 15%, 50%)',
    fontSize: '13px',
    textDecoration: 'none',
    transition: 'color 0.15s',
  },
  logo: {
    fontSize: '16px',
    fontWeight: 700,
    color: 'hsl(198, 80%, 80%)',
    letterSpacing: '1px',
  },
  hero: {
    textAlign: 'center',
    padding: '60px 0 48px',
    maxWidth: '600px',
  },
  title: {
    color: 'hsl(210, 30%, 90%)',
    fontSize: '32px',
    fontWeight: 700,
    margin: '0 0 12px',
    lineHeight: 1.2,
  },
  subtitle: {
    color: 'hsl(220, 15%, 50%)',
    fontSize: '15px',
    margin: 0,
    lineHeight: 1.5,
  },
  cardsRow: {
    display: 'flex',
    gap: '24px',
    justifyContent: 'center',
    alignItems: 'stretch',
    flexWrap: 'wrap',
    width: '100%',
  },
  card: {
    width: '340px',
    padding: '32px 28px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    boxSizing: 'border-box',
  },
  cardHighlight: {
    width: '340px',
    padding: '32px 28px',
    background: 'linear-gradient(135deg, rgba(61,143,168,0.08) 0%, rgba(61,143,168,0.02) 100%)',
    border: '1px solid rgba(61,143,168,0.35)',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    position: 'relative',
    boxShadow: '0 0 30px rgba(61,143,168,0.08), 0 8px 32px rgba(0,0,0,0.2)',
    boxSizing: 'border-box',
  },
  badge: {
    position: 'absolute',
    top: '-12px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '6px 16px',
    borderRadius: '20px',
    background: 'hsl(198, 60%, 35%)',
    color: '#fff',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 12px rgba(61,143,168,0.3)',
  },
  cardHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  cardPlanIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPlanIconHighlight: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: 'hsl(198, 60%, 35%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: 'hsl(210, 30%, 90%)',
    fontSize: '20px',
    fontWeight: 600,
    margin: 0,
  },
  cardTitleHighlight: {
    color: 'hsl(210, 30%, 90%)',
    fontSize: '20px',
    fontWeight: 600,
    margin: 0,
  },
  priceRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
  },
  price: {
    fontSize: '36px',
    fontWeight: 700,
    color: 'hsl(210, 30%, 90%)',
    lineHeight: 1,
  },
  priceUnit: {
    fontSize: '14px',
    color: 'hsl(220, 15%, 45%)',
    fontWeight: 400,
  },
  priceHighlight: {
    fontSize: '36px',
    fontWeight: 700,
    color: 'hsl(198, 80%, 80%)',
    lineHeight: 1,
  },
  priceUnitHighlight: {
    fontSize: '14px',
    color: 'hsl(198, 60%, 60%)',
    fontWeight: 400,
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    flex: 1,
  },
  featureRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  featureIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardFooter: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  currentPlan: {
    textAlign: 'center',
    color: 'hsl(198, 80%, 80%)',
    fontSize: '13px',
    fontWeight: 500,
    padding: '12px 16px',
  },
  ctaButton: {
    width: '100%',
    padding: '14px 20px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, hsl(198, 60%, 38%) 0%, hsl(198, 60%, 30%) 100%)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    boxShadow: '0 4px 14px rgba(61,143,168,0.25)',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '48px 0 40px',
    color: 'hsl(220, 15%, 40%)',
    fontSize: '12px',
    maxWidth: '500px',
    lineHeight: 1.5,
  },
};