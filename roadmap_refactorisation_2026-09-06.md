# Roadmap — Fiabilisation et refactorisation

Créée le 2026-09-06 à partir du [plan de refactorisation](ROBERTO/plan_refacto_2026-09-06.md).
Le plan conserve les preuves, les limites de l'analyse et les résultats des contrôles initiaux ; cette roadmap porte l'exécution et son suivi.

## Objectif et périmètre

Ranger les artefacts de livraison hors de la racine, sécuriser l'import et les opérations sur les séries de tâches, fiabiliser les relances réseau, puis réduire les dépendances de l'état global et la divergence des gestes du planning.

Conserver React, Dexie, le fonctionnement hors ligne, les contrats réseau, les formats historiques pris en charge et les parcours existants, sauf corrections explicitement décrites ci-dessous. Les phases 3 à 6 comportent des corrections de comportement ; les phases 7 et 8 sont des refactorisations conditionnées à un bénéfice établi.

Hors périmètre : nouvelles fonctionnalités, décisions produit déjà en attente, données réelles de Marie, services Discord, audit serveur Supabase, mise à niveau générale des dépendances, déploiement et réparation automatique de données historiques. Le nettoyage de racine est limité aux commentaires de livraison générés ; il n'autorise pas un tri ou une suppression générale des fichiers du projet.

Toutes les phases sont initialisées `[TODO]` : la création de cette roadmap ne lance pas l'implémentation. Une seule phase travaillée à la fois ; mise à jour des statuts lors de `/close`, conformément aux consignes du projet.

## Ordre et correspondance avec le plan

| Phase | Sujet | Référence | Prérequis |
|---|---|---|---|
| 1 | Restaurer les contrôles de référence | Étape 0 | Aucun |
| 2 | Ranger les commentaires de livraison | Nettoyage de racine | Phase 1 |
| 3 | Import validé et atomique | R1 — P1 | Phases 1 et 2 |
| 4 | Corriger l'horizon des récurrences | R2 — P2 | Phase 1 ; après 3 dans l'ordre recommandé |
| 5 | Rendre les opérations de série atomiques | R3 — P2 | Phase 4 |
| 6 | Borner les requêtes et permettre leur relance | R4 — P2 | Phase 1 ; après 5 dans l'ordre recommandé |
| 7 | Clarifier la composition et l'état React | R5 — P3 | Phases 3 à 6 stabilisées |
| 8 | Mutualiser le geste du planning si utile | R6 — P3 | Référence navigateur disponible ; après 7 ou son report acté |

Les constats datent de l'analyse du 2026-09-06. Les vérifier sur le checkout de réalisation avant chaque modification : le dépôt évoluait déjà pendant l'analyse.

## Décisions à consigner avant les changements concernés

| Décision | Proposition issue du plan | Moment |
|---|---|---|
| D1 — Imports partiels et versions futures | Rejeter les structures invalides avant écriture, maintenir explicitement les anciens formats acceptés | Phase 3, avant durcissement de validation |
| D2 — Retours avec images | Distinguer export, remplacement par import et effacement local intégral ; ne pas inclure ou supprimer silencieusement ces retours | Phase 3, avant toute modification de ce périmètre |
| D3 — Conservation des docx locaux | Conserver les fichiers générés, nommés par version, sous `COMMUNICATION/Marie/commentaires/` et exclus de Git ; le Drive reste le support remis à Marie | Phase 2 |
| D4 — Séries historiques trop longues | Corriger les créations futures ; traiter les anciennes séries uniquement dans une demande séparée | Phase 4 |
| D5 — Délai réseau | **Tranchée (2026-09-07) : 30 secondes, injectable par appel (`DEFAULT_NETWORK_TIMEOUT_MS`).** Vérifiée sur horloge simulée, pas sur uploads réels. | Phase 6 |
| D6 — Découpage React supplémentaire | Le retenir uniquement si une mesure ou un besoin de test concret le justifie | Phase 7 |
| D7 — Geste de semaine | Reproduire le défaut et confirmer le bénéfice de l'extraction, sans trancher les choix produit de navigation | Phase 8 |

D1 et D2 ne doivent pas empêcher l'extraction à comportement constant ni l'ajout d'une transaction conservant le périmètre actuel. Si leur arbitrage reste ouvert, isoler le changement correspondant et le signaler comme résiduel ; ne pas déclarer toute la phase terminée. D3 doit être tranchée avant de supprimer les copies locales historiques ; la proposition conserve les docx, hors de la racine et hors de Git.

## Règles de réalisation et contrôles communs

- Relever HEAD et `git status --short` au début de chaque phase. Préserver les changements concurrents ; ne pas les inclure dans les commits de refactorisation.
- Avant modification, exécuter les tests du périmètre et ajouter les tests de caractérisation pertinents. Conserver les erreurs préexistantes dans le bilan.
- Après modification, exécuter les tests ciblés, TypeScript et lint. Exécuter la suite complète avant validation de chaque phase de code.
- Utiliser des données synthétiques, un profil navigateur éphémère et une origine locale de test. Aucun accès à `.env` ou aux données privées sans instruction explicite. Configurer les outils pour ne pas charger les secrets indirectement.
- Conserver un changement réversible par commit lors de l'implémentation. Retour arrière par revert ciblé ; ne pas réinitialiser le dépôt partagé ou la base utilisateur.
- Aucun seuil de test ou de taille de bundle ne doit être abaissé ou augmenté pour masquer une régression.
- Les contrôles manuels développeur restants seront ajoutés à la file du projet lors de l'implémentation ; les tests destinés à Marie iront au catalogue in-app. Les contrôles ci-dessous sont proposés, pas déjà validés.

Commandes de référence utilisées ou identifiées par le plan, depuis la racine :

```powershell
node node_modules/typescript/bin/tsc -p tsconfig.app.json --incremental false
node node_modules/typescript/bin/tsc -p tsconfig.node.json --incremental false
npm run lint
node --input-type=module -e 'import { startVitest } from "vitest/node"; const ctx = await startVitest("test", [], { run: true, cache: false, configLoader: "runner", reporters: ["dot"], maxWorkers: 4 }, { envFile: false }); await ctx.close();'
```

Pour les tests ciblés, remplacer le tableau vide de filtres de `startVitest` par les chemins des tests concernés. Pour le build et Playwright, préparer en phase 1 une configuration de test sans backend réel ni lecture de `.env`. Les commandes ordinaires `npm run build` et `npm run test:e2e` ne dispensent pas de cette préparation.

## Phase 1 — Restaurer les contrôles de référence [FAIT]

Périmètre : environnement de dépendances et configurations de vérification. Risque : faible pour le code, mais risque d'écraser l'environnement d'une autre session si la remise en état est menée sans coordination.

- [ ] Relever les versions réellement utilisées, HEAD, les changements en cours et la disponibilité des dépendances.
- [ ] Reconstituer l'installation à partir du verrou existant dans le checkout de travail choisi, sans mise à niveau générale ni modification injustifiée du verrou.
- [ ] Relancer TypeScript, lint et Vitest ; consigner commandes, codes de sortie, durées et nombre réel de tests exécutés.
- [ ] Distinguer les diagnostics qui disparaissent avec les dépendances des défauts de code persistants.
- [ ] Préparer un build de test neuf, avec configuration sans secrets et destination explicite non versionnée ; exécuter le contrôle de taille du bundle sur ce build.
- [ ] Exécuter les tests navigateur avec profil éphémère et établir les éventuels échecs préexistants ; mesurer la couverture initiale si disponible.

**Critère de validation :** contrôles exécutables, résultats documentés ; base verte ou écarts préexistants précisément isolés et explicitement acceptés avant la suite. Ne pas reprendre comme résultat courant les « 783 tests verts » historiques.

**Retour arrière :** abandonner l'environnement de test préparé sans toucher au travail partagé ; aucune évolution de schéma ou de données.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 2 — Ranger les commentaires de livraison [FAIT]

Périmètre : les neuf fichiers `commentaires_marie_v*.docx` aujourd'hui à la racine, la règle correspondante de `.gitignore` et `.claude/commands/deploy.md` étape 11. Risque faible pour le code, mais risque opérationnel si le script conserve un chemin racine ou si un fichier existant est écrasé.

- [ ] Établir l'inventaire des docx générés présents à la racine et vérifier qu'ils correspondent au motif `commentaires_marie_*.docx` ; ne déplacer aucun autre fichier sans demande distincte.
- [ ] Créer le dossier cible `COMMUNICATION/Marie/commentaires/` et y déplacer les docx existants avec une opération traçable. Conserver leurs noms versionnés et leurs dates ; aucun document ne doit être supprimé.
- [ ] Modifier `.gitignore` pour ignorer `COMMUNICATION/Marie/commentaires/commentaires_marie_*.docx` et retirer la règle racine une fois que l'inventaire ne contient plus de docx généré à la racine.
- [ ] Modifier `.claude/commands/deploy.md` étape 11 pour que `pandoc` écrive directement dans `COMMUNICATION/Marie/commentaires/commentaires_marie_<version>.docx` et que `rclone copyto` lise ce même chemin avant son dépôt dans `tsa_gdrive:Projets/Appli/`.
- [ ] Vérifier tous les chemins cités par la commande, son en-tête d'outils autorisés et les documents opérationnels qui décrivent ce flux ; adapter seulement les références actives au chemin local généré.
- [ ] Exécuter une génération locale sur un commentaire synthétique, vers un nom de version de test et sans publier sur Drive ; confirmer l'absence de création de docx à la racine. Retirer l'artefact de test de façon ciblée après vérification.
- [ ] Consigner D3 : conservation locale nommée par version hors racine, ou autre politique explicitement décidée. Ne pas modifier les archives narratives ni les références au nom du fichier Drive, qui restent valides.

**Critère de validation :** racine débarrassée des seuls docx générés identifiés, fichiers historiques conservés dans le dossier dédié, future génération locale écrite au même endroit, et dépôt Drive inchangé par la modification de chemin.

**Retour arrière :** déplacer les docx vers leur emplacement d'origine et revert des modifications de chemin. Aucun dépôt Drive ni document existant ne doit être supprimé par le rollback.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 3 — Import validé et atomique [FAIT]

Référence : R1, priorité P1. Périmètre prévu par le plan : hook des paramètres, snapshot, interface d'import et tests associés. Nouveaux modules possibles : normalisation pure et service de restauration. Risque élevé : remplacement global des données.

- [ ] Avant : caractériser les formats historiques, le round-trip 3.6 et les réparations actuelles de catégories et d'outils.
- [ ] Ajouter un test d'intégration reproduisant l'échec à mi-import avec fake-indexeddb, en comparant toutes les tables avant/après.
- [ ] Couvrir doublons, éléments `null`, tableaux mal typés, références orphelines et versions futures ; consigner D1.
- [ ] Extraire la normalisation à comportement constant, puis appliquer la politique de validation avant toute écriture.
- [ ] Englober effacement et réinsertion dans une transaction unique ; mettre à jour l'état React seulement après commit.
- [ ] Transformer toutes les erreurs en résultat d'import exploitable et vérifier que l'interface quitte l'état « import en cours ».
- [ ] Consigner D2 et traiter séparément toute évolution du périmètre des retours avec images ; préserver ces retours dans les tests tant qu'aucune autre politique n'est actée.
- [ ] Après : vérifier annulation intégrale sur panne injectée, succès complet, compatibilité historique et rechargement sans perte ; passer les contrôles communs.

**Critère de validation :** aucun changement de données en cas d'échec ; restauration complète en cas de succès ; décisions de compatibilité et de périmètre consignées. Contrôle navigateur développeur de l'import invalide puis rechargement.

**Retour arrière :** revert séparé de l'extraction ou de la correction ; aucune migration irréversible. Un retour arrière du code ne doit jamais effacer les données créées depuis.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 4 — Corriger l'horizon des récurrences [FAIT]

Référence : R2, priorité P2. Périmètre prévu : hook de planification, règles de récurrence et tests métier/intégration. Risque modéré : nombre et dates des occurrences créées.

- [ ] Avant : reproduire via la création de série le cas du 06/09/2026 décrit par le plan.
- [ ] Verrouiller la convention de borne à +90 jours inclusive : 91 dates quotidiennes avec la racine, jusqu'au 05/12/2026 pour ce cas.
- [ ] Ajouter janvier, décembre, février bissextile, fin par date et fin par nombre d'occurrences.
- [ ] Extraire et corriger le calcul de fenêtre ; conserver les autres champs et règles.
- [ ] Appliquer D4 : ne modifier aucune occurrence historique dans cette phase.
- [ ] Après : vérifier le lot réellement enregistré, ses bornes et son nombre ; passer les contrôles communs.

**Critère de validation :** disparition du mois supplémentaire, bonnes bornes aux changements de mois et d'année, séries antérieures inchangées. Vérifier au navigateur une création synthétique.

**Retour arrière :** revert du calcul et de son intégration, sans purge des occurrences existantes.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 5 — Rendre les opérations de série atomiques [FAIT]

**Clôturée le 2026-09-07, commit `bbdf662`.** Nouveau service `src/data/services/seriesPersistence.ts`
(`persistSeriesBatch` — lot préparé en mémoire puis transaction Dexie unique `rw` sur `tasks` +
`taskRecurrences`, résolution des sous-étapes incluse). `usePlanningState` route créations, éditions
et suppressions de série par ce service ; l'occurrence isolée non récurrente garde le chemin direct.
Règles de portée inchangées, UI rafraîchie après commit uniquement. Tests : `seriesPersistence.test.ts`,
9 cas dont 5 pannes injectées (règle, mi-série, avant suppression de source, édition, suppression) —
rollback intégral prouvé (source conservée, aucune règle orpheline, aucune série partielle). Contrôle
navigateur réel : création d'une série quotidienne → série entière + une seule règle. Suite complète
98 fichiers / 805 tests verts, tsc app+node exit 0, lint 0, budget bundle OK. Contrôle dev ajouté à
`tests_manuels.md`. Prochaine action : Phase 6.

Référence : R3, priorité P2. Périmètre prévu : planification, dépôts de tâches/récurrences et service de persistance de série. Risque modéré à élevé : opérations multi-enregistrements.

- [ ] Avant : caractériser création depuis une source, occurrences détachées, passé conservé, portée future, édition de date et suppression des enfants.
- [ ] Ajouter les pannes après création de la règle, à mi-série et avant suppression de la source.
- [ ] Préparer le lot de changements en mémoire, puis le persister dans une transaction portant sur toutes les tables concernées.
- [ ] Appliquer cette séparation aux créations, éditions et suppressions de séries ; conserver les règles de portée actuelles.
- [ ] Rafraîchir l'interface uniquement après validation de la transaction.
- [ ] Après : prouver qu'un échec conserve la source et ne laisse ni série partielle ni règle orpheline ; passer les contrôles communs.

**Critère de validation :** chaque opération réussit entièrement ou est annulée entièrement ; occurrences détachées et passées traitées comme dans les tests de référence.

**Retour arrière :** revert du service et des adaptations des hooks ; pas de retour en arrière du schéma ni de suppression des données existantes.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 6 — Borner les requêtes et fiabiliser la relance [FAIT]

**Clôturée le 2026-09-07 (commit `close` du jour).**
Changements :
- `src/data/sync/rpc.ts` : `callRpc(name, params, { timeoutMs })` ; `DEFAULT_NETWORK_TIMEOUT_MS = 30_000`
  (D5) ; `AbortController` + `setTimeout(abort)` + `clearTimeout` en `finally` ; expiration →
  `{ data: null, error: Error('rpc <name> a expiré (<ms> ms)') }`. URL, méthode, en-têtes et corps
  inchangés (seul `signal` ajouté). Contrat non-levant conservé.
- `src/data/sync/feedbackStorage.ts` : même bornage pour `uploadFeedbackImage` (`timeoutMs`, message
  « upload du retour a expiré (<ms> ms) »).
- `src/data/sync/feedbackClient.ts` : `void task.finally(...)` au lieu de `task.then(...)` — le verrou
  `inFlight` est libéré quel que soit le sort de la promesse. `syncReports` a un `try/catch` global
  et ne rejette pas aujourd'hui : ce `.finally` est défensif, la garantie matérielle de libération
  vient du timeout transport (un `fetch` bloqué règle désormais `task`).
- `src/data/sync/syncClient.ts` : aucun changement de code. Bénéficie du timeout de `callRpc` ;
  `LAST_ATTEMPT_KEY` déjà écrit avant l'appel → throttle 1 h préservé même sur expiration.
- Politiques de throttle distinctes conservées : snapshot 1 h, retours 60 s par rapport. Aucune
  boucle de retry ajoutée.

Tests (+1 fichier, +11 cas → 99 fichiers / 816) :
- `rpc.test.ts` (+5) et `feedbackStorage.test.ts` (nouveau, 4) : horloge simulée — `signal` transmis
  à `fetch`, expiration → `{ error }` avec `signal.aborted === true`, délai par défaut appliqué,
  timer nettoyé (`vi.getTimerCount() === 0`) sur réponse avant expiration.
- `feedbackClient.test.ts` (+2) : expiration → `markFailed` + verrou libéré + tentative suivante
  repart ; verrou libéré même si la tentative rejette.
- `syncClient.test.ts` (+1) : expiration → `false`, throttle conservé (2e appel non relancé).

Commandes et résultats : `tsc -p tsconfig.app.json` exit 0, `tsc -p tsconfig.node.json` exit 0,
`npm run lint` exit 0, Vitest 99 fichiers / 816 tests verts, `npm run build` + `npm run bundle:check`
→ budget respecté (chunk d'entrée 262,97 kB < 266,43 ; inchangé, aucun impact bundle).

Décision : D5 tranchée — 30 s, injectable par appel.

Contrôle manuel restant : `tests_manuels.md` § « Bornage des requêtes réseau et reprise après
coupure (Phase 6) » — reprise après coupure simulée au navigateur, non effectuée.

Prochaine action : checkpoint Phase 6 ci-dessous. Phases 7-8 conditionnelles P3, non planifiées.

Référence : R4, priorité P2. Périmètre prévu : transport RPC, upload des images, client des retours et tests de contrat. Risque modéré sur réseau lent.

- [ ] Avant : verrouiller URL, méthode, en-têtes, JSON/binaire et erreurs retournées ; couvrir les appels concurrents.
- [ ] Ajouter avec horloge simulée une requête qui ne termine pas.
- [ ] Consigner D4 ; introduire un délai injectable, une annulation effective et le nettoyage du timer.
- [ ] Garantir la libération du verrou de tentative en cours après succès, erreur ou expiration.
- [ ] Conserver les politiques distinctes de synchronisation snapshot/retours ; éviter les boucles de retry illimitées.
- [ ] Après : tester expiration puis nouvelle tentative, réutilisation d'une image déjà envoyée, absence de doublon concurrent, mode hors ligne et absence de configuration.
- [ ] Passer les contrats réseau et les contrôles communs ; réaliser une reprise après coupure simulée au navigateur.

**Critère de validation :** une requête expirée ne bloque pas les tentatives suivantes ; aucun changement de protocole ou perte de retour local.

**Retour arrière :** revert du helper de transport et de ses appels ; aucune migration ni modification serveur.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 7 — Clarifier la composition et l'état React [TODO]

Référence : R5, priorité P3. Périmètre prévu : composition des dépôts, contexte global, snapshot et client des retours. Risque modéré : ordre d'initialisation, compatibilité des imports et mocks.

- [ ] Avant : relever les contrats d'exports publics, les tests de démarrage/navigation/import et les mesures du bundle.
- [ ] Mesurer les rendus d'un écran témoin lors d'un changement d'un autre domaine ; consigner D5.
- [ ] Déplacer la composition du stockage vers un module de données neutre, avec réexports compatibles, sans changer le nom de base ni multiplier ses instances.
- [ ] Si le bénéfice est établi, séparer navigation/session puis un seul domaine pilote ; migrer les consommateurs correspondants et stabiliser leurs valeurs de contexte.
- [ ] Si le bénéfice n'est pas établi, consigner le report du découpage supplémentaire, sans prétendre l'avoir réalisé.
- [ ] Après : rejouer démarrage, onboarding, import et navigation ; comparer rendus et bundle ; passer les contrôles communs.

**Critère de validation :** couche de données indépendante de la composition `app`, compatibilité conservée et bénéfice du découpage supplémentaire démontré ou report explicitement acté. Pas de nouvelle bibliothèque d'état.

**Retour arrière :** revert de chaque extraction indépendamment, en s'appuyant sur les réexports de compatibilité.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 8 — Harmoniser le geste du planning si utile [TODO]

Référence : R6, priorité P3. Périmètre prévu : planning jour/semaine et tests associés. Risque ergonomique modéré. Phase conditionnelle à D7.

- [ ] Avant : reproduire le défaut de semaine au navigateur ; décider de poursuivre ou de reporter explicitement la phase.
- [ ] Si retenue, caractériser gestes gauche/droite, seuil, annulation, changement de mois, retour aujourd'hui et sélection d'une tâche.
- [ ] Extraire uniquement la machine de geste commune ; garder les rendus et distances jour/semaine distincts.
- [ ] Couvrir fin de transition absente/annulée et préférence de mouvement réduit.
- [ ] Après : tests d'états, contrôle tactile sur petit écran, absence de saut et de double navigation ; passer les contrôles communs.

**Critère de validation :** geste stable et navigation métier conservée, confirmé par tests et contrôle tactile ; ou report explicite sans déclarer le comportement corrigé.

**Retour arrière :** revert de l'adaptateur d'une vue sans modifier le comportement de l'autre.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Acceptation finale et suivi

- [ ] Phases de fiabilisation et de rangement validées ; sort des deux phases P3 conditionnelles explicitement consigné.
- [ ] Suite automatisée, TypeScript et lint verts, avec résultats réellement exécutés et écarts initiaux résolus ou explicitement acceptés.
- [ ] Build neuf et budget du bundle contrôlés : limites de référence du plan, entrée 266428 octets / 81568 gzip ; entrée avec préchargements 431790 octets / 131317 gzip. Relire la configuration de référence avant mesure.
- [ ] Parcours navigateur et persistance hors ligne validés ; aucun test exécuté sur une origine ou une base de production.
- [ ] Compatibilité des imports et transactions sur panne vérifiées ; aucun traitement implicite des données historiques.
- [ ] Contrats réseau conservés, reprises fonctionnelles et contrôles manuels résiduels correctement tracés.
- [ ] Bilan des changements, commits, tests, décisions et retours arrière disponible. Déploiement exclu de cette roadmap sauf demande ultérieure.

À chaque clôture de phase, renseigner : date et commit de référence, changements effectués, commandes et résultats, décisions prises, contrôles manuels restants, prochaine action exacte. Une phase reportée ne doit jamais être présentée comme implémentée ; adapter son statut et le périmètre final lors de `/close` selon la décision actée.

Première action à lancer lors de la réalisation : **Phase 1 — état Git et rétablissement des contrôles de référence**.
