# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-08-19)

## Contexte chaud
- Flux B ROBERTO (`roadmap_demandes_marie_v1.md`) : Phases 1 à 4 livrées et testées (bugs prioritaires, tâches/planning, détail élément de liste, couleur de fond par outil). Phase 5 (préparation dist) livrée cette session : `CHANGELOG.md` v5.38, `WHATS_NEW` (8 entrées), `manualTestsCatalog.ts` (8 tests ajoutés). `/deploy` engagé cette session (voir question ouverte P1 dédiée pour l'état exact au moment de la coupure).
- Décision actée : `/deploy` lancé malgré le gate « test manuel » ouvert des Phases 4/5 — les points 10-17 de `tests_manuels.md` nécessitent la build déployée pour être testables par Marie (dépendance circulaire assumée), les critères code/doc étant eux fermés.
- Export de Marie du 2026-08-19 traité (étape 0 de `/deploy`) : archivé (`donnees_marie/export-audhd-2026-08-19.json`), ingéré dans le journal (10 nouvelles entrées, 7 déjà présentes). 3 frictions non bloquantes identifiées, à traiter comme futures demandes plutôt qu'à chaud : (a) test IDs `grouper-les-tests-par-categorie`/`modifier-une-tache-planifiee` obsolètes, absents du catalogue actuel, probablement mis en cache côté client ; (b) rejet explicite du geste de glissement du planning (2 commentaires : superposition non désirée, demande que le planning pousse le contenu de la page plutôt que de le recouvrir) ; (c) incompréhension du lien retrait de livret / catégorie budget — vérifié dans le code (`E74BudgetSettings.tsx`), les deux modèles sont indépendants par design, pas un bug.
- Mission ROBERTO globale : Flux A (testeur/JSON) `[FAIT]`, journal à 4/7 entrées INTEGRE (3 RECU bloquées sur retest manuel budget, voir question ouverte dédiée). Flux C (`sync-marie`) non repris cette session.
- **Divergence critique `sync-marie` / `main`** : la branche n'a pas été mise à jour depuis sa création (base commune `8188371`, 2026-08-16). `main` a depuis livré `roadmap_budget_v3`, `roadmap_categories_listes.md`, `roadmap_demandes_marie_v1.md` et plusieurs déploiements prod — aucun de ces commits n'est sur `sync-marie`. Un merge/rebase de `main` dans `sync-marie` sera nécessaire avant toute fusion ou déploiement de la sync, avec conflits probables sur les fichiers touchés des deux côtés (`E110Settings.tsx`, `useSettingsState.ts`, `AppContext.tsx`, `package.json`, `CHANGELOG.md`, `db.ts`). Non traité cette session — hors périmètre du travail demandé.
- `_contexte/dernier_deploiement.md` : consigné par `/deploy` lui-même (version/date/URL), indépendamment de `/close`. À vérifier pour connaître le dernier déploiement prod confirmé (v5.38 en cours cette session).
- `src/ui/screens/onboarding/E01Welcome.tsx` : `WHATS_NEW` désormais géré par cycle `/close` (ajoute une entrée en langage clair si changement visible pour Marie) / `/deploy` (vide le tableau après publication confirmée). Affichage de la modale conditionné à `VITE_APP_VERSION` (`localStorage`), ne se réaffiche plus une fois fermée pour une version donnée. `WHATS_NEW` contient actuellement 8 entrées (phases 1-4 de `roadmap_demandes_marie_v1.md`) en attente de publication/vidage par `/deploy`.
- Mémoire projet créée (`.claude/memory.md`, via `/create_memory`) : à chaque partage d'export Marie, le traiter puis l'archiver dans le projet.
- Site de test `appli-audhd-dev.netlify.app` (`NETLIFY_SITE_ID_DEV` dans `.env`) : déployable via `/deploy_dev`, pour tester hors réseau local sans toucher la prod.
- Panneau dev (haut à droite, visible uniquement en `npm run dev`) affiche la version courante, lue automatiquement dans `CHANGELOG.md` au build (`__APP_DEV_VERSION__`, `vite.config.ts`).
- `/deploy` et `/deploy_dev` vérifient la fraîcheur de `src/domain/data/manualTestsCatalog.ts` avant le déploiement.

## Questions ouvertes
- [P1] Terminer `/deploy` v5.38 en cours (étapes build/publication/vidage `WHATS_NEW` restant à confirmer selon le point exact de la coupure de session), puis redemander à Marie de tester et valider les points 10-17 de `tests_manuels.md` sur la nouvelle build. — fait quand : v5.38 confirmée en prod (HTTP 200, `_contexte/dernier_deploiement.md` à jour) et points 10-17 validés par Marie — réf : `roadmap_demandes_marie_v1.md` Phase 5, `tests_manuels.md`
- [P2] Traiter les 3 frictions du 2026-08-19 comme nouvelles demandes lors du prochain `/traiter_demandes_marie` : geste de glissement planning à revoir (pousser le contenu plutôt que superposer), clarifier avec Marie le lien retrait de livret/catégorie budget (comportement par design à expliquer, pas un bug), vérifier la disparition des test IDs obsolètes après le nouveau déploiement. — fait quand : les 3 points tranchés ou intégrés à une roadmap — réf : `_contexte/marie_tests_journal.json` (entrées `44f24c63`, `be0c10ef`, `6e32ace5`)
- [P1] Poursuivre la mission ROBERTO (système d'orchestration de workflow multi-flux : testeur JSON / Google Drive / sync-marie, décrit dans `ROBERTO/_docs/`). Flux B actif (roadmap ci-dessus). Flux A terminé. Flux C (sync-marie) en pause. — fait quand : chaque flux tranché jusqu'à FAIT ou décision explicite d'arrêt — réf : `roadmap_roberto_workflow.md`
- [P1] Séquence de validation Phase 4 `roadmap_sync_marie.md`, dans l'ordre : (1) exécuter `supabase/schema.sql` dans le SQL Editor du projet Supabase — jamais fait à ce jour, table `device_snapshots` inexistante côté serveur ; (2) compléter `.env` avec `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` (dashboard Supabase, section service_role) ; (3) régler la divergence `sync-marie`/`main` (voir Contexte chaud) avant fusion/déploiement ; (4) `/deploy` ; (5) faire ouvrir l'app à Marie ; (6) vérifier `SyncStatusCard` côté Marie et `python scripts/read_device_snapshots.py` côté développeur. — fait quand : ligne renvoyée par `read_device_snapshots.py` avec `device_id` de Marie et `synced_at` récent — réf : `roadmap_sync_marie.md` Phase 4, `supabase/schema.sql`
- [P1] Confirmer si les variables Supabase (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) ont aussi été ajoutées au site de test Netlify (dev, `appli-audhd-dev.netlify.app`), pas seulement à la prod. — fait quand : confirmé fait ou décidé non nécessaire — réf : `roadmap_sync_marie.md` Prérequis externe
- [P2] `npm run lint` échoue sur `src/data/db.ts:310` (`_section` assigné jamais utilisé) — pré-existant, ligne décalée par les migrations Dexie ajoutées depuis (v13, v14), cause exacte non investiguée. — fait quand : lint corrigé ou cause identifiée et jugée non bloquante — réf : `src/data/db.ts:310`
- [P1] Confirmer par retest manuel le correctif budget avant de transitionner les 3 entrées RECU restantes du journal testeur (`10a0154b-...`, `a0098520-...`, `23393df4-...`). Correctif suspecté déjà présent (`useSettingsState.ts:183-185`), jamais reconfirmé depuis le 14/08. 3 points de test dans `tests_manuels.md` (sections 3, 6, 9). — fait quand : les 3 entrées passées à INTEGRE dans `marie_tests_journal.json` — réf : `_contexte/marie_tests_journal.json`, `AGENT_STATE.md`, `tests_manuels.md`
- [P2] Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique. — fait quand : décision actée avec l'utilisateur — réf : `roadmap_v5.1.md` § Q à trancher
- [P3] Réglage « Réduire les animations » quasi sans effet visible faute d'animations à réduire dans l'interface actuelle — angle mort produit, pas une régression. — fait quand : décision prise — réf : `E112Accessibility.tsx`
- [P3] `todayStr()` (`planningSlotRules.ts`) ignore `dev_fake_date` alors que `todayDate()` (`repositories.ts:29`) le respecte. — fait quand : décision prise (harmoniser ou accepter, outil dev uniquement) — réf : `planningSlotRules.ts`, `repositories.ts:29`
- [P3] `index.html:7` : `<title>tsa-scaffold</title>`, résidu de scaffold. — fait quand : titre corrigé — réf : `index.html`

## Dernière session (2026-08-19 — Phase 5 demandes Marie, export du 19/08 traité, /deploy v5.38 en cours)

## Décisions prises
- Phase 4 (`roadmap_demandes_marie_v1.md`, couleur de fond par outil) close côté code après checkpoint confirmé par l'utilisateur.
- Phase 5 (préparation dist) livrée : `CHANGELOG.md` v5.38, `WHATS_NEW` (8 entrées), `manualTestsCatalog.ts` (8 tests ajoutés).
- `/deploy` lancé malgré le gate « test manuel » ouvert — argumenté et validé avec l'utilisateur : les tests manuels nécessitent la build déployée pour être exécutables par Marie.
- Export Marie du 2026-08-19 : archivé dans `donnees_marie/`, ingéré, 3 frictions non bloquantes détaillées et validées comme non bloquantes avec l'utilisateur — reportées en futures demandes plutôt que traitées à chaud.
- Mémoire projet créée (`.claude/memory.md`) sur demande explicite : traitement systématique des exports Marie.

## Livrables produits ou modifiés
- `src/domain/entities/tool.ts`, `toolRules.ts`(`.test.ts`), `db.ts`(`.test.ts`) v14, `useToolsState.ts`, `ToolWidgetCard.tsx`(`.test.tsx`), `testUtils.tsx` : couleur de fond par outil.
- `tests_manuels.md` : point 17 ajouté.
- `roadmap_demandes_marie_v1.md` : Phases 4 et 5 mises à jour.
- `CHANGELOG.md` : entrée v5.38.
- `src/ui/screens/onboarding/E01Welcome.tsx` : `WHATS_NEW` remplacé (8 entrées).
- `src/domain/data/manualTestsCatalog.ts` : 8 tests ajoutés.
- `.claude/memory.md` : créé.
- `donnees_marie/export-audhd-2026-08-19.json` : archivé.
- `_contexte/marie_tests_journal.json` : 10 entrées ajoutées.

## Hypothèses validées / invalidées
- VALIDE : rendre `Tool.color` optionnel a évité la dette de fixtures rencontrée en Phase 3 (`ListItem.description` obligatoire).
- EN ATTENTE : validation manuelle par Marie des points 10-17 de `tests_manuels.md`, possible seulement après déploiement de la build actuelle.
- EN ATTENTE : issue exacte de `/deploy` (build/publication/vidage `WHATS_NEW`) au moment de la coupure de session — à vérifier via `_contexte/dernier_deploiement.md` et `git log`.

## Prochaine étape exacte
Vérifier l'état exact de `/deploy` (terminé ou interrompu), terminer si besoin, puis redemander à Marie de valider les points 10-17 de `tests_manuels.md` sur la nouvelle build.

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-08-18 — Phases 1-3 sync-marie livrées, Phase 4 entamée partiellement)

## Décisions prises
- Phase 3 `roadmap_sync_marie.md` livrée : `SyncStatusCard` dans Paramètres, sans bascule marche/arrêt (hors périmètre de la phase, signalé à l'utilisateur).
- Phase 4 réduite au point 1 seul (accès développeur en lecture) sur choix explicite de l'utilisateur : retrait des bannières et révision de `deploy.md` restent bloqués sur un test manuel de sync réelle avec l'appareil de Marie, hors de ma portée.

## Livrables produits ou modifiés
- `src/ui/components/SyncStatusCard.tsx`(`.test.tsx`) : créé, indicateur de statut + date de dernière sync.
- `src/ui/screens/settings/E110Settings.tsx` : `SyncStatusCard` intégrée.
- `src/data/sync/supabaseClient.ts` : export `isSyncEnabled()`.
- `scripts/read_device_snapshots.py` : créé, lecture développeur de `device_snapshots` via clé service_role.
- `.env.example` : `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` ajoutées.

## Hypothèses validées / invalidées
- EN ATTENTE : `supabase/schema.sql` jamais exécuté côté projet Supabase — table `device_snapshots` inexistante à ce jour.
- EN ATTENTE : sync réelle avec l'appareil de Marie non testée, bloque la suite de la Phase 4.
- INVALIDE : hypothèse implicite que `sync-marie` pouvait être fusionnée simplement — la branche est très en retard sur `main` (roadmap_budget_v3 entier + v5.47/v5.49 manquants), un merge/rebase est nécessaire avant toute fusion.

## Prochaine étape exacte
Suivre la séquence en 6 points de la question ouverte P1 dédiée (SQL, `.env`, résolution de la divergence avec `main`, `/deploy`, usage réel par Marie, double vérification). Reprendre ensuite le reste de la Phase 4 (bannières, `deploy.md`).

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-08-16 — clôture des points de communication Marie)

## Décisions prises
- Adresse de test communiquée à Marie confirmée faite (`appli-audhd.netlify.app` à la place de l'ancienne URL).
- Points de `a_communiquer_v5.md` communiqués à Marie et retour sur les priorités recueilli — fichier devenu obsolète, supprimé (`git rm`).
- Correction actée : les 8 points de `tests_manuels.md` sont à valider par Marie sur son appareil réel, pas par l'utilisateur.

## Livrables produits ou modifiés
- `a_communiquer_v5.md` : supprimé (staged `git rm`).

## Hypothèses validées / invalidées
- EN ATTENTE : validation par Marie des 8 points de `tests_manuels.md`, puis `/deploy` v5.36.
- EN ATTENTE : confirmation des variables Supabase sur le site de test Netlify (dev).

## Prochaine étape exacte
Transmettre `tests_manuels.md` à Marie pour validation sur appareil réel ; une fois validé, `/deploy` v5.36. En parallèle, confirmer les variables Supabase sur le site dev avant de démarrer la Phase 1 de `roadmap_sync_marie.md`.

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-08-15 — setup projet Supabase)

## Décisions prises
- Projet Supabase créé (région Frankfurt/UE), réglages retenus : API de données activée, affichage automatique des nouvelles tables désactivé (contrôle manuel), RLS automatique activé — cohérent avec la politique d'accès stricte par secret d'appareil prévue Phase 1.
- Nouveau système de clés Supabase (publiable/secrète) utilisé plutôt que l'ancien anon/service_role ; clé publiable retenue côté client, clé secrète jamais exposée.
- Confirmé compatible avec l'hébergement Netlify existant : SPA statique sans fonctions serverless, Supabase appelé en client-side via `@supabase/supabase-js`, aucun conflit d'architecture.

## Livrables produits ou modifiés
- `.env` (utilisateur, hors dépôt git) : `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` ajoutées.
- Variables d'environnement Netlify (site prod) : mêmes clés ajoutées.
- `roadmap_sync_marie.md` : section Prérequis externe marquée `[FAIT]`.
- Aucun fichier de code applicatif modifié cette session (guidage setup externe uniquement).

## Hypothèses validées / invalidées
- VALIDE : ajouter des variables d'environnement sur Netlify ne casse pas le dist actuel en prod (pas de rebuild automatique, variables non encore utilisées par le code tant que la Phase 1 n'est pas codée).
- EN ATTENTE : variables Supabase pas confirmées sur le site de test Netlify (dev).

## Prochaine étape exacte
Confirmer les variables sur le site de test Netlify (dev), puis démarrer la Phase 1 de `roadmap_sync_marie.md` (schéma de tables, client Supabase) en basculant sur le modèle Opus au préalable.

## Question bloquante pour la session suivante
Les variables Supabase ont-elles aussi été ajoutées sur le site de test Netlify (dev) ?

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
