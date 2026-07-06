# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-07-06)

## Actions ouvertes

### Phase 7 — Tests utilisateurs (1/5–10 sessions)
- [P2|ouvert] Sessions test 2 à 5+ avec Marie et autres testeurs AuDHD
  - fait quand: 5 à 10 sessions réalisées, retours consolidés dans fichier dédié
  - réf: `Note de réunion/synthese_reunion_marie_2026-06-29.md` + `Note de réunion/analyse_conduite_visio_marie.md`

### V2 — En cours
- [P1|ouvert] Phase V2-10 (Consolidation V2 & 2e vague de tests) — EN COURS
  - Plan de test manuel V2 (`plan_test_manuel_v2.md`) rédigé et passé intégralement le 2026-07-06 ; les écarts constatés sont consolidés dans `roadmap_v2.md` § "Constats test manuel V2-10". Reste : corriger les bugs confirmés, trancher les décisions produit, puis build V2 à jour, doc V2, déploiement Netlify, sessions test 2-5.
  - fait quand: bugs confirmés corrigés, décisions produit tranchées, doc V2 rédigée, `dist/v2/` régénéré et déployé sur Netlify, 5-10 sessions test réalisées
  - réf: `roadmap_v2.md` Phase V2-10 et § "Constats test manuel V2-10 (session 2026-07-06)"
- [P1|ouvert] Bugs confirmés lors du passage du plan de test manuel (2026-07-06), à corriger avant déploiement :
  - tri incorrect de "Planning du jour" (Dashboard) par `scheduled_start`
  - création de liste depuis le sélecteur "Ajouter à une liste" (Todo et création de tâche) ne rattache jamais la tâche à la liste nouvellement créée
  - aucune détection de conflit de créneau dans Planning
  - sous-tâches perdues silencieusement lors de conversion Todo → Planifier/Liste (confirmé, remplace l'ancienne action P3 équivalente)
  - fait quand: chaque bug corrigé et retesté manuellement
  - réf: `roadmap_v2.md` § "Constats test manuel V2-10 (session 2026-07-06)" sous-section "Bugs confirmés à corriger"
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
- **Onboarding : comportement de reprise changé (2026-07-06)** : `User.onboarding_completed: boolean` ajouté (`user.ts`). `createUser` l'initialise à `false`. Nouvelle fonction `completeOnboarding` (`AppContext.tsx`) marque l'onboarding terminé et navigue vers le dashboard — appelée par `E04FirstTask` (submit et ignorer). Au démarrage, si un utilisateur existe mais `onboarding_completed` est `false`, toutes les données sont effacées et l'app repart sur `welcome` (au lieu de sauter directement au dashboard comme avant).
- **Écran choix de profil (`E02Profile`) simplifié (2026-07-06)** : bouton "Ignorer" retiré — la sélection d'un des 3 profils (Adolescent/Étudiant/Adulte) est désormais obligatoire pour avancer, aucun moyen de contourner ce choix.
- **Plan de test manuel V2 créé et passé (2026-07-06)** : `plan_test_manuel_v2.md` (13 sections, ~65 cas), scope basé sur les écrans réellement implémentés. Passage complet effectué le 2026-07-06 ; tous les cas non annotés sont validés. Les écarts (4 bugs confirmés, 2 décisions produit, 4 fonctionnalités manquantes, 2 demandes de nettoyage UI, 10 points à re-tester) sont consolidés dans `roadmap_v2.md`.
- Branche `v2` active ; tag `v1.0-mvp` posé ; `dist/v1/` versionné pour rollback, `dist/v2/` ignoré Git/régénérable via `npm run build`
- 345/345 tests unitaires, `tsc -b` passent après les changements onboarding/E02Profile ; e2e non relancés cette session (dernière confirmation 45/45 le 2026-07-05, session 2) — le helper e2e `completeFastOnboarding` clique déjà "Étudiant" puis "Ignorer" sur l'étape Aujourd'hui (pas sur le profil), donc a priori non impacté par le retrait du bouton Ignorer profil, mais non revérifié en e2e réel.
- `npm run test` sous `--pool=vmThreads --poolOptions.vmThreads.maxThreads=1` fait échouer les tests liés à `crypto.subtle` (faux négatif d'environnement documenté) — utiliser le pool par défaut (`npx vitest run`)

## Dernière session (2026-07-06)

## Décisions prises
- Un utilisateur qui quitte l'app avant d'atteindre le dashboard (onboarding incomplet) repart de zéro à la prochaine ouverture, plutôt que de reprendre directement sur le dashboard.
- Le bouton "Ignorer" de l'écran de choix de profil est retiré : la sélection d'un profil est obligatoire.
- Plan de test manuel V2 complet rédigé et exécuté ; tous les écarts documentés et consolidés dans la roadmap plutôt que corrigés à la volée (décision de les traiter comme un lot dédié).

## Livrables produits ou modifiés
- `src/domain/entities/user.ts` : ajout `onboarding_completed: boolean`
- `src/app/AppContext.tsx` : `completeOnboarding`, `wipeAllData` (extrait de `deleteAllData`), logique `init()` revue
- `src/ui/screens/onboarding/E04FirstTask.tsx` : appelle `completeOnboarding` au lieu de `goTo('dashboard')`
- `src/ui/screens/onboarding/E02Profile.tsx` : bouton "Ignorer" retiré
- Tests ajustés : `E04FirstTask.test.tsx`, `E02Profile.test.tsx`, `AppContext.test.tsx`, `db.test.ts`, `userRepository.test.ts`, `E111Profile.test.tsx`, `src/test/testUtils.tsx`
- `plan_test_manuel_v2.md` (nouveau) : plan de test manuel complet, passé et annoté
- `roadmap_v2.md` : nouvelle section "Constats test manuel V2-10 (session 2026-07-06)" (bugs, décisions produit, fonctionnalités manquantes, nettoyage UI, à re-tester)

## Hypothèses validées / invalidées
- VALIDE : 345/345 tests unitaires, `tsc -b` clean après le changement de comportement onboarding
- VALIDE : passage complet du plan de test manuel — cas non mentionnés dans la session déclarés OK par l'utilisateur
- INVALIDE : plusieurs comportements supposés acquis ne le sont pas (tri planning, rattachement liste à la création, conflit de créneau, suppression de liste, modification de profil) → pivot : consignés comme actions à traiter avant déploiement plutôt que suppositions validées
- EN ATTENTE : e2e non relancés après les changements onboarding/E02Profile (dernière confirmation 45/45 le 2026-07-05)
- EN ATTENTE : build V2 (`dist/v2/`) toujours périmé (généré le 2026-07-02)

## Prochaine étape exacte
Corriger les bugs confirmés (tri Planning du jour, rattachement liste à la création, conflit de créneau Planning, perte de sous-tâches), trancher les décisions produit (énergie, écran Planning vide), relancer les e2e, puis reprendre V2-10 : build `dist/v2/`, doc V2, déploiement Netlify.

## Question bloquante pour la session suivante
Aucune.
