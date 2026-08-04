import { motion } from 'framer-motion';

export function Footer() {
  const linkStyle: React.CSSProperties = {
    color: 'hsl(220, 15%, 45%)', fontSize: '13px',
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
        background: 'rgba(10, 12, 20, 0.6)',
        backdropFilter: 'blur(16px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(16px) saturate(1.2)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: 'clamp(32px, 5vw, 48px) clamp(20px, 4vw, 48px)',
      }}
    >
      <div style={{
        maxWidth: '1100px', margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '24px', marginBottom: '32px',
      }}>
        <a href="/" style={{
          fontSize: '18px', fontWeight: 800, color: 'white',
          letterSpacing: '-0.02em', textDecoration: 'none',
        }}>
          Set<span style={{ color: 'hsl(198, 80%, 80%)' }}>Lab</span>
        </a>

        <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
          <span style={linkStyle} onClick={() => {
            document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
          }}
          onMouseEnter={(e) => { (e.target as HTMLElement).style.color = 'hsl(220, 15%, 70%)'; }}
          onMouseLeave={(e) => { (e.target as HTMLElement).style.color = 'hsl(220, 15%, 45%)'; }}
          >Fonctionnalités</span>
          <a href="/tarifs" style={linkStyle}
          onMouseEnter={(e) => { (e.target as HTMLElement).style.color = 'hsl(220, 15%, 70%)'; }}
          onMouseLeave={(e) => { (e.target as HTMLElement).style.color = 'hsl(220, 15%, 45%)'; }}
          >Tarifs</a>
          <a href="/login" style={linkStyle}
          onMouseEnter={(e) => { (e.target as HTMLElement).style.color = 'hsl(220, 15%, 70%)'; }}
          onMouseLeave={(e) => { (e.target as HTMLElement).style.color = 'hsl(220, 15%, 45%)'; }}
          >Se connecter</a>
          <a href="/register" style={linkStyle}
          onMouseEnter={(e) => { (e.target as HTMLElement).style.color = 'hsl(220, 15%, 70%)'; }}
          onMouseLeave={(e) => { (e.target as HTMLElement).style.color = 'hsl(220, 15%, 45%)'; }}
          >Créer un compte</a>
        </div>
      </div>

      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.04)',
        paddingTop: '24px', textAlign: 'center',
        fontSize: '12px', color: 'hsl(220, 15%, 30%)',
      }}>
        © 2026 SetLab. Tous droits réservés.
      </div>
    </motion.footer>
  );
}
