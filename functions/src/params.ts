import { defineString } from 'firebase-functions/params';

// Paramètre public (non-secret) : URL du site pour les redirections Stripe.
// Valeur de production définie dans functions/.env.setlab-saas
// Déclaré UNE SEULE FOIS ici pour éviter un conflit de définition au déploiement.
export const SITE_URL = defineString('SITE_URL', {
  default: 'http://localhost:5173',
});
