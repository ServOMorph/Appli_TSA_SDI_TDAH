# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-08-04)

## Questions ouvertes
- [P1] Continuer la Phase V5-2b (planning et tâches refondus) : milestones M1-M4 faits et validés manuellement, reste M5 (planning sans grille), M6 (audit E7), M7 (gate). — fait quand : phase codée, testée, validée manuellement, passée à `[FAIT]` — réf : `roadmap_v5.0.md` Phase V5-2b
- [P1] M5 doit aussi régler l'accès à l'écran « Aujourd'hui », actuellement inatteignable par navigation (aucun bouton n'y mène, constaté en test manuel M3). — fait quand : un bouton permet d'atteindre l'écran, testé manuellement — réf : `App.tsx`, `E24Today.tsx`
- [P2] Bloc de choix libre de destination (« Que faire de cette tâche ? ») dans `E21CreateTaskV2.tsx` semble être du code mort — aucune origine de navigation ne laisse ce choix libre, toutes forcent une destination. Signalé à l'utilisateur, pas traité (attente décision). — fait quand : décision prise (retirer le code mort ou trouver un chemin de navigation qui l'atteint) — réf : `E21CreateTaskV2.tsx` `FORCED_DESTINATION_BY_ORIGIN`
- [P2] Récurrence mensuelle non testée manuellement (M3 point 2) : nécessite de se déplacer loin dans le planning, reporté jusqu'au déplacement rapide (M5). — fait quand : testé manuellement une fois le déplacement rapide dispo — réf : `tests_manuels.md`
- [P2] Édition d'une tâche récurrente via sa fiche (M4 point 3) non testée manuellement : depuis le planning, taper une occurrence ouvre encore l'ancien menu tap-based de `PlanningBoard.tsx`, pas la fiche `E22TaskDetail.tsx` — dépend du retrait du flux tap-based (M5). — fait quand : testé manuellement une fois M5 fait — réf : `tests_manuels.md`, `PlanningBoard.tsx`
- [P2] Corriger `exportData()` (`useSettingsState.ts`) qui lit `db.energyEntries.toArray()` brut au lieu de passer par `EnergyEntryRepository` — `energy_entries[].value` sort non déchiffré si `local_encryption` est activé. — fait quand : `exportData` passe par le repository, export vérifié avec chiffrement activé — réf : `roadmap_v5.0.md` § Bugs constatés
- [P2] Communiquer à Marie les points de `a_communiquer_v5.md` **au moment de la livraison de la V5.0 complète** (pas avant), puis recueillir son retour sur les 3 écarts assumés et sur la priorité « Comptage en premier » parmi les outils reportés. — fait quand : retour de Marie recueilli après livraison — réf : `a_communiquer_v5.md`
- [P2] Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique. — fait quand : décision actée avec l'utilisateur — réf : `Archives/roadmap_v4.1.md` § Q à trancher
- [P2] Recueillir le retour utilisateur sur le rendu visuel réel du Budget (refonte de lisibilité, session 2026-07-25) — le Budget est rebranché tel quel comme outil en Phase V5-3, Marie ne l'a toujours pas vu. — fait quand : retour utilisateur recueilli — réf : `roadmap_v5.0.md` Phase V5-3, `E71Budget.tsx`
- [P3] Réglage « Réduire les animations » quasi sans effet visible faute d'animations à réduire dans l'interface actuelle — angle mort produit, pas une régression. — fait quand : décision prise (enrichir l'UI d'animations ou accepter l'état actuel) — réf : `roadmap_v5.0.md` § Reporté hors V5, `E112Accessibility.tsx`
- [P3] `todayStr()` (`planningSlotRules.ts:21`) ignore `dev_fake_date` alors que `todayDate()` (`repositories.ts:29`) le respecte — en dev avec date simulée active, le planning peut afficher un jour différent de celui utilisé pour l'énergie. — fait quand : décision prise (harmoniser ou accepter, outil dev uniquement) — réf : `planningSlotRules.ts:21`, `repositories.ts:29`
- [P3] `index.html:7` : `<title>tsa-scaffold</title>`, résidu de scaffold visible dans l'onglet du navigateur. — fait quand : titre corrigé — réf : `index.html`

## Dernière session (2026-08-04 — Phase V5-2b M1-M4 codés et validés manuellement)

## Décisions prises
- Phase V5-2b découpée en 7 milestones internes (M1-M7, cf. plan de session) plutôt qu'un seul bloc — un seul `[FAIT]` final sur la phase, comme convenu.
- Récurrence : sous-ensemble maison (quotidien/hebdo/mensuel/annuel, intervalle, fin par date ou nombre), pas de librairie RRULE — décision actée avec l'utilisateur avant codage.
- Icônes : bibliothèque SVG interne restreinte (15 icônes), pas d'emoji — décision actée avec l'utilisateur.
- Flux « Déplacer » tap-based du planning : à terme entièrement remplacé par la fiche tâche (décidé avec l'utilisateur) — le retrait effectif du planning reste à faire en M5, la fiche (M4) est prête à le recevoir.
- Édition d'une tâche récurrente : dialogue « cette occurrence » / « toutes les occurrences » sur tout changement de champ ou suppression, propagation aux occurrences futures non détachées uniquement (jamais aux occurrences passées, jamais à la date elle-même).
- Duplication d'une tâche récurrente : la copie est toujours détachée de la série (`recurrence_id: null`), jamais recréée comme récurrente.

## Livrables produits ou modifiés
- **M1** : `src/domain/entities/task.ts` (+icon/color/description/duration_minutes/recurrence_id/is_recurrence_root/recurrence_exception), `taskRecurrence.ts`, `taskException.ts` (nouvelles entités), migration Dexie **v9** (`db.ts`), `taskRecurrenceRepository.ts`, `taskExceptionRepository.ts`, chiffrement de `description` aligné sur `title` (`taskRepository.ts`).
- **M2** : `src/domain/rules/taskRecurrenceRules.ts` (scan jour par jour, 18 tests), `taskAppearance.ts` (15 icônes), `IconPicker.tsx`, `ColorPicker.tsx`, `DurationRoller.tsx`, `RecurrenceEditor.tsx`.
- **M3** : `E21CreateTaskV2.tsx` entièrement redessiné (icône, sous-tâches, description, couleur, énergie, obligatoire, date/heure/durée, récurrence) ; `usePlanningState.ts` : nettoyage des noms `*V2` (renommés sans suffixe, répercuté partout), nouvelle fonction `createDetailedTask` avec matérialisation des occurrences sur 90 jours.
- **M4** : `E22TaskDetail.tsx` : champs cliquables (icône/couleur/date/horaire/énergie), action « Dupliquer », dialogue occurrence/série. `usePlanningState.ts` : `getTaskById`, `duplicateTaskById`, `updateTaskFields`, `deleteTaskScoped`. `taskRepository.getByRecurrenceId` ajouté.
- `tests_manuels.md` : purgé au fur et à mesure des validations M3/M4 ; restent 2 points bloqués (récurrence mensuelle, édition récurrente via planning) reportés à M5.
- `roadmap_v5.0.md` : Phase V5-2b passée à `[EN COURS]`, items M1-M4 cochés avec notes de simplification, staleness des références `taskV2.ts`/`subTaskRules.ts` corrigée dans le texte.
- 2 bugs trouvés en validation manuelle et corrigés dans la session : `IconPicker` ne désélectionnait jamais une icône déjà choisie ; `createDetailedTask` ne rafraîchissait pas `inboxTasks`/`todayTasks` (tâche créée invisible en Réception/Aujourd'hui).
- 1 dette de test pré-existante corrigée (hors périmètre M4 mais bloquante pour valider mon propre travail) : `AppContext.test.tsx` n'avait aucun nettoyage entre tests, provoquant une pollution intermittente (confirmée identique sur le code d'avant cette session via `git stash`) — `afterEach` ajouté, vidant `tasks`/`taskRecurrences`/`taskExceptions` (pas les autres tables, dont dépendent des blocs `describe` ultérieurs).

## Hypothèses validées / invalidées
- VALIDE : M1-M4 validés manuellement par l'utilisateur (icône, sous-tâches, description, couleur, énergie, obligatoire, création Todo/Outils/Listes/Planifier, champs cliquables de la fiche, dupliquer).
- INVALIDE puis corrigée : icône non désélectionnable au reclic — bug réel, corrigé et testé.
- INVALIDE puis corrigée : tâche créée via le nouvel écran invisible en Réception/Aujourd'hui — bug réel (fonction de rechargement pas toujours appelée), corrigé et testé.
- EN ATTENTE : récurrence mensuelle (nécessite de se déplacer loin dans le planning, pas testable avant M5).
- EN ATTENTE : édition d'une tâche récurrente depuis le planning (bloqué — le planning ouvre encore son propre menu tap-based, pas la fiche ; dépend du retrait de ce flux en M5).
- VALIDE : 563/563 tests unitaires, `tsc -b`/lint clean au run de clôture.

## Prochaine étape exacte
M5 — refonte du planning (`PlanningBoard.tsx`/`E10Dashboard.tsx`) : retrait du quadrillage horaire et du flux tap-based (assign/move), une ligne par tâche (icône/horaire/nom/énergie/pastille), bandeau de dates, sous-tâches dépliables avec compteur n/N. Router les taps sur une tâche du planning vers `E22TaskDetail` plutôt que le menu actuel. Profiter de M5 pour régler l'accès à l'écran « Aujourd'hui » (actuellement inatteignable).

## Question bloquante pour la session suivante
Aucune.
