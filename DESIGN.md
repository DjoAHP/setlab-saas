# DESIGN.md — Design System SetLab

> **Fichier de référence obligatoire pour toute modification visuelle.**
> Règle d'or : on ne **crée** jamais un style, on **copie** une recette de ce fichier.
> Si une recette manque, on l'ajoute ici dans le même commit que le code.
> Pattern du projet : styles **inline** (`style={{...}}`), pas de classes Tailwind pour le visuel. UI en **français**.

---

## §1 — Identité visuelle (palette officielle)

Thème sombre bleu-nuit + accent cyan. Toutes les valeurs ci-dessous sont celles du code réel — ne jamais en inventer d'autres.

### Fonds (du plus profond au plus élevé)

| Rôle | Valeur | Où |
|---|---|---|
| Fond app / body / pages auth & tarifs | `hsl(222, 25%, 7%)` | `index.css` body |
| Panneaux (éditeur, chrono) | `hsl(222, 20%, 11%)` | SetlistEditor, ChronoPanel |
| Cercle chrono | `hsl(222, 20%, 10%)` | ChronoPanel |
| Tab bar mobile | `hsl(222, 20%, 11%)` — onglet actif `hsl(222, 18%, 16%)` | App.tsx |
| Panneau de modale | `hsl(222, 22%, 12%)` | ExportModal, modales SetlistEditor |
| Surface bouton neutre | `hsl(222, 18%, 17%)` — hover `hsl(222, 18%, 20%)` | boutons icône, Importer |
| Surface enfoncée (selects, désactivé) | `hsl(222, 18%, 14%)` | selects, boutons disabled |
| Surface désactivée profonde | `hsl(222, 18%, 12%)` | boutons gated free |
| Fond secondaire (Annuler) | `hsl(222, 18%, 18%)` | modales de confirmation |

### Bordures

| Rôle | Valeur |
|---|---|
| Bordure standard (boutons, inputs, modales) | `hsl(220, 15%, 22%)` |
| Séparateurs, header de modale, borderTop/Bottom de panneaux | `hsl(220, 15%, 18%)` |
| En-têtes de panneaux, bordure désactivée | `hsl(220, 15%, 16%)` |
| Bordure Annuler | `hsl(220, 15%, 24%)` |

### Accent cyan (teinte 198)

| Rôle | Valeur | Équivalent var CSS |
|---|---|---|
| Fond bouton primaire, toggle actif, toast | `hsl(var(--tl-accent-button))` = `hsl(198, 60%, 35%)` | `--tl-accent-button` |
| Bordure bouton primaire | `hsl(var(--tl-accent-button-border))` = `hsl(198, 60%, 45%)` | `--tl-accent-button-border` |
| Texte accent (chiffres chrono, liens, pastilles LED) | `hsl(var(--tl-accent-text))` = `hsl(198, 80%, 80%)` | `--tl-accent-text` |
| Icônes des boutons carrés, titres auth | `hsl(var(--tl-accent-custom-icons))` = `hsl(198, 48%, 94%)` | `--tl-accent-custom-icons` / `--tl-accent-princ` |
| Item sélectionné (dropdown chrono) | `hsl(198, 60%, 25%)` | — |

> Les variables `--tl-*` sont dans `src/index.css`. Quand une recette utilise `hsl(var(--tl-…))`, garder cette écriture. **Ne pas créer de nouvelles variables.** Certaines variables définies sont mortes (`--tl-bg-panel`, `--tl-bg-card`, `--tl-accent-dim/mid/terc`…) : ne pas les utiliser.

### Couleurs sémantiques

| Rôle | Valeur |
|---|---|
| Danger (fond bouton) | `hsl(0, 60%, 35%)` |
| Danger (bordure) | `hsl(0, 60%, 45%)` |
| Danger (hover texte/icône) | `hsl(0, 70%, 60%)` |
| Texte d'erreur | `#e57373` sur fond `rgba(229,115,115,0.1)` |
| Succès (jauge A4) | `#22c55e` |
| Warning (jauge A4 ≥ 90%) | `#f59e0b` |
| Dépassement (jauge A4) | `#ef4444` |

### Textes

| Rôle | Valeur |
|---|---|
| Texte principal | `white` ou `hsl(210, 30%, 90%)` (titres modales) |
| Texte liste / secondaire | `hsl(220, 15%, 70%)` |
| Texte bouton secondaire | `hsl(220, 15%, 60%)` |
| Labels, texte muted | `hsl(220, 15%, 50%)` |
| En-têtes panneaux, placeholders dropdown | `hsl(220, 15%, 45%)` |
| Métadonnées (compteur, numéros) | `hsl(220, 15%, 40%)` |
| Discret (icône drag, hints) | `hsl(220, 15%, 35%)` |
| Désactivé | `hsl(220, 15%, 30%)` |

---

## §2 — Recettes composants (copy-paste)

### Échelles autorisées (ne JAMAIS sortir de ces valeurs)

- **fontSize** : `10px` (micro/selects tonalité) · `11px` (labels, en-têtes uppercase, hints) · `12px` (liste, tab bar, toasts) · `13px` (boutons, inputs éditeur) · `14px` (inputs auth, titres modales). Au-delà = titres de pages uniquement (18/20/28/32).
- **borderRadius** : `4px` (selects compacts) · `6px` (items dropdown, encart erreur) · `8px` (standard : boutons, inputs, **boutons carrés 40×40**) · `12px` (modales, cartes auth) · `10px`/`16px` réservés à PricingPage.
- **gaps** : `4px` (label↔input) · `6px` (toolbar, boutons du pied) · `8px` (boutons contigus, icône↔texte) · `10px` (sections éditeur) · `12px` (forms auth, boutons de confirmation) · `16px` (modale de confirmation).
- **Hover** : géré en JS inline via `onMouseEnter`/`onMouseLeave` (pattern du projet), avec `transition` en style.

### Bouton primaire accent
*Réf. vivante : « Exporter », `SetlistEditor.tsx` (pied de sidebar)*

```tsx
<button style={{
  background: "hsl(var(--tl-accent-button))",
  border: "1px solid hsl(var(--tl-accent-button-border))",
  color: "white", padding: "10px 16px", borderRadius: "8px",
  fontSize: "13px", cursor: "pointer",
  // width: "100%" si pleine largeur (pied de sidebar)
}}>Exporter</button>
```

### Bouton secondaire / Annuler
*Réf. : modales de confirmation, `SetlistEditor.tsx`*

```tsx
<button style={{
  padding: "10px", borderRadius: "8px",
  border: "1px solid hsl(220, 15%, 24%)",
  background: "hsl(222, 18%, 18%)", color: "hsl(220, 15%, 60%)",
  fontSize: "13px", cursor: "pointer",
}}>Annuler</button>
```

### Bouton danger
*Réf. : « Tout effacer » (confirmation), `SetlistEditor.tsx` ; « Arrêter », `ChronoPanel.tsx`*

```tsx
<button style={{
  padding: "10px", borderRadius: "8px",
  border: "none",                          // ou "1px solid hsl(0, 60%, 45%)" (variante chrono)
  background: "hsl(0, 60%, 35%)", color: "white",
  fontSize: "13px", cursor: "pointer",
}}>Supprimer</button>
```

### Bouton carré 40×40
*Réf. vivante : « Réordonner les morceaux » et « + » (ligne d'ajout morceau), « Tout effacer » (corbeille, barre d'outils), `SetlistEditor.tsx`. **Recette unique pour tout bouton carré 40×40** (action à côté d'un input, outil de barre d'outils, etc.).*

> **Mot-clé agent** : dès qu'une demande contient « bouton carré », appliquer **cette** recette (40×40, radius 8px, icône 20px). C'est le seul design de bouton carré du projet.

```tsx
<button
  title="Mon bouton" aria-label="Mon bouton"
  style={{
    width: "40px", height: "40px", minWidth: "40px", padding: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "hsl(222, 18%, 17%)",            // variante accent : hsl(var(--tl-accent-button))
    border: "1px solid hsl(220, 15%, 22%)",
    color: "hsl(var(--tl-accent-custom-icons))",  // icône hérite via currentColor
    borderRadius: "8px", cursor: "pointer",
    transition: "color 0.15s, background 0.15s",
  }}>
  {/* icône Lucide inline 20px */}
</button>
// Désactivé (neutre) : background "hsl(222, 18%, 14%)", color "hsl(220, 15%, 30%)",
//                      cursor "not-allowed", opacity 0.5
// Variante ACTIVE / PRIMAIRE (ex. bouton « + » d'ajout) :
//   background "hsl(var(--tl-accent-button))", color "white",
//   border "1px solid hsl(var(--tl-accent-button-border))"
// Variante DESTRUCTIF (ex. corbeille « Tout effacer ») : rouge danger AU SURVOL
//   via onMouseEnter/onMouseLeave (repos = accent comme ci-dessus) :
//     onMouseEnter → color "hsl(0, 70%, 60%)" + background "hsl(222, 18%, 20%)"
//     onMouseLeave → restaurer le repos (color accent, background "hsl(222, 18%, 17%)")
//   désactivé : border "1px solid hsl(220, 15%, 16%)", background "transparent",
//               color "hsl(220, 15%, 30%)", cursor "not-allowed"
// Variante NEUTRE (action non destructive, ex. Réordonner) : pas de onMouseEnter rouge,
//   garder color accent au repos COMME au survol.
```

### Slider (range) + popover — outil « Taille du texte »
*Réf. vivante : outil « Taille du texte » (icône Lucide `type`), barre d'outils `SetlistEditor.tsx`. Le slider modifie `fontScale` (aperçu A4, **desktop seul** ; mobile = rien).*

**Popover** (ouvert au clic sur le bouton, fermé au clic extérieur via `mousedown` + `ref.contains`) :

```tsx
<div style={{
  position: "absolute", top: "100%", right: "0", marginTop: "6px",
  zIndex: 40,                                   // dropdown §7
  background: "hsl(222, 22%, 12%)",
  border: "1px solid hsl(220, 15%, 22%)",
  borderRadius: "8px", padding: "12px",
  width: "200px",
  display: "flex", flexDirection: "column", gap: "8px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
}}>
  <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
    letterSpacing: "0.1em", color: "hsl(220, 15%, 45%)" }}>Taille du texte</span>
  <input type="range" className="tl-range" min={0.7} max={1.6} step={0.05}
         value={fontScale} onChange={(e) => onFontScaleChange(parseFloat(e.target.value))}
         style={{ width: "100%" }} />
  <span style={{ fontSize: "12px", color: "hsl(220, 15%, 60%)", textAlign: "right" }}>
    {Math.round(fontScale * 100)} %
  </span>
</div>
```

**Style du slider** (`.tl-range` dans `index.css` — le thumb ne peut pas être stylé en inline) :
- track : `height: 4px`, `border-radius: 4px`, `background: hsl(222, 18%, 14%)`
- thumb : `16px` rond, `background: hsl(var(--tl-accent-button))`, bordure `hsl(var(--tl-accent-button-border))` (webkit + moz)

### Bouton chrono (transport)
*Réf. : `buttonStyle`, `ChronoPanel.tsx`*

```tsx
const buttonStyle: React.CSSProperties = {
  padding: "8px 16px", borderRadius: "8px", border: "1px solid",
  cursor: "pointer", fontSize: "13px", transition: "all 200ms ease-out",
};
// Démarrer : background hsl(var(--tl-accent-button)), borderColor hsl(var(--tl-accent-button-border)), color white
// Arrêter  : background hsl(0, 60%, 35%), borderColor hsl(0, 60%, 45%), color white
// Neutre   : background hsl(220, 15%, 20%), borderColor hsl(220, 15%, 30%), color hsl(220, 15%, 70%)
```

### Item de modale (bouton-ligne avec icône)
*Réf. : `btnStyle`, `ExportModal.tsx`*

```tsx
const btnStyle = (disabled: boolean): React.CSSProperties => ({
  width: "100%", padding: "12px 16px", borderRadius: "8px",
  border: disabled ? "1px solid hsl(220, 15%, 18%)" : "1px solid hsl(220, 15%, 22%)",
  background: disabled ? "hsl(222, 18%, 12%)" : "hsl(222, 18%, 17%)",
  color: disabled ? "hsl(220, 15%, 30%)" : "white",
  fontSize: "13px", cursor: disabled ? "not-allowed" : "pointer",
  display: "flex", alignItems: "center", gap: "8px",
  transition: "background 0.15s", textAlign: "left",
});
```

### Input éditeur
*Réf. : `inputStyle`, `SetlistEditor.tsx`*

```tsx
const inputStyle: React.CSSProperties = {
  background: "transparent", border: "1px solid hsl(220, 15%, 22%)",
  color: "white", outline: "none", padding: "8px 12px",
  borderRadius: "8px", fontSize: "13px", width: "100%",
};
// Label au-dessus : fontSize "11px", color "hsl(220, 15%, 50%)", gap 4px
// Variante numérique MM/SS : { ...inputStyle, width: "70px", textAlign: "center" }
```

### Input auth (pages login/register/reset)
*Réf. : `styles.input`, `LoginPage.tsx`*

```tsx
{
  padding: "12px 16px", borderRadius: 8,
  border: "1px solid hsl(220, 15%, 22%)", background: "rgba(0,0,0,0.3)",
  color: "hsl(198, 48%, 94%)", fontSize: 14,
  outline: "none", width: "100%", boxSizing: "border-box",
}
```

### Select compact monospace (temps, tonalité)
*Réf. : `timeSelectStyle` et select tonalité, `SetlistEditor.tsx`*

```tsx
{
  width: "58px",                    // 42px pour la tonalité
  background: "hsl(222, 18%, 14%)", border: "1px solid hsl(220, 15%, 18%)",
  borderRadius: "4px", color: "hsl(220, 15%, 70%)",
  fontSize: "11px",                 // 10px pour la tonalité
  fontFamily: "monospace", textAlign: "center",
  outline: "none", cursor: "pointer", padding: "2px 0",
}
```

### Modale officielle
*Réf. : `ExportModal.tsx`, modale ordre `SetlistEditor.tsx`*

```tsx
{/* Overlay — LE SEUL autorisé (clic dehors = fermer) */}
<div style={{
  position: "fixed", inset: 0, zIndex: 100,
  display: "flex", alignItems: "center", justifyContent: "center",
  background: "rgba(10, 12, 20, 0.82)", backdropFilter: "blur(4px)",
}} onClick={onClose}>
  {/* Panneau */}
  <div style={{
    background: "hsl(222, 22%, 12%)", border: "1px solid hsl(220, 15%, 22%)",
    borderRadius: "12px", width: "min(90vw, 360px)", maxHeight: "80vh",
    display: "flex", flexDirection: "column",
  }} onClick={(e) => e.stopPropagation()}>
    {/* Header */}
    <div style={{ padding: "16px 20px", borderBottom: "1px solid hsl(220, 15%, 18%)",
                  display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ color: "hsl(210, 30%, 90%)", fontSize: "14px", fontWeight: 600 }}>Titre</span>
      <button onClick={onClose} style={{ background: "none", border: "none",
        color: "hsl(220, 15%, 45%)", cursor: "pointer", fontSize: "16px" }}>✕</button>
    </div>
    {/* Corps : padding "16px 20px", gap "8px" */}
  </div>
</div>
```

### Confirmation compacte (actions destructives)
*Réf. : « Supprimer ce morceau ? » / « Tout effacer ? », `SetlistEditor.tsx`*

```tsx
{/* Même overlay que la modale officielle, puis : */}
<div style={{
  background: "hsl(222, 22%, 12%)", border: "1px solid hsl(220, 15%, 22%)",
  borderRadius: "12px", padding: "24px", width: "280px",
  display: "flex", flexDirection: "column", gap: "16px",
}} onClick={(e) => e.stopPropagation()}>
  <div style={{ color: "hsl(210, 30%, 90%)", fontSize: "14px", fontWeight: 600, textAlign: "center" }}>
    Supprimer la setlist ?   {/* question explicite, jamais « Êtes-vous sûr ? » */}
  </div>
  {/* Optionnel — texte explicatif : fontSize "12px", color "hsl(220, 15%, 50%)", lineHeight 1.4 */}
  <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
    {/* Annuler (secondaire, flex: 1) à GAUCHE — Action danger (flex: 1) à DROITE */}
  </div>
</div>
```

### Toast
*Réf. : `ChronoPanel.tsx`*

```tsx
<div style={{
  position: "fixed", bottom: "80px", left: "50%", transform: "translateX(-50%)",
  background: "hsl(var(--tl-accent-button))", color: "white",
  padding: "8px 16px", borderRadius: "8px", fontSize: "12px",
  opacity: visible ? 1 : 0, transition: "opacity 0.3s",
  pointerEvents: "none", zIndex: 200, whiteSpace: "nowrap",
}}>✓ Message de confirmation</div>
```

### Toggle switch
*Réf. : « Temps de scène », `SetlistEditor.tsx`*

```tsx
<button onClick={toggle} style={{
  width: "32px", height: "20px", borderRadius: "10px", border: "none",
  cursor: "pointer", position: "relative",
  background: actif ? "hsl(var(--tl-accent-button))" : "hsl(220, 15%, 22%)",
  transition: "background 0.2s",
}}>
  <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "white",
    position: "absolute", top: "2px", left: actif ? "14px" : "2px", transition: "left 0.2s" }} />
</button>
```

### En-tête de panneau
*Réf. : en-têtes `SetlistEditor.tsx` / `ChronoPanel.tsx`*

```tsx
<div style={{ padding: "10px 12px", borderBottom: "1px solid hsl(220, 15%, 16%)", flexShrink: 0 }}>
  <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
    letterSpacing: "0.1em", color: "hsl(220, 15%, 45%)" }}>Titre du panneau</span>
</div>
```

---

## §3 — Icônes

### Convention par défaut : SVG inline style Lucide

Toute nouvelle icône est un SVG inline sur ce gabarit exact (tracés repris de [lucide.dev](https://lucide.dev)) :

```tsx
<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
     style={{ flexShrink: 0 }}>
  {/* tracés lucide */}
</svg>
```

**Tailles par contexte** :

| Contexte | Taille |
|---|---|
| Dans un bouton avec texte (item de modale) | `16` |
| Dans un bouton carré 40×40 | `20` |
| Logos / illustrations (auth, pricing) | `24` à `64` |

La couleur n'est **jamais** définie sur le SVG : elle vient du `color` du bouton parent via `currentColor` (c'est ce qui fait fonctionner les hovers).

### Icônes personnalisées de l'utilisateur (second canal officiel)

L'utilisateur crée ses propres icônes en `.svg` (ex. `ordre.svg`). **C'est le canal privilégié dès qu'une icône perso existe ou est fournie** — dans ce cas, ne pas la remplacer par une icône Lucide. Procédure d'intégration :

> **Exception documentée** : l'icône « Tout effacer » de la barre d'outils utilise un **SVG Lucide inline (`trash-2`)**, choix explicite de l'utilisateur. Ne pas réintroduire `corbeille.svg` (supprimé). Pour les futurs outils de la barre, préférer un SVG Lucide inline (§3, gabarit ci-dessus) plutôt qu'un `.svg` perso, afin de garder la barre cohérente.

1. Placer le fichier dans `src/assets/` (nom en français, minuscules, ex. `partage.svg`).
2. Format attendu : `viewBox="0 0 256 256"` et **`fill="currentColor"`** sur la racine `<svg>` (obligatoire pour hériter de la couleur du bouton). Pas de couleurs codées en dur dans le fichier.
3. Importer via svgr : `import PartageIcon from "../assets/partage.svg?react";`
4. Utiliser avec taille explicite selon le contexte (§ tailles ci-dessus) : `<PartageIcon width="18" height="18" style={{ flexShrink: 0 }} />`

Si l'utilisateur demande une icône sans fournir de `.svg`, utiliser le gabarit Lucide inline en attendant — il pourra la remplacer par la sienne plus tard (même emplacement, même taille).

### Existant conservé (ne pas « moderniser »)

- Glyphes Unicode en place : `✕` (fermeture modale), `▶ ⏸ ↺` (chrono), `✓` (toasts), `▲▼` (chevrons), `×` (suppression ligne). Les garder tels quels ; pour du **nouveau** code, préférer un SVG.
- Poignée de drag : SVG 6 cercles `fill="currentColor"`, couleur `hsl(220, 15%, 35%)` (modale ordre).

---

## §4 — Carte des zones (vocabulaire officiel)

Quand une demande cite une zone, utiliser cette carte. Si la zone demandée n'y figure pas clairement → **demander avant de coder**.

### Écran principal `/app` — desktop (≥ 768px), layout 3 colonnes (`src/App.tsx`)

```
┌─────────────────┬──────────────────────────┬─────────────────┐
│ SIDEBAR         │ APERÇU A4                │ PANNEAU CHRONO  │
│ D'ÉDITION       │ (feuille blanche,        │ (320px fixe)    │
│ SETLIST         │  flex: 1, centre)        │                 │
│ (320px, redim.  │                          │                 │
│  200–450px)     │                          │                 │
└─────────────────┴──────────────────────────┴─────────────────┘
```

**Sidebar d'édition setlist** = `src/components/SetlistEditor.tsx` (fond `hsl(222,20%,11%)`, borderRight) :
1. **En-tête** : label « SETLIST » uppercase + logo (padding `10px 12px`)
2. **Barre d'outils** (haut de la zone défilable, alignée à droite, `gap: 6px`) : outil « Taille du texte » 40×40 (icône Lucide `type`, ouvre un slider, **desktop seul**) à gauche du bouton corbeille 40×40 « Tout effacer » (réf. recettes « Bouton carré 40×40 » et « Slider + popover » §2). *→ C'est la seule zone pour les outils de la sidebar : tout nouveau outil se place ici, au gabarit carré 40×40 (même recette, même `gap: 6px`).*
3. **Section infos setlist** : label+input « Groupe », toggle + inputs « Temps de scène »
4. **Séparateur** (1px, `hsl(220,15%,18%)`)
5. **Ligne d'ajout morceau** : label « Morceau », input + bouton 40×40 « Réordonner » + bouton 40×40 « + »
6. **Compteur de morceaux** (centré, 11px)
7. **Liste des morceaux** : par ligne → select tonalité, numéro+titre (éditable au clic), selects min/s, bouton `×` supprimer
8. **Pied de sidebar** (borderTop) : boutons pleine largeur « Importer » (gated free) et « Exporter » (primaire accent)

**Aperçu A4** = `src/components/SetlistPreview.tsx` : la feuille blanche (source des exports print/html2canvas — voir règle R5) + jauge de remplissage. ⚠️ Zone sensible.

**Panneau chrono** = `src/components/ChronoPanel.tsx` (borderLeft) :
1. **Indicateur sync + profil** = `src/components/sync/SyncIndicator.tsx` (tout en haut)
2. **En-tête** : label « CHRONOMÈTRE »
3. **Cercle chrono** (LED, chiffres monospace accent) + indicateur d'état + hint Espace
4. **Boutons transport** : « ▶ Démarrer » / « ⏸ Arrêter » / « ↺ Réinitialiser »
5. **Section transfert** (sous séparateur) : « Temps mesuré », dropdown de sélection morceau, bouton « Appliquer le temps »

**Poignée de redimensionnement** : bord droit de la sidebar d'édition (4px, hover accent) — `App.tsx`.

### Écran principal `/app` — mobile (< 768px)

- Un seul panneau visible à la fois via la **tab bar mobile** en bas : onglets « Éditeur » / « Aperçu » / « Chrono » (`App.tsx`).
- ⚠️ `SetlistPreview` reste **toujours monté** (hors écran à `left: -9999px`) pour les exports — ne jamais le démonter conditionnellement.

### Modales

| Nom officiel | Fichier | Type |
|---|---|---|
| Modale d'export | `src/components/ExportModal.tsx` | Modale officielle (items .tl/PDF/JPEG/PNG, quota free) |
| Modale d'ordre des morceaux | `SetlistEditor.tsx` (inline) | Modale officielle (drag & drop + tactile) |
| Confirmation suppression morceau | `SetlistEditor.tsx` (inline) | Confirmation compacte 280px |
| Confirmation tout effacer | `SetlistEditor.tsx` (inline) | Confirmation compacte 280px |
| Modale de migration | `src/components/migration/MigrationModal.tsx` | ⚠️ Exception historique (overlay divergent, z-index 1000) — ne pas imiter |

### Pages hors app

| Page | Route | Fichier | Style |
|---|---|---|---|
| Connexion | `/login` | `src/components/auth/LoginPage.tsx` | Carte glass centrée (`rgba(255,255,255,0.04)` + blur 16px, radius 12, maxWidth 400) |
| Inscription | `/register` | `src/components/auth/RegisterPage.tsx` | Idem (styles dupliqués localement) |
| Mot de passe oublié | `/reset-password` | `src/components/auth/ResetPasswordPage.tsx` | Idem |
| Tarifs | `/tarifs` | `src/components/pricing/PricingPage.tsx` | Page marketing : cartes 340px radius 16, CTA gradient — style à part, cohérent en interne |

---

## §5 — Responsive

- **Breakpoint unique : JS** `window.innerWidth < 768` + listener `resize` (voir `App.tsx:16-27`). **Pas de classes `md:`/`lg:` Tailwind.**
- Les composants `SetlistEditor`, `SetlistPreview`, `ChronoPanel` sont rendus **dans les deux modes** (3 colonnes desktop, onglets mobile). Pour cibler un seul mode à l'intérieur d'un composant : état local `isMobile` sur le même pattern que `App.tsx`.
- Touch targets : minimum **36×36px** pour tout élément cliquable.
- La tab bar mobile est le seul mécanisme de navigation mobile — ne pas ajouter d'autre nav.

### ⚠️ Règle desktop / mobile (OBLIGATOIRE)

Avant d'ajouter **tout** nouvel élément d'UI (bouton, input, section, outil…), l'agent DOIT poser la question :

> « Cet élément doit-il apparaître en **desktop seulement**, **mobile seulement**, ou **les deux** ? »

- Ne jamais supposer la réponse, même si elle semble évidente.
- Exception : si la demande précise déjà la cible (« ajoute en mobile un bouton… »), ne pas redemander.
- Après implémentation, confirmer dans la réponse où l'élément est visible (desktop / mobile / les deux).

---

## §6 — Règles pour l'agent (workflow obligatoire)

**Ordre d'application pour toute tâche UI :**

1. **Localiser** : trouver la zone cible dans la carte (§4). Zone ambiguë ou absente → demander.
2. **Demander : desktop, mobile, ou les deux ?** (règle §5)
3. **R1 — Annoncer avant de coder** : zone officielle + position précise (ex. « à gauche du bouton corbeille, dans la barre d'outils de la sidebar d'édition ») + recette utilisée. Doute sur la position → demander.
4. **Copier la recette** exacte (§2) et la convention icône (§3). Jamais de couleur hors palette (§1), jamais de fontSize/radius/gap hors échelles (§2).
5. **Appliquer les règles spécifiques** :
   - **R2 — Destructif → confirmation compacte** (§2), jamais `window.confirm()`. Question explicite (« Supprimer la setlist ? »), Annuler à gauche, action danger à droite.
   - **R3 — Async → disabled + feedback** : tout bouton déclenchant sync/export/Stripe/auth est `disabled` pendant l'opération (style désactivé de la recette : `opacity 0.5`, `cursor: not-allowed`, fond assombri) + feedback de fin (toast §2 ou message inline). Jamais de double-clic possible.
   - **R4 — Icône seule → `title` + `aria-label`** en français, tous les deux.
   - **R5 — Feuille A4 intouchable** : aucun élément d'UI *dans* la feuille (`SetlistPreview`) sans vérifier `@media print` ET la capture html2canvas mobile. Les contrôles vont autour de la feuille. Ne jamais démonter le preview en mobile.
   - **R6 — Premium/export → gating** : passer par `useSubscription`/`useExportQuota`, jamais de contournement client (les Firestore rules sont la vraie barrière), lien vers `/tarifs` si l'utilisateur free est bloqué, mention « Réservé plan illimité » (10px muted) sur les items gated.
   - **R7 — Z-index** : `10` = éléments flottants locaux (poignée) · `40` = dropdowns · `100` = modales · `200` = toasts. Aucune autre valeur sans l'ajouter ici. (Le `1000` de MigrationModal est une exception historique à ne pas imiter.)
   - **R9 — Libellés FR** : verbes à l'infinitif sur les boutons (« Supprimer », « Exporter », « Annuler »), pas de MAJUSCULES hors en-têtes de panneaux (recette uppercase 11px), pas d'anglicismes.
6. **R8 — Vérifier** : `npm run build` doit passer (typecheck inclus). Confirmer dans la réponse : où l'élément est visible (desktop/mobile), quelle recette a été utilisée, quels états sont gérés (hover / disabled / confirmation).
7. **Nouvelle recette créée ? → l'ajouter à ce fichier dans le même commit.**
