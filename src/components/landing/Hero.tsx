import { motion, type Variants } from 'framer-motion';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, ease: 'easeOut' as const, delay },
  }),
};

export function Hero() {
  return (
    <section style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '120px 24px 80px', boxSizing: 'border-box',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Glow derrière le hero */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%',
        transform: 'translateX(-50%)',
        width: '600px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(61,143,168,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '900px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {/* Titre */}
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
          style={{
            fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 800,
            color: 'white', margin: '0 0 16px', lineHeight: 1.1,
          }}
        >
          SetLab
        </motion.h1>

        {/* Sous-titre */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.2}
          style={{
            fontSize: 'clamp(16px, 2.5vw, 20px)',
            color: 'hsl(220, 15%, 70%)',
            margin: '0 0 32px', lineHeight: 1.5,
            maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto',
          }}
        >
          Votre setlist, enfin pensée pour les musiciens.
        </motion.p>

        {/* CTA */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.4}
        >
          <a href="/register" style={{
            display: 'inline-block',
            padding: '14px 32px', borderRadius: '10px',
            background: 'hsl(198, 60%, 35%)',
            border: '1px solid hsl(198, 60%, 45%)',
            color: 'white', fontSize: '16px', fontWeight: 600,
            textDecoration: 'none', cursor: 'pointer',
            boxShadow: '0 0 30px rgba(61,143,168,0.2)',
            transition: 'box-shadow 0.3s, transform 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 0 50px rgba(61,143,168,0.35)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 0 30px rgba(61,143,168,0.2)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          >
            Commencer gratuitement
          </a>
        </motion.div>

        {/* Vidéo mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
          style={{
            marginTop: '64px',
            perspective: '1200px',
          }}
        >
          <div style={{
            border: '1px solid hsl(220, 15%, 22%)',
            borderRadius: '12px', overflow: 'hidden',
            background: 'hsl(222, 20%, 11%)',
            boxShadow: '0 0 80px rgba(61,143,168,0.12), 0 20px 60px rgba(0,0,0,0.4)',
            transform: 'rotateY(-2deg) rotateX(1deg)',
            transition: 'transform 0.4s ease-out',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'rotateY(0deg) rotateX(0deg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'rotateY(-2deg) rotateX(1deg)';
          }}
          >
            {/* Barre de navigateur simulée */}
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
            {/* Vidéo */}
            <video
              autoPlay muted loop playsInline
              preload="metadata"
              style={{ width: '100%', display: 'block' }}
              poster=""
            >
              <source src="/videos/presentation01.mp4" type="video/mp4" />
            </video>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
