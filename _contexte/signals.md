# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-08-16)

## Contexte chaud
- Branche `sync-marie` : 4 commits non fusionnés dans `main` (roadmap sync Supabase créée, setup projet Supabase, clôture de la communication Marie V5.0 incluant la suppression de `a_communiquer_v5.md`). Le travail de cette session (sans rapport avec la sync) a été fait sur `main` pour ne pas mélanger les deux chantiers — `a_communiquer_v5.md` existe donc encore sur `main`, `roadmap_sync_marie.md` n'y existe pas encore. Réconciliation à faire à la prochaine reprise du chantier sync (fusion ou rebase).
- `donnees_marie/` : deux exports réels de Marie stockés en local, gitignorés, donnée sensible déclarée dans `CLAUDE.md` (2026-08-13 et 2026-08-16, ce dernier analysé cette session — 0 nouveau résultat de test, suppression de 5 éléments de liste confirmée volontaire).
- `tests_manuels.md` ne contient plus qu'un seul point (Import JSON, vérification dev sur fichier local) — les 7 autres points, dupliqués avec le catalogue Marie (`manualTestsCatalog.ts`), en ont été retirés. Le catalogue Marie compte désormais 10 tests (ajout du badge énergie/couleur d'ambiance), dont 7 déjà soumis par Marie (4 ok, 3 nok liés au bug Budget déjà corrigé) et 2 jamais testés (catégories de listes, glisser pour ouvrir le planning).
- Bannières urgentes (accueil, Tests à faire) supprimées — leur rôle (demander la réimportation pour réparer le Budget) devenait obsolète une fois ce correctif publié.
- Bug « catégories de listes perdues à l'export/import » corrigé dans `useSettingsState.ts` : `list_categories` n'était ni exporté, ni vidé, ni restauré ; tout cycle export/import (même récent, même sans changer de version d'app) perdait les catégories. Réparation ajoutée pour les anciens formats (regroupement par `section`, comme la migration Dexie v12). Export bumpé en v3.3.
- Lint global (`npm run lint`) bloqué par une erreur préexistante dans `db.ts:308` (`_section` inutilisé), sans rapport avec les sessions récentes — **bloquera le prochain `/deploy` (étape 3.6)** si non corrigée avant.
- `_contexte/dernier_deploiement.md` : consigné par `/deploy` lui-même, indépendamment de `/close`. Dernier déploiement prod : v5.31, 2026-08-14 — les correctifs Budget, catégories de listes et le nettoyage des tests manuels n'y sont pas encore inclus.
- `src/ui/screens/onboarding/E01Welcome.tsx` : `WHATS_NEW` géré par cycle `/close`/`/deploy`. Contient toujours 4 entrées en attente de publication (accueil/planning fusionnés, flèches en pas d'une semaine, catégories de listes, budget regroupé Semaine/Mois) — rien ajouté cette session (correctifs internes exclus du cycle).
- Site de test `appli-audhd-dev.netlify.app` (`NETLIFY_SITE_ID_DEV` dans `.env`) : déployable via `/deploy_dev`.
- `/deploy` et `/deploy_dev` vérifient la fraîcheur de `manualTestsCatalog.ts` avant le déploiement.

## Questions ouvertes
- [P1] Corriger l'erreur de lint préexistante dans `db.ts:308` (`_section` inutilisé) avant le prochain `/deploy`, sinon l'étape 3.6 bloquera. — fait quand : `npm run lint` clean — réf : `src/data/db.ts:308`
- [P1] Valider le point restant de `tests_manuels.md` (Import JSON) puis clore la Phase V5.1-0 de `roadmap_v5.1.md`, en parallèle de la validation par Marie des tests du catalogue in-app (catégories de listes, glisser planning, badge énergie — jamais soumis). — fait quand : point Import JSON validé et catalogue Marie à jour, v5.37 déployée — réf : `tests_manuels.md`, `manualTestsCatalog.ts`, `roadmap_v5.1.md` Phase V5.1-0
- [P1] Une fois v5.37 déployée, redemander à Marie de réimporter son fichier et de revalider dans « Tests à faire » les 3 tests en échec liés au bug Budget (« Retirer de l'argent d'un livret », « Utiliser le budget », « Importer une sauvegarde »). — fait quand : ces 3 tests validés dans un nouvel export ingéré — réf : `_contexte/marie_tests_journal.json`, `useSettingsState.ts`
- [P1] Reprendre la Phase 1 de `roadmap_sync_marie.md` sur la branche `sync-marie` (non touchée cette session) — voir réconciliation de branche ci-dessus avant de continuer. — fait quand : Phase 1 checklist complétée — réf : `roadmap_sync_marie.md` Phase 1 (branche `sync-marie`)
- [P2] Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique. — fait quand : décision actée avec l'utilisateur — réf : `roadmap_v5.1.md` § Q à trancher
- [P3] Réglage « Réduire les animations » quasi sans effet visible faute d'animations à réduire dans l'interface actuelle — angle mort produit, pas une régression. — fait quand : décision prise (enrichir l'UI d'animations ou accepter l'état actuel) — réf : `roadmap_v5.0.md` § Reporté hors V5, `E112Accessibility.tsx`
- [P3] `todayStr()` (`planningSlotRules.ts`) ignore `dev_fake_date` alors que `todayDate()` (`repositories.ts:29`) le respecte — en dev avec date simulée active, le planning peut afficher un jour différent de celui utilisé pour l'énergie. — fait quand : décision prise (harmoniser ou accepter, outil dev uniquement) — réf : `planningSlotRules.ts`, `repositories.ts:29`
- [P3] `index.html:7` : `<title>tsa-scaffold</title>`, résidu de scaffold toujours visible dans l'onglet du navigateur. — fait quand : titre corrigé — réf : `index.html`

## Dernière session (2026-08-16 — export Marie, nettoyage tests manuels, correctif catégories de listes à l'import)

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
