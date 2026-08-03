import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  const navStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
    padding: '16px 24px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: scrolled ? 'rgba(10, 12, 20, 0.8)' : 'transparent',
    backdropFilter: scrolled ? 'blur(12px)' : 'none',
    borderBottom: scrolled ? '1px solid hsl(220, 15%, 18%)' : '1px solid transparent',
    transition: 'background 0.3s, border-bottom 0.3s, backdrop-filter 0.3s',
    boxSizing: 'border-box',
  };

  const logoStyle: React.CSSProperties = {
    fontSize: '18px', fontWeight: 700,
    color: 'hsl(198, 80%, 80%)', letterSpacing: '1px',
    textDecoration: 'none', cursor: 'pointer',
  };

  const linkStyle: React.CSSProperties = {
    color: 'hsl(220, 15%, 50%)', fontSize: '14px',
    textDecoration: 'none', cursor: 'pointer',
    transition: 'color 0.2s',
  };

  const ctaStyle: React.CSSProperties = {
    padding: '10px 20px', borderRadius: '8px',
    background: 'hsl(198, 60%, 35%)',
    border: '1px solid hsl(198, 60%, 45%)',
    color: 'white', fontSize: '14px', fontWeight: 600,
    cursor: 'pointer', textDecoration: 'none',
    transition: 'opacity 0.2s',
  };

  const hamburgerStyle: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', gap: '5px',
    background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
  };

  const barStyle: React.CSSProperties = {
    width: '22px', height: '2px', background: 'hsl(210, 30%, 90%)',
    borderRadius: '1px', transition: 'transform 0.3s, opacity 0.3s',
  };

  return (
    <>
      <nav style={navStyle}>
        <a href="/" style={logoStyle}>SetLab</a>

        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <span style={linkStyle} onClick={() => scrollTo('features')}>Fonctionnalités</span>
            <span style={linkStyle} onClick={() => scrollTo('preview')}>Aperçu</span>
            <a href="/login" style={linkStyle}>Se connecter</a>
            <a href="/register" style={ctaStyle}>Commencer</a>
          </div>
        )}

        {isMobile && (
          <button
            style={hamburgerStyle}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            <span style={{ ...barStyle, transform: mobileOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
            <span style={{ ...barStyle, opacity: mobileOpen ? 0 : 1 }} />
            <span style={{ ...barStyle, transform: mobileOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
          </button>
        )}
      </nav>

      <AnimatePresence>
        {mobileOpen && isMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 40,
                background: 'rgba(0,0,0,0.6)',
              }}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0,
                width: '280px', zIndex: 45,
                background: 'hsl(222, 22%, 12%)',
                borderLeft: '1px solid hsl(220, 15%, 22%)',
                padding: '80px 24px 24px',
                display: 'flex', flexDirection: 'column', gap: '24px',
                boxSizing: 'border-box',
              }}
            >
              <span style={{ ...linkStyle, fontSize: '16px' }} onClick={() => scrollTo('features')}>Fonctionnalités</span>
              <span style={{ ...linkStyle, fontSize: '16px' }} onClick={() => scrollTo('preview')}>Aperçu</span>
              <a href="/login" style={{ ...linkStyle, fontSize: '16px' }}>Se connecter</a>
              <div style={{ flex: 1 }} />
              <a href="/register" style={{ ...ctaStyle, textAlign: 'center', display: 'block' }}>Commencer</a>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
