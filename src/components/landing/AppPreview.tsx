import { motion } from 'framer-motion';

export function AppPreview() {

  return (
    <section id="preview" style={{
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

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
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

            {/* App screenshot */}
            <div style={{
              width: '100%',
              position: 'relative', overflow: 'hidden',
            }}>
              <img
                src="/apercu-setlab.png"
                alt="Aperçu de l'application SetLab"
                style={{ width: '100%', display: 'block' }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
