# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-07-06)

## Actions ouvertes

### Phase 7 — Tests utilisateurs (1/5–10 sessions)
- [P2|ouvert] Sessions test 2 à 5+ avec Marie et autres testeurs AuDHD
  - fait quand: 5 à 10 sessions réalisées, retours consolidés dans fichier dédié
  - réf: `Note de réunion/synthese_reunion_marie_2026-06-29.md` + `Note de réunion/analyse_conduite_visio_marie.md`

### V2 — En cours
- [P1|ouvert] Phase V2-10 (Consolidation V2 & 2e vague de tests) — EN COURS
  - Les 4 bugs confirmés du plan de test manuel sont corrigés (voir ci-dessous). Reste : retest manuel de ces 4 corrections, décisions produit restantes, relance e2e, build V2, doc V2, déploiement Netlify, sessions test 2-5.
  - fait quand: bugs retestés, décisions produit tranchées, doc V2 rédigée, `dist/v2/` régénéré et déployé sur Netlify, 5-10 sessions test réalisées
  - réf: `roadmap_v2.md` Phase V2-10 et § "Constats test manuel V2-10 (session 2026-07-06)"
- [P2|ouvert] Retest manuel des 4 bugs corrigés (2026-07-06) :
  - tri "Planning du jour" (Dashboard) par `scheduled_start` — corrigé (`AppContext.getPlannedTasksForDate`)
  - rattachement de la tâche à une liste créée à la volée — corrigé (`createList` retourne l'id, création inline dans `E20Inbox`/`E21CreateTaskV2`)
  - détection de conflit de créneau dans Planning — corrigé, décision produit actée avec l'utilisateur : refus + message (pas de remplacement ni de superposition) dans `E40Planning`
  - perte de sous-tâches lors de conversion Todo → Planifier/Liste — corrigé par avertissement de confirmation avant conversion (pas de migration du modèle de données)
  - fait quand: chaque bug retesté manuellement dans l'app (346/346 tests unitaires + `tsc -b` clean déjà validés côté code)
  - réf: `roadmap_v2.md` Phase V2-10, sous-section "Bugs confirmés à corriger" (statut mis à jour)
- [P3|ouvert] Planification indépendante des sous-tâches (chaque `SubTask` planifiable à son propre horaire) — décision explicitement reportée, non traitée par le fix minimal ci-dessus
  - fait quand: décision produit prise sur l'implémentation (piste retenue si besoin confirmé : chaque sous-tâche devient sa propre `TaskV2` avec `parent_task_id` optionnel)
  - réf: `roadmap_v2.md` § "Fonctionnalité reportée (décision 2026-07-06)"
- [P2|ouvert] Décisions produit à prendre (2026-07-06) : usage réel de l'énergie dans l'appli (une seule valeur/jour, pas d'historique) ; comportement de l'écran Planning quand aucune tâche n'est planifiable
  - fait quand: décisions actées et implémentées si nécessaire
  - réf: `roadmap_v2.md` § "Constats test manuel V2-10 (session 2026-07-06)" sous-section "Décisions produit à prendre"
- [P2|ouvert] Fonctionnalités manquantes identifiées (2026-07-06) : nom de profil à l'onboarding, actions Planifier/Liste depuis `E22TaskDetail`, suppression de liste (`deleteList` non câblée), modification du profil (`E111Profile` lecture seule, + libellés `profileLabels` ne correspondant pas à `ProfileType`)
  - fait quand: décision produit prise pour chaque point (implémenter ou explicitement abandonner)
  - réf: `roadmap_v2.md` § "Constats test manuel V2-10 (session 2026-07-06)" sous-section "Fonctionnalités manquantes / à implémenter"
- [P3|ouvert] Nettoyage UI demandé (2026-07-06) : supprimer la section "Organisation" des Paramètres, supprimer l'icône agenda de la TopBar
  - fait quand: les deux éléments retirés du code
  - réf: `roadmap_v2.md` § "Constats test manuel V2-10 (session 2026-07-06)" sous-section "Nettoyage UI demandé"
- [P2|ouvert] Points à (re)tester avant déploiement (2026-07-06) : badge X/Y Dashboard, Dashboard vide, scroll Planning à l'heure courante, horaires limites Planning, état vide Aujourd'hui, mode sombre, accessibilité/stimulation, export iOS + viabilité JSON, mode offline
  - fait quand: chaque point retesté et résultat consigné dans `plan_test_manuel_v2.md`
  - réf: `plan_test_manuel_v2.md` (lignes annotées "à tester"/"à retester") et `roadmap_v2.md` § "Constats test manuel V2-10 (session 2026-07-06)" sous-section "À (re)tester avant déploiement"
- [P3|ouvert] Trou fonctionnel TaskV2 : aucune interaction UI pour compléter/toggle `essential` une tâche planifiée
  - fait quand: décision produit prise (implémenter ou explicitement abandonner) sur `completeTaskV2`/`toggleEssentialV2` (`src/domain/rules/taskRulesV2.ts`), actuellement non appelées nulle part dans l'UI.
  - réf: constat session V2-10 2026-07-01, vérifié dans `E10Dashboard.tsx` et `E40Planning.tsx`. Toujours sans usage identifié après la revue du 2026-07-06.

## Questions ouvertes

## Échéances

## Blocages
Aucun.

## Contexte chaud
- **4 bugs confirmés du test manuel corrigés (2026-07-06)** : voir action "Retest manuel des 4 bugs corrigés" ci-dessus pour le détail technique et les fichiers touchés.
- **Décision produit actée (2026-07-06)** : en cas de conflit de créneau dans Planning, comportement = refus + message (pas de remplacement avec confirmation, pas de superposition autorisée).
- **Décision produit actée (2026-07-06)** : le fix "sous-tâches perdues" reste minimal (avertissement avant conversion) ; la planification indépendante des sous-tâches (chaque `SubTask` avec son propre horaire) est un chantier de fond reporté, piste retenue = chaque sous-tâche devient sa propre `TaskV2` avec `parent_task_id`.
- Branche `v2` active ; tag `v1.0-mvp` posé ; `dist/v1/` versionné pour rollback, `dist/v2/` ignoré Git/régénérable via `npm run build`
- 346/346 tests unitaires, `tsc -b` clean après les 4 corrections de bugs ; e2e non relancés cette session (dernière confirmation 45/45 le 2026-07-05, avant les changements onboarding du 2026-07-06 — toujours à revalider)
- `npm run test` sous `--pool=vmThreads --poolOptions.vmThreads.maxThreads=1` fait échouer les tests liés à `crypto.subtle` (faux négatif d'environnement documenté) — utiliser le pool par défaut (`npx vitest run`)

## Dernière session (2026-07-06)

## Décisions prises
- Conflit de créneau dans Planning : comportement = refus + message (tranché avec l'utilisateur parmi 3 options).
- Sous-tâches perdues à la conversion Todo → Planifier/Liste : fix minimal = avertissement de confirmation avant conversion, sans migrer le modèle de données ; la planification indépendante des sous-tâches est reportée comme chantier séparé.

## Livrables produits ou modifiés
- `src/app/AppContext.tsx` : `getPlannedTasksForDate` trie désormais par `scheduled_start` ; `createList` retourne l'id de la liste créée
- `src/ui/screens/tasks/E20Inbox.tsx` : création de liste inline dans le sélecteur "Ajouter à une liste" (rattache la tâche à la liste créée) ; modale d'avertissement avant perte de sous-tâches sur "Planifier"/"Liste"
- `src/ui/screens/tasks/E21CreateTaskV2.tsx` : création de liste inline dans le sélecteur, même correctif que E20Inbox
- `src/ui/screens/planning/E40Planning.tsx` : détection de conflit de créneau (refus + message) sur placement et déplacement de tâche
- `src/test/testUtils.tsx`, `src/ui/screens/tasks/E20Inbox.test.tsx` : mocks et tests mis à jour/ajoutés pour les nouveaux comportements
- `roadmap_v2.md` : 4 bugs confirmés marqués corrigés, section "Fonctionnalité reportée (décision 2026-07-06)" ajoutée

## Hypothèses validées / invalidées
- VALIDE : 346/346 tests unitaires, `tsc -b` clean après les 4 corrections de bugs
- EN ATTENTE : retest manuel des 4 corrections dans l'app réelle (non fait cette session, code + tests unitaires seulement)
- EN ATTENTE : e2e non relancés après ces changements (dernière confirmation 45/45 le 2026-07-05, avant les changements onboarding du 2026-07-06)
- EN ATTENTE : build V2 (`dist/v2/`) toujours périmé (généré le 2026-07-02)

## Prochaine étape exacte
Retester manuellement les 4 corrections, trancher les 2 décisions produit restantes (énergie, écran Planning vide), relancer les e2e, puis reprendre V2-10 : build `dist/v2/`, doc V2, déploiement Netlify.

## Question bloquante pour la session suivante
Aucune.
