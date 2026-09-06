# Plan de refactorisation — Appli_TSA_SDI_TDAH

Date : 2026-09-06. Statut : proposition, aucune étape d'implémentation commencée.

## Objectif et recommandation

Fiabiliser les opérations qui remplacent ou modifient plusieurs données, puis réduire les dépendances entre l'interface et le stockage. Conserver React, Dexie, le fonctionnement hors ligne, les écrans existants et les contrats réseau.

Commencer par rétablir les contrôles de référence, puis sécuriser l'import. Le découpage du contexte React et la mutualisation des gestes du planning passent après ces problèmes concrets. Une réécriture générale n'est pas justifiée par les observations.

L'analyse distingue les extractions à comportement constant des corrections fonctionnelles : transaction d'import, horizon des récurrences et délai réseau modifient volontairement le comportement en cas d'erreur. Leur exécution nécessite une demande distincte, comme toute réalisation de ce plan.

Périmètre approfondi : démarrage, composition des dépendances, paramètres/import/export, persistance, récurrences, transport de synchronisation et planning jour/semaine. Les autres écrans et tests ont été repérés sans audit exhaustif. Les scripts opérationnels, Discord, le kit embarqué et la sécurité du serveur Supabase ne sont pas couverts par un verdict d'audit. Aucun accès à `.env`, aux données privées de Marie ou aux services externes ; aucun déploiement, installation, branche ou changement de code effectué.

## État initial et travail concurrent

Dépôt : `D:\ServOMorph\Appli_TSA_SDI_TDAH`, branche `main`, divergence `main..HEAD` : 0 lors du contrôle.

HEAD initial : `b9afe0a1e703b1c8cd0a01c6642914d50ad56a82`.

État Git avant analyse :

```text
 M DISCORD/_contexte/on_start.md
 M _contexte/on_close.md
 M _contexte/on_start.md
 M scripts/_supabase.py
?? scratchpad/
```

Pendant l'analyse, HEAD est devenu `bee7a0bd55b074e469e8d20e5c5daafd3bb77e6f` (`chore(hooks): snapshot Marie sans sourcing shell du .env`). Juste avant rédaction, les seuls résidus précédents visibles étaient `DISCORD/_contexte/on_start.md` et `scratchpad/`. Ce commit et ces modifications appartiennent à une autre activité ; aucun n'a été réalisé par cette analyse. Relever à nouveau HEAD et les différences avant d'exécuter le plan. Le seul livrable de cette session est ce document.

Les informations de production et les nombres de tests dans `_contexte/signals.md` et `_contexte/contexte.md` sont des états historiques. Ils ne constituent pas une validation du checkout analysé. Les décisions produit en attente restent en dehors de cette refactorisation.

### Architecture observée

- `src/main.tsx` monte React en StrictMode. `src/App.tsx` compose le fournisseur d'état, la navigation et les écrans différés ; le tableau de bord reste importé statiquement.
- `src/app/AppContext.tsx` agrège les hooks spécialisés, l'initialisation, les rafraîchissements, la navigation et les déclenchements de synchronisation.
- `src/app/repositories.ts` instancie Dexie et les dépôts, et fournit aussi les identifiants et la date du jour.
- `src/domain/rules/` contient des règles séparées de l'interface ; `src/data/repositories/` encapsule les accès par entité. Ce découpage est à préserver.
- `src/data/db.ts` contient les schémas et migrations jusqu'à v19. Les tests de migration couvrent plusieurs versions historiques ; ne pas réécrire cet historique lors d'une simple extraction.
- `src/data/sync/buildSnapshot.ts` fournit le format 3.6 partagé par export manuel et synchronisation. Les clients réseau utilisent `fetch` ; les tests de contrat vérifient les requêtes RPC et Storage avec réseau simulé.

## Contrôles réellement exécutés

Environnement observé : Node.js v22.16.0 ; Vitest annonce 3.2.6 ; ESLint annonce 9.39.4. Aucun téléchargement de dépendances.

| Contrôle | Résultat actuel | Durée approximative |
|---|---|---|
| `node node_modules/typescript/bin/tsc -p tsconfig.app.json --incremental false` | Échec, code 2 : 6 imports `@dnd-kit` non résolus dans les fiches/décomposition de tâches et 6 diagnostics de paramètres implicitement `any` | Les deux contrôles TypeScript : 7,3 s au total |
| `node node_modules/typescript/bin/tsc -p tsconfig.node.json --incremental false` | Réussite, code 0 | Incluse ci-dessus |
| `npm run lint` | Échec, code 1 : commande `eslint` introuvable | Environ 2 s |
| Appel direct `node node_modules/eslint/bin/eslint.js . --max-warnings 0` | Échec avant analyse : dépendance `@eslint-community/eslint-utils` absente | Moins de 2 s |
| Suite Vitest via son API, configuration projet, sans `.env` ni cache | Échec au démarrage : `@jridgewell/sourcemap-codec` absent, aucun test exécuté | Moins de 1 s |
| Vérification ciblée de l'horizon des récurrences avec le module métier réel transpilé en mémoire | Décalage de 30 jours reproduit pour le 06/09/2026 | Moins de 2 s |
| Vérification ciblée de l'import : hook réel transpilé, React et stockage simulés en mémoire | Retour d'échec après disparition de la tâche initiale et insertion partielle | Moins de 2 s |

Commande exacte de tentative Vitest, depuis la racine :

```powershell
node --input-type=module -e 'import { startVitest } from "vitest/node"; const ctx = await startVitest("test", [], { run: true, cache: false, configLoader: "runner", reporters: ["dot"], maxWorkers: 4 }, { envFile: false }); await ctx.close();'
```

Le manifeste installé manque pour `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` et `@jridgewell/sourcemap-codec`, bien que ces paquets figurent dans `package-lock.json`. L'installation locale est incomplète ; ce constat ne démontre pas que le fichier de verrouillage est défectueux. Les diagnostics `any` devront être réévalués une fois les types disponibles.

`npm run build` est défini comme `tsc -b && vite build`. Aucun build n'a été produit : le contrôle applicatif échoue déjà, et la procédure n'autorise que la création du plan. Couverture, budget du bundle et tests Playwright non exécutés. Le chiffre historique de 783 tests verts n'est donc pas confirmé aujourd'hui. Les vérifications ciblées en mémoire ne remplacent pas la suite Vitest, IndexedDB réel ou une validation navigateur.

## Constats priorisés

### R1 — P1 : un import en erreur peut détruire les données précédentes

Preuve : `src/app/contexts/useSettingsState.ts:145` valide surtout le profil, transforme les collections par assertions de types et ne contrôle pas la version du fichier. À la ligne 242, il appelle `clearDatabase()`, puis réinsère les collections sans transaction englobante. Le `catch` retourne une erreur sans restauration. Certaines transformations, notamment la lecture de chaque élément de liste vers la ligne 217, ont lieu avant ce `try`.

Vérification : le hook réel a été transpilé avec TypeScript et exécuté avec des tables simulées en mémoire. En partant d'un utilisateur et d'une tâche synthétiques, importer deux tâches de même identifiant a retourné `ok: false` ; l'utilisateur importé et une tâche partielle restaient présents, la tâche originale avait disparu. Cela confirme l'ordre destructif du code, pas le comportement complet de Dexie : un test d'intégration avec fake-indexeddb reste nécessaire.

Autre périmètre à expliciter : la table `feedbackReports` ajoutée en v19 n'apparaît ni dans la liste d'effacement de `clearDatabase()` ni dans le snapshot. L'interface d'import et d'export décrit pourtant « toutes les données ». Ne pas ajouter silencieusement les images au JSON : définir séparément restauration des données applicatives, effacement local intégral et conservation des retours en attente.

Impact : fichier incomplet ou doublon, erreur de stockage ou interruption peuvent laisser un état partiel. Priorité à une validation intégrale avant écriture et à une transaction unique.

### R2 — P2 : la fenêtre de récurrence ajoute un mois supplémentaire

Preuve : `src/app/contexts/usePlanningState.ts:142` passe le mois issu de `YYYY-MM-DD` directement à `Date.UTC`, alors que `src/domain/rules/taskRecurrenceRules.ts` effectue correctement `m - 1`.

Vérification exécutée : pour `2026-09-06`, la borne actuelle après ajout de 90 jours est `2027-01-04`, contre `2026-12-05` attendu. Le générateur métier réel produit 121 dates quotidiennes, racine comprise, au lieu de 91. Le hook retire ensuite la racine de la liste des occurrences supplémentaires. Le test a reproduit le calcul et appelé le générateur ; le formulaire React complet n'a pas été exécuté.

Impact : matérialisation plus longue qu'annoncée et volume d'écritures accru. Extraire le calcul de fenêtre et l'utilisation du générateur dans une fonction pure couverte aux limites de mois et d'année. Ne pas supprimer les occurrences déjà enregistrées lors de cette correction.

### R3 — P2 : les opérations sur une série peuvent être partiellement enregistrées

Preuve : `src/app/contexts/usePlanningState.ts:139` écrit d'abord la récurrence, puis la tâche et chaque occurrence aux lignes 164–166, puis supprime éventuellement la source. Les éditions et suppressions de série utilisent aussi des boucles d'écritures séparées aux lignes 245 et 269. Les méthodes lues dans `src/data/repositories/taskRepository.ts` n'installent pas de transaction sur l'ensemble de ces opérations.

Impact déduit du code : si une écriture intermédiaire échoue, une série peut être incomplète ou partiellement modifiée. Aucun incident utilisateur ni test de panne réel n'a été observé pendant cette analyse.

Extraire des opérations applicatives explicites « créer une série », « modifier les occurrences futures », « supprimer les occurrences futures », avec calcul préalable et persistance atomique. Garder les règles d'exclusion des occurrences détachées et de conservation du passé.

### R4 — P2 : une requête réseau suspendue retient le verrou des retours

Preuve : `src/data/sync/rpc.ts:21` et `src/data/sync/feedbackStorage.ts:23` appellent `fetch` sans délai applicatif. `src/data/sync/feedbackClient.ts:66` attend tous les envois ; aux lignes 79–83, toute nouvelle tentative réutilise `inFlight` jusqu'à sa résolution.

Impact conditionnel : si une requête reste pendante, les relances partagent la même promesse au lieu de démarrer une nouvelle tentative. Le retour hors ligne n'est pas perdu par ce seul mécanisme, mais sa synchronisation peut rester en attente. Le navigateur peut finir par interrompre la requête ; aucun blocage réel n'a été reproduit ici.

Prévoir un transport borné commun pour RPC et upload, conservant les contrats actuels, avec libération garantie du verrou et tests de relance. Les tests actuels couvrent notamment l'envoi concurrent et l'échec des métadonnées, mais leur scénario concurrent résout explicitement l'upload ; il ne démontre pas la récupération d'une promesse qui ne termine jamais.

### R5 — P3 : la façade d'état reste couplée à tous les domaines

Preuve : `src/app/AppContext.tsx:51` agrège les résultats de tous les hooks ; à la ligne 201, une seule valeur Provider est reconstruite. `loadAll()` recharge tous les domaines après import et rafraîchissement général. En sens inverse, `src/data/sync/buildSnapshot.ts:1` et le client de retours dépendent de `@/app/repositories` pour accéder aux instances de stockage.

Impact : dépendances larges pour tester un domaine et risque d'élargir la portée des changements. Aucun gain de performance chiffré n'est établi. Les hooks spécialisés existent déjà : les conserver, éviter une migration générale vers une nouvelle bibliothèque d'état.

Proposition : déplacer la composition des instances vers un module de données neutre avec réexport compatible, puis séparer progressivement navigation/session et domaines si les mesures de rendu ou les besoins de test le justifient. Une simple mémorisation du grand objet ne suffit pas à isoler ses consommateurs.

### R6 — P3 : deux mécanismes de glissement du planning divergent

Preuve : `src/ui/screens/dashboard/E12WeekPlanning.tsx:204` remet immédiatement le déplacement à zéro et change la semaine dans le même événement. `src/ui/screens/dashboard/PlanningBoard.tsx:350` utilise au contraire les phases `idle`, `dragging`, `settling` et attend la fin de transition pour recentrer.

Impact : divergence de maintenance et risque de réintroduire le saut visuel déjà signalé dans le contexte historique. Le défaut visuel sur la semaine n'a pas été reproduit au navigateur pendant cette analyse. Les tests de semaine lus vérifient le changement de semaine, pas la continuité perceptuelle.

Proposition : caractériser les deux comportements avant d'extraire une primitive de geste commune. Garder séparés les rendus jour/semaine et les décisions produit sur la navigation hebdomadaire. Ne pas faire cette extraction avant les corrections de données.

## Plan d'exécution par étapes réversibles

Les chemins nouveaux ci-dessous sont des propositions, pas des fichiers déjà créés. Une étape doit être validée avant de commencer la suivante. Aucun chantier parallèle sur les mêmes fichiers.

### Étape 0 — Retrouver une référence exécutable [TODO]

Prérequis : relever HEAD, protéger les modifications concurrentes et choisir un checkout de travail. Reconstituer les dépendances depuis le verrou existant dans le cadre d'une session d'implémentation autorisant cette installation ; ne pas mettre les versions à niveau pour faire passer les tests.

Avant : conserver les erreurs exactes de la section précédente. Après : relancer TypeScript, lint et toute la suite Vitest ; consigner compte et durée réels. Lancer ensuite le build, le contrôle du bundle et les tests navigateur avec un profil éphémère et une configuration sans backend réel. Les scripts de build ordinaires chargent potentiellement `.env` : utiliser des overrides de configuration explicites, pas les secrets de production.

Sortie : une base verte, ou une liste d'échecs existants isolés et acceptés avant toute extraction. En particulier, ne pas attribuer les échecs de dépendances au code applicatif. Risque faible sur le code ; rollback de l'environnement par abandon du checkout préparé, sans toucher au travail partagé.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

### Étape 1 — Import vérifié et atomique (R1) [TODO]

Fichiers existants : `src/app/contexts/useSettingsState.ts`, son test, `src/data/sync/buildSnapshot.ts`, `src/data/db.test.ts`, `src/ui/screens/settings/E117Export.tsx` et son test. Proposition : ajouter un module pur de normalisation du snapshot et un service de restauration dans `src/data/`.

Avant : caractériser les exports historiques acceptés, les catégories/outils reconstruits et le round-trip 3.6 ; ajouter les cas doublon, élément `null`, tableau mal typé, référence orpheline et version future. Créer le test de perte sur une vraie base fake-indexeddb distincte, avec vérification de toutes les tables avant/après.

Changement : extraire d'abord la normalisation à comportement constant. Puis valider entièrement avant mutation, couvrir toutes les erreurs par `ImportResult` et réaliser effacement/réinsertion dans une seule transaction Dexie. Mettre à jour React uniquement après commit. Séparer cette correction de l'arbitrage sur l'export/effacement des retours avec images.

Après : injecter un échec à une insertion intermédiaire et vérifier l'identité des données précédentes ; vérifier l'import valide complet, les versions historiques et la fin de l'indicateur d'import sur erreur. Aucun traitement réseau dans la transaction. Risque élevé : remplacement global des données. Sortie : échec sans perte et succès complet. Rollback : revert du commit de cette étape ; aucune migration de schéma ni conversion irréversible requise.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

### Étape 2 — Horizon des récurrences exact (R2) [TODO]

Fichiers : `src/app/contexts/usePlanningState.ts`, `src/domain/rules/taskRecurrenceRules.ts`, leurs tests métier et d'intégration via `src/app/AppContext.test.tsx`. Dépendance : étape 0 ; recommandée après sécurisation de l'import.

Avant : ajouter un test sur la création réelle de série reproduisant le 06/09/2026 ; couvrir janvier, décembre, février bissextile, fin par date et fin par nombre. Verrouiller explicitement la convention « borne à +90 jours inclusive », soit 91 dates quotidiennes avec la racine.

Changement : isoler et corriger le calcul de borne, sans retoucher les séries stockées. Après : mêmes champs et mêmes règles de récurrence, uniquement le nombre attendu d'occurrences dans la bonne fenêtre. Risque modéré ; sortie : absence du mois supplémentaire. Rollback : revert ciblé du calcul, sans suppression des données créées entre-temps. Les éventuelles séries historiques trop longues nécessitent une décision séparée.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

### Étape 3 — Opérations de série atomiques (R3) [TODO]

Fichiers : `src/app/contexts/usePlanningState.ts`, `src/data/repositories/taskRepository.ts`, le dépôt de récurrences à inspecter avant modification, `src/app/AppContext.test.tsx`. Proposition : service de persistance de séries. Dépendance : étape 2.

Avant : caractériser création depuis une tâche source, occurrences détachées, portée future, modification de date et suppression des enfants. Ajouter des scénarios d'échec après création de la règle, à mi-série et avant suppression de la source.

Changement : préparer le lot en mémoire ; transaction sur les tables réellement concernées ; rafraîchir l'interface après commit seulement. Garder le comportement existant de portée tant qu'un test ou une décision n'autorise pas sa modification.

Après : comparer les données attendues, vérifier qu'un échec conserve la source et ne laisse ni série partielle ni règle orpheline. Risque modéré à élevé. Sortie : les lots réussissent ou sont annulés intégralement. Rollback : revert du service et de son adaptation, sans retour en arrière du schéma et sans effacement des séries existantes.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

### Étape 4 — Requêtes bornées et relance des retours (R4) [TODO]

Fichiers : `src/data/sync/rpc.ts`, `feedbackStorage.ts`, `feedbackClient.ts`, tests unitaires et tests de contrat correspondants. Proposition : petit helper de transport ; ne pas fusionner les deux politiques de synchronisation snapshot/retours.

Avant : enregistrer les contrats URL, méthode, en-têtes, JSON/binaire et échecs sans exception. Ajouter avec horloge simulée une requête qui ne termine pas et un second appel concurrent.

Changement : délai injectable avec annulation de la requête, nettoyage du timer et libération du verrou ; valeur initiale proposée 30 secondes, à ajuster sur les uploads de test. Pas de nouvelles relances automatiques illimitées.

Après : dépassement du délai, nouvelle tentative possible, image déjà envoyée réutilisée, succès unique en concurrence, mode sans configuration et hors ligne. Risque modéré sur réseau lent. Sortie : aucun verrou conservé après expiration ; contrats inchangés. Rollback : revert du helper et des appels ; ni migration ni changement de protocole serveur.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

### Étape 5 — Composition des dépendances, puis état React (R5) [TODO]

Fichiers : `src/app/repositories.ts`, `src/app/AppContext.tsx`, `src/data/sync/buildSnapshot.ts`, `src/data/sync/feedbackClient.ts` et tests concernés. Dépendance : étapes 1 à 4 stabilisées.

Avant : tests de démarrage, onboarding, import, rafraîchissement et navigation ; mesure de rendu d'un écran témoin lors d'un changement sans rapport. Photographier les contrats des exports publics et les tailles de bundle sur un build neuf.

Changement : déplacer la composition de stockage vers `src/data/` et garder temporairement des réexports compatibles. Ne pas créer une autre base ni changer son nom. Si le bénéfice est établi, séparer d'abord navigation/session, puis un seul domaine pilote avec une valeur stable ; migrer réellement les consommateurs concernés. Éviter un framework générique de dépôts ou une nouvelle bibliothèque d'état.

Après : mêmes données, navigation et démarrage ; tests complets, mesure comparable des rendus et budget du bundle. Risque modéré lié aux mocks et à l'ordre d'initialisation. Sortie : couche de données indépendante du module de composition `app`, comportement préservé ; découpage supplémentaire seulement si utile. Rollback : revert de chaque petite extraction grâce aux réexports conservés.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

### Étape 6 — Geste du planning partagé, si le besoin est confirmé (R6) [TODO]

Fichiers : `src/ui/screens/dashboard/PlanningBoard.tsx`, `E12WeekPlanning.tsx` et leurs tests. Dépendance : référence navigateur disponible ; aucune modification des choix produit bloqués.

Avant : gestes gauche/droite sous et au-dessus du seuil, annulation, changement de mois, retour aujourd'hui, fin de transition, mouvement réduit et sélection d'une tâche. Reproduire le saut de semaine avant de promettre sa correction.

Changement : extraire la machine de geste minimale, adapter séparément les distances et le rendu de chaque vue. Prévoir le cas d'une transition absente/annulée pour éviter un état bloqué.

Après : tests d'états et contrôle tactile développeur sur petit écran, sans saut visible ni double navigation. Risque ergonomique modéré. Sortie : même navigation métier et geste stable. Rollback : revert de l'adaptateur d'une vue sans modifier l'autre.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Stratégie commune de vérification et acceptation

Avant chaque étape : état Git/HEAD, tests du périmètre sur la base non modifiée, puis tests de caractérisation. Après chaque étape : ces tests, TypeScript et lint ; suite complète avant clôture de l'étape. Tout échec initial reste consigné jusqu'à sa résolution explicite.

Commandes prévues une fois l'environnement restauré : contrôles TypeScript sans émission ci-dessus, `npm run lint`, Vitest via l'appel sans `.env` ci-dessus (ajouter les fichiers aux filtres pour un contrôle ciblé). La configuration de couverture fixe 85 % pour lignes, fonctions, branches et instructions ; mesurer effectivement avant d'en faire une affirmation. Les tests ajoutés doivent vérifier les pertes, reprises et contrats, pas seulement reproduire la structure des fonctions.

Pour la validation finale, dans un environnement de test autorisant les artefacts, produire un build neuf sans variables de production, puis `node scripts/check_bundle_budget.mjs <dossier-build-explicite>`. Limites lues : entrée 266428 octets / 81568 gzip ; entrée et préchargements 431790 octets / 131317 gzip. Ne pas augmenter ces seuils pour absorber la refactorisation.

Playwright est configuré en Chromium avec serveur de prévisualisation ; `npm run test:e2e` construit puis teste. Utiliser exclusivement une origine locale de test et un profil éphémère : `e2e/helpers/reset.ts` supprime la base de l'origine visitée. Couvrir les parcours import, création de série, changement de portée, navigation et persistance hors ligne. Aucune preuve E2E n'a été produite aujourd'hui.

Contrôles manuels développeur indispensables à programmer lors de l'implémentation : import invalide puis rechargement sans perte, série quotidienne de borne connue, reprise d'un retour après coupure réseau avec transport simulé, parcours hors ligne après installation PWA, navigation tactile jour/semaine et mouvement réduit. Ce sont des contrôles proposés, aucun n'est marqué validé. Conformément au périmètre « seul plan », aucune autre file de tests n'a été modifiée ; lors de l'exécution, les contrôles développeur restants iront dans la file du projet, et tout test demandé à Marie dans le catalogue in-app.

Acceptation globale : tests exécutables et verts, absence de perte lors des pannes injectées, formats de données historiques acceptés selon la politique décidée, aucun changement de contrat réseau ni de schéma implicite, budgets respectés, comportement hors ligne et navigation conservés. Chaque étape produit un commit isolé lors de sa future réalisation ; rollback par revert ciblé, jamais par réinitialisation destructive du dépôt ou de la base utilisateur.

## Décisions à prendre au moment de l'exécution

1. Autoriser d'abord la remise en état des dépendances et l'étape 1. La procédure actuelle interdisant l'installation, elle a été laissée en attente ; cela n'empêche pas la livraison de ce plan.
2. Fixer le périmètre exact des retours avec images : export, remplacement par import et suppression locale intégrale ; préciser séparément tout éventuel effacement distant. Le choix ne découle pas d'une simple extraction technique.
3. Confirmer la politique des imports partiels et versions futures. Proposition : rejeter les formes invalides avant écriture, conserver explicitement les formats anciens déjà pris en charge.
4. Appliquer la correction d'horizon aux créations futures ; décider séparément d'un éventuel traitement des séries historiques, sur données autorisées et avec sauvegarde.
5. Reporter le découpage React non justifié par une mesure et la modification tactile jusqu'à validation de leur bénéfice. Les décisions produit déjà en attente ne sont pas tranchées par ce plan.

Bilan des constats : **1 P1, 3 P2, 2 P3**. Blocage de validation : dépendances locales incomplètes. Aucun refactor exécuté.
