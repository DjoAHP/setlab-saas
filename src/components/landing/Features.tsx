import { motion } from 'framer-motion';

const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15V6" /><path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
        <path d="M12 12H3" /><path d="M16 6H3" /><path d="M12 18H3" />
      </svg>
    ),
    title: 'Éditeur intuitif',
    desc: 'Créez et organisez vos setlists en quelques secondes. Ajoutez, réordonnez, définissez les tonalités et durées.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: 'Chronomètre intégré',
    desc: 'Mesurez le temps de chaque morceau en live. Transférez directement les durées dans votre setlist.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
    title: 'Export professionnel',
    desc: 'Exportez en PDF, JPEG ou PNG. Format prêt pour l\'impression ou le partage avec votre groupe.',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

export function Features() {
  return (
    <section id="features" style={{
      padding: '100px 24px', boxSizing: 'border-box',
      maxWidth: '1100px', margin: '0 auto',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '64px' }}>
        <h2 style={{
          fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 700,
          color: 'white', margin: '0 0 12px',
        }}>
          Tout ce dont vous avez besoin
        </h2>
        <p style={{
          fontSize: '16px', color: 'hsl(220, 15%, 70%)', margin: 0,
        }}>
          Outils simples, puissants, pensés pour la scène.
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
        }}
      >
        {features.map((f, i) => (
          <motion.div
            key={i}
            variants={cardVariants}
            style={{
              padding: '32px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px',
              transition: 'border-color 0.3s, transform 0.3s',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(61,143,168,0.3)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: 'rgba(61,143,168,0.1)',
              border: '1px solid rgba(61,143,168,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'hsl(198, 80%, 80%)',
            }}>
              {f.icon}
            </div>
            <h3 style={{
              fontSize: '18px', fontWeight: 600, color: 'white',
              margin: '16px 0 8px',
            }}>
              {f.title}
            </h3>
            <p style={{
              fontSize: '14px', color: 'hsl(220, 15%, 70%)',
              margin: 0, lineHeight: 1.6,
            }}>
              {f.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}