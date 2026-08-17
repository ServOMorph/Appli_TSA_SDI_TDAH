# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-08-17)

## Contexte chaud
- Branche `sync-marie` : 4 commits non fusionnés dans `main` (roadmap sync Supabase créée, setup projet Supabase, clôture de la communication Marie V5.0 incluant la suppression de `a_communiquer_v5.md`). Le travail des dernières sessions (sans rapport avec la sync) a été fait sur `main` pour ne pas mélanger les deux chantiers — `a_communiquer_v5.md` existe donc encore sur `main`, `roadmap_sync_marie.md` n'y existe pas encore. Réconciliation à faire à la prochaine reprise du chantier sync (fusion ou rebase).
- `donnees_marie/` : trois exports réels de Marie stockés en local, gitignorés, donnée sensible déclarée dans `CLAUDE.md` (2026-08-13, 2026-08-16 18h27, 2026-08-16 22h35 — ce dernier récupéré et traité cette session via `/traiter_export_marie`, jamais capturé avant malgré la reconfirmation erronée de la session précédente).
- Nouvelle commande `.claude/commands/traiter_export_marie.md` : traite l'arrivée d'un export de Marie indépendamment de `/deploy` (comparaison par `export_date`, copie normalisée dans `donnees_marie/`, ingestion du journal, détection pertes/frictions). `/deploy` étape 0 fait toujours le même travail en interne, redondance non retirée — à évaluer si gênant.
- Refonte complète du concept Budget en cours, demandée par Marie (« Montant total » distribué entre « Mon compte » (Semaine/Mois) et « Livrets »). Roadmap `roadmap_budget_v2.md` créée, 4 phases. Phase 1 livrée cette session (entité `BudgetIncomeEntry`, migration Dexie v13, formulaire de saisie, carte « Montant total » sur l'écran Budget) — **volontairement pas encore annoncée à Marie** (ni `WHATS_NEW`, ni `manualTestsCatalog.ts`) : la carte affichée est incohérente tant qu'elle n'est pas reliée aux catégories/livrets (Phases 2-4), la lui exposer maintenant la confondrait.
- `manualTestsCatalog.ts` : formulation du test « Utiliser le budget » corrigée (l'étape 1 renvoyait vers le widget « Comptes » de l'accueil, qui n'ouvre qu'un formulaire de dépense — le chemin réel passe par Outils → Budget), confirmée par le commentaire de Marie elle-même sur l'export du 16/08 22h35.
- `tests_manuels.md` vide — toutes les vérifications passent par le catalogue in-app `manualTestsCatalog.ts` (10 tests, étapes numérotées).
- `E121ManualTests.tsx` : un test « Validé » disparaît de la liste affichée à Marie (catalogue conservé en interne) ; chaque test dépliable/repliable.
- `_contexte/dernier_deploiement.md` : v5.40, 2026-08-17, prod vérifiée HTTP 200 — inchangé cette session (aucun déploiement).
- `src/ui/screens/onboarding/E01Welcome.tsx` : `WHATS_NEW` vide depuis v5.40, toujours vide (rien annoncé cette session, cf. ci-dessus).
- Site de test `appli-audhd-dev.netlify.app` (`NETLIFY_SITE_ID_DEV` dans `.env`) : déployable via `/deploy_dev`.
- `/deploy` et `/deploy_dev` vérifient la fraîcheur de `manualTestsCatalog.ts` avant le déploiement.

## Questions ouvertes
- [P1] Reprendre la Phase 2 de `roadmap_budget_v2.md` (rattachement des livrets au Montant total) — checkpoint atteint, confirmation utilisateur requise avant de continuer. — fait quand : Phase 2 livrée et testée — réf : `roadmap_budget_v2.md`
- [P1] Sur l'export du 16/08 22h35 : le retrait d'un livret ne se répercute toujours pas sur « Il me reste » (nouveau nok distinct de l'ancien bug d'accès déjà corrigé) — sera résolu par les Phases 2-4 de la refonte budget, pas par un correctif isolé. — fait quand : Phase 2-3 de `roadmap_budget_v2.md` livrées — réf : `_contexte/marie_tests_journal.json` (entrée `6e32ace5`), `budgetRules.ts`
- [P2] Redemander à Marie de réimporter et revalider « Utiliser le budget » (formulation corrigée) une fois redéployé, ainsi que « Glisser pour ouvrir le planning » (nok, demande de bottom-sheet continu déjà connue, non traitée). — fait quand : ces tests validés dans un nouvel export ingéré — réf : `manualTestsCatalog.ts`, `_contexte/marie_tests_journal.json`
- [P2] Reprendre la Phase 1 de `roadmap_sync_marie.md` sur la branche `sync-marie` (non touchée depuis plusieurs sessions) — voir réconciliation de branche ci-dessus avant de continuer. — fait quand : Phase 1 checklist complétée — réf : `roadmap_sync_marie.md` Phase 1 (branche `sync-marie`)
- [P2] Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique. — fait quand : décision actée avec l'utilisateur — réf : `Archives/roadmap_v5.1.md` § Q à trancher
- [P3] Réglage « Réduire les animations » quasi sans effet visible faute d'animations à réduire dans l'interface actuelle — angle mort produit, pas une régression. — fait quand : décision prise (enrichir l'UI d'animations ou accepter l'état actuel) — réf : `roadmap_v5.0.md` § Reporté hors V5, `E112Accessibility.tsx`
- [P3] `todayStr()` (`planningSlotRules.ts`) ignore `dev_fake_date` alors que `todayDate()` (`repositories.ts:29`) le respecte — en dev avec date simulée active, le planning peut afficher un jour différent de celui utilisé pour l'énergie. — fait quand : décision prise (harmoniser ou accepter, outil dev uniquement) — réf : `planningSlotRules.ts`, `repositories.ts:29`
- [P3] `index.html:7` : `<title>tsa-scaffold</title>`, résidu de scaffold toujours visible dans l'onglet du navigateur. — fait quand : titre corrigé — réf : `index.html`

## Dernière session (2026-08-17 — suite, traitement export Marie 22h35, refonte Budget Phase 1)

## Décisions prises
- Commande `/traiter_export_marie` créée pour traiter l'arrivée d'un export de Marie indépendamment de `/deploy`.
- Export du 16/08 22h35 (jamais récupéré) traité : 6 nouveaux résultats de tests ingérés, dont un bug budget distinct (retrait livret) et une formulation de test erronée (corrigée).
- Marie a demandé une refonte complète du concept Budget (« Montant total » réparti entre « Mon compte » et « Livrets ») ; roadmap `roadmap_budget_v2.md` créée et validée, Phase 1 livrée.
- `WHATS_NEW`/`manualTestsCatalog.ts` volontairement pas mis à jour pour la Phase 1 du budget : feature incomplète, exposer la carte « Montant total » à Marie maintenant serait trompeur.

## Livrables produits ou modifiés
- `.claude/commands/traiter_export_marie.md` : créée.
- `src/domain/data/manualTestsCatalog.ts` : formulation du test « Utiliser le budget » corrigée.
- `roadmap_budget_v2.md` : créée, Phase 1 [FAIT], Phases 2-4 [TODO].
- `src/domain/entities/budgetIncomeEntry.ts`, `src/data/repositories/budgetIncomeEntryRepository.ts`(`.test.ts`) : nouvelle entité et repository.
- `src/data/db.ts`(`.test.ts`) : migration Dexie v13.
- `src/domain/rules/budgetRules.ts`(`.test.ts`) : `getTotalIncomeEntries`.
- `src/app/contexts/useBudgetState.ts`, `src/app/repositories.ts` : câblage.
- `src/ui/components/BudgetIncomeModal.tsx`, `src/ui/screens/tools/E71Budget.tsx`(`.test.tsx`) : carte « Montant total » + formulaire.
- `src/app/contexts/useSettingsState.ts`(`.test.tsx`) : export/import `budget_income_entries`, version 3.4.
- `_contexte/marie_tests_journal.json` : 6 entrées ajoutées.
- `donnees_marie/export-audhd-2026-08-16-22h35.json` : copié (gitignoré, non commité).

## Hypothèses validées / invalidées
- INVALIDE : l'export du 16/08 était réputé le dernier disponible (affirmation de la session précédente) -> pivot : un export plus tardif du même jour existait, jamais capturé — commande `/traiter_export_marie` créée pour fiabiliser ce contrôle à l'avenir.
- VALIDE : 560/560 tests unitaires, `tsc -b`/lint clean après la Phase 1 du budget.
- EN ATTENTE : Phases 2-4 de la refonte budget non commencées (checkpoint roadmap, confirmation utilisateur requise).

## Prochaine étape exacte
Reprendre la Phase 2 de `roadmap_budget_v2.md` (rattachement des livrets au Montant total) après confirmation utilisateur.

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-08-17 — archivage des roadmaps terminées, déploiement v5.40)

## Décisions prises
- Export de Marie du 16/08 reconfirmé comme dernier disponible (étape 0 de `/deploy`) — aucun nouvel élément à ingérer, `/deploy` poursuivi.
- Erreur de lint préexistante `db.ts:308` (`_section` déstructuré jamais utilisé) corrigée à la racine : `eslint.config.js` ne couvrait que les paramètres de fonction (`argsIgnorePattern: '^_'`), pas les variables déstructurées — `varsIgnorePattern: '^_'` ajouté.
- Test `E01Welcome.test.tsx` fragile (dépendait du contenu réel, non vide, du tableau `WHATS_NEW`) reformulé pour vérifier le comportement réel (modale déjà vue pour la version courante via `localStorage`), indépendant du contenu — évite la récurrence à chaque cycle `/deploy`.
- v5.40 déployée en prod après confirmation utilisateur (cumule tous les correctifs/retouches depuis v5.31 : Budget, catégories de listes, nettoyage tests manuels, retouches accueil/E121, archivage roadmaps, correctifs lint/test).

## Livrables produits ou modifiés
- `roadmap_v5.1.md`, `roadmap_tests_marie.md`, `roadmap_categories_listes.md` → `Archives/` (`git mv`).
- `eslint.config.js` : `varsIgnorePattern: '^_'` ajouté.
- `src/ui/screens/onboarding/E01Welcome.test.tsx` : test reformulé (indépendant du contenu de `WHATS_NEW`).
- `src/ui/screens/onboarding/E01Welcome.tsx` : `WHATS_NEW` vidé après déploiement.
- `_contexte/dernier_deploiement.md` : v5.40, 2026-08-17.
- `CHANGELOG.md` : v5.39 (archivage), v5.40 (correctifs lint/test).

## Hypothèses validées / invalidées
- VALIDE : correctifs lint/test confirmés par vérifications bloquantes vertes (555/555 tests, `tsc -b` clean, `npm run lint` clean).
- VALIDE : déploiement v5.40 confirmé HTTP 200 sur `https://appli-audhd.netlify.app`.

## Prochaine étape exacte
Redemander à Marie de réimporter et revalider ses tests en attente (Budget ×3, catégories de listes, glisser planning).

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-08-16 — suite 2, archivage des roadmaps terminées)

## Décisions prises
- Les 3 roadmaps dont toutes les phases sont `[FAIT]` (`roadmap_v5.1.md`, `roadmap_tests_marie.md`, `roadmap_categories_listes.md`) déplacées vers `Archives/`, suivant le précédent déjà appliqué aux roadmaps V1-V5.0.
- Références actives (hors journal historique) mises à jour dans `_contexte/signals.md` et `_contexte/contexte.md` pour pointer vers `Archives/`.

## Livrables produits ou modifiés
- `Archives/roadmap_v5.1.md`, `Archives/roadmap_tests_marie.md`, `Archives/roadmap_categories_listes.md` : déplacés (`git mv`), contenu inchangé.
- `_contexte/signals.md`, `_contexte/contexte.md` : références mises à jour.

## Hypothèses validées / invalidées
- VALIDE : critère d'archivage (toutes phases `[FAIT]`, aucun `[TODO]`/`[EN COURS]` restant) cohérent avec les roadmaps déjà archivées.
- EN ATTENTE : lint global bloqué par une erreur préexistante dans `db.ts:308`, sans rapport avec cette session. Aucun déploiement depuis v5.31.

## Prochaine étape exacte
Corriger l'erreur de lint préexistante dans `db.ts:308` avant le `/deploy` en cours, puis terminer le déploiement (cumule tous les correctifs/retouches depuis v5.31) et redemander à Marie de réimporter et revalider ses tests en attente.

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-08-16 — suite, dashboard + refonte E121 tests manuels, clôture Phase V5.1-0)

## Décisions prises
- Dernier point de `tests_manuels.md` (Import JSON) validé par l'utilisateur ; fichier vidé intégralement. Phase V5.1-0 de `Archives/roadmap_v5.1.md` passée `[FAIT]`.
- Accueil retouché sur demande utilisateur : bouton « + » Outils déplacé à côté du titre et réduit, espacement accru avant la grille de widgets, police arrondie sur les widgets (fallback OS `ui-rounded`/`SF Pro Rounded`/`Segoe UI Rounded`, aucun fichier de police chargé — contrainte offline-first préservée).
- Sur E121, un test dont le dernier résultat est « Validé » n'apparaît plus dans la liste affichée à Marie ; le catalogue interne le garde intact comme suite de non-régression (décision explicite de l'utilisateur : ne pas supprimer l'archive, seulement filtrer l'UI).
- Chaque test dispose désormais d'un bouton déplier/replier (validé manuellement par l'utilisateur) ; `ManualTest.description` remplacé par `steps: string[]`, chaque test réécrit en étapes numérotées précises (libellés exacts des boutons/champs/écrans, aucun implicite). Gabarit de rédaction documenté en commentaire en tête de `manualTestsCatalog.ts` pour les prochains ajouts.

## Livrables produits ou modifiés
- `src/ui/screens/dashboard/E10Dashboard.tsx` : bouton « + » Outils repositionné/réduit, espacement grille, police arrondie widgets.
- `src/ui/screens/tests/E121ManualTests.tsx`/`.test.tsx` : filtrage des tests validés, déplier/replier, rendu `steps` en liste numérotée.
- `src/domain/data/manualTestsCatalog.ts` : `steps: string[]` remplace `description`, gabarit en commentaire, 10 tests réécrits.
- `tests_manuels.md` : vidé intégralement (plus aucun point en attente).
- `roadmap_v5.1.md` : Phase V5.1-0 `[FAIT]`.
- `src/ui/screens/onboarding/E01Welcome.tsx` : 2 entrées `WHATS_NEW` ajoutées.
- `CHANGELOG.md` : v5.38. `README.md` : état actuel mis à jour.

## Hypothèses validées / invalidées
- VALIDE : déplier/replier les étapes d'un test, confirmé par l'utilisateur en test manuel réel.
- INVALIDE : hypothèse initiale qu'un test « Validé » pouvait être supprimé du catalogue -> pivot : catalogue conservé comme suite de non-régression, seul l'affichage à Marie est filtré.
- EN ATTENTE : lint global bloqué par une erreur préexistante dans `db.ts:308`, sans rapport avec cette session. Aucun déploiement depuis v5.31.

## Prochaine étape exacte
Corriger l'erreur de lint préexistante dans `db.ts` avant le prochain `/deploy`, puis déployer (v5.38, cumule tous les correctifs/retouches depuis v5.31) et redemander à Marie de réimporter et revalider ses tests en attente.

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-08-16 — export Marie, nettoyage tests manuels, correctif catégories de listes à l'import)

## Décisions prises
- Suppression de 5 éléments de la liste « À acheter » (export du 16/08 vs 13/08) confirmée volontaire par l'utilisateur — pas un bug.
- `tests_manuels.md` recentré : les 7 points déjà dupliqués dans `manualTestsCatalog.ts` en sont retirés, ne garde que l'import JSON (dev). Point manquant (badge énergie) ajouté au catalogue.
- Bannières urgentes (accueil, Tests à faire) supprimées, devenues obsolètes.
- `.claude/commands/close.md` étape 6 enrichie : analyse de la conversation pour tracer les tests manuels décidés en session.
- Travail de cette session fait sur `main` (basculement depuis `sync-marie`, sans rapport avec ce chantier).

## Livrables produits ou modifiés
- `src/domain/data/manualTestsCatalog.ts` : test `badge-energie-couleur-ambiance` ajouté.
- `tests_manuels.md` : vidé de 7 points, ne garde que l'import JSON.
- `src/ui/screens/onboarding/E01Welcome.tsx`/`.test.tsx`, `src/ui/screens/tests/E121ManualTests.tsx`/`.test.tsx` : bannières urgentes retirées.
- `src/app/contexts/useSettingsState.ts`/`.test.tsx` : bug catégories de listes à l'export/import corrigé, export v3.2 → v3.3.
- `.claude/commands/close.md` : étape 6 enrichie.
- `CHANGELOG.md` : v5.37. `README.md` : état actuel mis à jour.

## Hypothèses validées / invalidées
- VALIDE : bug catégories de listes reproduit et corrigé (nouveau test dédié), 552/553 tests unitaires (échec préexistant sans rapport), `tsc -b` clean, lint clean sur les fichiers modifiés.
- INVALIDE : hypothèse que les 8 points de `tests_manuels.md` étaient tous propres au développeur -> pivot : 7/8 dupliquaient déjà le catalogue Marie.
- EN ATTENTE : lint global bloqué par une erreur préexistante dans `db.ts:308`, sans rapport avec cette session.

## Prochaine étape exacte
Corriger l'erreur de lint préexistante dans `db.ts` avant le prochain `/deploy`. Reprendre la Phase 1 de `roadmap_sync_marie.md` sur la branche `sync-marie` après réconciliation des deux branches.

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-08-15 — retouches diverses + feature Catégories de listes)

## Décisions prises
- Feature « Catégories de listes » livrée en 4 phases sur roadmap dédiée (demande utilisateur : trop d'informations affichées à plat dans une liste, vouloir choisir une catégorie avant de voir ses éléments). Catégorie obligatoire pour chaque item (pas d'item « sans catégorie »), modifiables après création de la liste, champ « Rubrique » texte libre supprimé au profit du choix de catégorie.
- Navigation par flèches du bandeau de dates passée de ±1 jour à ±1 semaine ; section « Tâche du jour » retirée de l'accueil (redondante avec le planning toujours visible) ; catégories de dépenses du budget regroupées sous « Semaine »/« Mois ».

## Livrables produits ou modifiés
- `roadmap_categories_listes.md` : créé, 4 phases toutes `[FAIT]`.
- `src/domain/entities/listCategory.ts`, `src/data/repositories/listCategoryRepository.ts`(`.test.ts`) : nouvelle entité et repository.
- `src/data/db.ts`(`.test.ts`) : migration Dexie v12.
- `src/domain/rules/listItemSortRules.ts`(`.test.ts`), `listRules.ts`(`.test.ts`) : règles de regroupement par catégorie.
- `src/ui/components/ToolCreateModal.tsx`(`.test.tsx`) : catégories initiales à la création de liste.
- `src/ui/screens/lists/E61ListDetail.tsx`(`.test.tsx`) : écran de sélection de catégorie, formulaire d'ajout scopé.
- `src/ui/screens/dashboard/PlanningBoard.tsx`(`.test.tsx`) : flèches ±1 semaine.
- `src/ui/screens/dashboard/E10Dashboard.tsx`(`.test.tsx`) : retrait « Tâche du jour ».
- `src/ui/components/BudgetExpenseModal.tsx` : regroupement Semaine/Mois.
- `src/ui/screens/tasks/E21CreateTaskV2.tsx` : retrait `autoFocus`, correctif débordement visuel Date/Heure.
- `src/ui/screens/onboarding/E01Welcome.tsx`, `src/domain/data/manualTestsCatalog.ts`, `tests_manuels.md` (point 8 ajouté, point 4 corrigé), `CHANGELOG.md` (v5.36), `README.md`, `_contexte/contexte.md` : mis à jour.

## Hypothèses validées / invalidées
- VALIDE : chaque phase de la feature catégories confirmée par l'utilisateur via `/compact` avant la suivante, conformément au protocole roadmap.
- EN ATTENTE : v5.36 pas encore déployée (build jamais lancé).

## Prochaine étape exacte
Reprendre la séquence en attente : validation par l'utilisateur des 8 points de `tests_manuels.md`, puis `/deploy` (v5.36, appliquera l'étape 0 « exports de Marie »).

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-08-14 — suite 14, ajout étape 0 « exports de Marie » dans /deploy)

## Décisions prises
- `.claude/commands/deploy.md` modifié sur demande explicite : nouvelle étape 0, avant `/close`, imposant de traiter les derniers exports de Marie avant tout déploiement — rappel à l'utilisateur, analyse complète du payload (pas seulement `manual_test_results`) pour pertes/incohérences/frictions, ingestion via `scripts/ingest_manual_tests.py`, arrêt et proposition de traitement à l'utilisateur si problème détecté, sans jamais toucher aux fichiers d'export bruts ni à `donnees_marie/`. Étapes suivantes renumérotées 1 à 9 (références internes corrigées).

## Livrables produits ou modifiés
- `.claude/commands/deploy.md` : ajout étape 0, renumérotation complète 1-9.

## Hypothèses validées / invalidées
- EN ATTENTE : nouvelle étape 0 pas encore exercée en pratique — le prochain `/deploy` (v5.33/v5.34) sera son premier passage réel.

## Prochaine étape exacte
Reprendre la séquence en attente : validation par l'utilisateur des 6 points de `tests_manuels.md`, puis `/deploy`, qui appliquera désormais la nouvelle étape 0 (exports de Marie) avant `/close`.

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-08-14 — suite 13, déploiement v5.33 reporté à la demande de l'utilisateur)

## Décisions prises
- Déploiement de v5.33 (correctif Budget) reporté : l'utilisateur préfère valider lui-même les 6 points de `tests_manuels.md` avant de relancer `/deploy`. Toutes les vérifications bloquantes de l'étape 2 étaient déjà passées (tests, `tsc -b`, lint, cohérence CHANGELOG) ; seul l'avertissement 3.4 (tests manuels en attente) restait à trancher.
- Export du 2026-08-14 17h40 reconfirmé comme dernier export disponible de Marie (ré-ingestion idempotente : 0 nouvelle entrée, 7 déjà présentes) — ses 4 tests en échec (Budget) restent à traiter en communication avec elle une fois v5.33 déployée.

## Livrables produits ou modifiés
- `_contexte/signals.md` : mise à jour des questions ouvertes (séquence attendue : validation manuelle utilisateur -> `/deploy` -> retour à Marie).
- Aucun fichier de code applicatif modifié cette session.

## Hypothèses validées / invalidées
- VALIDE : `dist/v5.33` n'a jamais été construit (déploiement arrêté avant l'étape de build) — rien à annuler côté build.

## Prochaine étape exacte
Attendre que l'utilisateur valide les 6 points de `tests_manuels.md`, puis relancer `/deploy` (version v5.33 déjà prête). Une fois déployée, redemander à Marie de réimporter et revalider ses 4 tests en échec.

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-08-14 — suite 12, correctif Budget, bannières et modale Nouveautés dynamiques, Phase 3 tests Marie close)

## Décisions prises
- Cause du bug « Budget disparu à l'import » identifiée par lecture de code et confirmée par les retours de Marie, puis corrigée : `useSettingsState.ts` recrée désormais aussi l'entrée `tableau_comptage` manquante à l'import, en plus des entrées `liste`.
- Bannières urgentes (accueil + Tests à faire) mises à jour pour demander la réimportation (répare le bug) au lieu d'un nouvel export, avec bouton « Fait » persistant (`localStorage`) et couleur de texte forcée en blanc (le `color` global des `<p>` dans `index.css` écrasait sinon le blanc hérité).
- Modale Nouveautés rendue dynamique : ne s'affiche plus une fois fermée pour une version donnée (`VITE_APP_VERSION` en clé de comparaison). Cycle formalisé dans `close.md` (étape 6 : ajouter une entrée en langage clair si changement visible pour Marie) et `deploy.md` (étape 7 : vider `WHATS_NEW` après publication confirmée). Entrée obsolète (icône « Tests à faire », déjà vue par Marie) retirée du tableau.
- Nouvel export de Marie (17h40) analysé et ingéré : 7 résultats de tests réels, dont 4 échecs confirmant le bug Budget déjà corrigé — Phase 3 de `roadmap_tests_marie.md` close (test manuel d'ingestion réussi avec un export réel).

## Livrables produits ou modifiés
- `src/app/contexts/useSettingsState.ts`/`.test.tsx` : réparation de l'entrée Outil Budget à l'import.
- `src/ui/screens/onboarding/E01Welcome.tsx`/`.test.tsx` : bannière urgente (bouton Fait, couleur), modale Nouveautés dynamique par version, `WHATS_NEW` vidé.
- `src/ui/screens/tests/E121ManualTests.tsx`/`.test.tsx` : bannière urgente identique.
- `.claude/commands/close.md`, `.claude/commands/deploy.md` : cycle d'écriture/vidage de `WHATS_NEW`.
- `_contexte/marie_tests_journal.json` : 7 entrées ajoutées (export du 2026-08-14 17h40).
- `roadmap_tests_marie.md` : Phase 3 `[FAIT]`.

## Hypothèses validées / invalidées
- VALIDE : cause du bug confirmée par les commentaires de Marie (« pas accès au budget » ×2, « il manque le budget ») sur 3 tests distincts du catalogue.
- VALIDE : correctif couvert par un test unitaire dédié (réparation `tableau_comptage` à l'import).
- INVALIDE : l'export vide du midi (15h10) n'était pas un bug de code (chemins `submitManualTestResult`/`exportData` vérifiés sains) — Marie avait rempli les tests après cet export, confirmé par le nouvel export du soir.
- EN ATTENTE : correctif pas encore déployé au moment de ce `/close` — le `/deploy` en cours va le publier.

## Prochaine étape exacte
Terminer le déploiement en cours, puis redemander à Marie de réimporter et revalider les 4 tests en échec (Budget).

## Question bloquante pour la session suivante
Aucune.
