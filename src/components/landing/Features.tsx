import { motion } from 'framer-motion';

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15V6" /><path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
        <path d="M12 12H3" /><path d="M16 6H3" /><path d="M12 18H3" />
      </svg>
    ),
    title: 'Éditeur intuitif',
    desc: 'Créez et organisez vos setlists en quelques secondes. Ajoutez, réordonnez, définissez les tonalités et durées.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: 'Chronomètre intégré',
    desc: 'Mesurez le temps de chaque morceau en live. Transférez directement les durées dans votre setlist.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
    title: 'Export professionnel',
    desc: 'Exportez en PDF, JPEG ou PNG. Format prêt pour l\'impression ou le partage avec votre groupe.',
  },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

export function Features() {
  return (
    <section id="features" style={{
      padding: 'clamp(60px, 10vw, 120px) clamp(20px, 4vw, 48px)',
      maxWidth: '1100px', margin: '0 auto',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 72px)' }}
      >
        <span style={{
          fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' as const,
          letterSpacing: '0.12em', color: 'hsl(198, 60%, 50%)',
          display: 'block', marginBottom: '16px',
        }}>
          Fonctionnalités
        </span>
        <h2 style={{
          fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700,
          color: 'white', margin: '0 0 16px', lineHeight: 1.15,
          letterSpacing: '-0.02em',
        }}>
          Tout ce dont vous avez besoin
        </h2>
        <p style={{
          fontSize: 'clamp(15px, 1.8vw, 17px)',
          color: 'hsl(220, 15%, 50%)', margin: 0, lineHeight: 1.6,
          maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto',
        }}>
          Outils simples, puissants, pensés pour la scène.
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
        }}
      >
        {features.map((f, i) => (
          <motion.div
            key={i}
            variants={item}
            style={{
              padding: '36px 28px', borderRadius: '16px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              transition: 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
              cursor: 'default',
              position: 'relative', overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.borderColor = 'rgba(61,143,168,0.2)';
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: 'rgba(61,143,168,0.08)',
              border: '1px solid rgba(61,143,168,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'hsl(198, 80%, 80%)', marginBottom: '20px',
            }}>
              {f.icon}
            </div>
            <h3 style={{
              fontSize: '17px', fontWeight: 600, color: 'white',
              margin: '0 0 10px', letterSpacing: '-0.01em',
            }}>
              {f.title}
            </h3>
            <p style={{
              fontSize: '14px', color: 'hsl(220, 15%, 50%)',
              margin: 0, lineHeight: 1.65,
            }}>
              {f.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
