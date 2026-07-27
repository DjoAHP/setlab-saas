import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function LoginPage() {
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signIn(email, password);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur de connexion';
      if (msg.includes('invalid-credential') || msg.includes('wrong-password') || msg.includes('user-not-found')) {
        setError('Email ou mot de passe incorrect');
      } else if (msg.includes('too-many-requests')) {
        setError('Trop de tentatives. Réessayez plus tard.');
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur Google';
      if (!msg.includes('popup-closed-by-user')) {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <svg width="32" height="32" viewBox="0 0 256 256" fill="none" style={{ flexShrink: 0 }}>
            <path fill="hsl(198, 80%, 80%)" d="M16.15,16.98c6.71,67.36,8.87,134.88,7.17,202.46-.18,5.19-.48,10.45-.73,15.64-.12-.64-.72-1.2-1.37-1.12,23.55,1.49,51.91,3.42,76.18,3.84,41.86.9,84.65-1.21,126.54-3.51,1.7-.19,7.63-.32,9.35-.5-.22-.06-.53-.03-.77.07-.47.18-.89.8-.93,1.21,0,0-.02-.4-.02-.4,0,0-.26-6.33-.26-6.33-2.13-68.48-3.78-137-1.54-205.49.06,1.57,1.34,2.99,2.89,3.18.14.04.3.02.44.04.06,0,.18-.01.18-.01,0,0-.4-.01-.4-.01,0,0-12.65-.38-12.65-.38-42.01-1.61-84.66-3.64-126.54-7.73,0,0,0-1.95,0-1.95,46.08-4.47,92.97-6.61,139.19-8.11,10.22-.19,16.44,8.18,15.71,18,1.66,50.61,1,101.23-.23,151.85-.42,19.37-.82,38.81-1.72,58.18-.37,6.67-6.41,12.37-13.1,12.19-1.92-.04-7.6-.41-9.63-.49,0,0-25.31-1.32-25.31-1.32-58.93-3.66-118.28-2.82-177.16,1.57-7.03.6-13.56-5.4-13.71-12.44-.21-5.31-.59-10.69-.74-15.99-1.25-33.75-.48-67.49.54-101.23,1.29-33.74,2.88-67.49,6.63-101.23h1.95Z" />
            <path fill="hsl(198, 80%, 80%)" d="M193.89,203.86c-2.55,0-5.1-.97-7.05-2.92L55.06,69.16c-3.89-3.89-3.89-10.21,0-14.1,3.89-3.89,10.21-3.89,14.1,0l131.79,131.78c3.89,3.89,3.89,10.21,0,14.1-1.95,1.95-4.5,2.92-7.05,2.92ZM158.04,201.96c2.6-2.6,2.6-6.8,0-9.4L63.44,97.96c-2.6-2.6-6.8-2.6-9.4,0s-2.6,6.8,0,9.4l94.59,94.59c1.3,1.3,3,1.95,4.7,1.95s3.4-.65,4.7-1.95ZM201.96,158.04c2.6-2.6,2.6-6.8,0-9.4L107.37,54.04c-2.6-2.6-6.8-2.6-9.4,0-2.6,2.6-2.6,6.8,0,9.4l94.59,94.59c1.3,1.3,3,1.95,4.7,1.95s3.4-.65,4.7-1.95ZM210.91,123.06c3.89-3.89,3.89-10.21,0-14.1l-63.87-63.87c-3.89-3.89-10.21-3.89-14.1,0-3.89,3.89-3.89,10.21,0,14.1l63.87,63.87c1.95,1.95,4.5,2.92,7.05,2.92s5.1-.97,7.05-2.92ZM123.06,210.91c3.89-3.89,3.89-10.21,0-14.1l-63.87-63.87c-3.89-3.89-10.21-3.89-14.1,0-3.89,3.89-3.89,10.21,0,14.1l63.87,63.87c1.95,1.95,4.5,2.92,7.05,2.92s5.1-.97,7.05-2.92Z" />
          </svg>
          <span style={styles.logo}>SetLab</span>
        </div>
        <h1 style={styles.title}>Connexion</h1>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" disabled={submitting} style={styles.button}>
            {submitting ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <div style={styles.divider}>OU</div>

        <button onClick={handleGoogle} disabled={submitting} style={styles.googleButton}>
          <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
            <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuer avec Google
        </button>

        <div style={styles.links}>
          <Link to="/reset-password" style={styles.link}>Mot de passe oublié ?</Link>
        </div>

        <div style={styles.footer}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={styles.link}>S'inscrire</Link>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'hsl(222, 25%, 7%)',
    fontFamily: 'system-ui, sans-serif',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 8,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: '40px 32px',
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    textAlign: 'center',
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'hsl(198, 80%, 80%)',
    letterSpacing: 2,
  },
  title: {
    fontSize: 18,
    color: 'hsl(198, 48%, 94%)',
    marginBottom: 24,
    fontWeight: 400,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  input: {
    padding: '12px 16px',
    borderRadius: 8,
    border: '1px solid hsl(220, 15%, 22%)',
    background: 'rgba(0,0,0,0.3)',
    color: 'hsl(198, 48%, 94%)',
    fontSize: 14,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  button: {
    padding: '12px 16px',
    borderRadius: 8,
    border: '1px solid hsl(198, 60%, 45%)',
    background: 'hsl(198, 60%, 35%)',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 4,
  },
  googleButton: {
    padding: '12px 16px',
    borderRadius: 8,
    border: '1px solid hsl(220, 15%, 22%)',
    background: 'rgba(255,255,255,0.06)',
    color: 'hsl(198, 48%, 94%)',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  divider: {
    margin: '16px 0',
    color: 'hsl(220, 15%, 50%)',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  error: {
    color: '#e57373',
    fontSize: 13,
    padding: '8px 12px',
    background: 'rgba(229,115,115,0.1)',
    borderRadius: 6,
    textAlign: 'left',
  },
  links: {
    marginTop: 12,
  },
  link: {
    color: 'hsl(198, 80%, 80%)',
    fontSize: 13,
    textDecoration: 'none',
  },
  footer: {
    marginTop: 20,
    color: 'hsl(220, 15%, 50%)',
    fontSize: 13,
  },
};