import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur';
      if (msg.includes('user-not-found')) {
        setError('Aucun compte trouvé avec cet email');
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.logo}>SetLab</div>
        <h1 style={styles.title}>Mot de passe oublié</h1>

        {sent ? (
          <>
            <p style={{ color: 'hsl(198, 48%, 94%)', fontSize: 14, lineHeight: 1.5 }}>
              Un email de réinitialisation a été envoyé à <strong>{email}</strong>.
            </p>
            <Link to="/login" style={{ ...styles.link, display: 'block', marginTop: 20 }}>
              Retour à la connexion
            </Link>
          </>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="email"
              placeholder="Votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />

            {error && <div style={styles.error}>{error}</div>}

            <button type="submit" disabled={submitting} style={styles.button}>
              {submitting ? 'Envoi…' : 'Envoyer le lien'}
            </button>

            <Link to="/login" style={{ ...styles.link, display: 'block', marginTop: 12 }}>
              Retour à la connexion
            </Link>
          </form>
        )}
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
    marginBottom: 8,
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
  error: {
    color: '#e57373',
    fontSize: 13,
    padding: '8px 12px',
    background: 'rgba(229,115,115,0.1)',
    borderRadius: 6,
    textAlign: 'left',
  },
  link: {
    color: 'hsl(198, 80%, 80%)',
    fontSize: 13,
    textDecoration: 'none',
  },
};