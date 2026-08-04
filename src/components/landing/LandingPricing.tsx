import { motion } from 'framer-motion';

export function LandingPricing() {
  return (
    <section id="pricing" style={{
      padding: 'clamp(60px, 10vw, 120px) clamp(20px, 4vw, 48px)',
    }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 64px)' }}
        >
          <span style={{
            fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' as const,
            letterSpacing: '0.12em', color: 'hsl(198, 60%, 50%)',
            display: 'block', marginBottom: '16px',
          }}>
            Tarifs
          </span>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700,
            color: 'white', margin: '0 0 16px', lineHeight: 1.15,
            letterSpacing: '-0.02em',
          }}>
            Choisissez votre formule
          </h2>
          <p style={{
            fontSize: 'clamp(15px, 1.8vw, 17px)',
            color: 'hsl(220, 15%, 50%)', margin: 0,
            lineHeight: 1.6,
          }}>
            Commencez gratuitement, passez à l illimité quand vous êtes prêt
          </p>
        </motion.div>

        <div style={{
          display: 'flex',
          gap: '24px',
          justifyContent: 'center',
          alignItems: 'stretch',
          flexWrap: 'wrap',
        }}>
          {/* Carte Gratuit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              width: '340px',
              padding: '32px 28px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(198, 80%, 80%)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <h3 style={{ color: 'hsl(210, 30%, 90%)', fontSize: '20px', fontWeight: 600, margin: 0 }}>
                Gratuit
              </h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '36px', fontWeight: 700, color: 'hsl(210, 30%, 90%)', lineHeight: 1 }}>
                  0
                </span>
                <span style={{ fontSize: '14px', color: 'hsl(220, 15%, 45%)', fontWeight: 400 }}>
                  €/mois
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              <FeatureRow icon="check" text="Setlists et édition illimitées" />
              <FeatureRow icon="check" text="3 exports par mois (JPEG, PNG)" />
              <FeatureRow icon="cross" text="Export PDF" />
              <FeatureRow icon="cross" text="Export .tl" />
              <FeatureRow icon="cross" text="Support prioritaire" />
            </div>

            <a href="/register" style={{
              display: 'block', width: '100%', padding: '14px 20px', borderRadius: '10px',
              border: '1px solid hsl(220, 15%, 24%)',
              background: 'hsl(222, 18%, 18%)', color: 'hsl(220, 15%, 70%)',
              fontSize: '14px', fontWeight: 600, textAlign: 'center',
              textDecoration: 'none', cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'hsl(222, 18%, 22%)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'hsl(222, 18%, 18%)'; }}
            >
              Commencer gratuitement
            </a>
          </motion.div>

          {/* Carte Illimité */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
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
            }}
          >
            <div style={{
              position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
              padding: '6px 16px', borderRadius: '20px',
              background: 'hsl(198, 60%, 35%)', color: '#fff',
              fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const,
              letterSpacing: '0.08em', whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(61,143,168,0.3)',
            }}>
              Recommandé
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: 'hsl(198, 60%, 35%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <h3 style={{ color: 'hsl(210, 30%, 90%)', fontSize: '20px', fontWeight: 600, margin: 0 }}>
                Illimité
              </h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '36px', fontWeight: 700, color: 'hsl(198, 80%, 80%)', lineHeight: 1 }}>
                  3,99
                </span>
                <span style={{ fontSize: '14px', color: 'hsl(198, 60%, 60%)', fontWeight: 400 }}>
                  €/mois
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              <FeatureRow icon="check" text="Setlists et édition illimitées" />
              <FeatureRow icon="check" text="Exports illimités (PDF, JPEG, PNG)" />
              <FeatureRow icon="check" text="Export .tl inclus" />
              <FeatureRow icon="check" text="Annulation à tout moment" />
            </div>

            <a href="/tarifs" style={{
              display: 'block', width: '100%', padding: '14px 20px', borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, hsl(198, 60%, 38%) 0%, hsl(198, 60%, 30%) 100%)',
              color: '#fff', fontSize: '14px', fontWeight: 600, textAlign: 'center',
              textDecoration: 'none', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(61,143,168,0.25)',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              Voir les détails
            </a>
          </motion.div>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '8px', padding: '32px 24px 0',
          color: 'hsl(220, 15%, 40%)', fontSize: '12px',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(198, 60%, 45%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
          <span>Paiement sécurisé par Stripe. Abonnement mensuel, annulable à tout moment.</span>
        </div>
      </div>
    </section>
  );
}

function FeatureRow({ icon, text }: { icon: 'check' | 'cross'; text: string }) {
  const isCheck = icon === 'check';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '8px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
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
