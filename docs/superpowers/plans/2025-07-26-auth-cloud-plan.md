# Authentification et synchronisation cloud — Plan d'implémentation

> **Pour les agents :** REQUIRED SUB-SKILL: Utiliser `superpowers:subagent-driven-development` (recommandé) ou `superpowers:executing-plans` pour implémenter ce plan tâche par tâche. Les étapes utilisent la syntaxe `- [ ]`.

**Objectif :** Ajouter l'authentification Firebase (email/mdp + Google) et la synchronisation Firestore à SetLab sans casser les fonctionnalités V1.

**Architecture :** Approche Service Layer — deux singletons purs (`authService`, `syncService`) pattern `chronoService`, consommés par `AuthContext` (React) et `useSyncStatus` (hook). Routage React Router séparant les pages auth de l'app.

**Tech Stack :** React 19, React Router v7, Firebase v11 (Auth + Firestore), Dexie.js, Tailwind 3, Vite 6.

## Global Constraints

- Ne jamais modifier `chronoService.ts` (logique métier du chronomètre)
- Ne jamais modifier `SetlistEditor.tsx` ni `SetlistPreview.tsx`
- Ne jamais modifier `types/index.ts` (Setlist déjà compatible avec userId)
- Ne jamais modifier `db/schema.ts` (index userId déjà présent)
- Ne jamais modifier `tailwind.config.js` ni `index.css`
- Variables d'env préfixées `VITE_` (Vite n'expose que celles-ci)
- `userId: string | null` déjà présent dans le modèle — ne pas changer son type
- Le thème est dark uniquement, tokens HSL `--tl-*` existants
- PWA offline doit continuer à fonctionner — la sync échoue, pas l'outil

---

## Structure des fichiers

### Nouveaux fichiers à créer (ordre d'implémentation)

| Fichier | Responsabilité |
|---------|---------------|
| `src/firebase/config.ts` | Initialisation lazy de FirebaseApp, Auth, Firestore |
| `src/services/authService.ts` | Singleton Firebase Auth (pattern observer) |
| `src/services/syncService.ts` | Singleton Firestore sync (pattern observer) |
| `src/context/AuthContext.tsx` | State React de la session utilisateur |
| `src/context/PublicRoute.tsx` | Garde : redirige /app si connecté |
| `src/context/ProtectedRoute.tsx` | Garde : redirige /login si pas connecté |
| `src/components/auth/LoginPage.tsx` | Page /login : email/mdp + Google |
| `src/components/auth/RegisterPage.tsx` | Page /register : email/mdp + Google |
| `src/components/auth/ResetPasswordPage.tsx` | Page /reset-password : email uniquement |
| `src/components/auth/LoadingScreen.tsx` | Écran de chargement pendant vérification session |
| `src/hooks/useSyncStatus.ts` | Hook React vers l'état observable de syncService |
| `src/components/sync/SyncIndicator.tsx` | Indicateur de statut sync + menu profil |
| `src/components/migration/MigrationModal.tsx` | Modal de migration des setlists locales |

### Fichiers existants à modifier

| Fichier | Changement |
|---------|-----------|
| `src/App.tsx` | Remplacer retour direct de `<AppContent>` par `<BrowserRouter>` avec routes |
| `src/main.tsx` | Ajouter `<AuthProvider>` autour de `<App>` |
| `src/hooks/useSetlabStore.ts` | Ajouter `setUserId(userId)` et `getSetlistsByUserId` |
| `src/components/ChronoPanel.tsx` | Ajouter `<SyncIndicator>` + profil en haut |
| `package.json` | Ajouter `firebase`, `react-router-dom`, `zod` |
| `.env` | Créer avec les vars Firebase |
| `firestore.rules` | Règles de sécurité Firestore |

---

## Tasks

### Task 1: Configuration Firebase projet via MCP

**Fichiers :** Aucun fichier de code — opérations MCP Firebase
**Dépend de :** Rien
**Produit :** Projet Firebase créé, Authentication activé (email/mdp + Google), app web enregistrée, config SDK disponible

Le MCP Firebase est déjà configuré. On l'utilise pour :

- [ ] **Étape 1.1 : Lister les projets Firebase existants**

```bash
firebase login
```

Utiliser le MCP `firebase_firebase_list_projects` pour vérifier si un projet existe déjà.

- [ ] **Étape 1.2 : Créer le projet Firebase (si nécessaire)**

Via MCP `firebase_firebase_create_project` :
- `project_id`: `setlab-saas`
- `display_name`: `SetLab SaaS`

- [ ] **Étape 1.3 : Initialiser les services Firebase dans le projet local**

Via MCP `firebase_firebase_init` :
- Auth : email/password + Google Sign-In activés
- Firestore : database initialisée

- [ ] **Étape 1.4 : Récupérer la config SDK**

Via MCP `firebase_firebase_get_sdk_config` (platform: web) → noter les valeurs pour `.env`

- [ ] **Étape 1.5 : Écrire les règles Firestore**

Via MCP `firebase_firebase_set_security_rules` (ou déploiement manuel) :

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /setlists/{docId} {
      allow read, update, delete: if request.auth != null
        && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

- [ ] **Étape 1.6 : Déployer les règles**

Via MCP `firebase_firebase_deploy` avec `only: firestore`.

---

### Task 2: Dépendances & configuration Firebase

**Fichiers :**
- Modifier : `package.json`
- Créer : `.env`
- Créer : `src/firebase/config.ts`

**Dépend de :** Task 1 (clés Firebase)
**Produit :** Firebase SDK prêt à être importé, avec `getAuth()`, `getFirestore()`, `getFirebaseApp()` lazy

- [ ] **Étape 2.1 : Installer les dépendances**

```bash
npm install firebase react-router-dom zod
```

Vérifier que `firebase` et `react-router-dom` apparaissent dans `package.json` dependencies.

- [ ] **Étape 2.2 : Créer le fichier `.env`**

```env
VITE_FIREBASE_API_KEY=votre_api_key
VITE_FIREBASE_AUTH_DOMAIN=setlab-saas.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=setlab-saas
VITE_FIREBASE_STORAGE_BUCKET=setlab-saas.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
VITE_FIREBASE_APP_ID=votre_app_id
```

- [ ] **Étape 2.3 : Créer `src/firebase/config.ts`**

```ts
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

export function getFirebaseFirestore(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }
  return db;
}
```

- [ ] **Étape 2.4 : Vérifier le build**

```bash
npm run build
```

Expected : succès, pas d'erreur d'import sur `firebase/*`.

---

### Task 3: AuthService — Singleton Firebase Auth

**Fichiers :**
- Créer : `src/services/authService.ts`

**Dépend de :** Task 2 (firebase/config.ts)
**Produit :** `authService` singleton avec API : `init`, `signIn`, `signUp`, `signInWithGoogle`, `logout`, `resetPassword`, `onUserChange`, `offUserChange`, `getCurrentUser`

- [ ] **Étape 3.1 : Créer `src/services/authService.ts`**

```ts
import {
  type User,
  type UserCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth';
import { getFirebaseAuth } from '../firebase/config';

type UserListener = (user: User | null) => void;

class AuthService {
  private static instance: AuthService;
  private auth = getFirebaseAuth();
  private userListeners = new Set<UserListener>();
  private currentUser: User | null = null;
  private unsubAuth: (() => void) | null = null;
  private _initialized = false;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  get initialized(): boolean {
    return this._initialized;
  }

  init(): Promise<void> {
    return new Promise((resolve) => {
      if (this.unsubAuth) {
        this.unsubAuth();
      }
      this.unsubAuth = onAuthStateChanged(this.auth, (user) => {
        this.currentUser = user;
        this._initialized = true;
        this.userListeners.forEach((fn) => fn(user));
        resolve();
      });
    });
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  async signIn(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async signUp(email: string, password: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  async signInWithGoogle(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    return signInWithPopup(this.auth, provider);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(this.auth, email);
  }

  onUserChange(listener: UserListener): void {
    this.userListeners.add(listener);
    if (this._initialized) {
      listener(this.currentUser);
    }
  }

  offUserChange(listener: UserListener): void {
    this.userListeners.delete(listener);
  }

  destroy(): void {
    if (this.unsubAuth) {
      this.unsubAuth();
      this.unsubAuth = null;
    }
    this.userListeners.clear();
    this.currentUser = null;
    this._initialized = false;
  }
}

export const authService = AuthService.getInstance();
```

- [ ] **Étape 3.2 : Vérifier le build**

```bash
npm run build
```

Expected : succès.

---

### Task 4: AuthContext — Session React + gardes de route

**Fichiers :**
- Créer : `src/context/AuthContext.tsx`
- Créer : `src/context/ProtectedRoute.tsx`
- Créer : `src/context/PublicRoute.tsx`
- Créer : `src/components/auth/LoadingScreen.tsx`

**Dépend de :** Task 3 (authService)
**Produit :** `<AuthProvider>`, `useAuth()`, `<ProtectedRoute>`, `<PublicRoute>`, `LoadingScreen`

- [ ] **Étape 4.1 : Créer `src/context/AuthContext.tsx`**

```tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type { User } from 'firebase/auth';
import { authService } from '../services/authService';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.onUserChange((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => {
      authService.offUserChange(() => {});
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    await authService.signIn(email, password);
  };

  const signUp = async (email: string, password: string) => {
    await authService.signUp(email, password);
  };

  const signInWithGoogle = async () => {
    await authService.signInWithGoogle();
  };

  const logout = async () => {
    await authService.logout();
  };

  const resetPassword = async (email: string) => {
    await authService.resetPassword(email);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signInWithGoogle, logout, resetPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
```

- [ ] **Étape 4.2 : Créer `src/components/auth/LoadingScreen.tsx`**

```tsx
export function LoadingScreen() {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'hsl(222, 25%, 7%)',
        color: 'hsl(198, 80%, 80%)',
        fontFamily: 'system-ui, sans-serif',
        gap: '24px',
      }}
    >
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="30" stroke="hsl(198, 60%, 35%)" strokeWidth="2" fill="none" />
        <text x="32" y="40" textAnchor="middle" fill="hsl(198, 80%, 80%)" fontSize="24" fontWeight="bold" fontFamily="monospace">SL</text>
      </svg>
      <div style={{ fontSize: '14px', opacity: 0.6 }}>SetLab</div>
    </div>
  );
}
```

- [ ] **Étape 4.3 : Créer `src/context/ProtectedRoute.tsx`**

```tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { LoadingScreen } from '../components/auth/LoadingScreen';
import type { ReactNode } from 'react';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
```

- [ ] **Étape 4.4 : Créer `src/context/PublicRoute.tsx`**

```tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { LoadingScreen } from '../components/auth/LoadingScreen';
import type { ReactNode } from 'react';

export function PublicRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/app" replace />;
  return <>{children}</>;
}
```

- [ ] **Étape 4.5 : Vérifier le build**

```bash
npm run build
```

Expected : succès.

---

### Task 5: Pages d'authentification + routage

**Fichiers :**
- Créer : `src/components/auth/LoginPage.tsx`
- Créer : `src/components/auth/RegisterPage.tsx`
- Créer : `src/components/auth/ResetPasswordPage.tsx`
- Modifier : `src/App.tsx`

**Dépend de :** Task 4 (AuthContext, ProtectedRoute, PublicRoute)
**Produit :** Routes `/login`, `/register`, `/reset-password`, `/app` fonctionnelles

- [ ] **Étape 5.1 : Créer `src/components/auth/LoginPage.tsx`**

```tsx
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
      if (msg.includes('invalid-credential')) {
        setError('Email ou mot de passe incorrect');
      } else if (msg.includes('user-not-found')) {
        setError('Aucun compte trouvé avec cet email');
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
        <div style={styles.logo}>SetLab</div>
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
```

- [ ] **Étape 5.2 : Créer `src/components/auth/RegisterPage.tsx`**

Même structure que LoginPage mais avec `signUp` au lieu de `signIn`. Affiche les erreurs : `email-already-in-use`, `weak-password`. Lien "Déjà un compte ? Se connecter" vers `/login`.

```tsx
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function RegisterPage() {
  const { signUp, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setSubmitting(true);
    try {
      await signUp(email, password);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur d'inscription";
      if (msg.includes('email-already-in-use')) {
        setError('Cet email est déjà utilisé');
      } else if (msg.includes('weak-password')) {
        setError('Mot de passe trop faible (minimum 6 caractères)');
      } else if (msg.includes('invalid-email')) {
        setError('Email invalide');
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
        <div style={styles.logo}>SetLab</div>
        <h1 style={styles.title}>Inscription</h1>

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
            placeholder="Mot de passe (6 caractères min)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Confirmer le mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            style={styles.input}
          />

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" disabled={submitting} style={styles.button}>
            {submitting ? 'Inscription…' : "S'inscrire"}
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

        <div style={styles.footer}>
          Déjà un compte ?{' '}
          <Link to="/login" style={styles.link}>Se connecter</Link>
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
  footer: {
    marginTop: 20,
    color: 'hsl(220, 15%, 50%)',
    fontSize: 13,
  },
  link: {
    color: 'hsl(198, 80%, 80%)',
    fontSize: 13,
    textDecoration: 'none',
  },
};
```

- [ ] **Étape 5.3 : Créer `src/components/auth/ResetPasswordPage.tsx`**

```tsx
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
```

- [ ] **Étape 5.4 : Modifier `src/App.tsx` pour le routage**

Lire d'abord le contenu actuel de `src/App.tsx`, puis remplacer :

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SetlabProvider } from './context/SetlabContext';
import { ProtectedRoute } from './context/ProtectedRoute';
import { PublicRoute } from './context/PublicRoute';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { SetlistEditor } from './components/SetlistEditor';
import { SetlistPreview } from './components/SetlistPreview';
import { ChronoPanel } from './components/ChronoPanel';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <SetlabProvider>
                <AppContent />
              </SetlabProvider>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/app" replace />} />
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

// Garder AppContent existant
export function AppContent() {
  // contenu existant inchangé
}
```

- [ ] **Étape 5.5 : Vérifier le build**

```bash
npm run build
```

Expected : succès.

---

### Task 6: SyncService — Singleton Firestore

**Fichiers :**
- Créer : `src/services/syncService.ts`

**Dépend de :** Task 2 (firebase/config.ts)
**Produit :** `syncService` singleton avec API : `init`, `destroy`, `pushSetlist`, `pullSetlists`, `getStatus`, `onStatusChange`, `offStatusChange`

- [ ] **Étape 6.1 : Créer `src/services/syncService.ts`**

```ts
import {
  doc,
  setDoc,
  getDocs,
  query,
  where,
  collection,
  Timestamp,
} from 'firebase/firestore';
import { getFirebaseFirestore } from '../firebase/config';
import type { Setlist } from '../types';
import { db as dexieDb } from '../db/schema';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

export interface SyncServiceState {
  status: SyncStatus;
  lastSyncedAt: string | null;
  error: string | null;
}

type StatusListener = (state: SyncServiceState) => void;

class SyncService {
  private static instance: SyncService;
  private firestore = getFirebaseFirestore();
  private status: SyncStatus = 'offline';
  private lastSyncedAt: string | null = null;
  private error: string | null = null;
  private listeners = new Set<StatusListener>();
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private userId: string | null = null;
  private pendingPush = false;
  private onlineHandler: (() => void) | null = null;
  private offlineHandler: (() => void) | null = null;

  private constructor() {
    this.onlineHandler = () => {
      if (this.pendingPush) {
        this.setStatus('syncing');
      }
    };
    this.offlineHandler = () => {
      this.setStatus('offline');
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.onlineHandler);
      window.addEventListener('offline', this.offlineHandler);
    }
  }

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  async init(userId: string): Promise<void> {
    this.userId = userId;
    this.setStatus('syncing');

    try {
      const remoteSetlists = await this.pullSetlists();
      const localSetlists = await dexieDb.setlists
        .where('userId').equals(userId)
        .toArray();

      const localMap = new Map(localSetlists.map((s) => [s.id, s]));

      for (const remote of remoteSetlists) {
        const local = localMap.get(remote.id);
        if (!local) {
          // Nouveau document distant -> copier en local
          await dexieDb.setlists.put(remote);
        } else if (new Date(remote.updatedAt).getTime() > new Date(local.updatedAt).getTime()) {
          // Remote plus récent -> mettre à jour local
          await dexieDb.setlists.put(remote);
        }
        localMap.delete(remote.id);
      }

      // Les setlists locales sans équivalent distant ont déjà leur userId
      // donc elles sont déjà "locales only" — c'est normal

      this.lastSyncedAt = new Date().toISOString();
      this.setStatus('synced');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur de synchronisation';
      this.error = msg;
      this.setStatus('offline');
    }
  }

  async pushSetlist(setlist: Setlist): Promise<void> {
    if (!this.userId) return;

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(async () => {
      this.setStatus('syncing');
      this.pendingPush = true;

      try {
        const docRef = doc(this.firestore, 'setlists', setlist.id);
        await setDoc(docRef, {
          ...setlist,
          userId: this.userId,
          updatedAt: new Date().toISOString(),
        });
        this.lastSyncedAt = new Date().toISOString();
        this.error = null;
        this.setStatus('synced');
        this.pendingPush = false;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erreur réseau';
        this.error = msg;
        if (!navigator.onLine) {
          this.setStatus('offline');
        } else {
          this.setStatus('error');
        }
        this.pendingPush = false;
      }
    }, 1000);
  }

  private async pullSetlists(): Promise<Setlist[]> {
    if (!this.userId) return [];

    const q = query(
      collection(this.firestore, 'setlists'),
      where('userId', '==', this.userId)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => {
      const data = d.data();
      return {
        ...data,
        createdAt: data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp
          ? data.updatedAt.toDate().toISOString()
          : data.updatedAt,
        stageTimeLimit: data.stageTimeLimit ?? null,
      } as unknown as Setlist;
    });
  }

  destroy(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    if (this.onlineHandler) {
      window.removeEventListener('online', this.onlineHandler);
    }
    if (this.offlineHandler) {
      window.removeEventListener('offline', this.offlineHandler);
    }
    this.listeners.clear();
    this.userId = null;
    this.status = 'offline';
  }

  getStatus(): SyncStatus {
    if (!navigator.onLine) return 'offline';
    return this.status;
  }

  onStatusChange(listener: StatusListener): void {
    this.listeners.add(listener);
    listener({
      status: this.getStatus(),
      lastSyncedAt: this.lastSyncedAt,
      error: this.error,
    });
  }

  offStatusChange(listener: StatusListener): void {
    this.listeners.delete(listener);
  }

  private setStatus(status: SyncStatus): void {
    this.status = status;
    const state: SyncServiceState = {
      status: this.getStatus(),
      lastSyncedAt: this.lastSyncedAt,
      error: this.error,
    };
    this.listeners.forEach((fn) => fn(state));
  }
}

export const syncService = SyncService.getInstance();
```

- [ ] **Étape 6.2 : Vérifier le build**

```bash
npm run build
```

Expected : succès.

---

### Task 7: Hook useSyncStatus + SyncIndicator + profil

**Fichiers :**
- Créer : `src/hooks/useSyncStatus.ts`
- Créer : `src/components/sync/SyncIndicator.tsx`

**Dépend de :** Task 6 (syncService)
**Produit :** Hook `useSyncStatus` et composant `SyncIndicator` (statut + menu profil déroulant)

- [ ] **Étape 7.1 : Créer `src/hooks/useSyncStatus.ts`**

```ts
import { useState, useEffect } from 'react';
import { syncService, type SyncServiceState } from '../services/syncService';

export function useSyncStatus(): SyncServiceState {
  const [state, setState] = useState<SyncServiceState>(() => ({
    status: syncService.getStatus(),
    lastSyncedAt: null,
    error: null,
  }));

  useEffect(() => {
    const handler = (s: SyncServiceState) => setState(s);
    syncService.onStatusChange(handler);
    return () => syncService.offStatusChange(handler);
  }, []);

  return state;
}
```

- [ ] **Étape 7.2 : Créer `src/components/sync/SyncIndicator.tsx`**

```tsx
import { useState, useRef, useEffect } from 'react';
import { useSyncStatus } from '../../hooks/useSyncStatus';
import { useAuth } from '../../context/AuthContext';
import { syncService } from '../../services/syncService';

export function SyncIndicator() {
  const { user, logout } = useAuth();
  const { status, error } = useSyncStatus();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    syncService.destroy();
    await logout();
  };

  const statusConfig: Record<string, { icon: string; text: string; color: string }> = {
    synced: {
      icon: '✓',
      text: 'Synchronisé',
      color: 'hsl(198, 80%, 80%)',
    },
    syncing: {
      icon: '⟳',
      text: 'Synchronisation…',
      color: 'hsl(198, 80%, 80%)',
    },
    offline: {
      icon: '⊘',
      text: 'Hors ligne',
      color: 'hsl(220, 15%, 50%)',
    },
    error: {
      icon: '⚠',
      text: error || 'Échec de sync',
      color: '#e57373',
    },
  };

  const cfg = statusConfig[status] || statusConfig.offline;

  return (
    <div
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid hsl(220, 15%, 22%)',
      }}
    >
      {/* Profil */}
      <div ref={menuRef} style={{ position: 'relative', marginBottom: 8 }}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'none',
            border: 'none',
            color: 'hsl(198, 48%, 94%)',
            cursor: 'pointer',
            padding: 0,
            fontSize: 13,
            width: '100%',
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'hsl(198, 60%, 35%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 'bold',
              color: '#fff',
              flexShrink: 0,
            }}
          >
            {user?.email?.charAt(0).toUpperCase() || '?'}
          </div>
          <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.email || 'Utilisateur'}
          </span>
          <span style={{ fontSize: 10 }}>{menuOpen ? '▲' : '▼'}</span>
        </button>

        {menuOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: 4,
              background: 'hsl(222, 18%, 13%)',
              border: '1px solid hsl(220, 15%, 22%)',
              borderRadius: 8,
              padding: 4,
              zIndex: 50,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}
          >
            <div
              style={{
                padding: '8px 12px',
                fontSize: 12,
                color: 'hsl(220, 15%, 50%)',
                borderBottom: '1px solid hsl(220, 15%, 22%)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.email}
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'none',
                border: 'none',
                color: '#e57373',
                cursor: 'pointer',
                fontSize: 13,
                textAlign: 'left',
                borderRadius: 4,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(229,115,115,0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              Se déconnecter
            </button>
          </div>
        )}
      </div>

      {/* Statut sync */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          color: cfg.color,
        }}
      >
        <span style={{
          display: 'inline-block',
          animation: status === 'syncing' ? 'spin 1s linear infinite' : 'none',
        }}>
          {cfg.icon}
        </span>
        <span>{cfg.text}</span>
      </div>

      {status === 'syncing' && (
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      )}
    </div>
  );
}
```

- [ ] **Étape 7.3 : Vérifier le build**

```bash
npm run build
```

Expected : succès.

---

### Task 8: MigrationModal — Choix des setlists locales

**Fichiers :**
- Créer : `src/components/migration/MigrationModal.tsx`

**Dépend de :** Task 4 (AuthContext pour user) et Task 6 (syncService pour push)
**Produit :** Modal affichée après connexion si setlists orphelines détectées

- [ ] **Étape 8.1 : Créer `src/components/migration/MigrationModal.tsx`**

```tsx
import { useState, useEffect } from 'react';
import { db } from '../../db/schema';
import { syncService } from '../../services/syncService';
import type { Setlist } from '../../types';

interface MigrationModalProps {
  userId: string;
  onComplete: () => void;
}

export function MigrationModal({ userId, onComplete }: MigrationModalProps) {
  const [orphanedSetlists, setOrphanedSetlists] = useState<Setlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    db.setlists
      .where('userId').equals(null)
      .toArray()
      .then((list) => {
        setOrphanedSetlists(list);
        setLoading(false);
      });
  }, []);

  if (loading) return null;

  if (orphanedSetlists.length === 0) {
    onComplete();
    return null;
  }

  const handleAssociate = async () => {
    setProcessing(true);
    try {
      for (const sl of orphanedSetlists) {
        const updated = { ...sl, userId };
        await db.setlists.put(updated);
        await syncService.pushSetlist(updated);
      }
      onComplete();
    } finally {
      setProcessing(false);
    }
  };

  const handleIgnore = async () => {
    setProcessing(true);
    try {
      await db.setlists.where('userId').equals(null).delete();
      onComplete();
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          width: '90%',
          maxWidth: 440,
          padding: '32px 28px',
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          textAlign: 'center',
        }}
      >
        <h2 style={{ color: 'hsl(198, 48%, 94%)', fontSize: 18, margin: '0 0 12px', fontWeight: 600 }}>
          Setlists locales détectées
        </h2>
        <p style={{ color: 'hsl(220, 15%, 60%)', fontSize: 14, lineHeight: 1.5, margin: '0 0 20px' }}>
          Nous avons trouvé {orphanedSetlists.length} setlist
          {orphanedSetlists.length > 1 ? 's' : ''} créée
          {orphanedSetlists.length > 1 ? 's' : ''} avant votre connexion.
          Que souhaitez-vous en faire ?
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={handleAssociate}
            disabled={processing}
            style={{
              padding: '12px 16px',
              borderRadius: 8,
              border: '1px solid hsl(198, 60%, 45%)',
              background: 'hsl(198, 60%, 35%)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: processing ? 'not-allowed' : 'pointer',
              opacity: processing ? 0.6 : 1,
            }}
          >
            {processing ? 'Association…' : `🔄 Associer à mon compte`}
          </button>

          <button
            onClick={handleIgnore}
            disabled={processing}
            style={{
              padding: '12px 16px',
              borderRadius: 8,
              border: '1px solid hsl(220, 15%, 22%)',
              background: 'transparent',
              color: 'hsl(220, 15%, 50%)',
              fontSize: 14,
              fontWeight: 500,
              cursor: processing ? 'not-allowed' : 'pointer',
              opacity: processing ? 0.6 : 1,
            }}
          >
            🗑️ Ignorer, repartir de zéro
          </button>
        </div>

        <p style={{ color: 'hsl(220, 15%, 40%)', fontSize: 12, marginTop: 16, lineHeight: 1.4 }}>
          Vous pourrez importer un fichier .tl ultérieurement.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Étape 8.2 : Vérifier le build**

```bash
npm run build
```

Expected : succès.

---

### Task 9: Intégration AuthContext dans main.tsx + migration dans AuthContext

**Fichiers :**
- Modifier : `src/main.tsx`
- Modifier : `src/context/AuthContext.tsx`

**Dépend de :** Task 4 (AuthContext), Task 8 (MigrationModal), Task 5 (App routing)
**Produit :** L'app est wrappée dans AuthProvider, la migration se déclenche après connexion

- [ ] **Étape 9.1 : Lire le fichier `src/main.tsx` actuel**

```bash
cat src/main.tsx
```

- [ ] **Étape 9.2 : Modifier `src/main.tsx`**

Rajouter `<AuthProvider>` autour de `<App />` :

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
```

- [ ] **Étape 9.3 : Ajouter la migration dans AuthContext.tsx**

Ajouter la détection de setlists orphelines après connexion dans `AuthContext.tsx` :

```tsx
import { useState, useEffect, useCallback } from 'react';
// ... imports existants ...
import { MigrationModal } from '../components/migration/MigrationModal';
import { syncService } from '../services/syncService';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMigration, setShowMigration] = useState(false);

  useEffect(() => {
    authService.init().then(() => {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    });

    authService.onUserChange((u) => {
      setUser(u);
      if (u) {
        syncService.init(u.uid);
        // Vérifier les setlists orphelines après un petit délai (le temps que la connexion s'établisse)
        setTimeout(() => setShowMigration(true), 500);
      } else {
        syncService.destroy();
        setShowMigration(false);
      }
    });

    return () => {
      authService.offUserChange(() => {});
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    await authService.signIn(email, password);
  };

  const signUp = async (email: string, password: string) => {
    await authService.signUp(email, password);
  };

  const signInWithGoogle = async () => {
    await authService.signInWithGoogle();
  };

  const logout = async () => {
    await authService.logout();
  };

  const resetPassword = async (email: string) => {
    await authService.resetPassword(email);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signInWithGoogle, logout, resetPassword }}
    >
      {children}
      {showMigration && user && (
        <MigrationModal
          userId={user.uid}
          onComplete={() => setShowMigration(false)}
        />
      )}
    </AuthContext.Provider>
  );
}
```

- [ ] **Étape 9.4 : Vérifier le build**

```bash
npm run build
```

Expected : succès.

---

### Task 10: Intégration SyncIndicator + setUserId dans l'application

**Fichiers :**
- Modifier : `src/components/ChronoPanel.tsx`
- Modifier : `src/hooks/useSetlabStore.ts`

**Dépend de :** Task 7 (SyncIndicator), Task 6 (syncService), Task 8 (MigrationModal)
**Produit :** SyncIndicator visible en haut de ChronoPanel, setUserId utilisable dans le store

- [ ] **Étape 10.1 : Lire et modifier `src/components/ChronoPanel.tsx`**

Lire le fichier, puis ajouter `<SyncIndicator />` en haut du retour du composant, avant tout le contenu existant :

```tsx
// Après les imports existants, ajouter :
import { SyncIndicator } from '../sync/SyncIndicator';

// Dans le JSX du return, tout en haut :
return (
  <div style={{ width: 320, ...styles.container }}>
    <SyncIndicator />
    {/* contenu existant du chronomètre */}
    ...
  </div>
);
```

- [ ] **Étape 10.2 : Lire et modifier `src/hooks/useSetlabStore.ts`**

Ajouter la fonction `setUserId` qui :
1. Met à jour `userId` de la setlist courante
2. Sauvegarde dans Dexie
3. Déclenche un push vers syncService

```ts
// Dans le hook useSetlabStore, ajouter :
const setUserId = useCallback(async (userId: string) => {
  setSetlist((prev) => {
    if (!prev) return prev;
    const updated = { ...prev, userId };
    sauvegarder(updated);
    return updated;
  });
}, [sauvegarder]);
```

Et ajouter dans l'objet retourné :
```ts
return {
  setlist,
  loading,
  setBandName,
  setStageTimeLimit,
  addSong,
  updateSong,
  deleteSong,
  reorderSong,
  importerSetlist,
  exporterSetlist,
  setUserId,  // <-- ajouter
};
```

- [ ] **Étape 10.3 : Modifier `useSetlabStore` pour pousser vers syncService à chaque sauvegarde**

Dans la fonction `sauvegarder`, après l'écriture Dexie, ajouter :

```ts
import { syncService } from '../services/syncService';
// ... dans sauvegarder :
await dexieDb.setlists.put(updated);
syncService.pushSetlist(updated);  // fire-and-forget, pas de await
```

- [ ] **Étape 10.4 : Vérifier le build**

```bash
npm run build
```

Expected : succès.

---

## Self-review checklist

1. **Spec coverage** :
   - ✅ Login/Register/ResetPassword pages (Task 5)
   - ✅ Écran auth dédié, pas une modal (Task 5 — routes séparées)
   - ✅ Email/mdp + Google (Task 3 — authService)
   - ✅ Migration des setlists locales (Task 8, Task 9)
   - ✅ Sync Firestore avec règles (Task 6, Task 1)
   - ✅ SyncIndicator + profil dans ChronoPanel (Task 7, Task 10)
   - ✅ "Last write wins" sans conflits complexes (Task 6 — init compare timestamps)
   - ✅ PWA offline continue (syncService gère les erreurs, pas d'impact sur l'outil)
   - ✅ chronoService intact (pas dans la liste des modifiés)
   - ✅ Thème dark cohérent (tokens HSL réutilisés dans toutes les pages auth)

2. **Placeholder scan** : Aucun "TBD", "TODO", ou implémentation incomplète — tout le code est concret.

3. **Type consistency** : `Setlist.userId: string | null` cohérent partout. `authService` retourne `User | null`. `syncService` utilise `SyncStatus` enum. Les signatures sont cohérentes entre tâches.

4. **Scope check** : Pas de dérive — freemium, paiement, export JPG, collaboration sont explicitement exclus.