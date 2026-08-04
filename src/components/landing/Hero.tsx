import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const videoY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const videoOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.3]);

  return (
    <section ref={ref} style={{
      position: 'relative', minHeight: '100vh',
      display: 'flex', alignItems: 'center',
      padding: '100px clamp(20px, 4vw, 48px) 80px',
      overflow: 'hidden',
    }}>
      {/* Background gradient orbs */}
      <div style={{
        position: 'absolute', top: '-20%', left: '-10%',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(61,143,168,0.06) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: '1200px', margin: '0 auto', width: '100%',
        display: 'flex', alignItems: 'center',
        gap: 'clamp(40px, 5vw, 80px)',
      }}>
        {/* Left — Text */}
        <div style={{ flex: '1 1 45%', minWidth: 0, position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '6px 16px', borderRadius: '100px',
              background: 'rgba(61,143,168,0.08)',
              border: '1px solid rgba(61,143,168,0.15)',
              marginBottom: '28px',
            }}
          >
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'hsl(198, 80%, 80%)',
              boxShadow: '0 0 8px hsl(198, 80%, 80%)',
            }} />
            <span style={{ fontSize: '13px', color: 'hsl(198, 80%, 80%)', fontWeight: 500 }}>
              Pour les musiciens, par des musiciens
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontSize: 'clamp(36px, 5vw, 58px)', fontWeight: 800,
              color: 'white', margin: '0 0 20px', lineHeight: 1.08,
              letterSpacing: '-0.03em',
            }}
          >
            Votre setlist,{' '}
            <span style={{
              background: 'linear-gradient(135deg, hsl(198, 80%, 80%) 0%, hsl(198, 60%, 60%) 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              enfin pensée
            </span>
            {' '}pour les musiciens.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{
              fontSize: 'clamp(15px, 1.8vw, 18px)',
              color: 'hsl(220, 15%, 55%)',
              margin: '0 0 36px', lineHeight: 1.6,
              maxWidth: '460px',
            }}
          >
            Créez, organisez et chronométrez vos setlists en un seul outil.
            Simple, rapide, professionnel.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}
          >
            <a href="/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '14px 28px', borderRadius: '10px',
              background: 'linear-gradient(135deg, hsl(198, 60%, 38%) 0%, hsl(198, 60%, 30%) 100%)',
              border: '1px solid hsl(198, 60%, 45%)',
              color: 'white', fontSize: '15px', fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 4px 24px rgba(61,143,168,0.25)',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 40px rgba(61,143,168,0.35)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 24px rgba(61,143,168,0.25)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            >
              Commencer gratuitement
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
            <a href="/tarifs" style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '14px 28px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'hsl(220, 15%, 70%)', fontSize: '15px', fontWeight: 500,
              textDecoration: 'none', transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.color = 'hsl(220, 15%, 70%)';
            }}
            >
              Voir les tarifs
            </a>
          </motion.div>
        </div>

        {/* Right — Video */}
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{
            flex: '1 1 55%', minWidth: 0,
            perspective: '1200px',
          }}
        >
          <motion.div style={{ y: videoY, opacity: videoOpacity }}>
            <div style={{
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px', overflow: 'hidden',
              background: 'hsl(222, 20%, 11%)',
              boxShadow: '0 0 80px rgba(61,143,168,0.08), 0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset',
            }}>
              {/* Browser bar */}
              <div style={{
                padding: '14px 18px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', gap: '10px',
                background: 'rgba(255,255,255,0.02)',
              }}>
                <div style={{ display: 'flex', gap: '7px' }}>
                  <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#ff5f57' }} />
                  <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#febc2e' }} />
                  <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#28c840' }} />
                </div>
                <div style={{
                  flex: 1, height: '28px', borderRadius: '6px',
                  background: 'rgba(255,255,255,0.04)',
                  display: 'flex', alignItems: 'center', padding: '0 12px',
                }}>
                  <span style={{ fontSize: '11px', color: 'hsl(220, 15%, 40%)' }}>setlab-saas.netlify.app</span>
                </div>
              </div>
              {/* Video */}
              <video
                autoPlay muted loop playsInline preload="metadata"
                style={{ width: '100%', display: 'block' }}
              >
                <source src="/videos/presentation01.mp4" type="video/mp4" />
              </video>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Responsive mobile: stack vertically */}
      <style>{`
        @media (max-width: 768px) {
          section > div:first-of-type {
            flex-direction: column !important;
            text-align: center;
          }
          section > div:first-of-type > div:first-child {
            order: 1;
          }
          section > div:first-of-type > div:last-child {
            order: 2;
          }
        }
      `}</style>
    </section>
  );
}
