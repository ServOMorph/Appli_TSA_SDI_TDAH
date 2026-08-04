# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-08-05)

## Questions ouvertes
- [P1] Continuer la Phase V5-2b (planning et tâches refondus) : M1-M5 codés, M5 testé (unitaires/e2e) mais validation manuelle en cours, reste M6 (audit E7), M7 (gate). — fait quand : phase codée, testée, validée manuellement, passée à `[FAIT]` — réf : `roadmap_v5.0.md` Phase V5-2b
- [P1] Retester manuellement le bug de série récurrente corrigé le 2026-08-05 : sur une occurrence déjà détachée (`recurrence_exception: true`), une modification en « Toutes les occurrences » ne la mettait pas à jour elle-même. Corrigé dans `usePlanningState.ts`, couvert par un test automatisé, pas encore revalidé manuellement. — fait quand : scénario rejoué manuellement sans défaut — réf : `tests_manuels.md` § 2b, `usePlanningState.ts` (`updateTaskFields`/`deleteTaskScoped`)
- [P1] Poursuivre la validation manuelle de M5 (planning épuré) : bandeau de dates, glissement tactile, sous-tâches dépliables, flux Planifier/Reporter, disparition de l'écran « Aujourd'hui ». — fait quand : `tests_manuels.md` § 3 purgé — réf : `tests_manuels.md`
- [P2] Bloc de choix libre de destination (« Que faire de cette tâche ? ») dans `E21CreateTaskV2.tsx` semble être du code mort — aucune origine de navigation ne laisse ce choix libre, toutes forcent une destination. Signalé à l'utilisateur, pas traité (attente décision). — fait quand : décision prise (retirer le code mort ou trouver un chemin de navigation qui l'atteint) — réf : `E21CreateTaskV2.tsx` `FORCED_DESTINATION_BY_ORIGIN`
- [P2] Récurrence mensuelle non testée manuellement : le déplacement rapide (sélecteur de date) est disponible depuis M5, le test peut maintenant être rejoué. — fait quand : testé manuellement — réf : `tests_manuels.md` § 1
- [P2] Corriger `exportData()` (`useSettingsState.ts`) qui lit `db.energyEntries.toArray()` brut au lieu de passer par `EnergyEntryRepository` — `energy_entries[].value` sort non déchiffré si `local_encryption` est activé. — fait quand : `exportData` passe par le repository, export vérifié avec chiffrement activé — réf : `roadmap_v5.0.md` § Bugs constatés
- [P2] Communiquer à Marie les points de `a_communiquer_v5.md` **au moment de la livraison de la V5.0 complète** (pas avant), puis recueillir son retour sur les 3 écarts assumés et sur la priorité « Comptage en premier » parmi les outils reportés. — fait quand : retour de Marie recueilli après livraison — réf : `a_communiquer_v5.md`
- [P2] Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique. — fait quand : décision actée avec l'utilisateur — réf : `Archives/roadmap_v4.1.md` § Q à trancher
- [P2] Recueillir le retour utilisateur sur le rendu visuel réel du Budget (refonte de lisibilité, session 2026-07-25) — le Budget est rebranché tel quel comme outil en Phase V5-3, Marie ne l'a toujours pas vu. — fait quand : retour utilisateur recueilli — réf : `roadmap_v5.0.md` Phase V5-3, `E71Budget.tsx`
- [P3] Réglage « Réduire les animations » quasi sans effet visible faute d'animations à réduire dans l'interface actuelle — angle mort produit, pas une régression. — fait quand : décision prise (enrichir l'UI d'animations ou accepter l'état actuel) — réf : `roadmap_v5.0.md` § Reporté hors V5, `E112Accessibility.tsx`
- [P3] `todayStr()` (`planningSlotRules.ts`) ignore `dev_fake_date` alors que `todayDate()` (`repositories.ts:29`) le respecte — en dev avec date simulée active, le planning peut afficher un jour différent de celui utilisé pour l'énergie. — fait quand : décision prise (harmoniser ou accepter, outil dev uniquement) — réf : `planningSlotRules.ts`, `repositories.ts:29`
- [P3] `index.html:7` : `<title>tsa-scaffold</title>`, résidu de scaffold visible dans l'onglet du navigateur. — fait quand : titre corrigé — réf : `index.html`

## Dernière session (2026-08-05 — Phase V5-2b M5 codé/testé, validation manuelle en cours)

## Décisions prises
- Sous-tâches : conservent un horaire propre indépendant (planifiable séparément de la tâche parente), en plus d'être comptées/dépliables sous la ligne de la tâche parente dans le planning — décidé avec l'utilisateur.
- Flux « Planifier » (Réception, fiche) sans grille : place la tâche au jour courant sans horaire puis ouvre sa fiche pour affiner — décidé avec l'utilisateur.
- Écran « Aujourd'hui » (`E24Today`) retiré entièrement (route, fichier, tests) plutôt que rendu accessible — jugé redondant avec la section « Tâche du jour » déjà présente sur l'accueil — décidé avec l'utilisateur.

## Livrables produits ou modifiés
- **M5** : `PlanningBoard.tsx` entièrement réécrit — grille horaire et flux tap-based (assign/menu/déplacer/renommer/supprimer) supprimés ; liste par tâche (icône/horaire/nom/énergie/pastille), bandeau de dates (jour réel souligné, point sur le jour affiché, navigation par appui et glissement tactile, sélecteur « aller à une date »), sous-tâches dépliables avec compteur n/N, bouton « Reporter » simplifié (bascule directe au lendemain, même horaire).
- `usePlanningState.ts` : ajout de `planTaskToday` ; retrait de `pendingPlanTask`/`movingTask` et de toute leur plomberie (code mort une fois le tap-based retiré) ; retrait de `planningTargetDate`/`createTaskDest` (déjà morts avant la session).
- `E22TaskDetail.tsx` : champ « Titre » ajouté (compense le retrait du « Renommer » de l'ancien menu planning) ; sous-tâches : bouton « Planifier » remplacé par un panneau horaire inline (date/heure/durée) réutilisant `scheduleSubTask`. `E23Decompose.tsx` : même traitement.
- `E20Inbox.tsx` : « Planifier » appelle `planTaskToday` puis ouvre la fiche (au lieu du grid pick) ; l'avertissement « sous-tâches perdues » retiré pour ce chemin (les sous-tâches sont désormais préservées).
- `E24Today.tsx`/`E24Today.test.tsx` supprimés ; route `today` retirée (`navigation.ts`, `App.tsx`, `DevResetButton.tsx`).
- `planningSlotRules.ts` réduit aux fonctions de date (grille/picker supprimées avec leurs tests).
- Tests unitaires réécrits/ajustés : `PlanningBoard.test.tsx`, `E10Dashboard.test.tsx`, `E20Inbox.test.tsx`, `E22TaskDetail.test.tsx`, `E23Decompose.test.tsx`, `E21CreateTaskV2.test.tsx`, `navigation.test.ts`.
- e2e réécrits : `05-overload.spec.ts`, `07-planning-v4.spec.ts` ; corrigés (collision d'accessible name avec le nouveau champ Titre) : `01-onboarding.spec.ts` (T06, pré-existant flaky confirmé via `git stash`), `02-tasks.spec.ts` (T13/T16/T17).
- Bug trouvé en validation manuelle et corrigé : `updateTaskFields`/`deleteTaskScoped` (`usePlanningState.ts`) excluaient à tort l'occurrence cliquée d'une propagation « série » si elle était déjà détachée (`recurrence_exception: true`) — l'occurrence éditée est désormais toujours incluse. Test de régression ajouté (`AppContext.test.tsx`), retest manuel en attente.
- `tests_manuels.md` : purgé des points débloqués par M5, section M5 ajoutée (7 points), section 2b ajoutée pour le bug de série récurrente.

## Hypothèses validées / invalidées
- VALIDE : 510/510 tests unitaires, 52/52 e2e, `tsc -b`/lint clean au run de clôture du code M5.
- INVALIDE puis corrigée : édition « série » d'une occurrence déjà détachée ne mettait pas à jour l'occurrence cliquée elle-même — bug réel, corrigé et testé automatiquement, retest manuel en attente.
- EN ATTENTE : validation manuelle tactile réelle de M5 (bandeau de dates, glissement, sous-tâches dépliables) — non faite dans cette session, hors environnement de test.

## Prochaine étape exacte
Poursuivre la validation manuelle de M5 (`tests_manuels.md` § 3) et retester le bug de série récurrente (§ 2b). Une fois validé : M6 (audit E7 — aucune donnée préremplie à l'installation), puis M7 (gate de phase V5-2b).

## Question bloquante pour la session suivante
Aucune.
