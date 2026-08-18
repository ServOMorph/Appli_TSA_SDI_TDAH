Oui. Là, je te conseille de donner à ton agent orchestrateur un **prompt de mission assez précis**, mais en lui laissant de l'autonomie pour analyser le dépôt et concevoir l'architecture.

Le point important est de lui demander de faire **deux choses séparées mais liées** :

1. **Implémenter le workflow concret pour `Appli_TSA_SDI_TDAH`**.
2. **Extraire de cette implémentation un skill générique de conception/orchestration de workflows**, réutilisable sur d'autres projets.

Je lui donnerais le prompt suivant :

# Mission ROBERTO — Concevoir et implémenter un système d’orchestration de workflow de développement

## Contexte

Tu es l’agent orchestrateur principal du projet.

Le projet concerné est :

`D:\ServOMorph\Appli_TSA_SDI_TDAH`

Tu dois travailler dans le dossier :

`D:\ServOMorph\Appli_TSA_SDI_TDAH\ROBERTO\`

Le projet utilise plusieurs agents spécialisés pour développer, tester et faire évoluer l’application.

L’objectif est de faire évoluer ROBERTO afin qu’il ne soit plus seulement un orchestrateur exécutant des instructions, mais qu’il puisse :

* analyser l’état réel d’un projet ;
* comprendre les différents flux de travail en cours ;
* déterminer les priorités ;
* choisir lui-même la prochaine action pertinente ;
* éviter que plusieurs flux de travail se mélangent ;
* préparer les intégrations et releases ;
* conserver une traçabilité complète ;
* permettre des retours arrière du code sans perdre les données utilisateurs ;
* et surtout pouvoir fonctionner selon un workflow qui peut évoluer dans le temps.

Cette mission comporte **deux objectifs obligatoires**.

---

# OBJECTIF 1 — Implémenter le système dans Appli_TSA_SDI_TDAH

## 1. Analyser l'existant avant de modifier quoi que ce soit

Commence par explorer le projet existant.

Analyse notamment :

* l'architecture actuelle de ROBERTO ;
* les agents disponibles ;
* leurs responsabilités ;
* les fichiers de configuration ;
* les prompts existants ;
* les skills existants ;
* le fonctionnement Git ;
* les branches ;
* le système actuel de build/dist ;
* la manière dont les données sont actuellement gérées ;
* le fonctionnement actuel des tests ;
* les éventuels mécanismes de suivi de tâches.

Ne modifie pas immédiatement le code.

Commence par comprendre comment le système fonctionne réellement.

Si certaines hypothèses du présent document sont différentes de l'implémentation actuelle, adapte la solution à l'existant plutôt que de casser l'architecture actuelle.

---

# 2. Principe général à implémenter

ROBERTO doit fonctionner comme un **chef d'orchestre de projet**.

Il ne doit pas recevoir obligatoirement une instruction humaine détaillant exactement quoi coder.

Il doit pouvoir déterminer :

> "Quelle est la prochaine meilleure action à effectuer compte tenu de l'état actuel du projet ?"

Il doit pour cela disposer de deux niveaux d'information distincts.

### A. Le workflow

Le workflow décrit les règles générales du projet.

Exemple :

* comment prioriser les tâches ;
* comment traiter les retours du testeur ;
* comment gérer les tâches externes ;
* quand travailler sur un chantier parallèle ;
* quand préparer une release ;
* quand demander une validation humaine ;
* comment gérer les urgences ;
* comment effectuer un rollback.

Le workflow ne doit pas contenir l'état temporaire du projet.

### B. L'état du projet

L'état décrit la situation actuelle.

Il doit pouvoir indiquer par exemple :

* nouvelle session de test disponible ;
* retour testeur en attente ;
* tâches Google Drive en attente ;
* tâches Google Drive terminées ;
* branche parallèle en développement ;
* branche parallèle prête à tester ;
* release en préparation ;
* release envoyée au testeur ;
* problème urgent ;
* validation humaine attendue.

L'état doit être modifiable sans modifier les règles du workflow.

---

# 3. Séparer impérativement WORKFLOW et STATE

Conçois une architecture explicite permettant de distinguer :

### Workflow

Par exemple :

`AGENT_WORKFLOW.md`

ou une structure équivalente si l'architecture actuelle justifie autre chose.

Il contient les règles du processus.

### State

Par exemple :

`AGENT_STATE.md`

ou une structure équivalente.

Il contient l'état courant du projet.

Le système doit rester compréhensible si le workflow évolue.

Un changement de workflow ne doit pas nécessiter de réécrire tout l'historique du projet.

---

# 4. Implémenter le concept de flux indépendants

Pour le projet Appli_TSA_SDI_TDAH, le système doit être capable de gérer au minimum trois flux.

## Flux 1 — Retours du testeur

Le testeur utilise une version distribuée de l'application.

Les résultats peuvent actuellement arriver sous forme de données JSON.

Le système doit pouvoir représenter :

`ATTENTE → REÇU → ANALYSE → CORRECTIONS → INTÉGRÉ`

Le fichier JSON reçu doit être considéré comme un artefact de test.

Ne jamais détruire ou écraser silencieusement un résultat de test précédent.

Chaque session de test doit idéalement pouvoir être identifiée.

Exemple conceptuel :

```text
test-results/
    session-001/
        feedback.json
        analysis.md
        status.md

    session-002/
        feedback.json
        analysis.md
        status.md
```

Adapte cette structure à l'existant si une meilleure solution existe.

---

## Flux 2 — Tests / modifications provenant du Google Drive

Le projet dispose d'un fichier Google Drive partagé contenant des tests et des modifications à réaliser.

Le système doit pouvoir transformer ces éléments en unités de travail suivables.

Une tâche doit pouvoir avoir au minimum :

* un identifiant ;
* une description ;
* une priorité ;
* un statut ;
* une origine ;
* éventuellement des dépendances ;
* éventuellement un caractère urgent ;
* éventuellement des critères de validation.

L'agent doit être capable de distinguer :

* nouveau ;
* en cours ;
* terminé ;
* intégré ;
* bloqué.

Ne fais pas dépendre toute la logique de l'agent d'une simple lecture ad hoc du Google Drive.

Si l'architecture actuelle permet une meilleure synchronisation, propose-la.

---

## Flux 3 — sync-marie

La branche :

`sync-marie`

correspond à un chantier de développement parallèle concernant notamment le nouveau système de données avec Supabase.

ROBERTO doit pouvoir déterminer son état :

* développement ;
* en cours de vérification ;
* bloqué ;
* prêt à tester ;
* prêt à intégrer.

Il doit pouvoir continuer à travailler dessus lorsqu'il n'existe pas de travail plus prioritaire.

Important :

`PRÊT À TESTER` ne signifie pas automatiquement `À INTÉGRER`.

L'intégration doit être décidée lors de la préparation d'une release cohérente.

---

# 5. Implémenter un moteur de décision

ROBERTO doit avoir une logique de décision explicite.

Elle ne doit pas être uniquement implicite dans le prompt d'un agent.

Le principe de priorité attendu est approximativement :

## Priorité 0 — Sécurité / intégrité / blocage critique

Exemples :

* perte de données ;
* corruption ;
* bug bloquant ;
* problème empêchant les tests ;
* problème critique de déploiement.

→ traiter immédiatement.

## Priorité 1 — Nouveau retour testeur

Si un nouveau résultat de test est disponible :

→ l'analyser avant de commencer un nouveau travail secondaire.

## Priorité 2 — Travail Google Drive

S'il n'y a pas de retour testeur prioritaire :

→ traiter les tâches Google Drive disponibles.

## Priorité 3 — sync-marie

S'il n'y a pas de travail prioritaire :

→ continuer le chantier sync-marie.

## Priorité 4 — Préparation de release

Lorsque les différents flux atteignent un état suffisamment cohérent :

→ préparer une nouvelle release.

Cette hiérarchie doit cependant être conçue comme une **politique configurable**, et non comme du code rigide impossible à modifier.

---

# 6. L'agent doit EXPLIQUER son choix

À chaque décision importante, ROBERTO doit pouvoir produire quelque chose de conceptuellement similaire à :

```text
PROJECT STATUS

Tester:
JSON session 18 reçu

Google Drive:
2 tâches en attente

sync-marie:
prête pour test

Release:
non préparée

DECISION

Action sélectionnée:
Analyser le JSON de la session 18

Reason:
- nouveau retour testeur disponible
- priorité supérieure aux tâches secondaires
- aucune urgence concurrente

NEXT:
Analyser les conséquences du retour testeur
```

L'objectif est que l'humain puisse comprendre :

> pourquoi l'agent a choisi cette action.

---

# 7. Préparation d'une release

Une nouvelle dist ne doit pas être créée simplement parce qu'une tâche est terminée.

Avant une release, ROBERTO doit effectuer une analyse globale.

Il doit prendre en compte :

* modifications issues du testeur ;
* modifications issues du Google Drive ;
* état de sync-marie ;
* éventuelles urgences ;
* régressions potentielles ;
* tests nécessaires ;
* état Git ;
* état des données ;
* compatibilité des migrations.

Le résultat doit être un ensemble cohérent destiné au testeur.

Conceptuellement :

```text
JSON testeur
       +
Google Drive
       +
sync-marie
       +
corrections urgentes
       ↓
ANALYSE GLOBALE
       ↓
ENSEMBLE COHÉRENT
       ↓
TESTS
       ↓
RELEASE
       ↓
DIST
       ↓
TESTEUR
```

---

# 8. Générer automatiquement les nouveautés et tests

Lorsqu'une release est préparée, ROBERTO doit être capable de produire ou mettre à jour les informations destinées au testeur :

* nouveautés ;
* corrections ;
* changements importants ;
* tests à effectuer ;
* points à surveiller ;
* éventuellement bandeau urgent.

Le système doit permettre de distinguer clairement :

### Nouveauté

Ce qui a changé.

### Test demandé

Ce que le testeur doit vérifier.

### Urgence

Ce qui doit absolument être vérifié.

---

# 9. Gestion des urgences

Prévoir une représentation structurée des urgences.

Par exemple :

```yaml
urgent: true
reason: "Bug bloquant la création d'un utilisateur"
required_before_release: true
```

Ne pas dépendre uniquement d'un texte libre ou d'un emoji.

Le bandeau visuel peut exister pour l'humain, mais la priorité doit être interprétable par ROBERTO.

---

# 10. Git et rollback

Le système doit être conçu pour permettre des retours arrière propres.

Il faut distinguer explicitement :

### Code

Versionné par Git.

### Configuration

Versionnée si approprié.

### Migrations / schéma de données

Versionnées et contrôlées.

### Données utilisateurs

Ne doivent pas être perdues lors d'un rollback applicatif.

L'objectif est notamment de pouvoir faire :

```text
Version N
   ↓
problème
   ↓
rollback du code
   ↓
Version N-1
```

sans faire :

```text
rollback code
   ↓
perte des données utilisateurs
```

Avec Supabase, étudie précisément la séparation entre :

* code applicatif ;
* migrations ;
* schéma ;
* données persistantes.

Ne mets jamais en place une mécanique de rollback destructive sans protection explicite.

---

# 11. Git doit permettre de distinguer les travaux

Analyse la stratégie actuelle de branches.

L'objectif conceptuel est de pouvoir isoler les travaux :

```text
main
│
├── travail testeur
├── travail Google Drive
└── travail sync-marie
```

La stratégie exacte doit être adaptée à l'existant.

L'important est que ROBERTO puisse savoir :

* quelle branche représente la version testeur ;
* quelle branche contient du travail en cours ;
* ce qui est prêt ;
* ce qui a été intégré ;
* ce qui ne doit surtout pas être intégré.

Évite de rendre `main` équivalent à un espace de travail permanent.

---

# 12. Traçabilité

Chaque modification importante doit pouvoir être reliée à son origine.

Exemples :

```text
TEST-018
GD-042
SYNC-MARIE-003
URGENT-007
```

L'objectif est de pouvoir répondre à :

> Pourquoi cette modification existe-t-elle ?

et :

> Dans quelle release cette modification a-t-elle été intégrée ?

La traçabilité doit idéalement fonctionner dans les deux sens :

```text
Tâche
 ↓
commit
 ↓
release
 ↓
testeur
```

et :

```text
Retour testeur
 ↓
correction
 ↓
commit
 ↓
release
```

---

# OBJECTIF 2 — Créer un SKILL générique de conception de workflow

Cette partie est aussi importante que l'implémentation du projet.

Tu dois analyser le système que tu viens de concevoir et en extraire un **skill généraliste réutilisable pour d'autres projets**.

Ce skill ne doit PAS être spécifique à :

* Appli_TSA_SDI_TDAH ;
* Google Drive ;
* Supabase ;
* sync-marie ;
* Netlify ;
* ce testeur particulier.

Il doit être capable d'aider ROBERTO à répondre à une question générale :

> "Comment concevoir un workflow d'agents efficace pour ce projet particulier ?"

---

# 13. Mission du skill générique

Le skill devra permettre à un agent orchestrateur de :

1. analyser un nouveau projet ;
2. identifier ses flux de travail ;
3. identifier ses acteurs ;
4. identifier ses sources de tâches ;
5. identifier ses artefacts ;
6. identifier les environnements ;
7. identifier les dépendances ;
8. identifier les risques ;
9. identifier les étapes de validation ;
10. identifier les conditions de release ;
11. définir les priorités ;
12. définir les états ;
13. définir les transitions ;
14. définir les règles de décision ;
15. définir les règles de rollback ;
16. séparer workflow et état ;
17. proposer une architecture d'orchestration ;
18. produire une première version du workflow ;
19. permettre son évolution ultérieure.

---

# 14. Le skill doit d'abord ANALYSER avant de proposer

Il ne doit pas appliquer aveuglément un workflow générique.

Pour un nouveau projet, il doit commencer par poser ou déduire :

### Projet

* Quel est le produit ?
* Quelle est son architecture ?
* Quel est son cycle de développement ?

### Acteurs

* développeur ;
* agent de coding ;
* agent de test ;
* utilisateur ;
* client ;
* product owner ;
* autres agents.

### Sources de travail

Exemples :

* GitHub ;
* Google Drive ;
* tickets ;
* emails ;
* JSON ;
* bases de données ;
* documents ;
* feedback utilisateur.

### Environnements

Exemples :

* local ;
* staging ;
* production ;
* dist ;
* environnement testeur.

### Flux

Identifier les flux indépendants et leurs interactions.

---

# 15. Le skill doit construire une machine à états

Pour chaque flux important, il doit chercher à déterminer :

```text
ÉTAT
 ↓
ÉVÉNEMENT
 ↓
TRANSITION
 ↓
NOUVEL ÉTAT
```

Par exemple :

```text
ATTENTE
  ↓
nouvelle information
  ↓
REÇU
  ↓
analyse
  ↓
EN COURS
  ↓
validation
  ↓
TERMINÉ
```

Il doit détecter les états ambigus et proposer une clarification.

---

# 16. Le skill doit construire une politique de priorité

Il doit chercher à distinguer :

* urgences ;
* blocages ;
* travail obligatoire ;
* travail opportuniste ;
* travail parallèle ;
* préparation de release ;
* maintenance.

Il doit éviter une règle naïve du type :

> "toujours faire les tâches les plus anciennes."

La priorité doit dépendre du contexte du projet.

---

# 17. Le skill doit rechercher les conflits entre flux

C'est une fonction essentielle.

Il doit détecter les situations telles que :

```text
Flux A modifie X
Flux B modifie X
Flux C dépend de X
```

et déterminer comment éviter qu'un agent écrase ou mélange les travaux.

Il doit rechercher notamment :

* conflits Git ;
* conflits fonctionnels ;
* conflits de données ;
* dépendances ;
* migrations ;
* releases incompatibles ;
* changements qui doivent être regroupés.

---

# 18. Le skill doit intégrer la notion de "release boundary"

Le skill doit identifier le moment où plusieurs travaux indépendants deviennent une version cohérente.

Il doit donc distinguer :

```text
travail terminé
```

de :

```text
travail intégrable
```

et :

```text
release prête
```

Ces trois états ne doivent pas être automatiquement confondus.

---

# 19. Le skill doit intégrer la sécurité des données

Lorsqu'un projet contient des données persistantes, le skill doit systématiquement analyser :

* où sont stockées les données ;
* ce qui est versionné ;
* ce qui ne l'est pas ;
* comment fonctionnent les migrations ;
* comment effectuer un rollback ;
* quelles opérations sont destructives ;
* comment restaurer les données.

Il doit considérer la protection des données comme une contrainte d'architecture du workflow.

---

# 20. Le skill doit être évolutif

Le workflow doit pouvoir changer.

Conçois donc une architecture permettant de modifier :

* les priorités ;
* les états ;
* les agents ;
* les sources ;
* les règles de release ;
* les critères de validation ;

sans devoir réécrire toute la logique d'orchestration.

Lorsque le workflow est modifié, ROBERTO doit pouvoir identifier :

* ce qui a changé ;
* quelles règles sont nouvelles ;
* quels états existants sont impactés ;
* si l'état courant reste compatible.

---

# 21. Ne pas sur-concevoir

Ne crée pas une usine à gaz simplement parce que le système doit être générique.

Privilégie :

* simplicité ;
* lisibilité ;
* explicabilité ;
* fichiers facilement éditables ;
* conventions claires ;
* mécanismes robustes ;
* évolution progressive.

Le système doit être utilisable par un humain qui veut comprendre ce que ROBERTO fait.

---

# 22. Livrables attendus

À la fin de la mission, tu dois avoir :

### Pour Appli_TSA_SDI_TDAH

* le workflow implémenté ;
* l'état du projet représentable proprement ;
* la logique de décision de ROBERTO ;
* la gestion des différents flux ;
* la gestion des priorités ;
* la gestion des releases ;
* la gestion des retours testeur ;
* la traçabilité ;
* les protections nécessaires concernant les données ;
* la compatibilité avec le système d'agents existant.

### Pour le système générique

Un skill clairement identifié et documenté permettant à ROBERTO de concevoir un workflow adapté à n'importe quel projet.

Le skill doit expliquer :

* quand il doit être utilisé ;
* quelles informations analyser ;
* quelles questions poser ;
* comment identifier les flux ;
* comment construire les états ;
* comment définir les priorités ;
* comment détecter les conflits ;
* comment définir les release boundaries ;
* comment gérer les données persistantes ;
* comment produire le workflow ;
* comment faire évoluer le workflow.

---

# 23. Avant de coder

Commence par me fournir une analyse de l'architecture actuelle de ROBERTO et du projet.

Présente notamment :

1. ce qui existe déjà ;
2. ce qui peut être réutilisé ;
3. ce qui doit être modifié ;
4. ce qui manque ;
5. les risques ;
6. ta proposition d'architecture ;
7. comment tu comptes implémenter le skill générique.

Ne commence l'implémentation qu'après avoir suffisamment compris l'existant.

---

# 24. Règle fondamentale

Ne considère pas ce document comme une spécification rigide de chaque détail technique.

Il définit **l'objectif et les principes**.

Tu dois utiliser ton analyse du projet pour choisir la meilleure implémentation.

Si tu identifies une meilleure architecture que celle suggérée ici :

* explique-la ;
* justifie-la ;
* conserve les principes fondamentaux ;
* privilégie la solution la plus robuste et maintenable.

Le but final est que ROBERTO puisse répondre de manière autonome à :

> **"Compte tenu de l'état actuel du projet, quelle est la meilleure prochaine action, pourquoi, et comment l'exécuter sans compromettre les autres flux ni les données ?"**

Et que cette capacité soit ensuite transformable en un **skill générique de conception de workflow utilisable sur d'autres projets**.
