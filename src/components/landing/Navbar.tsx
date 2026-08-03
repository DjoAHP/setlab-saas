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
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          padding: '0 clamp(20px, 4vw, 48px)',
          height: '72px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: scrolled ? 'rgba(10, 12, 20, 0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px) saturate(1.2)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
          transition: 'background 0.4s, border-bottom 0.4s, backdrop-filter 0.4s',
        }}
      >
        <a href="/" style={{
          fontSize: '20px', fontWeight: 800,
          color: 'white', letterSpacing: '-0.02em',
          textDecoration: 'none',
        }}>
          Set<span style={{ color: 'hsl(198, 80%, 80%)' }}>Lab</span>
        </a>

        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
            {['Fonctionnalités', 'Aperçu'].map((label) => (
              <span key={label} onClick={() => scrollTo(label === 'Fonctionnalités' ? 'features' : 'preview')} style={{
                color: 'hsl(220, 15%, 60%)', fontSize: '14px', fontWeight: 500,
                cursor: 'pointer', transition: 'color 0.2s',
                letterSpacing: '0.01em',
              }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.color = 'white'; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.color = 'hsl(220, 15%, 60%)'; }}
              >
                {label}
              </span>
            ))}
            <a href="/login" style={{
              color: 'hsl(220, 15%, 60%)', fontSize: '14px', fontWeight: 500,
              textDecoration: 'none', transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.color = 'white'; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.color = 'hsl(220, 15%, 60%)'; }}
            >
              Se connecter
            </a>
            <a href="/register" style={{
              padding: '10px 22px', borderRadius: '8px',
              background: 'rgba(61,143,168,0.12)',
              border: '1px solid rgba(61,143,168,0.25)',
              color: 'hsl(198, 80%, 80%)', fontSize: '14px', fontWeight: 600,
              textDecoration: 'none', transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(61,143,168,0.2)';
              e.currentTarget.style.borderColor = 'rgba(61,143,168,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(61,143,168,0.12)';
              e.currentTarget.style.borderColor = 'rgba(61,143,168,0.25)';
            }}
            >
              Commencer
            </a>
          </div>
        )}

        {isMobile && (
          <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu" style={{
            background: 'none', border: 'none', cursor: 'pointer',
            width: '32px', height: '32px', display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center', gap: '5px',
          }}>
            <span style={{
              width: '20px', height: '2px', background: 'white', borderRadius: '1px',
              transform: mobileOpen ? 'rotate(45deg) translate(2.5px, 2.5px)' : 'none',
              transition: 'transform 0.3s',
            }} />
            <span style={{
              width: '20px', height: '2px', background: 'white', borderRadius: '1px',
              opacity: mobileOpen ? 0 : 1, transition: 'opacity 0.2s',
            }} />
            <span style={{
              width: '20px', height: '2px', background: 'white', borderRadius: '1px',
              transform: mobileOpen ? 'rotate(-45deg) translate(2.5px, -2.5px)' : 'none',
              transition: 'transform 0.3s',
            }} />
          </button>
        )}
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && isMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.7)' }}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0, width: '300px', zIndex: 45,
                background: 'hsl(222, 22%, 11%)',
                borderLeft: '1px solid rgba(255,255,255,0.06)',
                padding: '88px 32px 32px', display: 'flex', flexDirection: 'column', gap: '28px',
              }}
            >
              {['Fonctionnalités', 'Aperçu'].map((label) => (
                <span key={label} onClick={() => scrollTo(label === 'Fonctionnalités' ? 'features' : 'preview')} style={{
                  color: 'hsl(220, 15%, 70%)', fontSize: '18px', fontWeight: 500,
                  cursor: 'pointer',
                }}>{label}</span>
              ))}
              <a href="/login" style={{ color: 'hsl(220, 15%, 70%)', fontSize: '18px', fontWeight: 500, textDecoration: 'none' }}>Se connecter</a>
              <div style={{ flex: 1 }} />
              <a href="/register" style={{
                padding: '14px', borderRadius: '10px', textAlign: 'center',
                background: 'hsl(198, 60%, 35%)', border: '1px solid hsl(198, 60%, 45%)',
                color: 'white', fontSize: '15px', fontWeight: 600, textDecoration: 'none',
              }}>Commencer gratuitement</a>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
