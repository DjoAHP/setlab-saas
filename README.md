# SetLab

**Setlist + Chronomètre pour musiciens live**

SaaS autonome qui permet de créer une setlist, chronométrer chaque morceau en répétition, et obtenir un document A4 imprimable prêt pour la scène — avec alerte si le set dépasse un temps de scène imposé.

---

## Stack

- **Frontend** : React 19 + TypeScript + Vite 6 + Tailwind v3 + React Router v7
- **Stockage local** : Dexie.js (IndexedDB), `userId` lié au compte cloud
- **Cloud** : Firebase Auth (email/mdp + Google) + Firestore (sync par userId)
- **Paiement** : Stripe (abonnement Illimité) via Cloud Functions v2 (`europe-west1`)
- **Secrets** : Firebase Secret Manager (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`) — aucun secret en `.env`
- **PWA** : `vite-plugin-pwa` avec Workbox (offline, installable)
- **Export** : `window.print()` via CSS `@media print`

## Commandes

```bash
npm run dev       # Serveur de développement Vite
npm run build     # tsc -b && vite build
npm run lint      # ESLint
npm run preview   # Prévisualisation du build
```

### Cloud Functions (dossier `functions/`)

```bash
npm run build          # Compilation TypeScript
npm run deploy         # Build + firebase deploy --only functions
npm run secrets:set    # Saisie des 3 secrets Stripe dans Secret Manager
npm run secrets:check  # Vérification des secrets configurés
```

Le paramètre public `SITE_URL` est défini dans `functions/.env.setlab-saas` (committable, non-secret).

## Authentification & synchronisation

L'app **nécessite un compte** (email/mdp ou Google). Les setlists sont stockées localement dans Dexie et synchronisées en arrière-plan vers Firestore (collection `setlists`, accès restreint au `userId` propriétaire). L'export/import de fichiers `.tl` permet de sauvegarder ou restaurer ses setlists.

Le statut de synchronisation est visible en haut de la sidebar ChronoPanel (synced, syncing, offline, error), avec un menu profil pour la déconnexion.

## Abonnement & paiements (Stripe)

Plan **Gratuit** (3 exports/mois) ou **Illimité** (3,99 €/mois). Trois Cloud Functions v2 :

```
functions/src/
├── admin.ts                  # Init unique du SDK Admin (guard)
├── params.ts                 # Paramètre public SITE_URL (defineString)
├── stripe.ts                 # Client Stripe + secrets (defineSecret)
├── createCheckoutSession.ts  # Callable — création session Checkout
├── createPortalSession.ts    # Callable — portail de facturation
└── handleWebhook.ts          # HTTPS — webhook Stripe (signature vérifiée)
```

Le webhook (`checkout.session.completed`, `customer.subscription.updated/deleted`) synchronise `users/{uid}/subscription/main` dans Firestore. La requête collection-group sur `stripeCustomerId` s'appuie sur un index dédié (`firestore.indexes.json`).

## Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginPage.tsx         # /login
│   │   ├── RegisterPage.tsx      # /register
│   │   ├── ResetPasswordPage.tsx # /reset-password
│   │   └── LoadingScreen.tsx     # écran de chargement session
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
│   ├── useSyncStatus.ts          # État de la synchronisation
│   ├── useExportQuota.ts         # Quota exports + transaction Firestore
│   └── useRateLimit.ts           # Rate limiting côté client (auth)
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