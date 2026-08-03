import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export function AppPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.95, 1]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="preview" ref={ref} style={{
      padding: 'clamp(60px, 10vw, 120px) clamp(20px, 4vw, 48px)',
      background: 'linear-gradient(180deg, transparent 0%, rgba(61,143,168,0.02) 50%, transparent 100%)',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <span style={{
            fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' as const,
            letterSpacing: '0.12em', color: 'hsl(198, 60%, 50%)',
            display: 'block', marginBottom: '16px',
          }}>
            Aperçu
          </span>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700,
            color: 'white', margin: '0 0 16px', lineHeight: 1.15,
            letterSpacing: '-0.02em',
          }}>
            Une interface pensée pour les musiciens
          </h2>
          <p style={{
            fontSize: 'clamp(15px, 1.8vw, 17px)',
            color: 'hsl(220, 15%, 50%)', margin: '0 0 clamp(40px, 6vw, 64px)',
            lineHeight: 1.6,
          }}>
            Trois panneaux, une seule vision. Éditez, visualisez, chronométrez.
          </p>
        </motion.div>

        <motion.div style={{ scale, opacity }}>
          <div style={{
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px', overflow: 'hidden',
            background: 'hsl(222, 20%, 11%)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04) inset',
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
                <span style={{ fontSize: '11px', color: 'hsl(220, 15%, 40%)' }}>setlab-saas.netlify.app/app</span>
              </div>
            </div>

            {/* App screenshot placeholder — to be replaced with real screenshot */}
            <div style={{
              aspectRatio: '16/10', width: '100%',
              background: 'linear-gradient(135deg, hsl(222,20%,11%) 0%, hsl(222,22%,9%) 50%, hsl(222,20%,11%) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Decorative grid */}
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }} />
              {/* Placeholder content */}
              <div style={{
                position: 'relative', zIndex: 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
              }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="hsl(220, 15%, 30%)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
                <span style={{ fontSize: '13px', color: 'hsl(220, 15%, 30%)' }}>
                  Aperçu de l'application
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
