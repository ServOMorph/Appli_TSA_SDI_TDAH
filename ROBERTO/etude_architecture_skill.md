# Étude — Architecture pour un skill générique d'orchestration multi-agents

Date : 2026-08-18
Statut : conception uniquement, aucun code produit, aucun fichier existant modifié.
Sources : exploration complète (lecture seule) de `templates/roberto` (kit), de l'architecture parente `claude-vibecoding-kit`, du dossier `ROBERTO` d'Appli_TSA_SDI_TDAH, et de l'architecture réelle du projet Appli_TSA_SDI_TDAH (git, scripts, `_contexte/`, roadmaps).

---

## 1. Architecture de ROBERTO (`templates/roberto`, kit)

Application Python/JS d'automatisation PC, extraite de `D:\ServOMorph\Roberto2` : `MASCOTTE/` (hibou animé, zone-agent avec `agent_role.md`), `MACROS/` (pilotage Windows/OpenCode), `UI_WEB/` (pywebview, pont JS↔Python). Une seule zone-agent déclarée (`mascotte`) dans `.claude/zones.md`. Aucun mécanisme d'orchestration, de state ou de communication livré dans ce template — `agent_role.md` référence un futur `_contexte/statut.md` qui n'est pas fourni (décision actée : mécanisme encore en pilote au moment de la construction).

Le vrai terrain d'expérimentation multi-agents n'est pas `templates/roberto` (livrable figé, testé, sans state) mais son projet source `Roberto2`, où le pilote `create_com_agents` est en cours (Phase 2, `roadmap_com_agents.md`).

## 2. Architecture d'Appli_TSA_SDI_TDAH

PWA React/TypeScript/Vite/Dexie mono-zone (`.claude/zones.md` : une seule ligne, un seul alias). Pas d'`agent_role.md`, pas de structure multi-agents en place. Le pilotage du travail repose sur trois fichiers texte sans outillage dédié : `tests_manuels.md`, `roadmap_<sujet>.md` (statuts `[TODO]/[EN COURS]/[FAIT]`), `_contexte/signals.md` (questions ouvertes priorisées `[P1]/[P2]/[P3]`, `fait quand:`/`réf:`).

Trois flux réels identifiés dans le projet lui-même (pas seulement dans les `_docs/` de cadrage) :
- **Tests Marie** : export JSON manuel → `scripts/ingest_manual_tests.py` (dédoublonne par `id`, jamais d'écrasement, idempotent) → `_contexte/marie_tests_journal.json`.
- **Sync Supabase** (`roadmap_sync_marie.md`, Phase 4/4 en cours) : doit remplacer le flux manuel — schéma écrit (`supabase/schema.sql`, table `device_snapshots` en JSONB unique, RLS actif) mais **jamais exécuté en base** à ce jour.
- **Branche `sync-marie`** : divergente de `main` (20 commits d'écart d'un côté, 15 de l'autre), avec un **conflit réel confirmé** sur `CHANGELOG.md` (vérifié via `git merge-tree`, pas seulement signalé dans un `.md`).

Gate de release (`/deploy`) : étape 0 obligatoire de traitement des exports Marie, 6 vérifications bloquantes (arbre propre, `.env`, cohérence version, tests, `tsc`, lint), 5 avertissements non bloquants nécessitant confirmation explicite. Aucun moteur de décision autonome — le déclenchement est humain à chaque étape.

Aucun mécanisme Google Drive n'existe dans le code : c'est un besoin mentionné dans les documents de cadrage, jamais implémenté.

## 3. Architecture actuelle du kit

Zones/`agent_role.md` (`/create_agent`), templates copiés via `/insert_template` (idempotent, placeholders, jamais d'écrasement), contexte persistant par zone : `signals.md` (chaud, rotatif) / `contexte.md` (stable, décisions append-only) / `memory.md` (mémoire scopée, écrite uniquement via `/create_memory`). Aucun mécanisme de skill Claude Code utilisé — `skills/` existe mais est vide. Le kit fonctionne exclusivement en slash commands, philosophie zéro dépendance externe, persistance fichiers Markdown uniquement.

## 4. Mécanismes d'orchestration déjà existants

- **`create_com_agents`** (`.claude/commands/create_com_agents.md`, lu intégralement) : topologie étoile, deux canaux — `statut.md` (agent→orchestrateur, écrasé à chaque `/close`, jamais append) et `messages.md` (orchestrateur→agent, écrit directement en session, purgé à la lecture). Pas de communication agent↔agent directe. Pilote sur `Roberto2` : Phase 2 en cours, un bug réel déjà corrigé (une étape de checklist placée après un paragraphe narratif était silencieusement sautée en exécution réelle — leçon générale sur le placement des étapes conditionnelles).
- **`roadmap_messages_zones.md`** : design antérieur concurrent, 2 niveaux (`urgent.md` vérifié avant toute action significative, `messages.md` lu au `/start`). Jamais implémenté (Phase 1 non commencée). Apporte une notion absente de `create_com_agents` : un niveau "urgent" qui interrompt le flux en cours, pas seulement lu au prochain `/start`.

Aucun des deux ne comporte de moteur de décision, de détection de collision, ni de notion de release boundary.

## 5. Problèmes d'orchestration observables ou prévisibles dans ROBERTO

- Duplication manuelle de code partagé sans mécanisme de référence : `UI_WEB/mascotte/` est une copie figée de 3 fichiers sur 10 de `MASCOTTE/animations/`, maintenue à la main — un vrai problème de coordination si le nombre d'agents/composants augmente.
- Écart entre contrat déclaré et capacité livrée : `agent_role.md` de MASCOTTE mentionne `_contexte/statut.md` comme canal vers l'orchestrateur, mais ce fichier n'existe pas dans le template.
- Une seule zone-agent modélisée ; aucune réflexion sur la coordination de plusieurs agents spécialisés en parallèle n'a été nécessaire jusqu'ici — donc rien à apprendre de ROBERTO sur la détection de collision entre agents.
- Le bug réel du pilote `create_com_agents` (étape sautée silencieusement selon sa position dans le fichier) est un anti-pattern générique : une checklist de workflow doit placer ses étapes conditionnelles tôt et de façon adjacente, jamais après un bloc de synthèse narrative.

## 6. Problèmes d'orchestration observables ou prévisibles dans Appli_TSA

- Divergence de branches non gérée : `main` et `sync-marie` s'écartent depuis plusieurs sessions, conflit réel confirmé sur `CHANGELOG.md`, aucune stratégie de merge/rollback codifiée au-delà de mentions en Markdown.
- Traçabilité qui dérive silencieusement de la réalité : `_contexte/dernier_deploiement.md` affiche v5.31 alors que `main` est à v5.49 d'après `git log` — rien ne vérifie automatiquement la fraîcheur de ce fichier.
- État "prêt" déclaré dans la documentation alors que l'infrastructure réelle ne l'est pas : le schéma Supabase existe en fichier mais la table `device_snapshots` n'a jamais été créée en base — désynchronisation narration/réalité.
- Perte de données déjà survenue en pratique (bug "Budget disparu à l'import" — une réparation automatique ne recréait pas une entrée `tools` pour un compte qui en était déjà dépourvu), preuve que le risque évoqué dans les `_docs/` n'est pas hypothétique.
- Aucun moteur de décision autonome : chaque étape de `/deploy` exige une confirmation humaine, le système est un gate à checklist, pas un orchestrateur qui choisit lui-même la prochaine action.
- Deux designs de communication (`create_com_agents` / `roadmap_messages_zones.md`) non tranchés dans le kit — retarde le choix d'une fondation plutôt que d'en choisir une et d'itérer dessus.

## 7. Concepts communs (invariants)

- **Zone/agent = unité de responsabilité** disposant de son propre périmètre d'écriture — confirmé à la fois par la convention `zones.md`/`agent_role.md` du kit et par `MASCOTTE/agent_role.md`.
- **Séparation stable/chaud déjà pratiquée**, sans être nommée "workflow/state" : `contexte.md` (règles et décisions durables) vs `signals.md` (situation actuelle, actions ouvertes) est structurellement la même distinction que celle demandée pour `AGENT_WORKFLOW.md`/`AGENT_STATE.md` dans les `_docs/`. C'est la découverte la plus importante de cette étude : **le kit a déjà ce pattern**, il n'est simplement pas exploité pour arbitrer entre plusieurs flux concurrents.
- **Idempotence et non-écrasement systématiques** : `/insert_template` ne remplace jamais un fichier existant, `ingest_manual_tests.py` dédoublonne par id, `create_com_agents` ne convertit jamais automatiquement un `statut.md` non conforme. Une règle déjà mature dans le kit, directement réutilisable.
- **Communication asynchrone par fichier texte**, jamais de queue temps réel : `statut.md`/`messages.md` d'un côté, fichiers plats `signals.md`/roadmaps de l'autre.
- **Traçabilité par référence explicite** déjà pratiquée (`réf:` dans `signals.md`), à généraliser en identifiant de tâche/source.
- **Priorité tranchée manuellement à la conception**, jamais calculée automatiquement, dans les deux terrains (`P1/P2/P3` dans `signals.md`, niveaux urgent/normal dans `roadmap_messages_zones.md`).

## 8. Concepts spécifiques (non généralisables)

MASCOTTE/hibou animé, pilotage OpenCode par coordonnées d'écran (ROBERTO) ; `sync-marie`, Supabase `device_snapshots`, testeuse Marie nommée, Google Drive (Appli_TSA). Les noms de fichiers `AGENT_WORKFLOW.md`/`AGENT_STATE.md` proposés dans les `_docs/` sont une convention possible parmi d'autres, pas un invariant prouvé — et entrent en collision avec la convention déjà existante `contexte.md`/`signals.md`.

## 9. Patterns généralisables

- Séparation stable/chaud du kit (§7), à étendre en politique de priorité entre plusieurs flux concurrents, pas seulement une liste d'actions ouvertes.
- `statut.md`/`messages.md` (topologie étoile), enrichi d'un niveau "urgent" repris de `roadmap_messages_zones.md` — couvre le besoin "urgence interrompt le flux en cours" (Priorité 0 demandée pour Appli_TSA), absent de `create_com_agents` actuel.
- Idempotence/non-écrasement systématique.
- Traçabilité par référence explicite, étendue à "artefact source → tâche → modification → release".
- Gate de release à deux niveaux (bloquant / avertissement à confirmer), pattern déjà prouvé par `/deploy`, généralisable.
- Détection de collision entre flux : **absente des deux terrains actuellement** — aucun mécanisme ne détecte que deux flux touchent la même ressource. C'est un pattern à construire, pas à extraire d'un existant.

## 10. Anti-patterns

- Duplication manuelle de code partagé sans référence unique (`UI_WEB/mascotte/`).
- Étape de checklist placée après un bloc narratif → sautée silencieusement en exécution réelle (bug réel constaté sur le pilote `create_com_agents`).
- Fichier de traçabilité non maintenu automatiquement, dérivant silencieusement de la réalité (`dernier_deploiement.md`).
- État déclaré "prêt" dans la documentation sans vérification contre l'état réel (infrastructure Supabase jamais provisionnée malgré un schéma écrit).
- Perte de données réelle par réparation automatique insuffisamment stricte (bug "Budget disparu").
- Deux designs de communication concurrents non tranchés, retardant le choix d'une fondation.
- Collision de noms entre un dossier de convention générique (`ROBERTO/`, destination par défaut d'`/insert_template`) et un template métier (`templates/roberto`) — démontrée par cette session elle-même.

## 11. Capacités nécessaires du skill

- Détecter si le projet est mono-zone ou multi-agents avant de proposer quoi que ce soit (Appli_TSA est mono-zone aujourd'hui — ne pas imposer une architecture multi-agents non nécessaire).
- Vérifier l'état réel (git, fichiers de config, bases) plutôt que faire confiance aux `.md` descriptifs — les deux terrains montrent des divergences narration/réalité.
- Réutiliser le pattern stable/chaud déjà présent dans le kit plutôt que le réinventer sous un autre nom.
- Modèle de communication configurable, construit sur `create_com_agents` existant plutôt qu'un système parallèle — ajouter le niveau urgent manquant.
- Détection de collision entre flux (fichiers/zones partagés) — capacité à construire.
- Gate de release à deux niveaux (bloquant/avertissement), généralisation du pattern `/deploy`.
- Support de la traçabilité par référence, déjà pratiqué, à étendre à un identifiant de tâche/source.

## 12. Architecture proposée pour le skill

Slash-command kit-only, cohérente avec la philosophie zéro-dépendance du kit — pas un skill Claude Code (`skills/` vide, jamais utilisé, rupture de convention sans bénéfice démontré). Une commande d'analyse (lecture seule, produit une étude comme celle-ci) suivie, sur validation utilisateur, d'une écriture proportionnée à la complexité réelle détectée : de "rien à ajouter, `signals.md` suffit" à "communication enrichie + gate de collision + release boundary". S'appuie sur `create_com_agents` comme brique de communication existante à faire évoluer (niveau urgent), plutôt que de la dupliquer. Ne pas introduire `AGENT_WORKFLOW.md`/`AGENT_STATE.md` par défaut : la distinction stable/chaud existe déjà sous les noms `contexte.md`/`signals.md`.

## 13. Nom proposé

À trancher avec l'utilisateur — candidats sans référence à "roberto" : `conception_workflow`, `design_orchestration`, `analyse_workflow_multi_agents`.

## 14. Emplacement proposé

Nouvelle commande `.claude/commands/` du kit, éventuellement accompagnée de patrons dans `templates/` pour les fichiers générés par défaut — cohérent avec le fonctionnement actuel, pas un dossier `skills/`.

## 15. Méthode d'intégration dans ROBERTO

Ne pas toucher `templates/roberto` (livrable figé, validé, hors sujet — c'est une application PC, pas un terrain d'orchestration). Le futur outil de conception devrait être exercé sur `Roberto2` (projet source réel), où `create_com_agents` est déjà en pilote (Phase 2 en cours) — poursuivre et achever ce pilote avant de le généraliser, plutôt que de partir d'un nouveau design.

## 16. Méthode d'intégration dans Appli_TSA

Partir de l'existant : `signals.md` avec ses priorités `P1/P2/P3` est déjà proche d'un état priorisé. Proposer d'abord un minimum (niveau urgent ajouté à `create_com_agents`, gate de collision sur les fichiers à risque déjà identifiés dans `contexte.md`) avant d'imposer des fichiers `AGENT_WORKFLOW.md`/`AGENT_STATE.md` distincts et redondants avec `contexte.md`/`signals.md`. Respecter la Phase 4 en cours de `roadmap_sync_marie.md` — ne pas interférer avec ce chantier actif.

## 17. Boucle d'amélioration du skill

Reprendre la boucle proposée dans la mission : à chaque usage réel, se demander si le problème rencontré est spécifique ou généralisable, si le skill aurait pu le détecter, si une règle ou une question d'analyse doit être ajoutée, si un anti-pattern doit être documenté. Journaliser ces retours quelque part de traçable (sur le modèle de `base_connaissances/ameliorations_create_agent.md` pour `/create_agent`).

## 18. Plan d'implémentation

Non détaillé à ce stade — à formaliser en `roadmap_<nom_skill>.md` seulement après validation du nom (§13) et de l'emplacement (§14) avec l'utilisateur, conformément à la règle du kit sur la création de roadmap (justifiée uniquement si le travail comporte plusieurs phases distinctes et s'étale sur plusieurs sessions — ce qui est le cas ici).

---

## Principe directeur retenu

Le but n'est pas un workflow pour ROBERTO ni un workflow pour Appli_TSA, mais un skill capable d'analyser un projet agentique et de concevoir le workflow adapté — proportionné à sa complexité réelle, jamais imposé par défaut. La découverte centrale de cette étude est que le kit possède déjà, sans le nommer ainsi, le socle stable/chaud (`contexte.md`/`signals.md`) et un embryon de communication étoile (`create_com_agents`) : le skill devrait les étendre plutôt que les dupliquer sous de nouveaux noms.
