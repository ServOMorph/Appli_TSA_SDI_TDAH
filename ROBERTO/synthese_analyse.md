# Synthèse — Analyse préalable au skill d'orchestration multi-agents

Date : 2026-08-18
Produit par : session Claude Code (`claude-vibecoding-kit`), avant toute conception du skill générique.

---

## Constat prioritaire : collision de noms, pas de filiation

`templates/roberto` (dans `claude-vibecoding-kit`) et `Appli_TSA_SDI_TDAH\ROBERTO` (ce dossier) n'ont **aucun lien de contenu**. Ils partagent uniquement le mot "ROBERTO" pour deux raisons différentes et sans rapport :

- `templates/roberto` est un template d'automatisation PC (mascotte animée, macros Windows, UI web), extrait du projet `Roberto2`.
- `ROBERTO/` dans `Appli_TSA_SDI_TDAH` est simplement le nom de **dossier de destination par défaut** que la commande `/insert_template` du kit utilise pour n'importe quel template inséré (convention posée en v3.26) — un dossier générique, jamais spécifique au template `roberto`.

Ce dossier `ROBERTO/` ne contient **aucune trace d'insertion du template** `roberto` (ni MASCOTTE, ni MACROS, ni UI_WEB, ni `.claude/`, ni `zones.md`). Il contient exclusivement `_docs/` avec deux documents de cadrage (transcriptions de conversations ChatGPT), non versionnés par git.

**Conséquence** : la mission ne peut pas s'appuyer sur une expérience déjà vécue — il n'y a pas encore de cas réel implémenté, seulement une demande de cas réel.

---

## 1. Que contient `templates/roberto` (dans le kit) ?

33 fichiers :
- `MASCOTTE/` — rendu animé d'un hibou (ASCII-art/texte), zone-agent avec son propre `agent_role.md` (rôle : développer l'affichage visuel de la mascotte). Labo de dev autonome (`run_MASCOTTE.py`, serveur HTTP local port 8642).
- `MACROS/` — pilotage Windows bas niveau : lancer un programme (menu Démarrer), piloter la fenêtre OpenCode (focus, clics, nouvelle conversation), envoyer un message texte, capturer des coordonnées écran (F8), deux scripts de test end-to-end.
- `UI_WEB/` — application pywebview (fenêtre demi-écran gauche), pont JS↔Python (`api.py`), primitives Windows bas niveau (`launcher.py`), résolution de chemins relative, persistance JSON des dossiers récents.
- `run.py`, `ollama_call.py` (appel Ollama local, stdlib uniquement).
- `.claude/zones.md` — déclare une seule zone-agent (`mascotte`), placeholders `{{NOM_PROJET}}`/`{{ALIAS_PROJET}}`/`{{DATE}}`.
- `README.md`, `tests_manuels.md` (vide).
- Pas de `.claude/commands/` spécifique. Pas de `_contexte/` livré (décision explicite : le mécanisme `create_com_agents` était encore en pilote au moment de la construction du template, hors périmètre).
- `analysis/inventaire.md` — trace les décisions de conception (CONSERVER/GÉNÉRICISER/EXCLURE), jamais copié à l'insertion.

Dépendances : `pywin32`, `pyautogui`, `pywebview`, `tkinter` (stdlib). Aucun `requirements.txt` fourni. Une valeur codée en dur non génériciée : `UI_WEB/api.py` ligne 11, `DEFAULT_OPENCODE_DIR = "D:\\ServOMorph"`.

## 2. Quel est son rôle dans `claude-vibecoding-kit` ?

Un template parmi d'autres (`control_PC`, `discord_com`, `overlay`, `notification`) : un patron de code applicatif réutilisable, copié tel quel dans un projet cible via `/insert_template`. Aucun rapport avec l'orchestration multi-agents au sens générique — c'est une application d'automatisation PC.

## 3. Comment est-il utilisé ?

Commande kit-only `/insert_template <projet_cible> roberto [dossier_destination]` :
- Destination par défaut (si non précisée) : `<projet_cible>/ROBERTO/` — nom **fixe pour tous les templates**, pas spécifique à `roberto`. C'est l'origine du nom de ce dossier.
- Copie idempotente : fichiers déjà présents jamais écrasés, listés séparément.
- Résolution de 3 placeholders (`{{NOM_PROJET}}`, `{{ALIAS_PROJET}}`, `{{DATE}}`) dans le contenu texte uniquement ; tout token `{{...}}` hors de cette liste bloque le fichier concerné.
- `analysis/` d'un template n'est jamais copié.
- Testé et validé de bout en bout sur un projet cible de test (Phase 4 de `roadmap_template_roberto.md`, FAIT, aucun écart constaté).

## 4. Quelle est son architecture ?

Application Python/JS classique (MASCOTTE, MACROS, UI_WEB), pas de state machine, pas d'orchestration multi-agents implémentée. Seul lien déclaratif avec l'orchestration : `MASCOTTE/agent_role.md` mentionne un futur `_contexte/statut.md` vers l'orchestrateur — mais ce fichier n'est pas livré dans le template.

## 5. Que contient le ROBERTO du projet `Appli_TSA_SDI_TDAH` (ce dossier) ?

Uniquement `_docs/` :
- `prompt_vibecoding-kit.md` (892 lignes)
- `workflow1-chatgpt.md` (523 lignes)

Deux documents de cadrage issus de conversations avec ChatGPT, non versionnés par git (`git status` les signale en `??`). Aucun code, aucune configuration `.claude/`, aucun `agent_role.md`, aucune entrée dans `zones.md` du projet. Ces documents demandent, comme mission future :
1. la construction d'un système de workflow (`AGENT_WORKFLOW.md` séparé de `AGENT_STATE.md`) pour gérer trois flux indépendants : retours de tests JSON de la testeuse Marie, tâches Google Drive, branche `sync-marie` — avec moteur de décision priorisé, gestion des urgences, releases, rollback Git/Supabase ;
2. l'extraction, à partir de cette implémentation, d'un skill générique réutilisable sur d'autres projets.

À la date de cette analyse, rien de tout cela n'a été réalisé.

## 6. Quelles différences entre les deux ?

Aucun point commun structurel ni fonctionnel. Domaines métier sans rapport : automatisation PC (pilotage OpenCode, mascotte visuelle) vs assistant numérique AuDHD (PWA React/TypeScript). `templates/roberto` est un livrable fini, testé, validé. `ROBERTO/` (ce dossier) est une intention non réalisée, un cahier des charges.

## 7. Quels éléments sont déjà génériques ?

Pas dans `templates/roberto`. Côté kit, au niveau architecture générale :
- Le mécanisme `/insert_template` (copie de template + placeholders + idempotence).
- Le pattern zones/`agent_role.md` (`/create_agent`).
- Le pilote `create_com_agents` — canaux `statut.md` (agent→orchestrateur, pull) et `messages.md` (orchestrateur→agent, push), topologie étoile. Phase 2 en cours sur `Roberto2` (le vrai projet source du template, pas `Appli_TSA_SDI_TDAH`), pas encore validé en conditions réelles.
- Un design concurrent antérieur, `roadmap_messages_zones.md` (2 niveaux urgent/normal), superseded mais pas formellement écarté.

## 8. Quels éléments sont spécifiques au projet ?

Dans `templates/roberto` : tout le code MASCOTTE/MACROS/UI_WEB, spécifique au pilotage PC/OpenCode de l'écosystème `ServOMorph`.

Dans `Appli_TSA_SDI_TDAH` (hors `ROBERTO/`, à la racine du projet) : les trois flux réels décrits dans les `_docs/` (tests Marie, tâches Drive, sync branche), les scripts `scripts/ingest_manual_tests.py`, `scripts/read_device_snapshots.py`, la donnée sensible `donnees_marie\`, les roadmaps métier (`roadmap_sync_marie.md`, `roadmap_tests_marie.md`). C'est la matière réelle exploitable pour concevoir le futur skill — mais à l'état de demande, pas d'expérience vécue.

## 9. Où serait le meilleur emplacement pour le futur skill générique ?

Pas dans `templates/roberto` (collision de nom trompeuse déjà constatée, domaine non lié — risque de confusion accrue si réutilisé). Le dossier `skills/` du kit existe mais est vide : aucun mécanisme de skill Claude Code n'est actuellement utilisé, le kit fonctionne uniquement via slash commands (`.claude/commands/`). Deux options à trancher, non tranchées à ce stade :
- (a) un nouveau `templates/<nom>/` + commande kit sur le modèle de l'existant, cohérent avec la philosophie actuelle (zéro dépendance externe, fichiers Markdown/PowerShell).
- (b) un vrai skill Claude Code (`skills/`), rupture avec la convention actuelle du kit.

Nom à choisir sans référence à "roberto", pour éviter la confusion déjà démontrée par cette mission.

## 10. Existe-t-il déjà un mécanisme qui pourrait servir de fondation ?

Oui : le pilote `create_com_agents` (`roadmap_com_agents.md`, Phase 2 en cours) — `statut.md`/`messages.md`, topologie étoile — est la base la plus proche d'un mécanisme d'orchestration déjà conçu et partiellement testé, bien que non validé de bout en bout. `roadmap_messages_zones.md` est un design antérieur concurrent, à trancher (garder/écarter) avant de construire dessus.

## 11. Quels risques à modifier le template `templates/roberto` existant ?

Il est validé et stable (0 écart constaté en Phase 4 de sa roadmap). Le modifier pour y loger de la logique d'orchestration générique romprait sa cohérence (mélange automatisation PC + workflow générique) et amplifierait la confusion de nom déjà démontrée. Recommandation : ne pas toucher `templates/roberto`.

## 12. Architecture proposée pour le skill

Points à trancher avant conception, non résolus à ce stade :
1. Faut-il d'abord implémenter le système d'orchestration réel décrit dans les `_docs/` de ce dossier (`AGENT_WORKFLOW.md`/`AGENT_STATE.md` pour les 3 flux Marie/Drive/sync) et l'éprouver en conditions réelles avant d'en extraire un skill générique (respecte la prémisse initiale de la mission) — ou concevoir directement le skill à partir des besoins déjà décrits et du pilote `create_com_agents`, sans implémentation complète préalable (plus rapide, moins étayé par l'expérience réelle) ?
2. Trancher le sort de `roadmap_messages_zones.md` vs `create_com_agents` (deux designs concurrents non résolus au niveau kit).
3. Choisir l'emplacement (nouveau template vs skill Claude Code) et le nom du futur skill, disjoint de "roberto".

---

*Ce fichier reprend intégralement les résultats des trois explorations menées (lecture seule) sur `templates/roberto`, l'architecture parente de `claude-vibecoding-kit`, et ce dossier `ROBERTO`. Aucune modification n'a été apportée aux fichiers existants du kit ou du projet à ce stade.*
