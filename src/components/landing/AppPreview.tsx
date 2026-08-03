import { motion } from 'framer-motion';

export function AppPreview() {
  return (
    <section id="preview" style={{
      padding: '100px 24px', boxSizing: 'border-box',
      background: 'linear-gradient(180deg, hsl(222,25%,7%) 0%, hsl(222,20%,9%) 100%)',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{
          fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 700,
          color: 'white', margin: '0 0 12px',
        }}>
          Une interface pensée pour les musiciens
        </h2>
        <p style={{
          fontSize: '16px', color: 'hsl(220, 15%, 70%)',
          margin: '0 0 48px',
        }}>
          Trois panneaux, une seule vision. Éditez, visualisez, chronométrez.
        </p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div style={{
            border: '1px solid hsl(220, 15%, 22%)',
            borderRadius: '12px', overflow: 'hidden',
            background: 'hsl(222, 20%, 11%)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          }}>
            {/* Barre de navigateur */}
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid hsl(220, 15%, 18%)',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#febc2e' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28c840' }} />
              <div style={{
                flex: 1, height: '8px', borderRadius: '4px',
                background: 'hsl(222, 18%, 17%)', marginLeft: '12px',
              }} />
            </div>

            {/* Placeholder screenshot — à remplacer par une vraie capture */}
            <div style={{
              aspectRatio: '16/10', width: '100%',
              background: 'linear-gradient(135deg, hsl(222,20%,11%) 0%, hsl(222,25%,9%) 50%, hsl(222,20%,11%) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'hsl(220, 15%, 35%)', fontSize: '14px',
            }}>
              {/* Screenshot de l'app à ajouter */}
              <span>Aperçu de l'application</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
