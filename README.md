# SetLab

**Setlist + Chronomètre pour musiciens live**

SaaS autonome qui permet de créer une setlist, chronométrer chaque morceau en répétition, et obtenir un document A4 imprimable prêt pour la scène — avec alerte si le set dépasse un temps de scène imposé.

---

## Stack

- **Frontend** : React 19 + TypeScript + Vite 6 + Tailwind v3
- **Stockage** : Dexie.js (IndexedDB), `userId` nullable réservé cloud
- **PWA** : `vite-plugin-pwa` avec Workbox (offline, installable)
- **Export** : `window.print()` via CSS `@media print`

## Commandes

```bash
npm run dev       # Serveur de développement Vite
npm run build     # tsc -b && vite build
npm run lint      # ESLint
npm run preview   # Prévisualisation du build
```

## Structure

```
src/
├── components/
│   ├── SetlistEditor.tsx   # Sidebar gauche — édition de la setlist
│   ├── SetlistPreview.tsx  # Colonne centrale — aperçu A4 temps réel
│   └── ChronoPanel.tsx     # Sidebar droite — chronomètre + transfert
├── context/
│   └── SetlabContext.tsx    # Provider React Context
├── hooks/
│   └── useSetlabStore.ts   # Store custom (pas de Zustand)
├── services/
│   └── chronoService.ts    # Singleton chronomètre (Date.now)
├── db/
│   └── schema.ts           # Dexie schema
└── types/
    └── index.ts            # Types Setlist, Song
```

## Version

`1.1.2`