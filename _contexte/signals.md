# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-08-05)

## Questions ouvertes
- [P1] Continuer la Phase V5-2b (planning et tâches refondus) : M1-M5 codés, M5 testé (unitaires/e2e) mais validation manuelle en cours, reste M6 (audit E7), M7 (gate). — fait quand : phase codée, testée, validée manuellement, passée à `[FAIT]` — réf : `roadmap_v5.0.md` Phase V5-2b
- [P1] Retester manuellement le bug de série récurrente corrigé le 2026-08-05 : sur une occurrence déjà détachée (`recurrence_exception: true`), une modification en « Toutes les occurrences » ne la mettait pas à jour elle-même. Corrigé dans `usePlanningState.ts`, couvert par un test automatisé, pas encore revalidé manuellement. — fait quand : scénario rejoué manuellement sans défaut — réf : `tests_manuels.md` § 2b, `usePlanningState.ts` (`updateTaskFields`/`deleteTaskScoped`)
- [P1] Poursuivre la validation manuelle de M5 (planning épuré) : bandeau de dates, glissement tactile, sous-tâches dépliables, flux Planifier/Reporter, disparition de l'écran « Aujourd'hui ». — fait quand : `tests_manuels.md` § 3 purgé — réf : `tests_manuels.md`
- [P2] Récurrence mensuelle non testée manuellement : le déplacement rapide (sélecteur de date) est disponible depuis M5, le test peut maintenant être rejoué. — fait quand : testé manuellement — réf : `tests_manuels.md` § 1
- [P2] Communiquer à Marie les points de `a_communiquer_v5.md` **au moment de la livraison de la V5.0 complète** (pas avant), puis recueillir son retour sur les 3 écarts assumés et sur la priorité « Comptage en premier » parmi les outils reportés. — fait quand : retour de Marie recueilli après livraison — réf : `a_communiquer_v5.md`
- [P2] Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique. — fait quand : décision actée avec l'utilisateur — réf : `Archives/roadmap_v4.1.md` § Q à trancher
- [P2] Recueillir le retour utilisateur sur le rendu visuel réel du Budget (refonte de lisibilité, session 2026-07-25) — le Budget est rebranché tel quel comme outil en Phase V5-3, Marie ne l'a toujours pas vu. — fait quand : retour utilisateur recueilli — réf : `roadmap_v5.0.md` Phase V5-3, `E71Budget.tsx`
- [P3] Réglage « Réduire les animations » quasi sans effet visible faute d'animations à réduire dans l'interface actuelle — angle mort produit, pas une régression. — fait quand : décision prise (enrichir l'UI d'animations ou accepter l'état actuel) — réf : `roadmap_v5.0.md` § Reporté hors V5, `E112Accessibility.tsx`
- [P3] `todayStr()` (`planningSlotRules.ts`) ignore `dev_fake_date` alors que `todayDate()` (`repositories.ts:29`) le respecte — en dev avec date simulée active, le planning peut afficher un jour différent de celui utilisé pour l'énergie. — fait quand : décision prise (harmoniser ou accepter, outil dev uniquement) — réf : `planningSlotRules.ts`, `repositories.ts:29`
- [P3] `index.html:7` : `<title>tsa-scaffold</title>`, résidu de scaffold visible dans l'onglet du navigateur. — fait quand : titre corrigé — réf : `index.html`

## Dernière session (2026-08-05 — nettoyages hors roadmap : destination toujours forcée, chiffrement local retiré)

## Décisions prises
- Destination de création de tâche (`E21CreateTaskV2.tsx`) toujours forcée automatiquement, plus jamais de choix libre à l'utilisateur, quelle que soit l'origine de navigation — décidé avec l'utilisateur, suite à la découverte que l'ancien constat « code mort » sur ce bloc était faux (atteignable depuis une dizaine d'écrans non mappés via le « + » de la nav basse).
- Chiffrement local (`Settings.local_encryption`) retiré entièrement plutôt qu'implémenté — décidé avec l'utilisateur, après constat que la fonctionnalité n'a jamais été activable (aucun écran ne la basculait) ni active en production (repositories instanciés sans mot de passe).

## Livrables produits ou modifiés
- `E21CreateTaskV2.tsx` : `DEFAULT_DESTINATION = 'todo'` comme repli pour toute origine non listée dans `FORCED_DESTINATION_BY_ORIGIN` ; bloc UI « Que faire de cette tâche ? » et son état retirés ; destination `'today'` (Tâche du jour) supprimée du type `Destination`, devenue inatteignable. Tests réécrits (`E21CreateTaskV2.test.tsx`).
- `e2e/02-tasks.spec.ts` : nouveau scénario T19 (depuis Paramètres, origine non mappée, le « + » crée directement une tâche en réception sans afficher de choix).
- `src/crypto/` (crypto.ts, crypto.test.ts) supprimé. `TaskRepository`, `EnergyEntryRepository`, `ListItemRepository` : paramètre `password` et logique `encrypt`/`decrypt` retirés (repositories en passthrough direct sur Dexie).
- `Settings.local_encryption` supprimé de l'entité et de `useSettingsState.createUser`.
- Tests nettoyés en conséquence : `db.test.ts`, `settingsRepository.test.ts`, `E112Accessibility.test.tsx`, `taskRepository.test.ts`, `energyEntryRepository.test.ts` (blocs « with encryption » et fixtures `local_encryption` retirés).
- `roadmap_v5.0.md` § Bugs constatés : entrée sur `exportData()` non déchiffré marquée résolue (le chiffrement n'ayant jamais été actif, elle présupposait un état impossible).

## Hypothèses validées / invalidées
- INVALIDE : le bloc de choix libre de destination dans `E21CreateTaskV2.tsx` était considéré comme du code mort par une session antérieure -> en réalité atteignable depuis ~10 écrans (task-detail, settings*, list-detail, budget, resources, overload-recovery, energy-view, task-decompose) via le « + » de la nav basse, non couverts par `FORCED_DESTINATION_BY_ORIGIN`.
- INVALIDE : le bug `exportData()` non déchiffré supposait que `local_encryption` pouvait être actif -> en réalité jamais actif en production (repositories toujours instanciés sans mot de passe, aucun écran ne bascule le réglage) -> pivot : retrait complet plutôt que correctif ciblé.
- VALIDE : 489/489 tests unitaires (53 fichiers), 53/53 e2e, `tsc -b`/build clean après les deux changements.

## Prochaine étape exacte
Reprendre les points P1 : validation manuelle de M5 (`tests_manuels.md` § 3), retest du bug de série récurrente (§ 2b), puis M6 (audit E7) et M7 (gate de phase V5-2b).

## Question bloquante pour la session suivante
Aucune.
