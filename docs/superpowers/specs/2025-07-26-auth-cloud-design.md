# Design : Authentification et synchronisation cloud SetLab

**Date :** 2025-07-26
**Statut :** Design validé, en attente d'implémentation
**Branche :** `feature/auth-cloud`

---

## 1. Objectif

Ajouter l'authentification Firebase (email/mdp + Google) et la synchronisation Firestore à SetLab, sans casser les fonctionnalités V1 existantes (setlists locales Dexie, chronomètre, export PDF, PWA offline).

---

## 2. Architecture : Approche C — Service Layer

Extension du pattern singleton existant (`chronoService.ts`) avec deux nouveaux services :

- **`authService`** : Firebase Authentication (singleton pur, zero React)
- **`syncService`** : Firestore sync (singleton pur, zero React)
- **`AuthContext`** : Consomme authService, fournit l'utilisateur à React
- **`useSyncStatus`** : Hook qui lit l'état observable de syncService

---

## 3. Arborescence des nouveaux fichiers

```
src/
├── firebase/
│   └── config.ts                  # Init Firebase App (lazy)
├── services/
│   ├── authService.ts             # Singleton Firebase Auth
│   └── syncService.ts             # Singleton Firestore sync
├── context/
│   └── AuthContext.tsx             # Session utilisateur + guards
├── hooks/
│   └── useSyncStatus.ts           # État observable de la sync
├── components/
│   ├── auth/
│   │   ├── LoginPage.tsx          # /login
│   │   ├── RegisterPage.tsx       # /register
│   │   ├── ResetPasswordPage.tsx  # /reset-password
│   │   └── ProtectedRoute.tsx     # Garde de route
│   ├── sync/
│   │   └── SyncIndicator.tsx      # Statut sync + profil dans ChronoPanel
│   └── migration/
│       └── MigrationModal.tsx     # Choix "Associer" ou "Ignorer" setlists locales
```

---

## 4. Dépendances npm à ajouter

- `firebase` (^11.x)
- `react-router-dom` (^7.x)
- `zod` (présent dans les imports mais absent du package.json — correction de bug)

---

## 5. Fichiers existants modifiés

| Fichier | Changement |
|---------|-----------|
| `App.tsx` | Remplacer le retour direct de `<AppContent>` par `<BrowserRouter>` avec routes |
| `main.tsx` | Ajouter `<AuthProvider>` autour de `<App>` |
| `ChronoPanel.tsx` | Ajouter `<SyncIndicator>` + menu profil en haut du panneau |
| `useSetlabStore.ts` | Ajouter `setUserId(userId)` et `getSetlistsByUserId(userId)` |
| `package.json` | Ajouter `firebase`, `react-router-dom`, `zod` |
| `.env` | Créer avec vars `VITE_FIREBASE_*` |

### Fichiers qui ne changent PAS

`chronoService.ts`, `SetlistEditor.tsx`, `SetlistPreview.tsx`, `types/index.ts`, `db/schema.ts`, `tailwind.config.js`, `index.css`

---

## 6. Routage (React Router)

```tsx
<BrowserRouter>
  <Routes>
    <Route path="/login"           element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/register"        element={<PublicRoute><RegisterPage /></PublicRoute>} />
    <Route path="/reset-password"  element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
    <Route path="/app"             element={<ProtectedRoute><AppContent /></ProtectedRoute>} />
    <Route path="/"                element={<Navigate to="/app" />} />
    <Route path="*"                element={<Navigate to="/app" />} />
  </Routes>
</BrowserRouter>
```

- **ProtectedRoute** : si loading → spinner, si !user → redirect /login, sinon → children
- **PublicRoute** : si loading → spinner, si user → redirect /app, sinon → children

---

## 7. AuthService (singleton)

Services pur, aucune dépendance React. Pattern identique à chronoService.

**API :**
- `init(): Promise<void>` — configure onAuthStateChanged, résout quand l'état est connu
- `getCurrentUser(): User | null`
- `signIn(email, password): Promise<UserCredential>`
- `signUp(email, password): Promise<UserCredential>`
- `signInWithGoogle(): Promise<UserCredential>` — signInWithPopup + GoogleAuthProvider
- `logout(): Promise<void>`
- `resetPassword(email): Promise<void>` — sendPasswordResetEmail
- `onUserChange(listener)` / `offUserChange(listener)` — pattern observer

**Firebase config (`src/firebase/config.ts`) :**
- Lazy initialization de `FirebaseApp`, `Auth`, `Firestore`
- Variables d'environnement `VITE_FIREBASE_*`

---

## 8. SyncService (singleton)

Gère la synchronisation Dexie ↔ Firestore.

**États :** `synced` | `syncing` | `offline` | `error`

**API :**
- `init(userId: string): Promise<void>` — configure le listener, pull initial
- `destroy(): void` — nettoie listeners et timers
- `pushSetlist(setlist: Setlist): Promise<void>` — écrit vers Firestore (debounce 1s)
- `pullSetlists(): Promise<Setlist[]>` — requête Firestore où userId == currentUserId
- `getStatus(): SyncStatus`
- `onStatusChange(listener)` / `offStatusChange(listener)` — pattern observer

**Stratégie :**
- Dexie = source de vérité locale (lecture/écriture immédiate, offline)
- Sync déclenchée à chaque modification (via store, avec debounce 1s)
- "Last write wins" — pas de résolution de conflits (hypothèse : 1 appareil actif)
- À la reconnexion : les pushs échoués sont réessayés
- En offline : l'application fonctionne normalement, la sync échoue silencieusement mais le statut est visible

---

## 9. AuthContext

```tsx
interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}
```

- `loading = true` pendant la vérification initiale de session (onAuthStateChanged)
- Après connexion : déclenche la détection de setlists locales orphelines (userId = null)
- Après connexion : appelle `syncService.init(user.uid)`

---

## 10. Écrans d'authentification

### Écran de chargement initial
- Fond : `--tl-bg-deep`
- Logo SetLab centré + spinner CSS

### Pages auth (Login, Register, ResetPassword)
- Fond : `--tl-bg-deep`
- Carte glassmorphism centrée :
  - `background: rgba(255,255,255,0.04)`
  - `backdrop-filter: blur(16px)`
  - `border: 1px solid rgba(255,255,255,0.08)`
  - `box-shadow: 0 8px 32px rgba(0,0,0,0.4)`
  - `border-radius: 12px`
- Logo + titre dans la carte
- Champs dark sur fond transparent
- Bouton submit : `--tl-accent-button`
- Séparateur "OU" pour Google
- Lien "Mot de passe oublié" / "Pas de compte ? S'inscrire"

---

## 11. Migration des données locales

Déclenchée juste après connexion, si des setlists avec `userId === null` existent dans Dexie.

**MigrationModal :**
- Pas un écran entier, une modal centrée
- Texte : "X setlist(s) trouvée(s) avant connexion. Que souhaitez-vous en faire ?"
- Bouton "Associer à mon compte" : update userId + push vers Firestore
- Bouton "Ignorer, repartir de zéro" : delete des setlists orphelines de Dexie

---

## 12. SyncIndicator + Profil (ChronoPanel)

### Zone en haut du ChronoPanel

```
┌──────────────────────────────┐
│  [Avatar]  email@user.com     │  ← clic → dropdown (déconnexion)
│──────────────────────────────│
│  ✓ Synchronisé               │  ← useSyncStatus()
│──────────────────────────────│
│      ⏱️ Chronomètre           │  ← contenu existant
└──────────────────────────────┘
```

États du sync indicator :
| Status | Affichage | Couleur |
|--------|-----------|---------|
| synced | ✓ Synchronisé | `--tl-accent-text` |
| syncing | ⟳ Synchronisation... | `--tl-accent-text` |
| offline | ⊘ Hors ligne | gray |
| error | ⚠ Échec de synchronisation | orange (exception) |

Menu dropdown au clic sur le profil :
- Email (affiché)
- "Se déconnecter" → logout, redirect /login

---

## 13. Firestore — Collection et règles

### Collection `setlists`

```
setlists/{docId} {
  id: string
  bandName: string
  stageTimeLimit: number | null
  songs: Song[]
  userId: string               // UID Firebase Auth
  createdAt: string            // ISO
  updatedAt: string            // ISO
}
```

Document ID = setlist.id (même UUID qu'en local). Pas de sous-collections.

### Règles de sécurité

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

Déploiement via MCP Firebase : `firebase init firestore` → `firebase deploy --only firestore`.

---

## 14. Périmètre exclu (phase suivante)

- Quotas freemium
- Paiement Stripe
- Export JPG/PNG
- Collaboration multi-utilisateurs
- Modification du chronomètre
- Profil/paramètres utilisateur avancés