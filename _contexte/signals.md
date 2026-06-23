# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-06-23)

## Actions ouvertes
- [P1|ouvert] Initialiser le projet React/TS/PWA (Vite + Dexie + Web Crypto + Capacitor)
  - fait quand: `package.json` créé, app se lance en local, Dexie initialisée avec les 5 entités MVP
  - réf: `_docs/docs de dev/6- MODÈLE DE DONNÉES & ARCHITECTURE BACKEND.md` §26 (schéma MVP)
- [P2|ouvert] Tests wireframes avec utilisateurs AuDHD réels
  - fait quand: 5 à 10 sessions de test réalisées, résultats documentés
  - réf: `_docs/docs de dev/4- WIREFRAMES BASSE FIDÉLITÉ.md` §23

## Questions ouvertes

## Échéances

## Blocages

## Contexte chaud
- Stack arrêtée cette session : React + TypeScript, PWA (Vite), IndexedDB via Dexie.js, chiffrement Web Crypto API (AES-GCM/PBKDF2), portage mobile futur via Capacitor
- Entité Event documentée dans Doc 6 mais marquée "hors MVP" — à implémenter en V1 post-validation

## Dernière session (2026-06-23)

# Session du 2026-06-23

## Décisions prises
- Stack : React + TypeScript, PWA, IndexedDB/Dexie, Web Crypto AES-GCM, Capacitor pour mobile
- Sync cloud reportée post-MVP (Supabase région UE envisagé, Firebase écarté)
- Entité Event hors MVP (documentée pour V1 post-validation)
- Cascade "Action immédiate" formalisée (déterministe, 4 étapes en MVP)
- Distinction notification push (max 2/j) vs suggestion in-app établie

## Livrables produits ou modifiés
- `_docs/cahier des charges.md` : référence arxiv supprimée, règle proposition 3 tâches formalisée
- `_docs/docs de dev/1- PRD.md` : 5 critères d'acceptation ajoutés
- `_docs/docs de dev/2- USER FLOWS.md` : cascade action immédiate, skip énergie, distinction notifs
- `_docs/docs de dev/3- ARCHITECTURE DES ÉCRANS.md` : calcul E10 documenté
- `_docs/docs de dev/5- DESIGN SYSTEM.md` : distinction notification push/in-app
- `_docs/docs de dev/6- MODÈLE DE DONNÉES.md` : stack complète, Event hors MVP, position, skipped, user_id, sécurité

## Hypothèses validées / invalidées
- VALIDE : Docs de dev existants sont cohérents entre eux — pas de contradiction majeure
- VALIDE : Vibecoding React/TS > Flutter pour ce projet
- INVALIDE : "Sync Supabase en V1" → reportée post-MVP
- EN ATTENTE : tests wireframes avec utilisateurs AuDHD réels

## Prochaine étape exacte
Démarrer le développement du MVP : initialiser le projet React/TS/PWA avec Dexie et implémenter les 5 entités MVP (User, Task, SubTask, EnergyEntry, Settings).

## Question bloquante pour la session suivante
Aucune
