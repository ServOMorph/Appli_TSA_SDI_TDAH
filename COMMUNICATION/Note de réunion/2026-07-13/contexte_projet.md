# Contexte du projet — Appli_TSA_SDI_TDAH

## Objectif

Application neuroinclusive (web PWA + mobile) pour personnes AuDHD (TSA sans DI + TDAH, 14–40 ans) : réduire la charge mentale quotidienne, soutenir les fonctions exécutives, offline-first, confidentialité renforcée.

## Stack technique

- Frontend : React + TypeScript, PWA (Vite)
- Stockage local : IndexedDB via Dexie.js (source de vérité)
- Chiffrement local : Web Crypto API, AES-GCM, clé PBKDF2
- Mobile futur : Capacitor (même codebase web)
- Sync cloud : reportée post-MVP (Supabase région UE envisagé)
- Offline-first strict : fonctionne sans serveur ni compte

## Historique des versions

- **V1** : MVP initial, taggé `v1.0-mvp`, `dist/v1/` archivé (rollback opérationnel).
- **V2** : phases V2-0 à V2-9 closes, V2-5 retirée. Reste V2-10 en suspens (doc V2 + déploiement Netlify) — test offline validé le 2026-07-09, mais doc/déploiement pas encore faits. `dist/v2/` à jour, roadmap archivée dans `Archives/roadmap_v2.md`.
- **V3** (branche active `v3`) : née d'une visio avec Marie (utilisatrice/testeuse référente) le 2026-07-06. Roadmap `roadmap_v3.md`, 7 phases (V3-0 à V3-6), **toutes closes** au 2026-07-07. Build de production basculé sur `dist/v3/`.

## Contenu de la V3 (résumé des 7 phases)

- **V3-0** — Refonte préalable : échelle d'énergie passée à 1-12, schéma Dexie v3, composants réutilisables (`EnergyDisplay`, `AppShell`, `BottomNav`).
- **V3-1** — Bugs + nettoyage UI : suppression de la question « chose la plus importante » à la connexion, suppression de la limite de 3 tâches/jour, tâche terminée reste affichée au planning, correctifs de contraste.
- **V3-2** — Domaine énergie et saisie (base pour V3-3/V3-4).
- **V3-3** — Check-in énergie + mode surcharge automatique (plus de toggle manuel — déclenché par le coût énergétique planifié qui dépasse l'énergie restante du jour). Action « Reporter » sur tâches non-obligatoires en surcharge.
- **V3-4** — Planning : symbole d'énergie (cuillères, puis remplacé par batterie), couleur d'ambiance configurable, bouton « Répéter demain » pour la récurrence.
- **V3-5** — Listes : hiérarchie visuelle vue globale / intérieur de liste.
- **V3-6** — Navigation persistante (`BottomNav` monté une fois dans `App.tsx`, visible sur tous les écrans sauf onboarding et check-in énergie).

## Itérations post-clôture (hors phases, retours utilisateur direct)

Après la clôture de la roadmap V3, plusieurs ajustements ont été faits sur retour de l'utilisateur (pas Marie) :
- Titre du Dashboard : « Appli pour AuDHD » → « AuDHD »
- Symbole d'énergie : cuillères → icône batterie (moins connotée spoon theory)
- Espacement des créneaux du Planning symétrisé
- Bouton « Mode surcharge » masqué hors surcharge dans la TopBar (**écart avec une demande explicite antérieure de Marie**, qui le voulait visible et grisé hors surcharge)
- Modale de planification refondue en flux 3 étapes (nom → énergie 1-12 → obligatoire Oui/Non)
- `outDir` du build basculé de `dist/v2` à `dist/v3` pour préserver le rollback V2

## Points en attente de validation par Marie

Quatre mécanismes ont été implémentés à titre provisoire, faute de précision explicite de Marie lors de la visio du 2026-07-06, et doivent être reconfirmés (détail dans `questions_marie.md`) :
1. Comportement de l'action « Reporter » (replanification au lendemain, même créneau)
2. Fréquence du check-in énergie (actuellement une fois par jour)
3. Rythme de la récurrence « Répéter demain » (un clic par jour)
4. Masquage du bouton « Mode surcharge » hors surcharge

Un cinquième point, sans lien avec la visio du 2026-07-06, reste en décision produit ouverte : la planification indépendante des sous-tâches (chaque sous-tâche à son propre horaire), explicitement reportée.

## État des tests

- Tests unitaires : 374/374 verts
- Tests e2e (Playwright) : 44/44 verts
- `tsc -b` : clean

## Deux chantiers en parallèle, indépendants

1. **Validation Marie** — session de test/retours sur les 4 points provisoires listés ci-dessus, à partir de son usage réel de la V3.
2. **Finalisation V2-10** (branche `v2`, indépendante de la V3) — documentation V2 et déploiement Netlify, resté en suspens pendant tout le développement V3.
