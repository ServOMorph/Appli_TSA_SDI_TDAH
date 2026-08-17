# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-08-17)

## Contexte chaud
- Branche `sync-marie` : 4 commits non fusionnés dans `main` (roadmap sync Supabase créée, setup projet Supabase, clôture de la communication Marie V5.0 incluant la suppression de `a_communiquer_v5.md`). Le travail des dernières sessions (sans rapport avec la sync) a été fait sur `main` pour ne pas mélanger les deux chantiers — `a_communiquer_v5.md` existe donc encore sur `main`, `roadmap_sync_marie.md` n'y existe pas encore. Réconciliation à faire à la prochaine reprise du chantier sync (fusion ou rebase).
- `donnees_marie/` : trois exports réels de Marie stockés en local, gitignorés, donnée sensible déclarée dans `CLAUDE.md` (2026-08-13, 2026-08-16 18h27, 2026-08-16 22h35). Export du 2026-08-17 11h13 analysé (étape 0 `/deploy`) mais pas encore copié dans `donnees_marie/` — usage normal (nouvelle dépense budget, nouvelle entrée d'énergie), 0 nouveau résultat de test, aucune perte ni friction.
- `roadmap_budget_v2.md` : toutes phases `[FAIT]` — à archiver vers `Archives/` au prochain `/close` qui touchera ce fichier (non fait cette session, hors périmètre).
- Nouvelle commande `.claude/commands/traiter_export_marie.md` : traite l'arrivée d'un export de Marie indépendamment de `/deploy` (comparaison par `export_date`, copie normalisée dans `donnees_marie/`, ingestion du journal, détection pertes/frictions). `/deploy` étape 0 fait toujours le même travail en interne, redondance non retirée — à évaluer si gênant.
- Refonte complète du concept Budget **terminée** (roadmap `roadmap_budget_v2.md`, 4 phases toutes `[FAIT]`) : « Montant total » distribué entre « Mon compte » (Semaine/Mois) et « Livrets », anciennes catégories `income` de Marie converties en revenus historiques puis supprimées.
- Poignée du planning (accueil) en drag continu façon bottom-sheet, Outils/bannière Mode surcharge toujours visibles (session précédente).
- Cette session (retours utilisateur, captures annotées) : sélecteur mois/année du planning (`MonthYearPickerModal.tsx`), bandeau de dates recentré en permanence sur le jour actuel avec navigation uniquement par glissement (flèches semaine retirées, `PlanningBoard.tsx`), fiche de tâche planifiée passée en lecture seule avec un nouveau bouton « Modifier » ouvrant `E24EditTask.tsx` (nouvelle route `task-edit`) pré-rempli, fond de fiche teinté à la couleur d'ambiance, alignement énergie/sous-tâches et hauteur de ligne proportionnelle à la durée. Aucun de ces changements déployé — Budget, drag planning et ces correctifs UI s'accumulent tous en attente du prochain `/deploy`.
- `manualTestsCatalog.ts` : deux tests ajoutés cette session (`naviguer-dans-le-planning`, `modifier-une-tache-planifiee`) ; test `montant-total-apres-migration-revenus` (Phase 4 Budget) toujours en attente de validation Marie.
- `tests_manuels.md` vide — toutes les vérifications passent par le catalogue in-app `manualTestsCatalog.ts`.
- `E121ManualTests.tsx` : un test « Validé » disparaît de la liste affichée à Marie (catalogue conservé en interne) ; chaque test dépliable/repliable.
- `_contexte/dernier_deploiement.md` : v5.40, 2026-08-17, prod vérifiée HTTP 200 — inchangé cette session (aucun déploiement, plusieurs sessions de correctifs/features prêts mais pas encore publiés).
- Site de test `appli-audhd-dev.netlify.app` (`NETLIFY_SITE_ID_DEV` dans `.env`) : déployable via `/deploy_dev`.
- `/deploy` et `/deploy_dev` vérifient la fraîcheur de `manualTestsCatalog.ts` avant le déploiement.

## Questions ouvertes
- [P1] Déployer l'ensemble accumulé depuis v5.40 : refonte Budget, drag continu du planning, sélecteur mois/année, navigation planning par glissement, édition de tâche dédiée (`E24EditTask.tsx`) — rien de tout cela jamais testé par Marie en conditions réelles. — fait quand : `/deploy` effectué et retour de Marie obtenu — réf : `roadmap_budget_v2.md`, `manualTestsCatalog.ts` (tests `montant-total-apres-migration-revenus`, `utiliser-le-budget`, `glisser-pour-ouvrir-le-planning`, `naviguer-dans-le-planning`, `modifier-une-tache-planifiee`)
- [P2] Redemander à Marie de réimporter et revalider « Utiliser le budget » et « Glisser pour ouvrir le planning » (steps du catalogue mis à jour pour refléter le nouveau comportement) une fois redéployé. — fait quand : ces tests validés dans un nouvel export ingéré — réf : `manualTestsCatalog.ts`, `_contexte/marie_tests_journal.json`
- [P2] Reprendre la Phase 1 de `roadmap_sync_marie.md` sur la branche `sync-marie` (non touchée depuis plusieurs sessions) — voir réconciliation de branche ci-dessus avant de continuer. — fait quand : Phase 1 checklist complétée — réf : `roadmap_sync_marie.md` Phase 1 (branche `sync-marie`)
- [P2] Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique. — fait quand : décision actée avec l'utilisateur — réf : `Archives/roadmap_v5.1.md` § Q à trancher
- [P3] Réglage « Réduire les animations » quasi sans effet visible faute d'animations à réduire dans l'interface actuelle — angle mort produit, pas une régression. — fait quand : décision prise (enrichir l'UI d'animations ou accepter l'état actuel) — réf : `roadmap_v5.0.md` § Reporté hors V5, `E112Accessibility.tsx`
- [P3] `todayStr()` (`planningSlotRules.ts`) ignore `dev_fake_date` alors que `todayDate()` (`repositories.ts:29`) le respecte — en dev avec date simulée active, le planning peut afficher un jour différent de celui utilisé pour l'énergie. — fait quand : décision prise (harmoniser ou accepter, outil dev uniquement) — réf : `planningSlotRules.ts`, `repositories.ts:29`
- [P3] `index.html:7` : `<title>tsa-scaffold</title>`, résidu de scaffold toujours visible dans l'onglet du navigateur. — fait quand : titre corrigé — réf : `index.html`

## Dernière session (2026-08-17 — suite 5, traitement export Marie 11h13, préparation /deploy)

## Décisions prises
- Aucune décision de conception. Export de Marie du 17/08 11h13 analysé (étape 0 `/deploy`) : ni perte, ni incohérence, ni friction bloquante — poursuite normale du déploiement.

## Livrables produits ou modifiés
- Aucun fichier de code modifié. `_contexte/marie_tests_journal.json` : ingestion tentée, 0 nouvelle entrée (13 déjà présentes).

## Hypothèses validées / invalidées
- VALIDE : différences entre l'export du 17/08 et celui du 16/08 22h35 limitées à une dépense budget (Vacances, 28€, « Violetta ») et une entrée d'énergie (17/08, valeur 8) — usage normal, pas de bug.

## Prochaine étape exacte
Poursuivre `/deploy` (étapes 1 à 9) : cumule Budget + drag planning + sélecteur mois/année + navigation planning + édition de tâche, jamais testés par Marie en conditions réelles.

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-08-17 — suite 4, sélecteur mois/année, refonte navigation planning et édition de tâche)

## Décisions prises
- Sur retours utilisateur (captures annotées), 5 correctifs UI cumulés : clic sur le mois/année du planning ouvre désormais une fenêtre dédiée (année + grille des 12 mois) au lieu de l'ancien sélecteur de date natif ; le bandeau de dates garde le jour actuel toujours centré (navigation uniquement par glissement, flèches semaine retirées) ; badge sous-tâches placé avant le logo énergie sur chaque ligne planifiée pour un alignement vertical constant, hauteur de ligne rendue proportionnelle à la durée ; débordement visuel du cadre Durée dans le formulaire de tâche corrigé ; fiche de tâche planifiée passée en lecture seule (fond teinté à la couleur d'ambiance) avec un nouveau bouton « Modifier » ouvrant un écran d'édition dédié pré-rempli, au même gabarit que la création, avec le choix occurrence/série conservé pour les tâches récurrentes.

## Livrables produits ou modifiés
- `src/ui/components/MonthYearPickerModal.tsx` : créé (sélecteur mois/année).
- `src/ui/screens/dashboard/PlanningBoard.tsx`(`.test.tsx`) : sélecteur mois/année câblé, bandeau recentré sur le jour actuel, flèches semaine retirées, ordre badge/énergie inversé, hauteur de ligne proportionnelle à la durée.
- `src/ui/screens/dashboard/E10Dashboard.test.tsx` : tests ajustés (bandeau de dates).
- `src/ui/components/DurationRoller.tsx`, `src/ui/screens/tasks/E21CreateTaskV2.tsx` : correctif débordement visuel du cadre Durée.
- `src/ui/screens/tasks/E22TaskDetail.tsx`(`.test.tsx`) : champs en lecture seule, fond teinté couleur d'ambiance, bouton « Modifier ».
- `src/ui/screens/tasks/E24EditTask.tsx`(`.test.tsx`) : créé (écran d'édition de tâche dédié).
- `src/app/navigation.ts`, `src/App.tsx`, `src/ui/components/DevResetButton.tsx` : nouvelle route `task-edit`.
- `src/domain/data/manualTestsCatalog.ts` : tests `naviguer-dans-le-planning` et `modifier-une-tache-planifiee` ajoutés.
- `src/ui/screens/onboarding/E01Welcome.tsx` : 2 entrées `WHATS_NEW` ajoutées.
- `CHANGELOG.md` : v5.45.

## Hypothèses validées / invalidées
- VALIDE : 566/566 tests unitaires, `tsc -b`/lint clean après l'ensemble des correctifs.
- HYPOTHÈSE NON VÉRIFIÉE : cause du débordement du cadre Durée attribuée aux `<select>` natifs sans largeur contrainte (`minWidth:0` manquant) — corrigé sur cette base mais pas confirmé visuellement par l'utilisateur sur son appareil.
- EN ATTENTE : aucun des changements de cette session (ni des sessions précédentes : Budget, drag planning) jamais testé par Marie en conditions réelles — aucun déploiement cette session.

## Prochaine étape exacte
`/deploy` (cumule Budget + drag planning + sélecteur mois/année + navigation planning + édition de tâche), puis redemander à Marie de tester les nouveaux comportements via le catalogue (`naviguer-dans-le-planning`, `modifier-une-tache-planifiee`, plus les tests Budget/planning déjà en attente).

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-08-17 — suite 3, drag continu du planning, mise à jour catalogue de tests)

## Décisions prises
- Sur retour utilisateur (capture annotée) : la poignée du planning devient un drag continu façon bottom-sheet — la fenêtre suit le doigt en temps réel (au lieu du seuil binaire précédent qui basculait instantanément), reste à la hauteur relâchée au lieu de forcément s'ouvrir/fermer en entier, et la section Outils / la bannière Mode surcharge restent visibles en permanence (elles disparaissaient auparavant quand le planning était déplié).
- Suite à cette évolution, les tests `utiliser-le-budget` et `glisser-pour-ouvrir-le-planning` du catalogue mis à jour : le premier teste désormais aussi « Ajouter un revenu » (jamais couvert alors que c'est le cœur de la refonte Budget) ; le second décrit le nouveau comportement continu au lieu de l'ancien « occupe l'écran ».

## Livrables produits ou modifiés
- `src/ui/screens/dashboard/E10Dashboard.tsx`(`.test.tsx`) : drag continu du planning (constantes `PLANNING_MIN_HEIGHT_PX`/`PLANNING_MAX_HEIGHT_PX`), Outils/bannière surcharge toujours visibles.
- `src/ui/screens/dashboard/PlanningBoard.tsx` : pollution non committée (caractère parasite ligne 1) corrigée, sans rapport avec la session.
- `src/domain/data/manualTestsCatalog.ts` : steps de `utiliser-le-budget` et `glisser-pour-ouvrir-le-planning` mis à jour.
- `src/ui/screens/onboarding/E01Welcome.tsx` : entrée `WHATS_NEW` ajoutée (drag continu du planning).

## Hypothèses validées / invalidées
- VALIDE : 564/564 tests unitaires, `tsc -b`/lint clean après le changement de drag et la mise à jour du catalogue.
- EN ATTENTE : refonte Budget et drag continu du planning tous deux jamais testés par Marie en conditions réelles — aucun déploiement cette session.

## Prochaine étape exacte
`/deploy` (cumule refonte Budget + drag continu du planning), puis redemander à Marie de tester « Utiliser le budget », « Ouvrir le planning en glissant » et « Vérifier le Montant total après la migration des revenus ».

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-08-17 — suite 2, clôture refonte Budget Phase 4, nettoyage catégories income)

## Décisions prises
- Phase 4 de `roadmap_budget_v2.md` (dernière phase) livrée et confirmée par l'utilisateur : catégories `income` existantes de Marie converties en revenus historiques ponctuels via migration Dexie v14, puis supprimées. Roadmap intégralement `[FAIT]`.
- Angle mort signalé par l'agent (hors périmètre de la roadmap) : l'écran de configuration permettait encore de créer de nouvelles catégories `income`, contredisant la nouvelle règle « Marie saisit elle-même chaque revenu ». Message rédigé pour trancher avec Marie plutôt que décidé unilatéralement.
- Marie a répondu (relayé par l'utilisateur) : option 1, suppression complète — option « Revenu » du formulaire de catégorie, bloc « Non alloué », section « Revenus » de l'écran Budget et fonctions de calcul mortes associées, tous retirés.
- `WHATS_NEW` mis à jour : la refonte Budget est désormais complète et cohérente de bout en bout, plus de raison de différer l'annonce à Marie (contrairement à la Phase 1 seule).

## Livrables produits ou modifiés
- `src/data/db.ts`(`.test.ts`) : migration Dexie v14 (conversion catégories income → `BudgetIncomeEntry`, suppression des catégories).
- `src/domain/data/manualTestsCatalog.ts` : test `montant-total-apres-migration-revenus` ajouté.
- `roadmap_budget_v2.md` : décision « Devenir des catégories income » actée, Phase 4 `[FAIT]`.
- `src/domain/rules/budgetRules.ts`(`.test.ts`) : `getTotalIncome`, `getUnbudgetedRemainder` supprimées (mortes après le nettoyage).
- `src/ui/screens/tools/E74BudgetSettings.tsx`(`.test.tsx`) : option « Revenu » et bloc « Non alloué » retirés.
- `src/ui/screens/tools/E71Budget.tsx`(`.test.tsx`) : section « Revenus » (catégories income) retirée.
- `src/app/AppContextBudget.test.tsx` : nettoyé des scénarios liés aux fonctions supprimées.
- `src/ui/screens/onboarding/E01Welcome.tsx` : entrée `WHATS_NEW` ajoutée (nouveau système Budget).
- `message_marie_categories_revenu.md` : message rédigé pour Marie (non committé, réponse déjà obtenue).

## Hypothèses validées / invalidées
- VALIDE : 564/564 tests unitaires, `tsc -b`/lint clean après la Phase 4 et le nettoyage des catégories income.
- EN ATTENTE : refonte Budget jamais testée par Marie en conditions réelles — premier `/deploy` de cette feature à venir.

## Prochaine étape exacte
Déployer la refonte Budget (`/deploy`), puis redemander à Marie de tester le nouveau système (« Ajouter un revenu », carte « Montant total », absence des anciennes catégories) via le test `montant-total-apres-migration-revenus` du catalogue.

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
