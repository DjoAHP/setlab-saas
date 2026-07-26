# SetLab

**Setlist + Chronomètre pour musiciens live**

SaaS autonome qui permet de créer une setlist, chronométrer chaque morceau en répétition, et obtenir un document A4 imprimable prêt pour la scène — avec alerte si le set dépasse un temps de scène imposé.

---

## Stack

- **Frontend** : React 19 + TypeScript + Vite 6 + Tailwind v3 + React Router v7
- **Stockage local** : Dexie.js (IndexedDB), `userId` lié au compte cloud
- **Cloud** : Firebase Auth (email/mdp + Google) + Firestore (sync par userId)
- **PWA** : `vite-plugin-pwa` avec Workbox (offline, installable)
- **Export** : `window.print()` via CSS `@media print`

## Commandes

```bash
npm run dev       # Serveur de développement Vite
npm run build     # tsc -b && vite build
npm run lint      # ESLint
npm run preview   # Prévisualisation du build
```

## Authentification & synchronisation

L'app **nécessite un compte** (email/mdp ou Google). Les setlists sont stockées localement dans Dexie et synchronisées en arrière-plan vers Firestore (collection `setlists`, accès restreint au `userId` propriétaire). En cas de données locales existantes avant la première connexion, une modal propose de les associer au compte ou de les ignorer.

Le statut de synchronisation est visible en haut de la sidebar ChronoPanel (synced, syncing, offline, error), avec un menu profil pour la déconnexion.

## Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginPage.tsx         # /login
│   │   ├── RegisterPage.tsx      # /register
│   │   ├── ResetPasswordPage.tsx # /reset-password
│   │   └── LoadingScreen.tsx     # écran de chargement session
│   ├── migration/
│   │   └── MigrationModal.tsx    # migration setlists locales
│   ├── sync/
│   │   └── SyncIndicator.tsx     # statut sync + profil
│   ├── SetlistEditor.tsx         # Sidebar gauche — édition de la setlist
│   ├── SetlistPreview.tsx        # Colonne centrale — aperçu A4 temps réel
│   └── ChronoPanel.tsx           # Sidebar droite — chronomètre + sync
├── context/
│   ├── AuthContext.tsx           # Session utilisateur
│   ├── ProtectedRoute.tsx        # Garde connecté
│   ├── PublicRoute.tsx           # Garde non connecté
│   └── SetlabContext.tsx         # Provider React Context setlist
├── hooks/
│   ├── useSetlabStore.ts         # Store custom (pas de Zustand)
│   └── useSyncStatus.ts          # État de la synchronisation
├── services/
│   ├── authService.ts            # Singleton Firebase Auth
│   ├── syncService.ts            # Singleton Firestore sync
│   └── chronoService.ts          # Singleton chronomètre (Date.now)
├── firebase/
│   └── config.ts                 # Initialisation Firebase (lazy)
├── db/
│   └── schema.ts                 # Dexie schema
└── types/
    └── index.ts                  # Types Setlist, Song
```

## Version

`1.3.1`