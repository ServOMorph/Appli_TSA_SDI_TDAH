# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-07-06)



## Actions ouvertes

### Phase 7 — Tests utilisateurs (1/5–10 sessions)
- [P2|ouvert] Sessions test 2 à 5+ avec Marie et autres testeurs AuDHD
  - fait quand: 5 à 10 sessions réalisées, retours consolidés dans fichier dédié
  - réf: `Note de réunion/2026-06-29/synthese_reunion_marie_2026-06-29.md` + `Note de réunion/2026-06-29/analyse_conduite_visio_marie.md`

### V2 — En cours (clôture, branche `v2`)
- [P2|ouvert] Phase V2-10 (Consolidation V2 & 2e vague de tests) — reste : mode offline (13.2), doc V2, déploiement Netlify
  - fait quand: mode offline retesté, doc V2 rédigée, déployé sur Netlify
  - réf: `Archives/roadmap_v2.md` Phase V2-10 et § "Constats test manuel V2-10 (session 2026-07-06)"
- [P3|ouvert] Ajouter un champ nom de profil à l'onboarding (`E02Profile` : choix de type de profil seulement, aucune saisie de nom)
  - fait quand: décision produit prise (implémenter ou explicitement abandonner)
  - réf: `Archives/roadmap_v2.md` § "Constats test manuel V2-10" sous-section "Fonctionnalités manquantes / à implémenter"

### V3 — Démarrage (branche `v3`, post-visio Marie 2026-07-06)
- [P1|ouvert] Démarrer Phase V3-0 (refacto préalable) — toutes les décisions bloquantes sont levées (Q1, Q2, reset données)
  - Contenu V3-0 : constantes/schéma énergie (Dexie v3), composant `EnergyDisplay`, extraction `AppShell`/`BottomNav`, sélecteur `isOverloaded` pur. Détail complet dans `roadmap_v3.md`.
  - fait quand: Phase V3-0 démarrée (au moins R1 en cours)
  - réf: `roadmap_v3.md` Phase V3-0
- [P3|ouvert] Planification indépendante des sous-tâches (chaque `SubTask` planifiable à son propre horaire) — décision explicitement reportée
  - fait quand: décision produit prise sur l'implémentation (piste retenue si besoin confirmé : chaque sous-tâche devient sa propre `TaskV2` avec `parent_task_id` optionnel)
  - réf: `Archives/roadmap_v2.md` § "Fonctionnalité reportée (décision 2026-07-06)"

## Questions ouvertes

## Échéances

## Blocages
Aucun.

## Contexte chaud
- Toutes les décisions bloquantes pré-V3-0 sont tranchées (2026-07-06) : Q1 = suppression de la limite de 3 tâches/jour ; Q2 = retirer le segment nav "Aujourd'hui" sans remplacement ET renommer l'option de création "Aujourd'hui" en "Tâche du jour" (D4/D4b) ; reset données V2 = accepté par Marie, pas de migration. Roadmap `roadmap_v3.md` à jour avec ces décisions.
- Branche `v3` créée à partir de `v2` (commit `965ccc1`) : réorganisation des notes de réunion (`2026-06-07` → `2026-07-06`), `roadmap_v2.md` archivée dans `Archives/`, fichiers d'analyse V3 obsolètes supprimés.
- `dist/v2/` à jour (export corrigé + créneaux 30 min inclus) ; `vite.config.ts` fixe `build.outDir: 'dist/v2'` — reste sur la branche `v2`.
- Serveur de test téléphone : `npx vite preview --host --outDir dist/v2`, adresse réseau `http://192.168.1.180:4173` (même Wi-Fi). Penser à vider le cache du site / désinstaller la PWA sur le téléphone après chaque nouveau build.

## Dernière session (2026-07-06, suite 5)

## Décisions prises
- Q1 tranché : suppression de la limite de 3 tâches/jour (Marie juge la limite non nécessaire, certaines tâches très courtes/nombreuses).
- Q2 tranché : pas de contradiction dans la transcription — retirer le segment nav "Aujourd'hui" du dashboard sans remplacement (D4), et renommer l'option de création "Aujourd'hui" en "Tâche du jour" pour conserver un moyen de créer une tâche dans cette section (D4b).
- Reset données V2 tranché : Marie accepte le reset, pas de migration nécessaire au bump Dexie v3.
- Branche `v3` créée à partir de `v2` après commit de réorganisation des dossiers de notes de réunion.

## Livrables produits ou modifiés
- `roadmap_v3.md` : Q1/Q2/reset marqués tranchés, items D4/D4b ajoutés (Phase V3-1), item de suppression de la limite 3 tâches ajouté
- `Note de réunion/2026-07-06/constats_2026-07-06.md` : D4b ajouté, D4 clarifié (plus de point ambigu)
- `_contexte/signals.md` : actions Q1/Q2/reset closes, prochaine étape mise à jour
- Branche git `v3` créée (commit `965ccc1` sur `v2`, checkout `-b v3`)

## Hypothèses validées / invalidées
- INVALIDE : la transcription Q2 semblait contradictoire (l.254-273 vs l.383-397) -> relecture complète a montré que les deux passages sont complémentaires (retrait nav + renommage création), pas contradictoires

## Prochaine étape exacte
Démarrer Phase V3-0 (`roadmap_v3.md`) sur la branche `v3` : R1 (constantes énergie) puis R2 (schéma Dexie v3).

## Question bloquante pour la session suivante
Aucune.
