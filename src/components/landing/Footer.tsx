import { motion } from 'framer-motion';

export function Footer() {
  const linkStyle: React.CSSProperties = {
    color: 'hsl(220, 15%, 50%)', fontSize: '13px',
    textDecoration: 'none', transition: 'color 0.2s',
    cursor: 'pointer',
  };

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      style={{
        borderTop: '1px solid hsl(220, 15%, 18%)',
        padding: '40px 24px',
        maxWidth: '1100px', margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '16px',
        boxSizing: 'border-box',
      }}
    >
      <a href="/" style={{
        fontSize: '16px', fontWeight: 700,
        color: 'hsl(198, 80%, 80%)', letterSpacing: '1px',
        textDecoration: 'none',
      }}>
        SetLab
      </a>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <span style={linkStyle} onClick={() => {
          document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
        }}>Fonctionnalités</span>
        <a href="/tarifs" style={linkStyle}>Tarifs</a>
        <a href="/login" style={linkStyle}>Se connecter</a>
        <a href="/register" style={linkStyle}>Créer un compte</a>
      </div>

      <div style={{
        width: '100%', textAlign: 'center', marginTop: '16px',
        fontSize: '12px', color: 'hsl(220, 15%, 35%)',
      }}>
        © 2026 SetLab. Tous droits réservés.
      </div>
    </motion.footer>
  );
}
