---
description: Clôture la session d'une zone — synthèse, mise à jour du contexte, commit
argument-hint: <zone>
model: sonnet
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git add:*), Bash(git commit:*), Bash(git push:*)
---

# /close <zone>

## Zones valides et dossiers réels

Lire `.claude/zones.md` pour obtenir la table des alias → dossiers réels.


## Procédure

1. Lire l'argument fourni ($ARGUMENTS).
   - Si absent : utiliser le working directory courant comme dossier cible (zone implicite).
   - Si présent mais non reconnu dans la table ci-dessus :
     répondre "Erreur : zone inconnue. Zones valides : <liste des alias>"
     et s'arrêter.
   - Si présent et reconnu : résoudre le dossier via la table.

2. Résoudre le dossier réel via la table (ou utiliser le working directory si pas d'argument),
   puis identifier la branche Git courante.
   - Sur `main`, définir `<contexte>` comme `<dossier>/_contexte` et appliquer la procédure
     complète.
   - Sur `sync-marie`, définir `<contexte>` comme
     `<dossier>/_contexte/branches/sync-marie`. Cette branche est limitée à l'authentification,
     Supabase et la synchronisation : ne pas modifier `CHANGELOG.md`, `README.md`, `WHATS_NEW`,
     `manualTestsCatalog.ts`, `tests_manuels.md` et ne jamais lancer `/deploy`.
   - Sur toute autre branche, s'arrêter et demander le périmètre avant d'écrire ou de committer.

   Sur `sync-marie`, afficher aussi `git rev-list --left-right --count main...HEAD`. Si `main`
   a avancé, signaler l'intégration à planifier ; ne jamais lancer un merge ou un rebase
   automatiquement.

2-bis. **Relevé final de l'`inbox` gateway — zones `design` et `discord` uniquement** (symétrique
   de l'étape 4-bis de `/start`). Si la zone résolue est `design` ou `discord` :
   ```bash
   python DISCORD/discord_com/gateway.py poll --zone <zone résolue> --format hook
   ```
   `ack --agent <zone> --id <id>` chaque message effectivement traité pendant la session ;
   ajouter à la synthèse (étape 3) une ligne pour tout message restant non acquitté. Étape non
   bloquante : gateway absente ou zone hors registre → sortie vide, poursuivre.
   **Zone racine : ne rien relever** — l'orchestrateur ne touche `inbox/orchestrateur/` que sur
   demande explicite de l'utilisateur.

3. Produire une synthèse de session (< 25 lignes) au format suivant :

```
# Session du AAAA-MM-JJ

## Décisions prises
- [décision actée, 1 ligne]

## Livrables produits ou modifiés
- [fichier] : [statut]

## Hypothèses validées / invalidées
- VALIDE : ...
- INVALIDE : ... -> pivot vers ...
- EN ATTENTE : ...

## Prochaine étape exacte
[1-3 lignes]

## Question bloquante pour la session suivante
[1 question, ou "Aucune"]
```

4. Mettre à jour `<contexte>/signals.md` :
   - Lire le fichier existant. Reporter tout élément non résolu.
   - Écraser la section "Dernière session" avec la synthèse de l'étape 3 (date du jour dans le titre).
   - Mettre à jour les priorités [P1/P2] sur les actions ouvertes.
   - Supprimer les entrées "Contexte chaud" périmées. Ajouter les nouvelles informations volatiles.
   - Sections sans contenu : omettre entièrement le titre (le recréer seulement si elle redevient non vide).
   - **Invariant :** chaque action ouverte doit comporter :
     - `fait quand: <critère observable en 1 ligne>` — condition concrète permettant de clore l'action
     - `réf: <fichier(s) ou contexte clé>` — où trouver le contexte nécessaire
     Si le contexte est introuvable dans la session, écrire `réf: [à préciser]` plutôt qu'omettre le champ.

5. Mettre à jour `<contexte>/contexte.md` :
   - Réécrire intégralement la section "État actuel" (5 lignes max).
   - Ajouter les décisions actées à "Décisions structurantes" (append only, 5 lignes max par entrée — le détail va dans `archive_decisions.md` ou le commit).
   - Si la liste dépasse 10 entrées : archiver les plus anciennes dans `_contexte/archive_decisions.md`.
   - Ne pas toucher à "Objectif" sauf décision explicite. Ne pas toucher à "Stack" sauf changement technique.
   - Si rien n'a changé : ne pas toucher au fichier.

6. Si une `roadmap*.md` existe dans `<dossier>` : vérifier qu'elle reflète fidèlement l'état après
   session (statuts des tâches et phases). Mettre à jour si périmée.
   Invariant : ce que lira le prochain `/start` doit être vrai.
   Sur `main` uniquement, si `src/domain/data/manualTestsCatalog.ts` existe : examiner les évolutions de la session et
   mettre à jour ce catalogue pour chaque test à demander à Marie. Le catalogue doit couvrir tous
   les tests Marie encore pertinents à la fin de l'évolution, dans un langage clair et sans détails
   techniques ou chemins locaux. Ne pas y ajouter les validations internes réservées au développement.

   Relire l'intégralité de la conversation de la session pour repérer tout test manuel dont la
   nécessité a été actée en discussion (nouveau scénario à vérifier, comportement à valider) et qui
   n'a pas encore été tracé dans un fichier. Pour chacun :
   - s'il s'agit d'une vérification technique réservée au développeur (fichier local, détail
     d'implémentation, contrôle de régression) : l'ajouter à `tests_manuels.md` (créer le fichier
     avec la consigne standard s'il n'existe pas encore) ;
   - s'il s'agit d'un comportement à valider par Marie sur son appareil réel : l'ajouter à
     `manualTestsCatalog.ts`, en langage clair, sans jargon ni chemin local.
    Ne rien ajouter si aucun test n'a été décidé dans la session — ne pas en inventer. Objectif : que
    `/deploy` (avertissements 4.4 et 4.5) reflète l'état réel des tests décidés pendant la session.

   Avant de continuer, vérifier aussi `COMMUNICATION/Marie/a_transmettre.md` : chaque changement visible pour Marie,
   décision attendue, écart assumé ou retour d'export encore pertinent de la session doit y être présent, en langage
   simple. Ce fichier ne contient jamais de liste de tests : les tests à refaire par Marie vivent uniquement dans le
   catalogue in-app (cf. `CLAUDE.md` § Spécificités projet). Ne pas déplacer les documents de
   `COMMUNICATION/Marie/livraisons/`, qui sont l'historique figé des messages déjà publiés.

7. Sur `main` uniquement, mettre à jour `README.md` à la racine du projet :
   - Refléter l'état actuel du projet (section "État actuel" de `contexte.md`).
   - Ne pas modifier les sections stables (objectif, stack, structure) sauf changement explicite.
   - Si le README n'existe pas encore : le créer avec les sections standard (objectif, stack, structure, état actuel).

8. Sur `main` uniquement, bumper la version dans `CHANGELOG.md` :
   - Lire la dernière entrée de `CHANGELOG.md` pour extraire la version actuelle (ex: `v2.2`).
   - Déterminer le type de bump à partir de la synthèse de l'étape 3 :
     - **major** si : structure de `_contexte/` modifiée, placeholder renommé ou supprimé, commande supprimée
     - **minor** dans tous les autres cas
   - Calculer la prochaine version : minor → incrémenter le chiffre après le point ; major → incrémenter le chiffre avant le point et remettre le minor à 0.
   - Ajouter en tête de `CHANGELOG.md` une nouvelle entrée :
     ```
     ## vX.Y — AAAA-MM-JJ

     ### [Ajouté / Modifié / Corrigé]
     - [reprendre les livrables produits ou décisions actées de l'étape 3]
     ```
   - Ne pas modifier les entrées existantes.

9. Avant de committer, relire les étapes 3 à 8 une par une et confirmer explicitement que chacune
   a été exécutée (pas seulement planifiée). Si une étape a une commande associée (script de build,
   régénération de vue, etc.) et qu'elle n'a pas encore été lancée dans cette session, l'exécuter
   maintenant, avant le commit — jamais après.

10. Effectuer un commit git :
    ```bash
    git diff --name-only          # vérifier tous les fichiers modifiés pendant la session
    git status                    # confirmer l'état du repo
    git add <contexte>/ [CHANGELOG.md sur main uniquement] [autres fichiers modifiés identifiés ci-dessus]
    git commit -m "close(<alias>): session AAAA-MM-JJ — <résumé 1 ligne>"
    ```
    - Le résumé reprend la première décision actée, ou la prochaine étape si aucune décision.
    - En cas de doute sur ce qu'il faut stager : préférer un commit légèrement trop large
      plutôt qu'un commit partiel laissant le repo dans un état incohérent.
    - Ne pas inclure de fichiers sans lien avec la session.
    - Si une commande de génération a modifié des fichiers après le commit (cas non censé
      survenir avec l'étape 9, mais à vérifier via `git status` après coup) : les inclure dans
      ce même commit, jamais dans un commit séparé.

11. Exécuter `git push` :
    ```bash
    git push
    ```
    Si le projet n'a pas de remote configuré, ignorer cette étape silencieusement. Si le push
    échoue (pas de remote tracking, conflit, réseau, etc.) : afficher l'erreur telle quelle dans
    le bilan de l'étape 12, ne pas tenter de résolution automatique (pas de force push, pas de
    pull/rebase automatique).

12. Afficher un bilan des résidus non commités :
    ```bash
    git status --short
    ```
    S'il reste des fichiers non commités : ajouter à la synthèse finale une ligne
    "résidus non commités : N fichiers". Pas d'action automatique — uniquement rendre visible.

13. Afficher en fin de réponse en grand format : ✌️😎

<!-- SPECIFICITES PROJET : DEBUT (préservé par /update, ne pas toucher hors de ce bloc) -->
<!-- Convention : toute règle liée à une étape précise de la Procédure ci-dessus doit la
     référencer explicitement par son numéro (ex: "Étape 6 : ..."), plutôt que compter sur la
     position physique de cette zone (toujours en fin de fichier). -->

Étape 6, sur `main` uniquement : si la session a introduit un changement visible pour Marie (nouvelle fonctionnalité,
écran, comportement modifié — pas un correctif interne ni un refacto), ajouter une entrée en
langage clair et sans jargon technique au tableau `WHATS_NEW` de
`src/ui/screens/onboarding/E01Welcome.tsx`. Ajout uniquement, ne jamais réécrire ni supprimer les
entrées existantes : le tableau accumule les changements depuis le dernier déploiement, la modale
Nouveautés de l'écran d'accueil s'appuyant dessus pour la version publiée par `/deploy`.
Étape 2, sur `main` uniquement et si la zone résolue est la racine du projet
(`Appli_TSA_SDI_TDAH`) : lancer une sauvegarde du snapshot Supabase de Marie avant de produire la
synthèse de l'étape 3 :
`( set -a; . ./.env; set +a; python scripts/backup_marie_snapshot.py )`.
Non bloquant — en cas d'échec (hors ligne, Supabase indisponible), le signaler en une ligne et
poursuivre la clôture. Symétrique de l'étape 4 de `/start` : sauvegarder aussi en fin de session
réduit la fenêtre pendant laquelle une perte de données locale chez Marie, suivie d'une
resynchronisation, écraserait le dernier bon snapshot côté Supabase — le schéma fait un `upsert`
d'une ligne unique par `device_id`, sans aucun historique. Le script est idempotent et écrit dans
`donnees_marie/` (gitignoré : sans effet sur le commit de l'étape 10). Ne jamais afficher le
contenu de `.env` ni celui d'un snapshot (données personnelles de Marie).

Étape 6, sur `main` uniquement et si la zone résolue est la racine du projet : vérifier que
`tests_manuels.md` est cohérent avant de le committer à l'étape 10 — en particulier, ne jamais
recréer ni modifier une section `[discord-auto]` que la session `discord` a supprimée pendant la
session (elle signale un test délégué validé, cf. `.claude/commands/discord_loop.md` § 3d-bis) ;
ajouter de nouvelles sections `[discord-auto]` uniquement si un nouveau test délégable a été
décidé en session. Si une section `[discord-auto]` reste présente sans avoir été observée,
la laisser telle quelle — elle attend un cycle `/discord_loop` pertinent, pas une action ici.

Étape 12, sur `main` uniquement et si la zone résolue est la racine du projet : mettre à jour le
manifeste des fichiers absents de la branche GitHub suivie puis les copier vers Drive :
`git fetch --quiet` puis `python claude-vibecoding-kit/backup_project.py . --refresh-list --upload`.
Afficher le nombre de fichiers et le résultat de la copie dans le bilan. La liste comprend les
fichiers privés/ignorés et les différences avec la branche publique, y compris les commits locaux
non publiés. Cette sauvegarde est automatique ; une erreur rclone est non bloquante mais doit être
signalée. Le script utilise `rclone copy` et ne supprime aucun fichier distant. Les dépendances et
artefacts régénérables restent exclus.

<!-- SPECIFICITES PROJET : FIN -->
