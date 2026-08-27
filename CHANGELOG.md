## v5.60 — 2026-08-27

### Corrigé
- Tests à faire : un test modifié réapparaît désormais même s’il avait été validé avant la modification ; sa nouvelle validation le masque à nouveau.

## v5.59 — 2026-08-25

### Modifié
- Suivi : v5.58 est déployée en production, son commentaire de livraison est archivé et publié sur Drive.
- Contexte : les actions prioritaires de la prochaine session portent sur les liens Drive, le rangement des fichiers de commentaires et l’archivage contrôlé des roadmaps après déploiement.

## v5.58 — 2026-08-25

### Modifié
- Tâches : le bouton « Terminer » est retiré de la fiche ; les tâches planifiées se terminent depuis le planning.
- Outils : la couleur de fond se règle désormais dans Paramètres > Accessibilité, après « Couleur d’ambiance », et plus depuis les cartes d’outils.
- Énergie : le badge de l’accueil ouvre directement l’écran de modification ; après validation, le retour se fait à l’accueil.
- Suivi Marie : l’export du 25 août est ingéré, les roadmaps clôturées sont archivées et une roadmap de retours est ouverte.
- Commande : l’analyse du Google Doc utilise la source configurée et s’arrête lorsqu’elle n’a pas changé depuis la dernière distribution.

## v5.57 — 2026-08-25

### Modifié
- Traçabilité : la livraison v5.56 est enregistrée comme déployée et sa communication à Marie est publiée sur Drive.

## v5.56 — 2026-08-25

### Modifié
- Tâches : le menu de la fiche est simplifié, en conservant les actions Modifier, Décomposer, Terminer, Dupliquer et Supprimer.
- Budget et Comptes : les montants prévus et les dépenses réelles sont présentés dans des écrans distincts ; l'ajout d'une dépense se fait depuis la catégorie concernée.
- Listes et énergie : le formulaire d'ajout de catégorie reste utilisable sur mobile avec le clavier ouvert, et la validation de l'énergie ramène directement à l'accueil.

## v5.55 — 2026-08-24

### Modifié
- Documentation : les roadmaps et messages clôturés sont archivés ; les notes de réunion et la convention de catégorisation sont regroupées dans `COMMUNICATION/`.
- Documentation : les références internes ont été mises à jour vers ces nouveaux emplacements.

## v5.54 — 2026-08-24

### Modifié
- Tâches : la fiche d'une tâche ne propose plus que Décomposer, Dupliquer, Modifier, Terminer et Supprimer.
- Budget : « Montant total » et « Mon compte » reflètent désormais les montants prévus plutôt que les dépenses déjà effectuées.
- Budget : le suivi prévu/dépensé/jauge par catégorie devient l'écran « Comptes » (accessible depuis le widget du même nom sur l'accueil) ; « Mon compte » (dans l'outil Budget) n'affiche que les prévisions.
- Budget : ajouter une dépense se fait désormais depuis la fiche d'une catégorie, sans resélectionner la catégorie dans un formulaire séparé.

## v5.53 — 2026-08-24

### Modifié
- Commande de déploiement : le bilan inclut désormais un message WhatsApp prêt à envoyer à Marie, avec le lien de production et les marqueurs `💻🤖`.

## v5.52 — 2026-08-24

### Corrigé
- Planning : une tâche sans couleur explicite utilise désormais un fond neutre, indépendamment de la couleur d’ambiance.
- Listes : le retour depuis le détail d’un élément restaure la catégorie précédemment ouverte.
- Outils : le sélecteur de couleur porte désormais un libellé visible.

## v5.51 — 2026-08-19

### Ajouté
- Détail d'un élément de liste (E62) : description et sous-tâches, ouvrable en touchant le titre d'un élément.
- Chaque outil (liste, budget...) peut avoir sa propre couleur de fond (sélecteur sur la carte, `E70Tools`/`E72FolderDetail`).
- Suppression d'une seule catégorie de liste, sans supprimer toute la liste.

### Modifié
- Une tâche sans couleur choisie n'est plus teintée par la couleur d'ambiance dans le planning.
- Badge énergie de l'accueil : accès direct à l'écran de modification, sans écran de consultation intermédiaire.
- Bandeau de dates du planning : encadré par la couleur d'ambiance, glissement tactile suivi en continu avec retour animé.

## v5.50 — 2026-08-18

### Modifié
- Déploiement de v5.49 en production (refonte Budget v3 complète, cumulée avec les changements déjà en attente depuis v5.47), HTTP 200 vérifié.

## v5.49 — 2026-08-17

### Ajouté
- Refonte Budget v3 terminée (`roadmap_budget_v3.md`, Phases 1-6) : Montant total réparti entre Mon compte (drill-down par sous-catégorie Semaine/Mois) et Mes livrets (drill-down par livret, fiche dédiée avec mouvements ajoutables/modifiables/supprimables).

### Modifié
- Gestion des mouvements de livret déplacée de l'écran de configuration vers la nouvelle fiche par livret, pour un formulaire unique et cohérent (montant/motif/date).

### Corrigé
- Suppression de 5 fonctions mortes dans `budgetRules.ts` devenues obsolètes après la refonte.

## v5.48 — 2026-08-17

### Modifié
- Déploiement de v5.47 en production (regroupement des tests par catégorie, cumulé avec la v5.45 déjà en prod), HTTP 200 vérifié.
- Avertissement de build « chunk JS > 500 kB » laissé tel quel sur consigne explicite de l'utilisateur ; refacto (`React.lazy`/`Suspense`) à proposer seulement si le poids grossit nettement.

## v5.47 — 2026-08-17

### Ajouté
- Catégorisation du travail validée avec Marie (7 catégories : Accueil/Planning, Tâches, Outils Budget, Outils Listes, Outils autres, Énergie, Paramètres/Profil).
- Écran « Tests à faire » : tests regroupés par catégorie, repliées par défaut (nom de catégorie mis en valeur, pliage/dépliage à trois niveaux : catégorie -> test -> étapes).

### Modifié
- Export de Marie du 17/08 11h13 traité : copié dans `donnees_marie/`, journal de tests ré-ingéré (aucun nouveau résultat, aucune perte ni friction).

## v5.46 — 2026-08-17

### Modifié
- Déploiement de v5.45 en production (refonte Budget, drag continu du planning, sélecteur mois/année, navigation planning par glissement, édition de tâche dédiée), après analyse sans anomalie de l'export de Marie du 17/08.
- `roadmap_budget_v2.md` (toutes phases terminées) archivée.

## v5.45 — 2026-08-17

### Ajouté
- Fiche de tâche planifiée : bouton « Modifier » ouvrant un écran d'édition dédié, pré-rempli au même gabarit que la création, avec choix occurrence/série pour les tâches récurrentes.

### Modifié
- Bandeau de dates du planning (accueil) : flèches de navigation par semaine retirées, le jour actuel reste toujours centré et seul le cadre du jour sélectionné se déplace ; navigation uniquement par glissement tactile.
- Ligne d'une tâche planifiée : badge des sous-tâches désormais avant le logo d'énergie (alignement vertical constant entre les lignes), hauteur de ligne proportionnelle à la durée de la tâche.
- Fiche d'une tâche planifiée : fond teinté avec la couleur d'ambiance des paramètres ; champs affichés en lecture seule (l'édition se fait via le bouton « Modifier »).

### Corrigé
- Formulaire de création de tâche : débordement visuel du cadre Durée à droite de l'écran (selects sans largeur contrainte).

## v5.44 — 2026-08-17

### Modifié
- Planning de l'accueil : la poignée devient un drag continu façon bottom-sheet (la fenêtre suit le doigt et reste à la hauteur relâchée, au lieu d'un seuil binaire) ; la section Outils et la bannière Mode surcharge restent désormais toujours visibles.

## v5.43 — 2026-08-17

### Ajouté
- Refonte du Budget (Phase 4/4, `roadmap_budget_v2.md`) — dernière phase, toutes livrées : anciennes catégories de revenu à montant fixe de Marie converties en revenus historiques ponctuels (migration Dexie v14) puis supprimées.

### Modifié
- Écran de configuration du Budget : possibilité de créer une nouvelle catégorie de type Revenu retirée, ainsi que le bloc « Non alloué » et la section « Revenus » de l'écran Budget, devenus incohérents avec le nouveau système « Montant total ».

## v5.42 — 2026-08-17

### Ajouté
- Commande `/traiter_export_marie` : traite l'arrivée d'un export de Marie indépendamment de `/deploy` (comparaison par `export_date`, ingestion du journal de tests, détection de pertes/frictions).
- Refonte du Budget (Phase 1/4, `roadmap_budget_v2.md`) : entité de revenus saisis manuellement (« Montant total »), avec formulaire dédié sur l'écran Budget — non encore reliée aux catégories de dépense ni aux livrets, pas encore annoncée à Marie.

### Corrigé
- `manualTestsCatalog.ts` : formulation du test « Utiliser le budget » (l'étape 1 renvoyait vers le widget « Comptes » de l'accueil, qui n'ouvre qu'un formulaire de dépense direct, pas l'écran Budget).

## v5.41 — 2026-08-17

### Modifié
- Clôture de session `/close` : synthèse du déploiement v5.40 (correctifs lint `db.ts:308`, test `E01Welcome.test.tsx` reformulé) consignée dans `_contexte/signals.md`/`contexte.md`, `README.md` aligné sur la version déployée.

## v5.40 — 2026-08-17

### Corrigé
- Lint global bloqué par une erreur préexistante dans `db.ts:308` (`_section` déstructuré jamais utilisé) : `eslint.config.js` ne couvrait que les paramètres de fonction (`argsIgnorePattern: '^_'`), pas les variables déstructurées — `varsIgnorePattern: '^_'` ajouté.
- Test `E01Welcome.test.tsx` fragile (« n'affiche pas la modale Nouveautés quand WHATS_NEW est vide ») : dépendait du contenu réel du tableau `WHATS_NEW`, vide seulement juste après un déploiement — reformulé pour vérifier le comportement réel (modale déjà vue pour la version courante via `localStorage`), indépendant du contenu.

## v5.39 — 2026-08-16

### Modifié
- Roadmaps terminées (`roadmap_v5.1.md`, `roadmap_tests_marie.md`, `roadmap_categories_listes.md`) déplacées vers `Archives/`, suivant le classement déjà appliqué aux roadmaps V1-V5.0. Aucun changement fonctionnel.

## v5.38 — 2026-08-16

### Modifié
- Accueil : bouton « + » (ajout d'un outil) déplacé juste à côté du titre « Outils » et réduit ; espacement augmenté entre ce titre et les cases Comptes/To Do/À acheter/Budget, qui utilisent désormais une police plus arrondie.
- « Tests à faire » : chaque test peut être déplié pour afficher ses étapes numérotées ou replié pour ne garder que le titre ; un test déjà validé disparaît de la liste affichée (le catalogue interne le conserve, comme suite de non-régression).
- Catalogue de tests manuels (`manualTestsCatalog.ts`) : description de chaque test réécrite en étapes numérotées précises (libellés exacts des boutons/champs), sans étape implicite ; un gabarit de rédaction est documenté en tête du fichier pour les prochains ajouts.

### Terminé
- Phase V5.1-0 de `roadmap_v5.1.md` (refonte ergonomique du Budget) clôturée : gate entièrement validée, dernier point de `tests_manuels.md` (import JSON) confirmé par l'utilisateur.

## v5.37 — 2026-08-16

### Corrigé
- Catégories de listes perdues à l'export/import : `list_categories` n'était jamais exporté ni vidé/restauré, laissant les éléments de liste importés inaccessibles (aucune catégorie pour les afficher), y compris sur un export/import fait avec cette version. Corrigé (`useSettingsState.ts`), avec réparation automatique par regroupement sur `section` pour les imports au format antérieur, comme le fait la migration Dexie v12 à l'installation.

### Modifié
- Bannières urgentes (accueil, « Tests à faire ») retirées, leur rôle (demander la réimportation pour réparer le Budget) devenu obsolète.
- Catalogue de tests manuels Marie complété (badge énergie, fond en couleur d'ambiance) ; `tests_manuels.md` recentré sur les seules vérifications techniques internes (import JSON), les autres points étant désormais couverts par le catalogue Marie.

## v5.36 — 2026-08-15

### Ajouté
- Catégories de listes : à la création d'une liste, définir une ou plusieurs catégories (au moins une obligatoire). Ouvrir une liste affiche d'abord ses catégories (avec le nombre d'éléments de chacune) ; toucher une catégorie affiche ses éléments. Possibilité d'ajouter une catégorie depuis cet écran. Le formulaire d'ajout d'élément range désormais automatiquement l'élément dans la catégorie ouverte (le champ « Rubrique » texte libre disparaît).

### Modifié
- Navigation par flèches du bandeau de dates (Planning) : passe d'un jour à l'autre en un pas d'une semaine, plus rapide pour naviguer loin dans le calendrier.
- Budget, ajout d'une dépense : les catégories sont désormais regroupées sous « Semaine » et « Mois », plus lisible quand les deux périodicités sont utilisées.

### Corrigé
- Formulaire de création de tâche détaillée (E21) : les cadres des champs Date et Heure de début ne débordaient plus correctement de leur zone sur certaines largeurs d'écran.

## v5.35 — 2026-08-15

### Modifié
- Accueil et Planning visuellement unifiés : le bandeau de dates (jours de la semaine, mois, année) est désormais toujours visible sur l'accueil, comme sur l'écran Planning déplié.
- Poignée accueil/planning simplifiée : les libellés « Déplier »/« Replier » sont retirés, seul le trait gris reste visible. Le tap reste fonctionnel, complété par un geste de glissement vertical (glisser vers le bas ouvre le planning, vers le haut le referme).

## v5.34 — 2026-08-14

### Modifié
- `/deploy` : nouvelle étape 0 imposant de traiter les derniers exports de Marie avant tout déploiement (analyse des pertes/incohérences/frictions, ingestion des résultats de tests), avant le passage habituel par `/close`.

## v5.33 — 2026-08-14

### Corrigé
- Bug « Budget disparu à l'import » : l'entrée Outil Budget (`tableau_comptage`) manquante à l'import n'était jamais recréée, contrairement aux entrées de listes. Corrigé (`useSettingsState.ts`).

### Modifié
- Bannières urgentes (accueil, « Tests à faire ») : message adapté (demande de réimportation pour réparer le Budget), bouton « Fait » pour les masquer durablement.
- Modale Nouveautés de l'accueil : ne se réaffiche plus une fois fermée pour une version donnée.

## v5.32 — 2026-08-14

### Modifié
- Déploiement de la v5.31 effectué en production (badge énergie allégé, fond en couleur d'ambiance), vérifié HTTP 200.

## v5.31 — 2026-08-14

### Modifié
- Badge énergie de la barre du haut (`EnergyDisplay.tsx`) : retrait du libellé texte « planifié / dispo » (icône batterie et chiffres conservés), fond désormais teinté avec la couleur d'ambiance choisie par l'utilisateur dans Paramètres > Accessibilité (au lieu d'une couleur fixe), suite à un retour de test manuel de Marie.

## v5.30 — 2026-08-14

### Modifié
- Déploiement de la v5.29 effectué en production (bannière urgence tests Marie et catalogue de tests inclus), vérifié HTTP 200.
- `README.md` restructuré (présentation professionnalisée du projet).

## v5.29 — 2026-08-14

### Ajouté
- Phase 3 des tests manuels Marie : script `scripts/ingest_manual_tests.py` et journal versionné `_contexte/marie_tests_journal.json`, pour archiver côté projet les résultats reçus dans un export (fusion sans écrasement, dédoublonnage par `id`).
- Bannière « URGENCE : importe tes données, vérifie-les, puis exporte-les et envoie-les-moi » sur l'écran d'accueil et l'écran « Tests à faire », pour obtenir un nouvel export de Marie après ce déploiement.

### Modifié
- `WHATS_NEW` de l'écran d'accueil : contenu périmé retiré, remplacé par l'annonce de la nouvelle icône « Tests à faire ».

## v5.28 — 2026-08-14

### Modifié
- Clôture des phases 1 et 2 des tests manuels Marie : catalogue de sept scénarios, validation commentée, historique append-only et export/import JSON v3.2 validés manuellement.
- Contexte de session, README et procédure `/close` alignés sur la phase 3 restante : archivage côté projet des exports reçus.

## v5.27 — 2026-08-14

### Ajouté
- Tests manuels Marie — catalogue in-app de sept scénarios actuels, écran « Tests à faire », statuts, pastilles rouges et saisie d’une validation ou d’un refus commenté.
- Historique append-only des validations de Marie, visible par test et préservé dans les exports/imports JSON (payload v3.2, 15 tables).
- Migration Dexie v11 : table `manualTestResults`.

## v5.26 — 2026-08-14

Roadmap `roadmap_tests_marie.md` créée, vérification de fraîcheur du catalogue de tests Marie ajoutée à `/deploy` et `/deploy_dev`.

### Ajouté
- `roadmap_tests_marie.md` : catalogue in-app des tests manuels soumis à Marie (langage clair, modale de validation avec commentaire obligatoire si refus, historique append-only, pastille rouge sur les tests jamais soumis et sur l'icône du bandeau), et archivage côté projet des exports reçus (Phase 1 `[TODO]`, rien de codé).
- `/deploy` et `/deploy_dev` : vérification non bloquante de la fraîcheur de `src/domain/data/manualTestsCatalog.ts` (no-op tant que ce fichier n'existe pas).

## v5.25 — 2026-08-14

Déploiement v5.24 en prod, puis version courante affichée en permanence dans le panneau dev.

### Ajouté
- Panneau dev (haut à droite, `npm run dev` uniquement) : version courante affichée en permanence, lue automatiquement dans `CHANGELOG.md` au build (`__APP_DEV_VERSION__`, `vite.config.ts`) — se met à jour seule à chaque bump de version.
- `@types/node` ajouté en devDependency, nécessaire pour lire `CHANGELOG.md` dans `vite.config.ts` (`tsconfig.node.json` : `types: ["node"]`).

### Déployé
- v5.24 build `dist/v5.24`, prod `https://appli-audhd.netlify.app`, vérifié HTTP 200 — déployé après confirmation explicite malgré les 5 points de `tests_manuels.md` non validés.

## v5.24 — 2026-08-14

Modale « Nouveautés » sur l'écran d'accueil, site de test Netlify dédié, `/close` intégré aux commandes de déploiement.

### Ajouté
- `WhatsNewModal.tsx` : liste des nouveautés simples affichée sur l'image de l'écran d'accueil (`E01Welcome.tsx`), fond semi-transparent laissant l'image visible, fermable. Contenu maintenu à la main, limité pour l'instant au delta entre la dist prod v5.20 et v5.22 (import/export de sauvegarde).
- `/deploy_dev` : nouvelle commande, build et déploiement de l'état courant du code sur un site Netlify de test dédié (`appli-audhd-dev.netlify.app`, distinct de la prod), pour tester sur un appareil hors réseau local. `NETLIFY_SITE_ID_DEV` ajouté à `.env`/`.env.example`.
- `/deploy` et `/deploy_dev` exécutent désormais `/close` en étape 0 — le code déployé (prod ou test) est systématiquement clôturé et commité avant build.

### Corrigé
- `a_communiquer_v5.md` : caractère parasite ajouté accidentellement en tête du titre, restauré.

## v5.23 — 2026-08-14

Durcissement de `/deploy` après un premier déploiement réel sous les nouvelles vérifications (v5.22), et mise à jour de la documentation de session.

### Ajouté
- `/deploy` : 10 vérifications ajoutées avant build (7 bloquantes : arbre de travail propre, `.env` avec clés attendues, cohérence CHANGELOG/version, tests unitaires, `tsc -b`, lint ; 3 avertissements à confirmation explicite : branche git attendue, version déjà présente dans `dist/`, tests manuels en attente).
- `/deploy` : vérification de fumée `curl` sur l'URL de production après déploiement, avertissement si des commits locaux ne sont pas poussés vers le remote, `_contexte/dernier_deploiement.md` créé et auto-maintenu par la commande (version/date/URL du dernier déploiement).

### Corrigé
- `/deploy` : vérification des clés `.env` durcie (`grep -qE '...=.+'`) — une clé présente mais vide passait auparavant le contrôle bloquant.
- `_contexte/contexte.md` : mention de branche active obsolète corrigée (`v5.1` est fusionnée dans `main` depuis plusieurs sessions).

## v5.22 — 2026-08-14

Ajout de l'import de sauvegarde JSON dans Paramètres, et complétion de l'export à l'occasion de l'analyse des données de test de Marie.

### Ajouté
- Import de sauvegarde JSON (`E117Export.tsx`, écran renommé « Export et import ») : sélection de fichier, remplacement intégral des données de l'appareil après confirmation (irréversible), avec message d'erreur si le fichier est invalide.
- `useSettingsState.importData()` : valide le fichier (profil utilisateur requis), remplace les 14 tables Dexie, reconstruit l'entrée `tools` manquante pour chaque liste d'un export v3.0 (avant l'ajout de `folders`/`tools`/`task_recurrences`/`task_exceptions` à l'export).

### Corrigé
- `useSettingsState.exportData()` : n'exportait que 10 des 14 tables Dexie (`folders`, `tools`, `task_recurrences`, `task_exceptions` manquants) — export désormais complet, version de payload passée à `3.1`.
- `useSettingsState.clearDatabase()` : ne vidait pas `task_recurrences`/`task_exceptions` — désormais synchronisé avec le schéma Dexie réel.

## v5.21 — 2026-08-14

Ménage de la racine du projet, sans modification de code applicatif.

### Corrigé
- `ollama_call.py` (racine) supprimé, doublon exact de `scripts/ollama_call.py` — `CLAUDE.md` mis à jour en conséquence.
- `llms.txt` : mentions résiduelles du chiffrement local (`src/crypto/`, retiré le 2026-08-05) supprimées.
- `roadmap_v5.0.md` (close depuis le 2026-08-07) déplacé vers `Archives/`, cohérent avec les roadmaps v1 à v4.1.
- Vieux builds `dist/v3`, `v4.1`, `v5.0`, `v5.1` purgés du disque (dossier non versionné).

## v5.20 — 2026-08-14

### Ajouté
- `E01Welcome.tsx` : bouton d'accueil affiche « Entrer dans la <version> » en production, alimenté par `VITE_APP_VERSION` injectée au build par `/deploy`. Sans cette variable (dev, tests), reste « Entrer ».

## v5.19 — 2026-08-13

Retour vidéo de Marie sur la dist V5.1 : superposition de la nav basse sur le formulaire d'ajout d'élément de liste.

### Corrigé
- `E61ListDetail.tsx` : formulaire « Ajouter un élément » converti en boîte de dialogue plein écran (`position: fixed`, `z-index: 1000`), même pattern que les dialogues « Planifier » et « Supprimer la liste » du même fichier — corrige la superposition transitoire avec la barre de nav fixe à l'ouverture du clavier sur mobile.

## v5.18 — 2026-08-07

Retours de validation manuelle de la Phase V5.1-0 (Outils et Budget), modèle de données inchangé.

### Ajouté
- Suppression d'une liste depuis sa fiche (`E61ListDetail.tsx`) : bouton dédié avec confirmation, `deleteTool` (déjà présent côté état) désormais câblé côté UI.
- Retrait d'argent sur un livret (`E74BudgetSettings.tsx`) : `BudgetDeposit.amount` accepte un montant négatif, sélecteur Dépôt/Retrait, blocage si le retrait dépasse le solde du livret. Item auparavant hors périmètre de la phase.

### Modifié
- `ToolCreateModal.tsx` : création de dossier retirée, ne propose plus que la création d'une liste — dossiers existants toujours consultables et supprimables.
- `e2e/09-tools-folders-lists.spec.ts` adapté (T55, plus de création de dossier).

### Corrigé
- Signalement initial d'une dépense non enregistrable après création d'une catégorie : non reproduit, confirmé par l'utilisateur comme une erreur de manipulation — aucun correctif de code nécessaire.

## v5.17 — 2026-08-07

Phase V5.1-0 codée : refonte ergonomique du Budget en trois écrans, à modèle de données constant (aucune migration Dexie).

### Ajouté
- `E73CategoryDetail.tsx` (route `budget-category-detail`) : fiche d'une catégorie ouverte au tap depuis l'écran Budget — restant, jauge, historique des dépenses de la période consultée, renommer / modifier le montant / supprimer.
- `E74BudgetSettings.tsx` (route `budget-settings`) : écran de configuration atteint par l'icône ⚙ du Budget — création de catégorie, gestion des livrets et dépôts, bloc « Non alloué » par période.
- `BudgetExpenseModal.tsx` : formulaire de dépense partagé par l'écran Budget et le widget « Comptes » de l'accueil, avec sélection de catégorie en pastilles et champ Date (paramètre déjà supporté par `createBudgetEntry`, jamais exposé jusqu'ici).
- `BudgetGauge.tsx` et `src/ui/styles/budget.ts` : jauge et styles communs aux trois écrans.
- `budgetRules.ts` : `getTotalSpent`, `getTotalRemaining`, `getGaugeRatio`, `getGaugeLevel`, `GAUGE_WARNING_RATIO` — fonctions ajoutées, aucune fonction existante modifiée.

### Modifié
- `E71Budget.tsx` réécrit : chiffre-vedette « Il me reste » (budget des dépenses de la période moins dépensé) remplaçant « Reste non budgétisé », onglets Semaine / Mois avec un seul navigateur de période, jauge par catégorie remplaçant « Restant : X (Dépensé Y) », livrets réduits à une ligne de synthèse, une seule action principale. Les 18 liens de configuration permanents et le journal de dépenses inline ont quitté l'écran.
- `E10Dashboard.tsx` : formulaire de dépense dupliqué remplacé par `BudgetExpenseModal` — les deux points d'entrée de saisie sont désormais le même composant.
- Dates du domaine budget au format français (`formatFrenchDate`), au lieu des dates ISO brutes.

### Corrigé
- Bloc Livrets : le solde cumulait tous les dépôts alors que les mouvements listés juste en dessous étaient filtrés sur la période courante. La configuration liste désormais tous les dépôts d'un livret, cohérents avec son solde.
- `e2e/08-tools-budget.spec.ts` et `e2e/09-tools-folders-lists.spec.ts` : point d'entrée « Outils » disparu de l'accueil depuis la v5.13 (carte redondante retirée), jamais répercuté faute d'exécution e2e depuis. Les 6 tests concernés échouaient avant cette session.

### Gate
- 522/522 tests unitaires, 57/57 e2e, `tsc -b` / lint / build clean. Validation manuelle en attente (`tests_manuels.md`).

## v5.16 — 2026-08-07

Analyse UX de l'écran Budget sur demande de l'utilisateur et ouverture de la roadmap V5.1. Aucun code applicatif modifié.

### Ajouté
- `roadmap_v5.1.md` : successeur de `roadmap_v5.0.md` (close). Phase V5.1-0 `[TODO]` — refonte ergonomique de l'écran Budget, à modèle de données constant : 8 défauts constatés par lecture de code, 5 arbitrages validés avec l'utilisateur, 10 items de checklist, gate. Backlog outils V5.1+ et Q non tranchées reportés depuis V5.0.

### Modifié
- `roadmap_v5.0.md` : ligne de clôture ajoutée en tête, pointant vers le successeur.
- `README.md` : état actuel et prochaine étape alignés sur la roadmap V5.1 ; mention « Phase V5-3 en cours » corrigée, contradictoire avec le paragraphe suivant qui la déclarait close.
- `_contexte/archive_decisions.md` : décision du 2026-08-02 (Phase V5-2a) archivée, la liste de `contexte.md` atteignant 10 entrées.

### Décisions
- Refonte engagée maintenant sans attendre le retour de la testeuse : l'écran actuel est jugé assez confus pour biaiser ce retour.
- Chiffre-vedette « Il me reste » remplaçant « Reste non budgétisé » — changement de sens assumé, pas seulement de mise en forme.
- Trois écrans (`E71Budget` refondu, `E73CategoryDetail`, `E74BudgetSettings`) plutôt que des sections repliables dans un écran unique.
- Aucune migration Dexie : `E32` (colonnes configurables) et `E34` (livrets reliés) restent au backlog, ils exigent un changement de modèle.

## v5.15 — 2026-08-07

Point 5 de `tests_manuels.md` (widget Comptes) revalidé par l'utilisateur avec le correctif de la session précédente. Gate de sortie de la Phase V5-3 atteinte.

### Corrigé
- Aucun correctif de code cette session.

### Gate
- 501/501 tests unitaires, `tsc -b` clean. Phase V5-3 passée à `[FAIT]`, roadmap V5.0 (V5-0 à V5-3) intégralement terminée.

## v5.14 — 2026-08-07

Validation manuelle des 6 points de `tests_manuels.md` (Phase V5-3) : 5 points OK, un bug trouvé et corrigé sur le widget Comptes.

### Corrigé
- `E10Dashboard.tsx` : le bouton « Comptes » de l'accueil était `disabled` (donc silencieusement inactif) tant qu'aucune catégorie budgétaire de type « dépense » n'existait dans le Budget, sans aucun retour visuel. Le bouton reste désormais toujours actif ; un clic sans catégorie de dépense ouvre un message dédié invitant à en créer une.

### Gate
- 501/501 tests unitaires, `tsc -b` clean. Phase V5-3 reste `[EN COURS]` : point 5 de `tests_manuels.md` à revalider par l'utilisateur avec le correctif.

## v5.13 — 2026-08-06

Premier passage de validation manuelle réelle de la Phase V5-3 : bugs de blocage et de navigation trouvés et corrigés.

### Corrigé
- Blocage bloquant à l'ouverture (« Chargement... » indéfini) : la migration Dexie v10 (`db.ts`) appelait `crypto.randomUUID()` directement, API indisponible hors contexte sécurisé (HTTP sur IP réseau) — remplacé par un repli local identique à celui de `newId()` (`repositories.ts`).
- `AppContext.tsx` : `try/catch/finally` ajouté autour de `init()` pour qu'une erreur future ne bloque plus jamais silencieusement l'écran de chargement.
- `E10Dashboard.tsx` : carte « Outils » redondante retirée de la zone widgets, libellé d'un outil de type liste affichant désormais son vrai nom (au lieu du générique « Liste »), zone Outils passée en grille 3 colonnes.
- `E71Budget.tsx` : le bouton « Retour » forçait `goTo('tools')` au lieu de dépiler la pile de navigation réelle — remplacé par `back('dashboard')`.

### Modifié
- Bouton « + » de création d'un outil/dossier déplacé de l'écran Outils (`E70Tools.tsx`) vers l'accueil (`E10Dashboard.tsx`).

### Vérifié
- Widget « Comptes » de l'accueil confirmé conforme à la transcription du 28/07 (rattaché au domaine budget, distinct de l'outil « Comptage » reporté en V5.1) — non modifié.

### Gate
- 500/500 tests unitaires, `tsc -b`/lint clean (build/e2e non relancés cette session). Phase V5-3 reste `[EN COURS]` : points 1-2 de `tests_manuels.md` à revalider sur les écrans corrigés, points 3-6 jamais testés.

## v5.12 — 2026-08-06

Clôture de la Phase V5-2b (M6/M7) et codage intégral de la Phase V5-3 (outils, dossiers, listes et Budget rebranché), en mode plan.

### Ajouté
- Entités `Folder`/`Tool`, migration Dexie **v10** (`folders`, `tools`, `ListItem.checked`/`section` ; seed d'une To Do et d'un Budget d'office à l'installation, sans contenu).
- `src/ui/screens/tools/E72FolderDetail.tsx`, `src/ui/components/ToolCreateModal.tsx`/`ToolWidgetCard.tsx`.
- `E61ListDetail.tsx` : coche intensifiée avec tri (cochés sous les non cochés), rubriques optionnelles, icône réveil planifiant une tâche récurrente ou ponctuelle via `createDetailedTask`.
- `E10Dashboard.tsx` : widget « Comptes » ouvrant la saisie de dépense en un tap.
- `e2e/09-tools-folders-lists.spec.ts`.

### Modifié
- `E70Tools.tsx` : écran générique rendant dossiers et outils réels (plus de boutons « Todo »/« Budget » codés en dur).
- `E71Budget.tsx` : code interne inchangé, atteint désormais via une carte outil.
- Flux « déplacer une tâche vers une liste » (`E20Inbox.tsx`, `E21CreateTaskV2.tsx`, `E22TaskDetail.tsx`) migré vers `createToolList` pour que toute nouvelle liste obtienne un outil associé.

### Retiré
- `E60Lists.tsx` et la route `lists` : les listes ne se créent plus que via le « + » du bloc outils (dossier ou racine). `pinned_to_tools` retiré de `List`.
- Code mort dans `E21CreateTaskV2.tsx` (sélecteur de liste devenu inatteignable après retrait de l'origine `lists`).

### Corrigé
- Le réveil d'un item de liste ne fixait pas d'heure de début, rendant la tâche créée invisible sur le planning (`scheduleTask` n'assigne `scheduled_date` que si une heure est fournie) — champ Heure ajouté à la mini-modale, requis.

### Vérifié
- `E7` (M6, Phase V5-2b) — aucune donnée n'est préremplie à l'installation.

### Gate
- 500/500 tests unitaires, 57/57 e2e, `tsc -b`/lint/build clean. Phase V5-2b passée à `[FAIT]`. Phase V5-3 `[EN COURS]` — codée et testée, reste la validation manuelle (`tests_manuels.md`).

## v5.11 — 2026-08-06

Clôture de la Phase V5-2b (planning et tâches refondus) : M6 (audit E7) et M7 (gate de phase).

### Vérifié
- `E7` — aucune donnée n'est préremplie à l'installation (`src/ui/screens/onboarding/*`, `useSettingsState.ts`, `db.ts`) : `createUser` ne crée qu'un `User` et des `Settings` par défaut (configuration, pas contenu), aucune tâche/liste/catégorie budget créée automatiquement, aucun hook `populate` sur la base Dexie.

### Gate de phase
- 488/488 tests unitaires, `tsc -b`/lint clean. Phase V5-2b passée à `[FAIT]`.

## v5.10 — 2026-08-06

Clôture M5 de la Phase V5-2b : validation manuelle tactile du point 3.2, deux bugs fonctionnels signalés clos comme non reproductibles.

### Corrigé
- Aucun changement de code applicatif. Les deux bugs signalés (suppression d'une tâche récurrente sans effet, ajout de sous-tâche impossible) sont clos sans correctif : retest de l'utilisateur confirmant un comportement normal, signalement initial attribué à une erreur de manipulation.

## v5.9 — 2026-08-06

Retours de tests manuels de la Phase V5-2b (M5) traités : corrections UI du planning, deux bugs fonctionnels signalés restent non reproduits.

### Ajouté
- `src/domain/rules/planningSlotRules.ts` : `formatFrenchDate`, `formatMonthYear`.
- `src/app/AppContext.tsx` : fonction `replace` exposée dans le contexte de navigation (remplace la route courante sans empiler), utilisée pour préserver la date affichée du planning au retour depuis la fiche tâche.
- `src/ui/screens/dashboard/PlanningBoard.tsx` : nom du mois affiché en permanence dans le planning déplié, cliquable pour ouvrir le sélecteur de date natif (remplace l'ancienne icône calendrier illisible et non tactile) ; bouton « Aujourd'hui ».

### Modifié
- `src/ui/screens/dashboard/PlanningBoard.tsx` : contour parasite (blanc en sombre, gris en clair) des lignes de tâche retiré (`background`/`appearance`/`outline` du bouton natif réinitialisés) ; hauteur minimale réservée sur l'état « rien de planifié » pour limiter le saut visuel.
- `src/ui/screens/tasks/E22TaskDetail.tsx`, `E23Decompose.tsx` : dates affichées au format français.
- `src/ui/components/TopBar.tsx`, `E10Dashboard.tsx` : icône Paramètres retirée du bandeau supérieur (doublon avec la nav basse).

### Constaté, non corrigé
- Suppression d'une tâche récurrente sans effet et ajout de sous-tâche impossible depuis une tâche existante : signalés en test manuel, non reproduits malgré lecture de code et tests automatisés Playwright rejouant les scénarios décrits — laissés en attente d'une reproduction précise plutôt que corrigés à l'aveugle (`tests_manuels.md`).
- Bug de taille du planning vide : investigué avec un navigateur automatisé, confirmé non reproductible sur build reconstruit — la première tentative de mesure était faussée par un serveur de preview Playwright resté sur un `dist/` figé.

## v5.8 — 2026-08-05

Session hors roadmap : deux constats hérités d'une session antérieure corrigés après vérification en profondeur, plutôt qu'exécutés tels quels.

### Modifié
- `src/ui/screens/tasks/E21CreateTaskV2.tsx` : destination de création de tâche toujours forcée automatiquement (`DEFAULT_DESTINATION = 'todo'` en repli pour toute origine non listée dans `FORCED_DESTINATION_BY_ORIGIN`) ; le bloc UI « Que faire de cette tâche ? », cru à tort mort dans une session antérieure, était en réalité atteignable depuis une dizaine d'écrans (task-detail, settings*, list-detail, budget, resources, overload-recovery, energy-view, task-decompose) via le « + » de la nav basse — retiré, décidé avec l'utilisateur.
- `e2e/02-tasks.spec.ts` : nouveau scénario T19 couvrant ce comportement depuis une origine non mappée (Paramètres).

### Retiré
- Chiffrement local (`Settings.local_encryption`, `src/crypto/`, paramètres `password` de `TaskRepository`/`EnergyEntryRepository`/`ListItemRepository`) supprimé entièrement plutôt que corrigé — jamais activable depuis aucun écran ni actif en production (repositories toujours instanciés sans mot de passe). L'ancien bug tracé « `exportData()` non déchiffré » présupposait à tort que le chiffrement pouvait être actif ; devenu sans objet.

## v5.7 — 2026-08-05

Phase V5-2b (planning et tâches refondus) — milestone M5 codé et testé (automatisé) : planning épuré, sans grille ni flux tap-based. Validation manuelle en cours.

### Ajouté
- `src/domain/rules/planningSlotRules.ts` : `formatDayBadge`, `dateStrip` pour le bandeau de dates.
- `src/app/contexts/usePlanningState.ts` : `planTaskToday` (place une tâche au jour courant sans horaire, l'utilisateur affine ensuite via sa fiche).
- `src/ui/screens/tasks/E22TaskDetail.tsx` : champ « Titre » cliquable/éditable (compense le retrait du « Renommer » de l'ancien menu planning) ; panneau horaire inline par sous-étape (date/heure/durée), réutilisant `scheduleSubTask`. Même ajout dans `E23Decompose.tsx`.

### Modifié
- `src/ui/screens/dashboard/PlanningBoard.tsx` : réécrit intégralement — grille horaire et flux tap-based (assign/menu/déplacer/renommer/supprimer) supprimés, remplacés par une liste par tâche (icône/horaire/nom/énergie/pastille de complétion), un bandeau de dates (jour réel souligné, navigation par appui et glissement tactile, sélecteur « aller à une date »), des sous-tâches dépliables avec compteur n/N. Bouton « Reporter » simplifié : bascule directe au lendemain, même horaire.
- `src/app/contexts/usePlanningState.ts` : retrait de `pendingPlanTask`/`movingTask` et de toute leur plomberie, devenus morts avec le flux tap-based ; retrait de `planningTargetDate`/`createTaskDest`, déjà morts avant cette session.
- `src/ui/screens/tasks/E20Inbox.tsx` : « Planifier » appelle `planTaskToday` puis ouvre la fiche ; l'avertissement « sous-tâches perdues » retiré pour ce chemin (les sous-tâches sont désormais préservées, la tâche n'étant plus recréée).
- `src/domain/rules/planningSlotRules.ts` : réduit aux fonctions de date, les fonctions de grille/picker (créneaux, disponibilité de plage, fenêtre visible) retirées avec leurs tests.

### Retiré
- Écran « Aujourd'hui » (`E24Today.tsx`) et route `today` — jugé redondant avec la section « Tâche du jour » déjà présente sur l'accueil, décidé avec l'utilisateur plutôt que de lui donner un point d'accès.

### Corrigé
- `src/app/contexts/usePlanningState.ts` (`updateTaskFields`/`deleteTaskScoped`) : sur une occurrence déjà détachée d'une série (`recurrence_exception: true`), la modifier à nouveau en choisissant « Toutes les occurrences » ne la mettait pas à jour elle-même — le filtre de ciblage l'excluait à tort au même titre que les autres occurrences détachées. L'occurrence cliquée est désormais toujours incluse dans la cible, trouvé en validation manuelle.
- 4 tests e2e pré-existants (`01-onboarding.spec.ts` T06, `02-tasks.spec.ts` T13/T16/T17) : collision d'accessible name avec le nouveau champ Titre de la fiche (le titre de la tâche de test contenait le mot recherché, ex. « Tâche à décomposer » contient « décomposer »).

## v5.6 — 2026-08-04

Phase V5-2b (planning et tâches refondus) en cours — milestones M1 à M4 codés et validés manuellement : entités et migration, moteur de récurrence, écran de création et fiche tâche redessinés.

### Ajouté
- `src/domain/entities/task.ts` : nouveaux champs `icon`, `color`, `description`, `duration_minutes`, `recurrence_id`, `is_recurrence_root`, `recurrence_exception`.
- `src/domain/entities/taskRecurrence.ts`, `taskException.ts` : nouvelles entités (fréquence, intervalle, fin par date/nombre ; exception d'occurrence).
- Migration Dexie **v9** (`src/data/db.ts`) : nouveaux champs par défaut sur les tâches existantes, tables `taskRecurrences`/`taskExceptions`.
- `src/domain/rules/taskRecurrenceRules.ts` : génération des dates d'occurrence par scan jour par jour (quotidien/hebdo/mensuel/annuel, intervalle, fin par date ou nombre), sans librairie RRULE — 18 tests.
- `src/domain/rules/taskAppearance.ts` : bibliothèque de 15 icônes SVG internes restreintes.
- Composants `IconPicker.tsx`, `ColorPicker.tsx`, `DurationRoller.tsx` (3 rouleaux jour/heure/minute), `RecurrenceEditor.tsx`.
- `src/ui/screens/tasks/E21CreateTaskV2.tsx` : écran de création entièrement redessiné (icône, titre, sous-tâches puis description, couleur, énergie, obligatoire, puis pour une tâche planifiée : date/heure/durée et récurrence).
- `src/app/contexts/usePlanningState.ts` : `createDetailedTask` (matérialise les occurrences sur 90 jours), `getTaskById`, `duplicateTaskById`, `updateTaskFields`/`deleteTaskScoped` (portée occurrence ou série).
- `src/ui/screens/tasks/E22TaskDetail.tsx` : champs cliquables (icône/couleur/date/horaire/énergie), action Dupliquer, dialogue « cette occurrence » / « toutes les occurrences » sur toute modification ou suppression d'une tâche récurrente.

### Modifié
- Suffixe historique `*V2` retiré des fonctions de `usePlanningState.ts`/`useTasksState.ts` (`createTaskDest`, `scheduleTask`, `completeTaskById`, etc.), sans plus de sens après la fusion V5-2a.

### Corrigé
- `IconPicker.tsx` : cliquer sur une icône déjà sélectionnée ne la désélectionnait pas.
- `usePlanningState.createDetailedTask` : ne rafraîchissait pas toujours `inboxTasks`/`todayTasks`, rendant une tâche fraîchement créée invisible en Réception ou Aujourd'hui.
- `AppContext.test.tsx` : absence de nettoyage entre tests provoquait une pollution intermittente d'un test pré-existant (confirmée présente avant cette session) — ajout d'un `afterEach` vidant les tables tâches/récurrences/exceptions.

## v5.5 — 2026-08-04

Phase V5-2a close après validation manuelle intégrale (points 110-117, `tests_manuels.md` purgé).

### Corrigé
- `src/ui/screens/tasks/E21CreateTaskV2.tsx` : `FORCED_DESTINATION_BY_ORIGIN` n'avait pas d'entrée pour l'origine `dashboard` (écran d'accueil depuis la fusion V5-1), faisant réapparaître l'écran de choix de destination au lieu de créer directement la tâche depuis le « + » de l'accueil. Ajout de `dashboard: 'planned'`.

### Validé
- Migration Dexie v7/v8 confirmée sans perte de données sur un export réel utilisateur (tâches antérieures au 2026-07-31 toutes présentes).

## v5.4 — 2026-08-02

Phase V5-2a — refacto : unification du modèle de tâches. Aucun changement de comportement visible. Validation manuelle en attente (`tests_manuels.md`, points 110 à 117).

### Modifié
- `src/domain/entities/task.ts` : entité `Task` unique, absorbant `SubTask` et `TaskV2`. Nouveaux champs `parent_id` (null pour une tâche principale, id du parent pour une sous-étape), `essential`, `energy_cost`, `postponed`, `scheduled_date`/`scheduled_start`/`scheduled_end`. `TaskStatus` passe à `'inbox' | 'today' | 'planned' | 'completed'` ; le statut `'todo'` de `TaskV2` (jamais atteignable depuis l'interface) est fusionné dans `'inbox'`.
- `src/domain/rules/taskRules.ts` : fusion de `taskRulesV2.ts` et `subTaskRules.ts`. Suffixes `V2` retirés (`createTask`, `scheduleTask`, `reportTask`, `renameTask`, `toggleEssential`, `setEnergyCost`, `toggleTaskCompletion`). Ajout de `isCompleted`, `isSubTask`, `getSubTasks`, `getSubTaskCounts`, `uncompleteTask`. La logique de créneaux (`SLOTS_PER_DAY`, `taskSlotRange`, `taskOccupiesSlot`) est déplacée sans changement.
- `src/data/repositories/taskRepository.ts` : repository unique remplaçant `TaskRepository` + `SubTaskRepository` + `TaskV2Repository`. `getByStatus` et `getTodayTasks` excluent désormais les sous-étapes ; ajout de `getChildren`, `getRootByDate`, `getChildrenByDate`, `deleteWithChildren`, `getEssentialTasks`.
- `src/app/contexts/useTasksState.ts`, `usePlanningState.ts` : opèrent sur la collection unique. L'API exposée par le contexte est inchangée, pour ne pas propager le refacto aux écrans au-delà des types.
- `src/app/contexts/useSettingsState.ts` : l'export ne contient plus `sub_tasks` ni `tasks_v2`, tout est dans `tasks` (version de payload `2.0` → `3.0`).
- `src/test/factories.ts` : fabriques de tests partagées (`makeTask`, `makeSubTask`, `makePlannedSubTask`), remplaçant sept fabriques dupliquées dans les fichiers de test.

### Ajouté
- Migration Dexie v7 : fusionne `subTasks` et `tasksV2` dans `tasks` en conservant les identifiants. Les sous-étapes prennent `parent_id` = ancien `task_id` et un statut dérivé de `is_completed` puis de la présence d'un créneau ; les sous-étapes orphelines (parent supprimé) sont écartées. Les tâches V2 conservent énergie, obligatoire et créneau.
- Migration Dexie v8 : suppression des tables `subTasks` et `tasksV2`. Séparée de la v7 parce que Dexie supprime les object stores avant d'exécuter le `upgrade` de la même version — les lire et les supprimer d'un coup n'est pas fiable.
- `src/data/db.test.ts` : test de migration v6 → v8 vérifiant la fusion des trois tables, le rattachement `parent_id`, la conversion de statut et l'écartement des orphelines.

### Corrigé
- `TaskRepository.reorder()` réencryptait un titre déjà chiffré (lecture brute en base puis passage par `update()`), corrompant le titre au réordonnancement quand le chiffrement local est actif. Le réordonnancement écrit désormais directement en base. Défaut latent préexistant, révélé par l'unification ; verrouillé par un test.

## v5.3 — 2026-08-02

Phase V5-1 close après validation manuelle intégrale sur appareil tactile (points 101-109).

### Corrigé
- `src/ui/screens/tasks/E20Inbox.tsx` : titre `<h1>` « Todo » → « Réception » (résidu du renommage nav Todo→Outils de la Phase V4.1-0, jamais corrigé sur cet écran).
- `index.html` : `lang="en"` → `lang="fr"`. Cause racine de deux anomalies constatées en validation manuelle : la page anglaise déclenchait la traduction automatique de Chrome sur une interface entièrement française, ce qui remplace les nœuds texte du DOM et casse la réconciliation React sur ces nœuds — « Replier » affiché « Répondeur », pastille d'énergie figée jusqu'au changement d'écran (React perd la référence du nœud traduit).
- `e2e/02-tasks.spec.ts` : assertion de titre alignée sur « Réception ».

### Validé
- Points 101 à 109 de `tests_manuels.md` validés sur appareil tactile après correctifs. 514/515 tests unitaires (flaky pré-existant `AppContext.test.tsx`, sans lien), 53/53 e2e, build/lint clean.

## v5.2 — 2026-07-30

Phase V5-1 — navigation et écran d'accueil fusionné. Validation manuelle en attente (`tests_manuels.md`, points 101 à 109).

### Ajouté
- `src/ui/screens/dashboard/PlanningBoard.tsx` : corps du planning extrait de `E40Planning`, piloté par un état `collapsed`. Replié, il n'affiche qu'une fenêtre de créneaux autour de l'heure courante et masque la navigation par jour ; déplié, la journée entière défile. Créneaux, pickers, bannières de planification et de déplacement inchangés.
- `visibleSlotWindow()` (`planningSlotRules.ts`) : fenêtre de six créneaux ancrée sur le créneau courant, recalée pour rester entière en début et en fin de journée. 4 tests.
- `getEnergyPairLabel()` (`energyRules.ts`) : libellé « planifié / disponible » de la pastille d'énergie, avec repli sur le libellé simple quand l'énergie du jour n'est pas renseignée (E14, Q1). 4 tests.
- Poignée de dépliement/repliement sur l'accueil (E18), sous le planning en état replié, au-dessus en état déplié.
- Zone de widgets d'outils sur l'accueil (E24), portant en V5-1 deux entrées provisoires « Outils » et « Listes » — les vrais widgets arrivent en V5-3. Sans elles, le retrait des onglets rendait `tools`, `budget`, `lists` et `list-detail` inatteignables.

### Modifié
- `src/ui/components/BottomNav.tsx` : nav ramenée à quatre éléments — Boîte de réception, Accueil, Paramètres, « + » (N1). Les onglets Outils, Planning et Listes sont retirés ; le bouton pleine largeur « Ajouter une tâche » devient le segment « + ». La pastille de tâches en attente passe sur la boîte de réception.
- `src/App.tsx` : la route `planning` rend l'accueil fusionné en état déplié. `activeTabFor` mappe `dashboard` et `planning` sur le même onglet. Les six flux qui appelaient `goTo('planning')` (inbox, création, fiche tâche, décomposition, report) fonctionnent sans modification.
- `src/ui/screens/dashboard/E10Dashboard.tsx` : écran unique à deux états (E19, Q8). Replié : planning à l'heure courante, Tâche du jour, zone widgets. Déplié : planning entier scrollable seul, Tâche du jour et widgets masqués. La liste de cartes « Planning du jour » est remplacée par la grille réelle.
- `src/ui/components/EnergyDisplay.tsx` : affiche l'énergie planifiée et l'énergie disponible côte à côte (E14, Q1).
- `src/ui/components/TopBar.tsx` : la pastille de surcharge ouvre le centre de récupération quand la surcharge est active, et conserve la modale explicative quand elle est inactive (E21).
- `vite.config.ts` : `outDir` `dist/v4.1` → `dist/v5.0`, résidu de version aligné sur la branche active.
- e2e : sélecteurs adaptés à la nouvelle nav et à la fusion. `T44` réaffecté — « Terminer la tâche depuis le Planning » n'a plus de sens distinct, un seul écran portant les deux états ; il vérifie désormais que la pastille de surcharge ouvre le centre de récupération (E21).

### Supprimé
- `src/ui/screens/planning/` (`E40Planning.tsx`, `E40Planning.test.tsx`) : absorbé par l'accueil fusionné.
- Glisser-déposer du planning (~250 lignes : appui long, maintien aux bords pour changer de jour, overlay de glissement, neutralisation de la sélection de texte). Supprimé pendant la fusion plutôt que porté puis retiré en V5-2, conformément à l'arbitrage `Q10`. Le déplacement d'une tâche passe par le menu « Déplacer ».

## v5.1 — 2026-07-30

### Corrigé
- `src/app/navigation.ts` : `push()` ne remonte plus vers une occurrence antérieure du même écran dans la pile — cette clause anti-cycle tronquait les niveaux intermédiaires quand un écran sans paramètre différenciant (ex. `task-create-v2`) était réutilisé deux fois dans un même flux, cassant le retour contextuel (ex. depuis Aujourd'hui, la destination « Tâche du jour » n'était plus forcée après un second passage par la création). Détecté en validation manuelle de la Phase V5-0. Test de non-régression ajouté (`navigation.test.ts`).

### Validé
- Phase V5-0 (`roadmap_v5.0.md`) passée à `[FAIT]` : validation manuelle intégrale (points 83 à 100, `tests_manuels.md` purgé) — retours contextuels, non-régression Planning/Budget/Réglages/onboarding. Aucune régression fonctionnelle trouvée hors le bug de navigation ci-dessus.

### Constaté (non corrigé, tracé dans `roadmap_v5.0.md`)
- Réglage « Réduire les animations » (`E112Accessibility.tsx`) : mécanique correcte mais quasiment aucune animation à réduire dans l'interface actuelle. Angle mort produit, reporté hors V5.
- `exportData()` (`useSettingsState.ts`) lit la table `energyEntries` brute au lieu de passer par `EnergyEntryRepository` : `energy_entries[].value` sort non déchiffré dans l'export si le chiffrement local est activé. Bug isolé, hors périmètre V5-0, à corriger séparément.

## v5.0.0 — 2026-07-30

### Ajouté
- `src/app/navigation.ts` : pile de navigation et route porteuse de paramètres (`Route`, `NavStack`, `push`/`pop`/`replace`, `previousRoute`). Remplace l'union plate `Screen` à 23 valeurs comme source de vérité ; `Screen` reste exporté comme alias de `Route['name']`. 21 tests.
- `src/domain/rules/planningSlotRules.ts` : logique de calcul de créneaux extraite de `E40Planning.tsx` (`slotTime`, `slotLabel`, `slotFromDate`, `addDays`, `formatPlanningDate`, `isRangeAvailable`, `normalizeRange`, `moveTargetRange`). Prérequis de la fusion accueil/planning (Q8). 22 tests.
- `src/app/repositories.ts` : instances de repositories, `todayDate` et `newId` partagés par les contextes de domaine.
- `src/app/contexts/` : six modules d'état par domaine — `useTasksState` (tâches V1 et sous-tâches), `usePlanningState` (tâches V2, placement, déplacement), `useEnergyState`, `useListsState`, `useBudgetState`, `useSettingsState`.
- `goToPath(routes)` : empile un chemin de navigation complet, pour les écrans qui doivent retomber sur un parent qui n'est pas l'écran d'appel.

### Modifié
- `src/app/AppContext.tsx` : 961 → 169 lignes. Devient la façade qui compose les six domaines ; `useApp()` conserve la même surface, aucun écran n'a changé d'API. Aucun module d'état ne dépasse 300 lignes.
- `E40Planning.tsx` : branché sur `planningSlotRules`, helpers locaux dupliqués supprimés.

### Supprimé
- `taskCreateOrigin`, `taskDetailOrigin`, `listDetailOrigin` et leurs setters : les retours codés en dur sont remplacés par la pile (`back(fallback)`), l'origine étant dérivée via `originScreen`.

## v4.24 — 2026-07-28

### Modifié
- `roadmap_v5.0.md` : Q10 révisé, tranché directement avec l'utilisateur — abandon du glisser-déposer sur le planning au profit d'une fiche tâche cliquable (date, horaire, alerte, énergie éditables individuellement), alignée sur l'application de référence de la testeuse. Rend obsolètes la dette V4.1-6 (auto-scroll pendant drag) et la validation tactile du correctif de sélection de texte du 2026-07-25. Q2 résolu (« Sentiments » → « Météo du jour »), Q3 résolu (« joint » → « Comptage »), ordre de priorité des 5 outils reportés fixé (Comptage en premier).
- `a_communiquer_v5.md` (racine) : créé — synthèse finale à communiquer à la testeuse à la livraison de la V5.0 (envoi différé, décision explicite).

### Corrigé
- 7 fichiers de communication testeuse devenus obsolètes supprimés (questions déjà répondues dans des visios ultérieures, ou remplacées par `a_communiquer_v5.md`).

## v4.23 — 2026-07-28

### Ajouté
- `.claude/commands/analyse_visio.md` : commande corrigée en profondeur après échec constaté en exécution — appariement horodaté du `.jsonl` remplacé par un appariement ordinal par annonce vérifié image par image (le premier avait un retard cumulatif de ~20 min sur ce jeu de données) ; garde-fou d'intégrité systématisé ; étape d'arbitrage interactif ajoutée avant l'écriture de la roadmap ; lecture conditionnelle des documents non lisibles (`.docx`) ; étape finale d'archivage/promotion de roadmap.
- `roadmap_v5.0.md` (racine) : roadmap V5.0 issue de la visio testeuse du 2026-07-28 (`COMMUNICATION/Note de réunion/2026-07-28/`), 4 phases socle (V5-0 à V5-3), 7 arbitrages tranchés avec l'utilisateur. `COMMUNICATION/Note de réunion/2026-07-28/captures_2026-07-28.md`, `constats_2026-07-28.md`, `a_communiquer_2026-07-28.md` produits en amont.

### Modifié
- Branche `v5.0` créée depuis `v4.1`.
- `roadmap_v4.1.md` archivée (`Archives/roadmap_v4.1.md`).

## v4.22 — 2026-07-25

### Corrigé
- `E40Planning.tsx` : sélection de texte parasite du navigateur pendant le drag-and-drop d'une tâche (déclenchée par le long-press). `userSelect`/`touchAction: none` sur les cellules du planning, purge de la sélection au démarrage du drag, `userSelect: none` sur la page tant que le drag est actif. Correctif hors roadmap, signalé par l'utilisateur. 474/474 tests verts, `tsc -b` clean. Validation manuelle tactile à confirmer.

## v4.21 — 2026-07-25

### Ajouté
- Nav « + » contextuel (`App.tsx`) : pose désormais l'écran courant comme origin de création de tâche au lieu de `'dashboard'` en dur.
- `E21CreateTaskV2.tsx` : `effectiveDestination` généralisé via `FORCED_DESTINATION_BY_ORIGIN` (`inbox`/`tools`→`todo`, `today`→`today`, `planning`→`planned`, `lists`→`list`) ; depuis Listes, le « + » ouvre directement le sélecteur de liste (existante ou création d'une nouvelle liste) sans passer par le choix générique à 4 destinations.
- `E60Lists.tsx` : accent visuel (bordure gauche + fond teinté) sur une liste épinglée dans Outils, distinct du seul libellé du bouton.

### Validé
- Phase V4.1-5 (`roadmap_v4.1.md`) close. 474/474 tests unitaires au run de clôture, `tsc -b` clean, lint clean. Validation manuelle intégrale confirmée par l'utilisateur (`tests_manuels.md` points 74-82, purgés).

## v4.20 — 2026-07-25

### Corrigé
- Dette e2e du renommage nav Todo→Outils (Phase V4.1-0) : `02-tasks.spec.ts`, `06-offline.spec.ts`, `07-planning-v4.spec.ts` mis à jour (flux via hub Outils, suppression du clic sur le sélecteur de destination masqué depuis V4.1-0). Bug de test lié découvert en cascade : bouton Retour de `E20Inbox` pointant vers le hub Outils depuis V4.1-0 (au lieu du Dashboard), tâche déplacée invisible après Retour (T14) — assertion corrigée.

### Validé
- Cause des 10 échecs e2e confirmée unique (renommage nav, pas de régression fonctionnelle). Suite e2e complète 53/53 verte, suite unitaire 464/466 (flaky pré-existant `AppContext.test.tsx`, sans lien).

## v4.19 — 2026-07-25

### Ajouté
- Roadmap `roadmap_v4.1.md` : Phase V4.1-5 (ajout de tâche contextuel selon l'écran d'origine, distinction visuelle liste épinglée) et Phase V4.1-6 (auto-scroll vertical de la grille planning pendant un drag), toutes deux `[TODO]`.

### Validé
- Les 4 retours bruts de `bug et ameliorations.txt` triés et intégralement repris dans la roadmap — aucun écarté hors périmètre. Aucun code applicatif modifié cette session.

## v4.18 — 2026-07-25

### Modifié
- `outDir` de `vite.config.ts` corrigé (`dist/v3` → `dist/v4.1`, résidu de version), aligné sur la branche/version active.

### Validé
- Build de production régénéré avec succès (`tsc -b` + `vite build` + PWA) vers `dist/v4.1/`.

## v4.17 — 2026-07-25

### Modifié
- Refonte de lisibilité de l'écran Budget (`E71Budget.tsx`) sur retour utilisateur : hiérarchie visuelle renforcée (Restant avant Dépensé), reste non budgétisé mis en avant (gros chiffre coloré vert/rouge selon le signe), dépassement de budget signalé par la couleur du Restant de catégorie, boutons destructifs (Supprimer, Supprimer la dépense/le dépôt/le livret) distingués en rouge des actions neutres, accent visuel par période (pastille + bordure colorée, semaine/mois), formulaire de catégorie allégé (Type et Périodicité groupés).

### Corrigé
- Modales de confirmation de suppression (catégorie/livret) : le texte affichait encore « seront conservées » alors que la suppression est réellement en cascade depuis la correction d'intégrité précédente — corrigé pour refléter le comportement réel.

### Validé
- 465/466 tests unitaires (flaky pré-existant `AppContext.test.tsx`, sans lien), `tsc -b` clean, lint clean, build et e2e Budget 2/2 verts après adaptation des assertions au nouvel ordre Restant/Dépensé. Rendu visuel réel non vérifié en navigateur dans cette session.

## v4.16 — 2026-07-25

### Corrigé
- Intégrité relationnelle du Budget : migration Dexie v6 supprimant les dépôts/écritures orphelins issus d'une suppression de livret ou de catégorie ; `deleteBudgetCategory`/`deleteBudgetAccount` suppriment désormais en cascade les écritures/dépôts liés une fois la suppression confirmée.
- Périodicité des dépôts (`period: 'week' | 'month'`, sélecteur ajouté au formulaire) : un dépôt n'est plus déduit simultanément des vues semaine et mois ; existant migré vers `month`.
- Bouton de suppression d'une dépense libellé « Supprimer la dépense » (ambigu avec le bouton de suppression de la catégorie, relevé en validation manuelle).

### Modifié
- Script de lancement dev déplacé de `scripts/run_dev.py` vers `run.py` (racine), référence corrigée dans `llms.txt`.

### Validé
- Phase V4.1-4 close : validation manuelle intégrale des points 48 à 73 confirmée par l'utilisateur ; `tests_manuels.md` purgé de tous les points validés. Roadmap `roadmap_v4.1.md` intégralement terminée (V4.1-0 à V4.1-4). 466/466 tests unitaires verts (seul échec rencontré : le flaky pré-existant `AppContext.test.tsx`, sans lien), `tsc -b` clean, lint clean, e2e Budget 2/2 verts (nouveau scénario T53 sur la suppression en cascade).

## v4.15 — 2026-07-21

### Ajouté
- Phase V4.1-3 validée : configuration des catégories Budget et des livrets depuis `E71Budget`.
- Phase V4.1-4 implémentée : saisie et suppression des dépenses/dépôts, calcul des soldes, navigation dans l'historique semaine/mois et recalcul après correction.
- Parcours `tests_manuels.md`, tests unitaires Budget et scénario e2e `e2e/08-tools-budget.spec.ts`.

### Corrigé
- Actions de suppression rendues explicites dans les livrets : « Supprimer le dépôt » et « Supprimer le livret ».
- État React rechargé depuis Dexie après suppression directe d'une dépense ou d'un dépôt.

### Validé
- Phase V4.1-3 validée manuellement ; Phase V4.1-4 validée jusqu'au point 47. Tests Budget ciblés, build, lint et e2e Budget verts.

### En attente
- Phase V4.1-4 non close : les dépôts d'un livret supprimé deviennent orphelins, invisibles mais encore comptés. Migration de réparation, suppressions en cascade et périodicité des dépôts à implémenter avant la reprise au point 48.
- Suite Vitest complète : un échec intermittent pré-existant dans `AppContext.test.tsx`.

## v4.14 — 2026-07-21

### Ajouté
- Phase V4.1-2 codée : quatre entités et tables Budget, migration Dexie v4→v5, quatre repositories et règles pures pour les périodes, catégories, totaux, reste non budgétisé et soldes des livrets.
- Tests de migration d'une base v4 existante, des repositories et des règles Budget : 27/27 verts.

### Corrigé
- `E61ListDetail` : `getListItems` stabilisé et déclaré dans les dépendances du `useEffect`, supprimant l'avertissement lint.

### Validé
- Build et lint verts. Suite complète à 454/455 avec un échec intermittent pré-existant dans `AppContext.test.tsx`, sans lien avec la Phase V4.1-2.

## v4.13 — 2026-07-21

### Ajouté
- Phase V4.1-1 codée : champ `pinned_to_tools?` sur `List`, règle `togglePinList`, bouton épingler/désépingler sur `E60Lists.tsx`, section « Listes épinglées » sur le hub `E70Tools.tsx`, retour contextuel de `E61ListDetail` (`listDetailOrigin`).

### Validé
- Phase V4.1-1 validée manuellement par l'utilisateur. 433/435 tests unitaires verts (2 échecs pré-existants sans lien), `tsc -b` clean.

## v4.12 — 2026-07-21

### Ajouté
- Phase V4.1-0 codée : nouvel écran hub `E70Tools.tsx` (screen `'tools'`), onglet nav « Todo » renommé « Outils », `E20Inbox` accessible depuis le hub avec retour vers celui-ci.

### Corrigé
- `E21CreateTaskV2` : depuis Todo, le choix de destination (Todo/Tâche du jour/Planifier/Liste) n'a plus de sens et n'est plus affiché — la tâche est créée directement dans Todo.

### Validé
- Phase V4.1-0 validée manuellement par l'utilisateur. 427 tests unitaires verts, `tsc -b` clean.

## v4.11 — 2026-07-21

### Ajouté
- `roadmap_v4.1.md` créée à la racine (5 phases V4.1-0 à V4.1-4) : cadrage complet d'E3 — rubrique nav « Outils » remplaçant « Todo » (Todo tel quel, listes épinglables, module Budget semaine/mois avec catégories, revenus multiples, livrets simples, reste non budgétisé).

### Décidé
- Nav « Outils » (pluriel) ; onglet Listes conservé, listes épinglables dans Outils plutôt que dupliquées. Budget : périodicités semaine/mois, reset auto par période avec historique conservé, données en clair (cohérent avec le reste du modèle non chiffré). Hors périmètre V4.1 : intégration accueil, date butoir Todo, liste courses spécialisée, virements livrets.

## v4.10 — 2026-07-21

### Modifié
- Ménage complet de la racine du projet (8 points validés par l'utilisateur) : `docs/adr/` fusionné dans `_docs/adr/`, scripts regroupés dans `scripts/`, `SERVEURS.md` fusionné dans `README.md`, `validation_manuelle.md` archivé, `Retours/` fusionné dans `COMMUNICATION/Note de réunion/`, `dist/v1`/`dist/v2` supprimés (`dist/v3` conservée), `.gitignore` ignore `dist/` entier.
- `roadmap_v4.md` archivé (`Archives/roadmap_v4.md`) — plus aucune roadmap active à la racine.

### Ajouté
- Branche `v4.1` créée depuis `v4` et activée.

## v4.9 — 2026-07-21

### Validé
- V2-10 (doc V2, déploiement Netlify, branche `v2`) confirmée terminée par l'utilisateur — roadmap V2 intégralement close.

## v4.8 — 2026-07-21

### Validé
- Point 1.5 de `validation_manuelle.md` (bouton « Renommer » une sous-étape depuis E22) validé par l'utilisateur.
- Phase V4-5 close. Roadmap V4 intégralement terminée (V4-0 à V4-5).

## v4.7 — 2026-07-19

### Ajouté
- Phase V4-5 codée : sous-tâches planifiables (E9a modèle de données, E9b affichage hiérarchique, E9c point d'entrée « Planifier »), avec parité complète d'interactions (glisser, menu déplacer/renommer/supprimer, report) entre tâche et sous-tâche planifiées, sur demande explicite de l'utilisateur.
- Bouton « Renommer » une sous-étape ajouté sur l'écran de détail de tâche (E22), sur retour utilisateur en cours de validation manuelle.

### Modifié
- `SubTask` reste rattachée à sa tâche parente (pas de promotion en `TaskV2` indépendante), conforme à la décision E9 du 2026-07-18 — migration Dexie v3→v4.
- `E40Planning.tsx` réécrit autour d'un type union `PlanBlock` (tâche/sous-tâche) pour porter la parité d'interactions sans dupliquer la logique de glisser/menu/report.

### Validé
- 422/422 tests unitaires, `tsc -b` clean, eslint 0 erreur, 51/51 e2e (T51 nouveau). Validation manuelle quasi close (1.1-1.4, 2.1-2.3, 3.1-3.6 confirmés) ; point 1.5 (renommer depuis E22) en attente.

## v4.6 — 2026-07-19

### Ajouté
- Phase V4-4 codée : menu déplacer/renommer/supprimer sur une tâche planifiée (E6), glisser souris/tactile avec lecture directe de la case sous le curseur et zones de bord pour changer de jour (E1), report vers un créneau choisi (E8).
- E6 (« Déplacer ») et E8 (« Reporter ») unifiés sur le flux « tâche en main » (bandeau, navigation libre entre les jours) au lieu d'une modale de liste de créneaux — retirée sur demande de l'utilisateur.

### Corrigé
- `E40Planning.tsx` : `reload()` rechargeait le mauvais jour après une bascule pendant un glisser en cours (closure figée dans un écouteur `window` de longue durée) — corrigé via une ref toujours à jour.

### Validé
- Tous les points de `validation_manuelle.md` V4-4 passés. 403/403 tests unitaires, `tsc -b` clean, 50/50 e2e. Phase V4-4 close ; roadmap V4 passe à la Phase V4-5.

## v4.5 — 2026-07-19

### Corrigé
- Validation manuelle V4-3 close : bandeau « tâche en cours de planification » repositionné en fixe au-dessus du bouton « Ajouter une tâche » (`E40Planning.tsx`), espace ajouté entre le nom de tâche et l'icône batterie sur la carte « Planning du jour » (`E10Dashboard.tsx`).
- `--bottomnav-h` mesuré dynamiquement via `ResizeObserver` (`BottomNav.tsx`) au lieu d'une constante CSS figée — supprime un interstice de grille de planning visible sous le bandeau.

### Validé
- Tous les points de `validation_manuelle.md` V4-3 passés, dont B2. 386/386 tests unitaires, `tsc -b` clean, 47/47 e2e. Phase V4-3 close ; roadmap V4 passe à la Phase V4-4.

## v4.4 — 2026-07-19

### Modifié
- V4-3 codée : plages multi-créneaux, tâche active replaçable, retrait de « Répéter demain » et modale énergie/obligatoire fusionnée.
- Gates automatisés mis à jour : 386/386 tests unitaires et 47/47 e2e verts.

### En attente
- Validation manuelle V4-3 à passer avant la clôture de la phase.

## v4.3 — 2026-07-19

### Corrigé
- Phase V4-1 clôturée : retour vers l'écran d'origine après création de tâche et modale d'explication du mode surcharge.
- Phase V4-2 clôturée : créneaux colorés, coche réversible sur les tâches planifiées et conservation des tâches terminées.

### Validé
- 388/388 tests unitaires, build TypeScript, 45/45 tests e2e et validation manuelle complète.

## v4.2 — 2026-07-19

### Ajouté
- Phase V4-1 (Quick wins UI) codée : D2 (libellés check-in « aujourd'hui » → « maintenant » sur `E31EnergyCheckIn.tsx`, `E03Energy.tsx`, `E30EnergyView.tsx`), E7 (bouton « Mode surcharge » de la TopBar rendu permanent, grisé hors surcharge / coloré actif, cliquable dans les deux états), D4 (l'ajout de tâche depuis Todo ne propose plus la destination « Planifier », via nouveau state `taskCreateOrigin` dans `AppContext.tsx`). 383/383 tests, `tsc -b` clean.
- E2, E8, E9 tranchés avec l'utilisateur (chevauchement de plage bloquant, coût énergétique compté une fois par tâche, choix de créneau au lieu de report automatique, sous-tâche rattachée au parent).

### Corrigé (à faire)
- B3 : le retour depuis l'écran de création de tâche (`E21CreateTaskV2.tsx`) ramène toujours vers Todo au lieu de l'écran d'origine — ajouté à la Phase V4-1, non corrigé cette session.
- B4 : le bouton « Mode surcharge » doit ouvrir une modale d'explication détaillée (bouton Fermer) au lieu du texte inline actuellement codé — ajouté à la Phase V4-1, non corrigé cette session.

## v4.1 — 2026-07-18

### Ajouté
- Phase V4-0 (refacto préalable) codée et validée manuellement (`validation_manuelle.md`, 20/20 points) : `taskSlotRange`/`taskOccupiesSlot` (`taskRulesV2.ts`) pour l'occupation du planning par plage de créneaux ; variable CSS `--color-accent` injectée depuis `Settings.ambiance_color`.
- B1 tranché (périmètre large) et codé : la couleur d'ambiance s'applique à tous les boutons utilisant le bleu clair de base (`Button`, `BottomNav`, `E120Resources`, `E31EnergyCheckIn`, `E03Energy`, `E21CreateTaskV2`, `E40Planning`).

## v4.0 — 2026-07-18

### Contexte
Bascule vers roadmap V4 — voir `roadmap_v4.md`. `roadmap_v3.md` (7 phases, intégralement close) archivé dans `Archives/`.

### Ajouté
- Analyse de la visio Marie du 2026-07-16 : `COMMUNICATION/Note de réunion/2026-07-16/constats_2026-07-18.md` (17 constats). Répond aux 4 points V3 en attente (Reporter, fréquence check-in, bouton surcharge, sous-tâches).
- Roadmap V4 (`roadmap_v4.md`, racine, 6 phases V4-0 à V4-5), supersédant le brouillon du 2026-07-13 — ordre des phases revu (multi-créneaux/récurrence avant interactions sur une tâche), retrait de « Répéter demain » regroupé avec son remplaçant. Aucune phase codée.
- Branche `v4` créée depuis `v3` et activée.

## v3.16 — 2026-07-13

### Ajouté
- Analyse de la visio Marie du 2026-07-13 (écourtée) : `COMMUNICATION/Note de réunion/2026-07-13/constats_2026-07-13.md` (7 constats) et `COMMUNICATION/Note de réunion/2026-07-13/roadmap_v4.md` (brouillon, 4 phases) — non promue à la racine, aucun code touché.

## v3.15 — 2026-07-09

### Corrigé
- Tests e2e Playwright : T19 supprimé (`e2e/02-tasks.spec.ts`) — testait la limite « 3 tâches/jour » retirée intentionnellement en V3-1, confirmé non-régression. 44/44 verts.

### Ajouté
- Icône batterie ajoutée au pill énergie du Dashboard/TopBar (`EnergyDisplay.tsx`), affichée uniquement quand une valeur d'énergie est saisie.

### Modifié
- Modale de planification (E1/E2, `E40Planning.tsx`) refondue en flux 3 étapes séquentielles : nom de la tâche (Valider) → grille de sélection d'énergie 1-12 (option Passer) → choix « Obligatoire ? » via deux boutons Oui/Non à finalisation directe (sans bouton de validation supplémentaire).
- `vite.config.ts` : `build.outDir` basculé de `dist/v2` à `dist/v3` pour préserver le rollback V2 ; `dist/v3/` ajouté au `.gitignore` (régénérable via `npm run build`).
- `roadmap_v3.md` : Q3 (couleur à la connexion) et « reset données » cochés — décisions déjà actées, roadmap mise à jour en conséquence.

### Validé
- Test manuel 13.2 (mode offline) validé sur le build `dist/v3`.
- 29/29 tests `E40Planning.test.tsx`, 44/44 e2e, `tsc -b` clean.

## v3.14 — 2026-07-07

### Corrigé
- Tests e2e Playwright remis en état (`e2e/`) : cause élargie au-delà du signal initial (écran `E04FirstTask` supprimé depuis V3-1) à 4 dérives cumulées — titre Dashboard obsolète (`Appli pour AuDHD` → `AuDHD`, 6 fichiers), bouton « Ajouter une tâche » dupliqué (BottomNav persistante V3-6 + bouton propre à `E20Inbox.tsx`) causant des violations de mode strict Playwright, `aria-label` de déplacement passé de « Aujourd'hui » à « Tâche du jour » (V3-1), mode surcharge devenu 100% automatique depuis V3-3 (plus de bouton manuel). `e2e/05-overload.spec.ts` réécrit intégralement pour déclencher/désactiver la surcharge via le mécanisme automatique réel. Corrigé côté tests uniquement, aucun changement de code applicatif.

### Validé
- 44/45 tests e2e verts. T19 (`02-tasks.spec.ts`) reste en échec sciemment : teste la limite « 3 tâches/jour » retirée intentionnellement en V3-1 (décision Q1, confirmée via `_contexte/archive_decisions.md`) — suppression du test à faire en session suivante, pas une régression.

## v3.13 — 2026-07-07

### Modifié
- Bouton « Mode surcharge désactivé » de la TopBar retiré hors surcharge (`TopBar.tsx`) — n'apparaît plus que quand la surcharge est active. Écart assumé avec une demande explicite antérieure de Marie (bouton visible, grisé, informatif hors surcharge) ; point ajouté à `COMMUNICATION/Note de réunion/a demander a Marie.md` pour reconfirmation.

### Validé
- 29/29 tests (`E10Dashboard.test.tsx`) verts, `tsc -b` clean.

## v3.12 — 2026-07-07

### Corrigé
- Espacement des créneaux du Planning (`E40Planning.tsx`) rendu symétrique : suppression du `minHeight` fixe (64px) qui créait un espace plus grand en bas qu'en haut autour de la case de tâche. Les créneaux occupés s'ajustent désormais à leur contenu réel, les créneaux vides sont alignés sur la même hauteur via un placeholder invisible (`emptySlotPlaceholderStyle`) plutôt qu'une valeur en dur.

### Validé
- 29/29 tests (`E40Planning.test.tsx`) verts, `tsc -b` clean. Changement visuel mineur hors gate de phase — pas de test manuel dédié.

## v3.11 — 2026-07-07

### Modifié
- Titre du Dashboard renommé "Appli pour AuDHD" → "AuDHD" (`E10Dashboard.tsx`).
- Symbole d'énergie changé de cuillères à batterie à la demande de l'utilisateur (moins connoté spoon theory) : `SpoonIcon`/`SpoonCost` supprimés, remplacés par `BatteryIcon`/`BatteryCost` (`src/ui/components/`). Câblé sur le Dashboard et le Planning (remplacement direct), et ajouté aux 3 écrans de check énergie (`E03Energy.tsx`, `E31EnergyCheckIn.tsx`, `E30EnergyView.tsx`) qui n'affichaient aucun symbole auparavant.

### Validé
- 374/374 tests unitaires verts, `tsc -b` clean. Changement visuel mineur hors gate de phase (roadmap V3 déjà close) — pas de test manuel dédié.

## v3.10 — 2026-07-07

### Ajouté
- Phase V3-6 (nav persistante, N1) codée intégralement : `BottomNav` monté une seule fois dans `App.tsx` en position fixe (bottom), affiché sur tous les écrans sauf l'onboarding (`welcome`/`profile`/`energy`) et le check-in énergie quotidien (`energy-checkin`) ; onglet actif mis en valeur (`activeTabFor`), pastille rouge Todo conservée, 4ᵉ onglet « Accueil » ajouté pour revenir au Dashboard depuis n'importe quel écran.
- `--bottomnav-h` (`index.css`) et `padding-bottom` réservé sur 17 écrans pour qu'aucun contenu ne soit caché derrière la nav fixe.
- `plan_test_manuel_v3-6.md` : plan de test manuel (5 sections), passé intégralement le 2026-07-07.
- `src/ui/components/BottomNav.test.tsx` et `src/App.test.tsx` : nouveaux tests (nav directe sur le composant, mapping écran → onglet, montage global).

### Modifié
- `E10Dashboard.tsx` : retrait du montage local de `BottomNav` (désormais global).
- Tests de nav obsolètes de `E10Dashboard.test.tsx` migrés vers `BottomNav.test.tsx`/`App.test.tsx`.

### Validé
- **Phase V3-6 close, roadmap V3 (7 phases, V3-0 à V3-6) intégralement close** : gate intégral (374/374 tests, `tsc -b` clean, eslint 0 erreur, test manuel, doc).

### Reporté
- Comportement de l'action « Reporter », fréquence du check-in énergie et rythme du bouton « Répéter demain » : à reconfirmer avec Marie — consigné dans `COMMUNICATION/Note de réunion/a demander a Marie.md` et `_contexte/signals.md`.
- V2-10 (mode offline, doc V2, déploiement Netlify) : reste en suspens sur la branche `v2`.

## v3.9 — 2026-07-07

### Ajouté
- Phase V3-5 (Listes) codée intégralement : hiérarchie visuelle entre la vue globale des listes (`E60Lists.tsx`, grosses cases, inchangée) et l'intérieur d'une liste (`E61ListDetail.tsx`, cases resserrées — padding `--spacing-xs`, radius `--radius-sm`) (L1, L2) ; titre de la liste encadré du même style que les lignes de la vue globale (L3).
- `plan_test_manuel_v3-5.md` : plan de test manuel (3 sections), passé intégralement le 2026-07-07.

### Corrigé
- `E03Energy.tsx` (onboarding) : échelle d'énergie corrigée de 1-10 à 1-12 (`ENERGY_MIN`/`ENERGY_MAX`), cohérente avec `E31EnergyCheckIn.tsx`.
- Affichage des valeurs d'énergie sur deux lignes fixes de 6 dans `E03Energy.tsx` et `E31EnergyCheckIn.tsx` (au lieu du `flexWrap` libre dépendant de la largeur d'écran).

### Validé
- **Phase V3-5 close** : gate intégral (367/367 tests, `tsc -b` clean, eslint 0 erreur, test manuel, doc).

### Reporté
- Rythme du bouton « Répéter demain », comportement de l'action « Reporter » et fréquence du check-in énergie : à reconfirmer avec Marie — consigné dans `COMMUNICATION/Note de réunion/a demander a Marie.md` et `_contexte/signals.md`.

### Supprimé
- `plan_test_manuel_v3-4.md` (nettoyage intentionnel, phase déjà close).

## v3.8 — 2026-07-07

### Ajouté
- Phase V3-4 (Planning : cuillères, couleurs, récurrence) codée intégralement : composant cuillères sobre (`SpoonIcon.tsx`, `SpoonCost.tsx`), coût affiché en cuillères sur le planning (E7/E8) ; texte des cases agrandi et centré (P1) ; bouton « Terminer » ajouté au Planning, cases pastel quand une tâche est placée (P2) ; couleur d'ambiance configurable (`Settings.ambiance_color`, sélecteur dans Accessibilité, `src/ui/styles/ambiance.ts`) pilotant les teintes pastel/flashy (P3) ; tâche terminée en version flashy de la couleur d'ambiance (P4b) ; « Planning du jour » du Dashboard en cartes pastel comme « Tâche du jour » (D5).
- Récurrence (P6) : bouton « Répéter demain » sur chaque tâche planifiée (Planning et Dashboard) — `duplicateTaskV2ToNextDay` (`taskRulesV2.ts`), `repeatTaskTomorrow` (`AppContext.tsx`). Duplique la tâche au lendemain, même créneau, et ouvre directement le jour du duplicata (`planningTargetDate`/`setPlanningTargetDate`, AppContext).
- `plan_test_manuel_v3-4.md` : plan de test manuel (5 sections), passé intégralement le 2026-07-07.

### Validé
- **Phase V3-4 close** : gate intégral (367/367 tests, `tsc -b` clean, eslint 0 erreur, test manuel, doc).

### Corrigé
- P6 : une première version (avance automatique au jour suivant après chaque tâche planifiée, sans bouton dédié) a été testée manuellement et invalidée — elle masquait la tâche qu'on venait de placer, lue comme un bug. Remplacée par le bouton explicite « Répéter demain » ci-dessus.

### Reporté
- Rythme du bouton « Répéter demain » (1 clic par jour), comportement de l'action « Reporter » et fréquence du check-in énergie : à reconfirmer avec Marie — consigné dans `COMMUNICATION/Note de réunion/a demander a Marie.md` et `_contexte/signals.md`.

### Supprimé
- `plan_test_manuel_v3-3.md` (nettoyage intentionnel, phase déjà close).

## v3.7 — 2026-07-07

### Ajouté
- Action « Reporter » (Phase V3-3, E6) : `postponeTaskV2` (`taskRulesV2.ts`) et `postponeTask` (`AppContext.tsx`) replanifient automatiquement une tâche non-obligatoire grisée au lendemain, même créneau horaire ; bouton « Reporter » dans `E10Dashboard.tsx` et `E40Planning.tsx`. Décision provisoire, non validée par Marie sur ce mécanisme précis.
- `plan_test_manuel_v3-3.md` : plan de test manuel (5 sections), passé intégralement le 2026-07-07.

### Validé
- **Phase V3-3 close** : gate intégral (353/353 tests, `tsc -b` clean, eslint 0 erreur, test manuel, doc). Navigation restreinte au Dashboard/Centre récupération en mode surcharge confirmée intentionnelle par l'utilisateur (initialement suspectée à tort comme un bug bloquant, vérifiée puis levée).

### Reporté
- Comportement de l'action « Reporter » et fréquence du check-in énergie (une fois/jour vs chaque ouverture) : à reconfirmer avec Marie — consigné dans `COMMUNICATION/Note de réunion/a demander a Marie.md`.

### Supprimé
- `plan_test_manuel_v3-1.md`, `plan_test_manuel_v3-2.md` (nettoyage intentionnel, phases déjà closes).

## v3.6 — 2026-07-07

### Ajouté
- Phase V3-3 (check-in + surcharge automatique) codée : `overloadMode` (AppContext) désormais 100% dérivé (`isOverloaded` sur énergie du jour vs coût planifié restant, `todayPlannedTasks`/`refreshTodayPlanned`) — plus de toggle manuel. Check-in énergie routé automatiquement à l'ouverture si aucune saisie du jour, échelle corrigée 1-10 → 1-12. Bouton TopBar devenu informatif (détail chiffré au clic). "Planning du jour" reste visible en surcharge (obligatoires en pastel, non-obligatoires grisées), résout l'effet de bord D1 en attente depuis V3-1. 341/341 tests unitaires, `tsc -b` clean, `eslint` 0 erreur.

### Modifié
- `src/domain/entities/settings.ts` : champ `overload_mode` retiré (mort, remplacé par la dérivation automatique)
- `src/ui/screens/overload/E90OverloadRecovery.tsx`, `src/ui/components/BottomNav.tsx` : boutons de désactivation manuelle devenus invalides, remplacés par une navigation retour

### Reporté
- Action « Reporter » sur les tâches non-obligatoires grisées en surcharge (E6) : décision explicitement laissée ouverte à la demande de l'utilisateur, à trancher en session suivante.

## v3.5 — 2026-07-07

### Validé
- Test manuel de la Phase V3-2 passé intégralement (tous cas OK) — gate de phase clos.

## v3.4 — 2026-07-07

### Ajouté
- Phase V3-2 (énergie : domaine + saisie) codée intégralement : `getRemainingPlannedCost` et `setEnergyCostV2` (`taskRulesV2.ts`, purs), fenêtre à deux carrés (sélecteur d'énergie 1-12 + case « obligatoire ») dans `E40Planning.tsx` au moment de l'assignation à un créneau, `essential` câblé via `toggleEssentialV2` existant (ferme le trou fonctionnel V2-10), affichage minimal du coût sur les cases du Planning et du Dashboard. 342/342 tests unitaires, `tsc -b` clean, `eslint` 0 erreur.
- `plan_test_manuel_v3-2.md` : plan de test manuel dédié à la Phase V3-2 (4 sections).

### Modifié
- `AppContext.tsx` : `schedulePendingTask` étend sa signature (`energyCost`, `essential`) pour persister le coût en énergie et le caractère obligatoire à la création d'une tâche planifiée.

## v3.3 — 2026-07-07

### Validé
- Test manuel de la Phase V3-1 passé intégralement (27/27 cas OK) — gate de phase clos.
- Point mode surcharge sans tâche visible (effet de bord D1) explicitement reporté à la Phase V3-3.

## v3.2 — 2026-07-06

### Ajouté
- Phase V3-1 (bugs + nettoyage UI) codée intégralement : B1 (plus de tâche `planned` fantôme non schedulée en cas d'abandon de la planification), B2 (contraste des cases du Planning en thème clair), B3 (vérifié non reproductible), D1 (bloc "Que faire maintenant ?" retiré), D2 (question "chose la plus importante" retirée de l'onboarding), D3 (section "Tâche du jour" réordonnée au-dessus de "Planning du jour", police agrandie), D4/D4b (segment de nav "Aujourd'hui" retiré, destination de création renommée "Tâche du jour"), P4a (tâche planifiée terminée reste affichée), P5 (case vide du Planning propose d'ajouter une tâche directement plutôt qu'une liste de backlog), Q1 (limite de 3 tâches du jour et modale associée retirées). 330/330 tests unitaires, `tsc -b` clean, `eslint` 0 erreur.
- `plan_test_manuel_v3-1.md` : plan de test manuel dédié à la Phase V3-1 (27 cas).

### Modifié
- `AppContext.tsx` : `pendingPlanTask`/`startPlanTask`/`clearPendingPlanTask`/`schedulePendingTask` remplacent `planTodoTask`/`getUnscheduledPlannedTasks` — une tâche en cours de planification n'est plus persistée avant qu'un créneau soit validé (fix B1).

### Retiré
- Écran `E04FirstTask` et `actionImmediateRules.ts` (devenus morts après D1/D2).

## v3.1 — 2026-07-06

### Ajouté
- Phase V3-0 (refacto préalable) close : constantes/schéma énergie (`ENERGY_MIN`/`ENERGY_MAX`, Dexie v3 `energy_cost`/`ambiance_color`/`energy_max`), composant `EnergyDisplay`, extraction `AppShell`/`BottomNav`, sélecteur pur `isOverloaded`. Aucun changement de comportement visible, validé par test manuel utilisateur. 353/353 tests verts, `tsc -b` clean.

### Modifié
- Commande `/analyse_visio` : ajoute un rappel de bascule sur le modèle Opus avant toute phase de refacto générée dans une roadmap (dont la phase 0).

## v3.0 — 2026-07-06

### Contexte
- Bascule vers la roadmap V3 (`roadmap_v3.md`, racine) — succède à `roadmap_v2.md` (archivée dans `Archives/`). Branche git `v3` créée à partir de `v2`.

### Décidé
- Q1 tranché avec Marie : suppression de la limite de 3 tâches/jour.
- Q2 tranché : retirer le segment nav "Aujourd'hui" du dashboard sans remplacement, et renommer l'option de création "Aujourd'hui" en "Tâche du jour".
- Stratégie de reset des données V2 tranchée : Marie accepte le reset, pas de migration nécessaire au bump Dexie v3.

## v2.1 — 2026-07-06

### Modifié
- Commande `/analyse_visio` réécrite : 2 fichiers de sortie (constats + roadmap) au lieu de 4, règle de non-duplication (analyse code portée sur les items de roadmap plutôt qu'en fichier séparé), gate compact en une ligne par phase.
- `roadmap_v3.md` régénérée au nouveau format : 7 phases (V3-0 à V3-6) au lieu de 10, contenu identique.

## v2.0 — 2026-07-06

### Contexte
- Versioning du CHANGELOG réaligné sur la version produit (roadmap) au lieu d'un compteur `v0.x` indépendant qui prêtait à confusion avec V1/V2/V3. Major = numéro de la roadmap active à la racine (`roadmap_v2.md` → major 2) ; minor incrémenté à chaque `/close`, remis à 0 au passage à une roadmap majeure suivante (V3). Les entrées `v0.x` ci-dessous restent inchangées (historique non réécrit).

### Ajouté
- Commande `/analyse_visio <dossier-réunion>` (`.claude/commands/analyse_visio.md`) : automatise l'analyse d'une visio testeur (transcription + captures + code) et génère constats, analyse de code, plan d'implémentation et roadmap versionnée (bump auto du numéro de version, format à cases à cocher).
- Roadmap V3 (`COMMUNICATION/Note de réunion/2026-06-07/roadmap_v3.md`) créée à partir de la visio Marie du 2026-07-06 : refonte énergie (coût par tâche, "cuillères"), tâches obligatoires, surcharge automatique, nettoyage dashboard/planning/listes, navigation persistante. 10 phases, aucune démarrée.

## v0.44 — 2026-07-06

### Corrigé
- Export JSON (RGPD) incomplet — `exportData` omettait les tables V2 (`tasksV2`, `lists`, `listItems`), en contradiction avec la mention "intégralité de vos données". Corrigé, version export passée à `2.0`.

### Modifié
- Planning : granularité des créneaux passée d'1h à 30 min (48 créneaux) ; durée par défaut à l'assignation ramenée à 30 min.
- `vite.config.ts` : `build.outDir` fixé à `dist/v2` (au lieu de sortir dans `dist/` racine).

### Validé
- E2e relancés après les changements onboarding : 45/45, aucune régression.
- Test manuel 11.5 (export des données sur iPhone) validé.

## v0.43 — 2026-07-06

### Ajouté
- Contexte complet de la question énergie consigné pour la prochaine réunion Marie (`COMMUNICATION/Note de réunion/a traiter prochaine reunion.txt`).

### Modifié
- Tests manuels 2.4, 2.6, 6.7, 6.10, 7.3, mode sombre et 11.2 validés (`roadmap_v2.md`).

### Décidé
- Profil (`E111Profile`) : reste en lecture seule, aucune modification à implémenter.
- Énergie : décision non tranchée en interne, remontée à Marie pour retour.

### Supprimé
- Section "Stimulation cognitive" des Paramètres retirée intégralement (écran `E113Stimulation`, entrée menu, champ `Settings.stimulation_mode`, CSS `data-stimulation`).

## v0.42 — 2026-07-06

### Corrigé
- Conflit de créneau dans Planning : le clic sur un créneau déjà occupé ouvrait à tort le déplacement de l'autre tâche au lieu de refuser la tâche en attente ; message de refus affiché en modale plutôt qu'en bannière.
- Libellés du profil (`E111Profile`) : correspondaient à d'anciennes valeurs (`audhd`/`asd`/`adhd`) au lieu des vraies valeurs `ProfileType` (`teenager`/`student`/`adult`), affichant une valeur brute non traduite.

### Ajouté
- Écran détail tâche (`E22TaskDetail`) : actions "Aujourd'hui", "Planifier" et "Liste", cohérentes avec l'écran Todo.
- Navigation directe vers le détail de la liste après y avoir ajouté une tâche (Todo, création de tâche, détail tâche).
- Écran Aujourd'hui : bouton "Ajouter une tâche".
- Dashboard, section "Planning du jour" : bouton "Terminer" par tâche (la tâche terminée sort de la liste).
- Listes : renommage et suppression (avec confirmation).
- Planning : grille horaire étendue à 24h (0h-23h) au lieu de 6h-22h.

### Modifié
- Dashboard : message d'état vide de l'action immédiate remplacé par "Rien à faire aujourd'hui" quand Aujourd'hui est vide.

### Supprimé
- Section "Organisation" des Paramètres et écran `E114Organisation` retirés intégralement.
- Icône Planning de la TopBar retirée (redondante avec la nav segmentée du Dashboard).

---

## v0.41 — 2026-07-06

### Corrigé
- Tri de la section "Planning du jour" (Dashboard) par `scheduled_start`.
- Création de liste depuis le sélecteur "Ajouter à une liste" (Todo et création de tâche) : la tâche est désormais rattachée à la liste nouvellement créée, directement dans la modale.
- Détection de conflit de créneau dans Planning : placement/déplacement d'une tâche sur un créneau déjà occupé refusé avec message explicite (décision produit actée).
- Perte silencieuse des sous-tâches lors de la conversion Todo → Planifier/Liste : avertissement de confirmation ajouté avant la conversion.

### Ajouté
- Roadmap : section "Fonctionnalité reportée" pour la planification indépendante des sous-tâches, décision explicitement différée.

---

## v0.40 — 2026-07-06

### Modifié
- Onboarding : un utilisateur qui quitte l'app avant d'atteindre le dashboard repart de zéro à la prochaine ouverture (`User.onboarding_completed`, `completeOnboarding`) au lieu de reprendre directement sur le dashboard.
- Écran de choix de profil (`E02Profile`) : bouton "Ignorer" retiré, sélection d'un profil désormais obligatoire.

### Ajouté
- Plan de test manuel V2 (`plan_test_manuel_v2.md`) : 13 sections, ~65 cas, basé sur les écrans réellement implémentés.

### Corrigé
- Écarts constatés lors du passage du plan de test consolidés dans `roadmap_v2.md` § "Constats test manuel V2-10" : 4 bugs confirmés (tri "Planning du jour", rattachement de tâche à la création de liste, absence de détection de conflit de créneau, perte de sous-tâches à la conversion Todo→Planifier/Liste), 2 décisions produit à prendre, 4 fonctionnalités manquantes, 2 demandes de nettoyage UI, 10 points à retester.

---

## v0.39 — 2026-07-05

### Modifié
- Mode surcharge du Dashboard rendu minimaliste : masquage des icônes TopBar (Planning/Ressources/Paramètres), du chip énergie, du bouton "Ajouter une tâche", de la nav segmentée et des sections "Planning du jour"/"Tâches du jour" quand le mode surcharge est actif.

### Ajouté
- Bouton "Sortir du mode surcharge" en pied de page du Dashboard, même style que le bouton actif en haut.

### Corrigé
- Filtre mort `essential` sur le planning du jour supprimé (il n'était jamais atteignable, `toggleEssentialV2` n'étant câblée nulle part dans l'UI).

---

## v0.38 — 2026-07-05

### Corrigé
- E2E `05-overload.spec.ts` (T40/T44/T45) : assertions réécrites pour matcher le bandeau surcharge réel (`<p>Mode surcharge actif</p>`) au lieu d'un `heading` inexistant. 45/45 e2e passent désormais, aucune régression sur les changements récents.

### Modifié
- Réorganisation des dossiers de build à la racine : `dist_v1/` fusionné dans `dist/` — `dist/v1/` (versionné, rollback V1) et `dist/v2/` (ignoré Git, régénérable via `npm run build`).

---

## v0.37 — 2026-07-05

### Modifié
- Écran de création de tâche (`E21CreateTaskV2`) : destination "À planifier plus tard" remplacée par "Mettre dans une liste" (ouvre un sélecteur de liste, crée un `ListItem`).

### Ajouté
- Écran de création de tâche : destination "Aujourd'hui" (crée directement une tâche du jour, avec la même règle de remplacement à 3 tâches que sur l'écran Todo).

### Corrigé
- Statut `to_plan` (TaskV2) retiré du domaine — il n'avait plus aucune voie de création après le point ci-dessus, ce qui rendait mort l'écran `E50ToPlanQueue`, la pastille "Tâches à planifier" du dashboard et `moveTaskToLaterV2`. Tout retiré proprement (décision de nettoyage validée).

---

## v0.36 — 2026-07-03

### Corrigé
- Bug racine SubTask : `toggleSubTask` n'était appelée nulle part dans l'UI — aucune sous-tâche ne pouvait jamais être marquée terminée, ce qui bloquait le badge "X/Y" du Dashboard à "0/Y" et empêchait "Prochaine étape" d'avancer. Checkbox fonctionnelle ajoutée dans `E22TaskDetail`/`E23Decompose`.

### Ajouté
- Badge de progression "X/Y" des sous-tâches sur `E20Inbox` (Todo) et `E24Today` (Aujourd'hui), en plus du Dashboard.
- "Prochaine étape : {titre}" affichée sur `E24Today`, comme sur le Dashboard.

### Modifié
- `E24Today` : bouton "Voir le Todo" retiré.

---

## v0.35 — 2026-07-03

### Modifié
- Écran Planning (`E40Planning`) : ajout d'un bouton "Valider" explicite — un clic sur une tâche ne valide plus immédiatement le placement (retour utilisateur : comportement non intuitif).
- Flux "Planifier" (Todo ou création directe) transporte désormais l'id de la tâche créée jusqu'à Planning : taper un créneau vide affiche directement la confirmation de placement de cette tâche, sans lister toutes les tâches non planifiées.
- Bouton "Planifier" de la nav segmentée du dashboard renommé "Planning".

---

## v0.34 — 2026-07-02

### Ajouté
- Écran Todo (`E20Inbox`) : actions "Planifier" et "Liste" par tâche, en plus de "Aujourd'hui" — convertissent la tâche vers `TaskV2`/`ListItem` au moment du clic et vident Todo.
- Pastille rouge sur le bouton "Todo" du dashboard dès qu'une tâche est en attente.

### Modifié
- Le système V1 `Task` (inbox→today, sous-tâches, action immédiate) reste le moteur du dashboard — pas d'unification sur `TaskV2`, conversion à l'action à la place.

### Corrigé
- Fonctionnalité Routines (V2-8) retirée intégralement — jamais demandée explicitement par Marie (écrans, règles, repositories, entités, tables Dexie supprimés).
- Collision de nommage V1/V2 "plus tard" résolue — système V1 "À faire plus tard" (`E25Later`, statut `later`) retiré, seul `to_plan` (V2) subsiste.
- Bug orphelin : la destination "Todo" de `E21CreateTaskV2` créait des `TaskV2` jamais affichées nulle part — crée maintenant une `Task` V1 cohérente avec l'écran Todo. Écran `E21CreateTask` (V1) devenu inaccessible, supprimé.
- `deleteAllData` ne vidait jamais la table `tasksV2` — corrigé.

---

## v0.33 — 2026-07-02

### Modifié
- `roadmap_v2.md` : note ajoutée sous Phase V2-8 — l'onglet "Routines" dédié n'a pas été demandé explicitement par Marie (sa maquette dessinée et ses notes écrites décrivent les routines comme un type de liste, pas une entité séparée). À retirer ou fusionner dans Listes, décision à trancher.
- `_contexte/signals.md` : action P1 ajoutée pour cette décision.

---

## v0.32 — 2026-07-01

### Modifié
- `_contexte/signals.md` : diagnostic d'un signalement utilisateur ("tâche 'à planifier plus tard' invisible") — pas un bug, collision de nommage entre deux systèmes distincts (V1 `Task`/`later` vs V2 `TaskV2`/`to_plan`). Documenté en action ouverte avec 3 options de résolution, à trancher la prochaine session.

---

## v0.31 — 2026-07-01

### Modifié
- `vitest.config.ts` : exclusion `dist_v1/**`/`e2e/**` du calcul de couverture (polluaient le rapport à 0%) — couverture réelle mesurée : 95.48% lignes / 91.74% branches / 89.11% fonctions (seuil 85% dépassé).
- `roadmap_v2.md` : Phase V2-10 — item "refacto d'architecture, dead code, couverture ≥85%" clos.

### Corrigé
- `src/domain/rules/taskRules.ts` : suppression de `TASK_TODAY_MAX`/`canAddToToday`, dead code V1 confirmé (aucune limite quotidienne appliquée nulle part dans l'app) — 392/392 tests après nettoyage.

---

## v0.30 — 2026-07-01

### Ajouté
- Phase V2-9 — Refonte page d'accueil : icône agenda dans `TopBar.tsx` (`onPlanningClick`, accès direct au planning), boutons "Planifier"/"Listes" ajoutés à la nav segmentée du dashboard.
- `E10Dashboard.tsx` : nouvelle section "Planning du jour" (mini, `TaskV2`+`Routine` du jour triés par heure), masquant les tâches `essential=false` en mode surcharge.
- 8 tests ajoutés (396/396 total, pool par défaut).

### Corrigé
- Navigation orpheline (`task-create-v2`) : bouton "Ajouter une tâche" du dashboard repointé vers le flux 3-destinations. Vérifié sans régression : les e2e T11-T19 passent par le bouton propre à `E20Inbox`, indépendant de celui du dashboard.

### Modifié
- `roadmap_v2.md` : V2-9 close (mécanique + test manuel TM-01 à TM-06 validés) ; test manuel V2-7 (12 TM) et TM-07/08 de V2-8 validés en cascade, débloqués par la nouvelle nav.
- `README.md` : état actuel et prochaine étape mis à jour (V2-10).

---

## v0.29 — 2026-07-01

### Ajouté
- Phase V2-8 — Routines (matin/soir) : `E70Routines.tsx` (liste, création nom/type/durée), `E71RoutineDetail.tsx` (étapes cochables, réservation de créneau).
- `src/domain/rules/routineRules.ts` : règles pures `createRoutine`/`createRoutineStep`/`scheduleRoutine`/`toggleRoutineStep`.
- `Routine` (entité) : ajout `scheduled_date`/`scheduled_start` optionnels.
- `AppContext.tsx` : state et méthodes routines, branchées sur `RoutineRepository`/`RoutineStepRepository` existants.
- `E40Planning.tsx` : affichage des routines planifiées comme bloc distinct dans la grille horaire.
- Dashboard : segment nav "Routines".
- 25 tests ajoutés (390/390 total). Test manuel TM-01 à TM-06 validé.

### Corrigé
- Roadmap : gate commun complété (point 7 — vérifier qu'un écran livré ne perd pas son accès navigable) suite à la découverte d'une régression silencieuse (`task-create-v2` orphelin depuis le revert e2e du 2026-06-30, planning inaccessible par navigation réelle).

### Modifié
- `roadmap_v2.md` : V2-8 close (mécanique + TM-01 à TM-06) ; V2-7 test manuel formellement reporté V2-9 ; TM-07/08 V2-8 reportés V2-9 ; angles morts "Navigation orpheline" documenté.

---

## v0.28 — 2026-07-01

### Ajouté
- Phase V2-7 — Listes (référentiel personnel) : `E60Lists.tsx` (page listes, création à la volée), `E61ListDetail.tsx` (détail liste, ajout/suppression d'élément).
- `src/domain/rules/listRules.ts` : règles pures `createList`/`createListItem`.
- `AppContext.tsx` : state et méthodes listes (`lists`, `createList`, `deleteList`, `getListItems`, `addListItem`, `deleteListItem`), branchées sur `ListRepository`/`ListItemRepository` existants.
- 28 tests ajoutés (365/365 total).

### Modifié
- `roadmap_v2.md` : Phase V2-7 close (mécanique) ; suggestion de liste depuis le flux d'ajout de tâche reportée V2-9.

---

## v0.27 — 2026-06-30

### Modifié
- `TopBar.tsx` : bouton "Mode surcharge" isolé en haut (top-right), prop `overloadActive`, `aria-pressed`, style actif/inactif distinct ; chip énergie seul dans la seconde ligne.
- `E10Dashboard.tsx` : toggle instantané surcharge sans navigation — bandeau "Mode surcharge actif" + accès Centre récupération inline ; suppression branche full-page overload.
- `E10Dashboard.test.tsx` : tests mode surcharge D10B réécrits + enrichis (337/337).
- `roadmap_v2.md` : Phase V2-6 close (mécanique [x] ; masquage `essential=false` différé V2-9).

---

## v0.26 — 2026-06-30

### Corrigé
- Dette e2e V1→V2 soldée : 46/46 tests Playwright passent (était 2/46).
- `01-onboarding.spec.ts`, `helpers/reset.ts` : `Commencer` → `Entrer` (vocabulaire V2-1).
- `03-energy.spec.ts` : `souffle` → `énergie`.
- `02-tasks.spec.ts`, `06-offline.spec.ts` : `Inbox` → `Todo`, `Plus tard` → `À faire plus tard`, aria-labels alignés.
- `E20Inbox.tsx` : bouton "Ajouter une tâche" revert sur `task-create` (V1) — incohérence corrigée (le bouton créait des TaskV2 invisibles dans l'inbox V1). `E21CreateTaskV2` sera reconnecté en V2-7/V2-9.

### Infrastructure
- Tests unitaires : 336/336 ✓. Tests e2e : 46/46 ✓.

---

## v0.25 — 2026-06-30

### Ajouté
- `E50ToPlanQueue.tsx` : écran file "À planifier" séquentielle — affiche 1re tâche `to_plan`, choix date/heure, planifier/arrêter, page de fin.
- `E50ToPlanQueue.test.tsx` : 12 tests (file vide, tâche affichée, champs, enchaînement, interruption).
- `AppContext` : screen `'to-plan-queue'`, state `toPlanTasks` (chargé dans `loadAll`, retiré après `scheduleV2Task`).

### Modifié
- `E10Dashboard.tsx` : pastille rouge "À planifier" → `goTo('to-plan-queue')` si `toPlanTasks.length > 0`.
- `App.tsx` : route `'to-plan-queue'` → E50ToPlanQueue.
- `testUtils.tsx` : mock `toPlanTasks: []`.
- `DevResetButton.tsx` : entrées manquantes `'task-create-v2'`, `'planning'`, `'to-plan-queue'` (fix build TypeScript).
- `roadmap_v2.md` : Phase V2-5 cochée [x].
- `_contexte/signals.md`, `contexte.md`, `README.md` : état V2-5 close, dette e2e P0, V2-6 prochaine.

### Infrastructure
- Tests unitaires : 336/336 ✓ (45 fichiers test).
- ⚠ Tests e2e : 44/46 échouent — specs V1 périmées (cherchent "Commencer", bouton dit "Entrer" depuis V2-1). À corriger en priorité.

---

## v0.24 — 2026-06-30

### Ajouté
- `E40Planning.tsx` : vue Planning — grille 6h–22h, scroll auto heure courante, navigation précédent/suivant, picker de placement et de déplacement de tâches.
- `E40Planning.test.tsx` : 11 tests (navigation, placement, déplacement, picker vide).
- `AppContext` : screen `'planning'` + `scheduleV2Task` / `getPlannedTasksForDate` / `getUnscheduledPlannedTasks`.

### Modifié
- `E21CreateTaskV2.tsx` : "Planifier" navigue vers `'planning'` (corrige le placeholder inbox).
- `App.tsx` : route `'planning'` → E40Planning.
- `testUtils.tsx` : 3 nouvelles fonctions mock.
- `roadmap_v2.md` : Phase V2-4 cochée [x].
- `_contexte/signals.md`, `contexte.md`, `README.md` : état V2-4 close, V2-5 prochaine.

### Infrastructure
- Tests : 324/324 ✓ (44 fichiers test).

---

## v0.23 — 2026-06-30

### Ajouté
- `E21CreateTaskV2.tsx` : écran d'ajout V2 avec 3 destinations obligatoires (Todo / Planifier / À planifier plus tard), validation bloquée si destination non choisie.
- `AppContext` : `createTaskV2Dest(title, status)` + screen `'task-create-v2'`.
- `E21CreateTaskV2.test.tsx` : 11 tests (3 chemins + cas limites).

### Modifié
- `E20Inbox.tsx` : bouton "Ajouter une tâche" pointe vers `'task-create-v2'`.
- `App.tsx` : route `'task-create-v2'` ajoutée.
- `testUtils.tsx` : mock `createTaskV2Dest` ajouté.
- `roadmap_v2.md` : Phase V2-3 cochée [x].
- `_contexte/signals.md`, `contexte.md`, `README.md` : état V2-3 close, V2-4 prochaine.

### Infrastructure
- Tests : 313/313 ✓ (43 fichiers test).

---

## v0.22 — 2026-06-29

### Ajouté
- `TaskV2`, `List`, `ListItem`, `Routine`, `RoutineStep` : entités domaine v2.
- `taskRulesV2.ts` : règles métier v2 (createTaskV2, scheduleTaskV2, completeTaskV2, moveTaskToLaterV2, toggleEssentialV2).
- Repositories v2 : `TaskV2Repository`, `ListRepository`, `ListItemRepository`, `RoutineRepository`, `RoutineStepRepository`.
- `_contexte/archive_decisions.md` : archive des décisions 2026-06-25 déplacées hors de `contexte.md`.

### Modifié
- `db.ts` : version(2) + tables v2 en parallèle de v1 (sans breaking change).
- `roadmap_v2.md` : Phase V2-2 cochée [x].
- `_contexte/signals.md`, `contexte.md`, `README.md` : état V2-2 close, V2-3 prochaine.

### Infrastructure
- Tests : 301/301 ✓ (42 fichiers test, dont 5 fichiers V2 nouveaux).

---

## v0.21 — 2026-06-29

### Ajouté
- `dist_v1/` : archive build V1 pour rollback immédiat.

### Modifié
- Vocabulaire UI V2-1 : "souffle" → "énergie", "Inbox" → "Todo", "Plus tard" → "À faire plus tard" (8 composants, 6 fichiers de tests).
- `roadmap_v2.md` : Phases V2-0 et V2-1 cochées [x].
- `_contexte/signals.md`, `contexte.md`, `README.md` : état V2 en cours mis à jour.

### Infrastructure
- Tag `v1.0-mvp` posé sur le dernier commit `main`.
- Branche `v2` créée depuis `main`.

---

## v0.20 — 2026-06-29

### Ajouté
- `roadmap_v2.md` : roadmap V2 complète (11 phases, pilotée par retours Marie).
- `Archives/roadmap_v1.md` : roadmap V1 archivée.
- `COMMUNICATION/Note de réunion/synthese_reunion_marie_2026-06-29.md` : synthèse session test utilisateur.
- `COMMUNICATION/Note de réunion/analyse_conduite_visio_marie.md` : méthodo prochaines visios.

### Modifié
- `_contexte/signals.md`, `contexte.md` : état V2 prête à démarrer, reset données acté.
- `README.md` : état actuel mis à jour (Phase 7 en cours, V2 cadrée).

---

## v0.19 — 2026-06-25

### Ajouté
- `public/images/welcome-hero.png` : image générée pour l’écran de bienvenue.

### Modifié
- `E01Welcome.tsx` : écran de bienvenue refondu autour de l’image et du bouton `Entrer`, sans scroll mobile.
- `E02Profile.tsx` : âges retirés des choix de profil.
- `_contexte/`, `README.md` : clôture session alignée sur l’onboarding préparé pour test utilisateur.

### Validé
- `npm run test -- E01Welcome E02Profile`, `npm run lint`, `npm run build` : OK.
- Preview mobile 390x844 : écran bienvenue sans scroll, image chargée, bouton visible.

---

## v0.18 — 2026-06-25

### Modifié
- `_contexte/`, `README.md` : clôture session Phase 7 mise à jour autour du test utilisateur distant
- Décision actée : connexion Google hors périmètre immédiat, à réévaluer avec la sync V2

### Validé
- `npm run build` : build production OK et dossier `dist/` régénéré pour dépôt manuel Netlify

---

## v0.17 — 2026-06-25

### Ajouté
- `TopBar.tsx` : bouton icône document “Ressources” ajouté au dashboard
- `E120Resources.tsx` : nouvel écran ressources avec fondements de conception, mode d’emploi de l’application et liens utiles en attente
- `E120Resources.test.tsx` : couverture du nouvel écran ressources

### Modifié
- `App.tsx`, `AppContext.tsx`, `DevResetButton.tsx` : route `resources` et code écran E120 branchés
- `E10Dashboard.tsx` / `E10Dashboard.test.tsx` : navigation dashboard → ressources ajoutée et testée
- `_contexte/`, `README.md`, `roadmap.md` : clôture session mise à jour

### Corrigé
- `E22TaskDetail.tsx`, `E23Decompose.tsx` : dépendances `useEffect` complétées pour validation ESLint
- `DevResetButton.tsx` : appel `useApp()` rendu non conditionnel

### Validé
- `npm run lint`, `npm run build`, `npm run test` : 259/259 tests passent
- `npm run test:e2e` : 46/46 scénarios passent sans serveur manuel

---

## v0.16 — 2026-06-25

### Corrigé
- `E22TaskDetail.test.tsx` : assertion sous-étape alignée sur l'item drag-and-drop visible
- `E10Dashboard.test.tsx`, `E30EnergyView.test.tsx`, `E03Energy.test.tsx` : assertions restantes "cuillères" → "souffle"
- `vitest.config.ts` : Vitest limité aux tests `src/` pour exclure les specs Playwright `e2e/`
- `.claude/commands/start.md`, `.claude/commands/close.md` : détection des fichiers `roadmap*.md`

### Validé
- `npm run test` : 253/253 tests passent
- E2E Playwright : 46/46 scénarios passent avec preview lancé manuellement

---

## v0.15 — 2026-06-25

### Modifié
- `E10Dashboard.tsx`, `E30EnergyView.tsx`, `E31EnergyCheckIn.tsx`, `E03Energy.tsx` : "cuillères" → "souffle" (terme énergie)
- `e2e/03-energy.spec.ts` : libellés mis à jour ("cuillères" → "souffle")
- `E10Dashboard.tsx` : padding Card "Que faire maintenant?" 24px → 12px ; SortableTaskItem police 0.75rem + spacing-xs
- `src/index.css` : --spacing-12: 12px ajouté

### Corrigé
- `AppContext.tsx` : addSubTask() — await loadAll() ajouté → todaySubTasksMap rafraîchi après décomposition d'une tâche

---

## v0.14 — 2026-06-25

### Ajouté
- `src/ui/components/TopBar.tsx` : nouveau composant — titre « Appli pour AuDHD », pill énergie, pill surcharge, roue ⚙ paramètres
- `run_dev.py` / `run_prod.py` : scripts de lancement dev/prod avec `--host` (accès mobile réseau local)
- `SERVEURS.md` : liens localhost PC + mobile (192.168.1.180)

### Modifié
- `E10Dashboard.tsx` : refacto sans scroll — TopBar + nav segmentée (Inbox / Aujourd'hui / Plus tard) remplace 7 boutons empilés
- `E10Dashboard.test.tsx` : tests adaptés aux nouveaux libellés (26/26)
- `e2e/*.spec.ts` + `helpers/reset.ts` : libellés remappés (Tableau de bord → Appli pour AuDHD, Mon énergie → pill, Activer mode surcharge → Activer le mode surcharge)

### Corrigé
- `AppContext.tsx` : `taskId` → `_taskId` dans `reorderSubTasks` (erreur TS6133 bloquant le build prod)
- Fix scroll latéral mobile validé en build prod (overflow-x: clip, DevResetButton absent) ✅

---

## v0.13 — 2026-06-25

### Corrigé
- Scroll latéral mobile : `overflow-x: clip` sur html/body — neutralise le débordement du sr-only dnd-kit (-1px) que `overflow-x: hidden` ne bloquait pas

---

## v0.12 — 2026-06-25

### Ajouté
- `AppContext.tsx` : `taskDetailOrigin` state — mémorise l'écran d'origine pour corriger la navigation retour depuis E22
- Braille dots ⠿ sur cartes E10 et sous-tâches E22/E23 (indicateur drag)
- Drag-and-drop des sous-tâches dans E22 (dnd-kit, pattern optimiste identique E23)
- Bouton supprimer (×) sur chaque sous-tâche dans E22

### Corrigé
- E22 : sous-tâche supprimée encore visible dans E10 → `refreshDashboard()` après `deleteSubTask`
- E22 : bouton Retour naviguait vers E24 au lieu de E10 lors d'une navigation depuis le dashboard

### Modifié
- E110–E117, E30–E31 : bouton "← Retour" déplacé en haut des écrans (harmonisation pattern E22)
- Tests E110–E117 : `getByText('Retour')` → `getByRole('button', { name: 'Retour' })`

---

## v0.11 — 2026-06-25

### Corrigé
- `src/app/AppContext.tsx` : fallback UUID v4 via `crypto.getRandomValues` — `crypto.randomUUID()` indisponible hors HTTPS (accès mobile par IP locale)

### Modifié
- `roadmap.md` : Phase 6 clôturée `[x]`
- `README.md` : état actuel mis à jour (Phase 6 close, Phase 7 à démarrer)

---

## v0.10 — 2026-06-25

### Ajouté
- Suite E2E Playwright : 46 tests (onboarding, tâches, énergie, settings, surcharge, offline/SW/IndexedDB)
- `playwright.config.ts` : configuration Playwright webServer vite preview + Chromium headless
- `e2e/` : 6 fichiers de tests + helper reset/onboarding
- `package.json` : scripts `test:e2e`, `test:e2e:headed`, `test:e2e:report`

---

## v0.9 — 2026-06-25

### Ajouté
- `AppContext.test.tsx` : +3 describe blocks couvrant inbox ops, sous-tâches, settings/données (241 tests, 99.34% couverture)

### Corrigé
- Repositories (user, settings, task, subTask, energyEntry) : fix `erasableSyntaxOnly` TS 5.8+ (déclaration explicite des champs privés)
- `E117Export.test.tsx` : fix act() warning sur handleExport async
- `taskRules.test.ts` : suppression import inutilisé TASK_TODAY_MAX
- `vitest.config.ts` : DevResetButton exclus de la couverture (composant dev-only)

### Modifié
- `README.md` : Phase 6 code complète, 241 tests, 99.34% couverture

---

## v0.8 — 2026-06-25

### Ajouté
- `src/ui/screens/settings/` : E110–E114, E116, E117 + tests (paramètres, accessibilité, stimulation, export, suppression)
- `src/ui/screens/overload/E90OverloadRecovery.tsx` + tests : centre récupération, désactivation surcharge
- `AppContext.tsx` : settings state, updateSettings, exportData, deleteAllData, 8 nouveaux écrans
- `src/index.css` : dark-mode class, reduce-motion class, stimulation mode CSS (calm/dynamic)
- `E10Dashboard.tsx` : bouton "Activer mode surcharge" (nav normale) + "Centre récupération" (mode surcharge)

### Corrigé
- Font sizes : small=13px / medium=16px / large=22px (différences perceptibles)
- E90 : suppression "Retour au dashboard" — créait une boucle sans possibilité de sortir du mode surcharge

---

## v0.7 — 2026-06-25

### Ajouté
- `src/ui/screens/energy/E30EnergyView.tsx` + tests : affichage énergie du jour (3 états : null / filled / skipped)
- `src/ui/screens/energy/E31EnergyCheckIn.tsx` + tests : check-in grille 1-10, skip, pré-sélection, 8 tests
- `AppContext.tsx` : Screen + 'energy-view'/'energy-checkin', state todayEnergyStatus ('filled'|'skipped'|null)
- `DevResetButton.tsx` : sélecteur date simulée (localStorage dev_fake_date) pour tests J+1 en DEV

### Modifié
- `src/App.tsx` : +2 routes energy-view / energy-checkin
- `src/ui/screens/dashboard/E10Dashboard.tsx` : badge énergie cliquable, encart CTA J+1, "Énergie ignorée", bouton "Mon énergie"
- `src/ui/screens/dashboard/E10Dashboard.test.tsx` : +5 cas énergie
- `src/test/testUtils.tsx` : todayEnergyStatus: null dans makeAppContext
- `roadmap.md` : Phase 4 cochée [x]

---

## v0.6 — 2026-06-24

### Ajouté
- `src/ui/screens/tasks/E20Inbox.tsx` + tests : liste inbox, déplacement today/later, modale M04
- `src/ui/screens/tasks/E21CreateTask.tsx` + tests : formulaire création tâche
- `src/ui/screens/tasks/E22TaskDetail.tsx` + tests : détail tâche, sous-tâches, terminer, supprimer
- `src/ui/screens/tasks/E23Decompose.tsx` + tests : décomposition manuelle en sous-tâches
- `src/ui/screens/tasks/E24Today.tsx` + tests : liste aujourd'hui, terminer, retirer
- `src/ui/screens/tasks/E25Later.tsx` + tests : liste plus tard, déplacer vers aujourd'hui, modale M04
- `AppContext.tsx` : inboxTasks, todayTasks, laterTasks, moveTask, completeTask, deleteTask, selectTask, getSubTasks, toggleSubTask
- `DevResetButton.tsx` : SCREEN_CODES mapping, affichage code écran (E01–E25)

### Corrigé
- `E20/E22/E25` : `backgroundColor: var(--color-bg)` inexistant → `var(--color-surface)` ; overlay 75 % opacité ; zIndex 1000
- `Button.tsx` : disabled state — opacity 0.4 + cursor not-allowed

### Modifié
- `src/App.tsx` : renderScreen() helper, DevResetButton dans AppScreens
- `roadmap.md` : Phase 3 cochée `[x]`

---

## v0.5 — 2026-06-24

### Ajouté
- `src/app/AppContext.tsx` : state machine React (Screen), repositories, logique onboarding complète
- `src/app/AppContext.test.tsx` : 9 tests intégration avec real DB (fake-indexeddb)
- `src/ui/components/Button.tsx` + `Card.tsx` : composants UI réutilisables
- `src/ui/components/DevResetButton.tsx` : reset IndexedDB en DEV uniquement (import.meta.env.DEV)
- `src/ui/screens/onboarding/E01Welcome.tsx` + `E02Profile.tsx` + `E03Energy.tsx` + `E04FirstTask.tsx` + tests
- `src/ui/screens/dashboard/E10Dashboard.tsx` + tests : D10A (normal) / D10B (surcharge)
- `src/test/testUtils.tsx` : makeAppContext + renderWithApp pour tests UI découplés
- Design tokens CSS neurodivergents dans `src/index.css` (palette, grille 8px, dark mode)

### Corrigé
- `src/data/db.ts` : `import type { Table }` — Rolldown/Vite 8 refuse l'import valeur

### Modifié
- `src/App.tsx` : router principal via AppContext + DevResetButton
- `vitest.config.ts` : exclusion `src/domain/entities/**` de la couverture
- `roadmap.md` : Phase 2 cochée `[x]`

---

## v0.4 — 2026-06-24

### Ajouté
- `src/domain/entities/` : types purs User, Task, SubTask, EnergyEntry, Settings
- `src/domain/rules/taskRules.ts` : canAddToToday (max 3), sortByPosition, nextPosition, completeTask
- `src/domain/rules/energyRules.ts` : hasCheckedInToday, getLatestFilledValue, getTodayEntry
- `src/domain/rules/actionImmediateRules.ts` : cascade Action immédiate MVP (déterministe)
- `src/data/db.ts` : schéma Dexie v1, 5 tables indexées, name optionnel pour tests isolés
- `src/data/repositories/` : 5 repositories CRUD (User, Task, SubTask, EnergyEntry, Settings)
- Chiffrement transparent des champs sensibles : Task.title, SubTask.title, EnergyEntry.value
- `docs/adr/ADR-003-domaine-infra.md` : règle d'isolement domaine/infra
- 71 tests, couverture globale 98.26 %, isolement domaine/infra validé par grep

### Modifié
- `src/test/setup.ts` : ajout `import 'fake-indexeddb/auto'`
- `package.json` : devDependency `fake-indexeddb`
- `roadmap.md` : Phase 1 cochée `[x]`
- `README.md` : état actuel et prochaine étape mis à jour

---

## v0.3 — 2026-06-24

### Ajouté
- `package.json` : React 19, Vite 8, TypeScript 6, ESLint, Prettier, Vitest + coverage v8, Dexie, vite-plugin-pwa
- `vite.config.ts` + `vitest.config.ts` : PWA (manifest, service worker Workbox), couverture 85 %
- `src/crypto/crypto.ts` : wrapper AES-GCM + PBKDF2 (Web Crypto API)
- `src/crypto/crypto.test.ts` + `src/test/smoke.test.ts` : 5 tests, couverture 100 % crypto
- `docs/adr/ADR-001-stack.md` + `ADR-002-architecture-couches.md` : décisions d'architecture
- `run.py` : script Python pour lancer `npm run dev` sur Windows

### Modifié
- `roadmap.md` : Phase 0 cochée `[x]`
- `README.md` : lancement local, structure des dossiers src/, état actuel

---

## v0.2 — 2026-06-23

### Ajouté
- `roadmap.md` : 15 phases (MVP 0–7, V1 8–12, V2 13–14), coches de suivi `[ ]`/`[~]`/`[x]`
- `LICENSE` : MIT, copyright ServOMorph 2026
- `.gitignore` : Node/Vite/Capacitor/coverage

### Modifié
- `_contexte/signals.md` : actions P1/P2 alignées sur la roadmap
- `README.md` : état actuel et prochaine étape mis à jour

---

## v0.1 — 2026-06-23

### Ajouté
- Documentation produit complète (6 docs de dev + cahier des charges) révisée et cohérente
- Stack technique arrêtée : React/TS PWA, Dexie.js, Web Crypto AES-GCM, Capacitor
- Cascade "Action immédiate" formalisée dans User Flows et Architecture des écrans
- Entité Event documentée (hors MVP, prévue V1 post-validation)
- Critères d'acceptation MVP étendus dans le PRD
- Distinction notification push / suggestion in-app établie dans Design System et User Flows
- Règle de skip du check-in énergie (statut `skipped`) dans Modèle de données
- Sync cloud définie comme post-MVP (Supabase région UE)
