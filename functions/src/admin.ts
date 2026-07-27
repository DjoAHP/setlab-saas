import * as admin from 'firebase-admin';

// Initialisation unique du SDK Admin (évite l'erreur
// "The default Firebase app already exists" quand plusieurs
// modules sont importés par index.ts)
if (admin.apps.length === 0) {
  admin.initializeApp();
}

export { admin };
