---
description: Clôture la session d'une zone — synthèse, mise à jour du contexte, commit
argument-hint: <zone>
model: sonnet
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git add:*), Bash(git commit:*), Bash(git push:*), PowerShell(python *backup_file.py*)
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

2. Résoudre le dossier réel via la table (ou utiliser le working directory si pas d'argument).

2-bis. **Hook de zone — Pré-synthèse.** Si `<dossier>/_contexte/on_close.md` existe : le charger et
   exécuter les instructions de sa section « Pré-synthèse » si elle est présente. Rien à faire sinon.
   Non bloquant : en cas d'échec d'une commande du hook, le signaler en une ligne et poursuivre la
   clôture. Contrat des sections : `on_close_TEMPLATE.md` du kit.

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

4. Mettre à jour `<dossier>/_contexte/signals.md` :
   - Lire le fichier existant. Reporter tout élément non résolu.
   - **Rotation des sessions :** Si le nombre de blocs `# Session du` dépasse 1 (seuil) :
     - Déplacer toutes les sessions sauf la plus récente vers `<dossier>/_contexte/archive_sessions.md` (append only, préfixer par `---` si le fichier existe déjà).
     - Conserver uniquement la dernière session dans `signals.md`.
   - Écraser la section "Dernière session" avec la synthèse de l'étape 3 (date du jour dans le titre).
   - Mettre à jour les priorités [P1/P2] sur les actions ouvertes.
   - Supprimer les entrées "Contexte chaud" périmées. Ajouter les nouvelles informations volatiles.
   - Sections sans contenu : omettre entièrement le titre (le recréer seulement si elle redevient non vide).
   - **Invariant :** chaque action ouverte doit comporter :
     - `fait quand: <critère observable en 1 ligne>` — condition concrète permettant de clore l'action
     - `réf: <fichier(s) ou contexte clé>` — où trouver le contexte nécessaire
     Si le contexte est introuvable dans la session, écrire `réf: [à préciser]` plutôt qu'omettre le champ.

5. Mettre à jour `<dossier>/_contexte/contexte.md` :
   - Réécrire intégralement la section "État actuel" (5 lignes max).
   - Ajouter les décisions actées à "Décisions structurantes" (append only, 5 lignes max par entrée — le détail va dans `archive_decisions.md` ou le commit).
   - Si la liste dépasse 10 entrées : archiver les plus anciennes dans `_contexte/archive_decisions.md`.
   - Ne pas toucher à "Objectif" sauf décision explicite. Ne pas toucher à "Stack" sauf changement technique.
   - Si rien n'a changé : ne pas toucher au fichier.

6. Si une `roadmap*.md` existe dans `<dossier>` : vérifier qu'elle reflète fidèlement l'état après
   session (statuts des tâches et phases). Mettre à jour si périmée.
   Invariant : ce que lira le prochain `/start` doit être vrai.

7. Base de connaissances (`DOCUMENTATION/`), si la zone fermée n'est pas `documentation` elle-même :
   - Si `<racine du projet>/DOCUMENTATION/INDEX.md` n'existe pas (pas d'agent documentaire sur ce
     projet) : ignorer cette étape.
   - Sinon : évaluer si la session a produit une information utile aux autres zones du projet
     (décision transversale, référence externe stable, donnée métier durable) — pas une info propre
     à cette seule zone.
   - Si oui : proposer à l'utilisateur l'entrée à ajouter/mettre à jour dans `DOCUMENTATION/`
     (fichier concerné + ligne d'`INDEX.md`) et attendre confirmation avant d'écrire — cette zone
     n'a pas la main sur le dossier d'une autre zone.
   - Si oui : ajouter aussi une action de triage dans `DOCUMENTATION/_contexte/signals.md`, sans
     modifier les documents de connaissance. Utiliser le format `[P2|ouvert|source=<alias>]`, avec
     `fait quand:` (décision documentaire prise) et `réf:` (fichier ou décision source). Ne pas
     créer de doublon si une action portant la même référence est déjà ouverte.
   - Si `DOCUMENTATION/_contexte/signals.md` a été modifié : l'inclure au commit de l'étape 13.
   - Si non : ne rien faire, ne pas le mentionner dans le bilan.

8. Mettre à jour `README.md` à la racine du projet :
   - Refléter l'état actuel du projet (section "État actuel" de `contexte.md`).
   - Ne pas modifier les sections stables (objectif, stack, structure) sauf changement explicite.
   - Si le README n'existe pas encore : le créer avec les sections standard (objectif, stack, structure, état actuel).

9. Bumper la version dans `CHANGELOG.md` :
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

10. Avant de committer, si `scripts/check_kit.py` existe à la racine du projet, exécuter le
   contrôle d'intégrité mécanique (sinon passer directement à l'étape 12) :
   ```bash
   python scripts/check_kit.py
   ```
   **Règle :** un écart signalé bloque le commit tant qu'il n'est pas traité ou explicitement écarté.

   Si le contrôle passe (exit code 0) : continuer à l'étape 12.
   Si le contrôle échoue (exit code 1) :
   - Lister les écarts détectés
   - Traiter chaque écart ou le consigner explicitement comme "écart connu à corriger en Phase X"
   - Ne pas committer tant que des écarts non consignés persistent

12. Relire les étapes 3 à 9 une par une et confirmer explicitement que chacune
   a été exécutée (pas seulement planifiée). Si une étape a une commande associée (script de build,
   régénération de vue, etc.) et qu'elle n'a pas encore été lancée dans cette session, l'exécuter
   maintenant, avant le commit — jamais après.

13. Effectuer un commit git :
    ```bash
    git diff --name-only          # vérifier tous les fichiers modifiés pendant la session
    git status                    # confirmer l'état du repo
    git add <dossier>/_contexte/ CHANGELOG.md [autres fichiers modifiés identifiés ci-dessus]
    git commit -m "close(<alias>): session AAAA-MM-JJ — <résumé 1 ligne>"
    ```
    - Le résumé reprend la première décision actée, ou la prochaine étape si aucune décision.
    - En cas de doute sur ce qu'il faut stager : préférer un commit légèrement trop large
      plutôt qu'un commit partiel laissant le repo dans un état incohérent.
    - Ne pas inclure de fichiers sans lien avec la session.
    - Si une commande de génération a modifié des fichiers après le commit (cas non censé
      survenir avec l'étape 12, mais à vérifier via `git status` après coup) : les inclure dans
      ce même commit, jamais dans un commit séparé.

14. Exécuter `git push` :
    ```bash
    git push
    ```
    Si le projet n'a pas de remote configuré, ignorer cette étape silencieusement. Si le push
    échoue (pas de remote tracking, conflit, réseau, etc.) : afficher l'erreur telle quelle dans
    le bilan de l'étape 15, ne pas tenter de résolution automatique (pas de force push, pas de
    pull/rebase automatique).

14-ter. **Hook de zone — Fin.** Si `<dossier>/_contexte/on_close.md` existe et contient une section
    « Fin » : l'exécuter maintenant. Rien à faire sinon. Non bloquant. S'exécute même si le `git
    push` de l'étape 14 a échoué : une sauvegarde de fin de session ne dépend pas du push.

15. Afficher un bilan des résidus non commités :
    ```bash
    git status --short
    ```
    S'il reste des fichiers non commités : ajouter à la synthèse finale une ligne
    "résidus non commités : N fichiers". Pas d'action automatique — uniquement rendre visible.

16. Afficher en fin de réponse en grand format : ✌️😎

<!-- SPECIFICITES PROJET : DEBUT (préservé par /update, ne pas toucher hors de ce bloc) -->
<!-- Convention : toute règle liée à une étape précise de la Procédure ci-dessus doit la
     référencer explicitement par son numéro (ex: "Étape 6 : ..."), plutôt que compter sur la
     position physique de cette zone (toujours en fin de fichier). -->

## Substitution `<contexte>` (branches Git)

**Avant l'étape 2**, identifier la branche Git courante et définir `<contexte>` :
- Sur `main` : `<contexte>` = `<dossier>/_contexte`. Procédure complète.
- Sur une branche `agent/<alias>` correspondant à un alias déclaré dans `.claude/zones.md` (casse
  ignorée) : `<contexte>` = `<dossier>/_contexte`. Écrire et committer uniquement les livrables
  autorisés par `agent_role.md`, sur cette branche. Ne jamais fusionner, rebaser, déployer ni
  modifier `main`.
- Sur toute autre branche : s'arrêter et demander le périmètre avant d'écrire ou de committer.

**Étapes 4, 5, 13** : partout où le corps générique lit ou stage `signals.md` / `contexte.md` /
`archive_sessions.md` / `archive_decisions.md` sous `<dossier>/_contexte/`, lire et stager sous
`<contexte>/`. Sur `main`, `<contexte>` = `<dossier>/_contexte` : comportement identique au
générique.

## Spécificités projet

- Étape 3 (avant) — **relevé final de l'`inbox` gateway**, zones `design` et `discord` uniquement
  (symétrique de l'étape 4 de `/start`) :
  ```bash
  python DISCORD/discord_com/gateway.py poll --zone <zone résolue> --format hook
  ```
  `ack --agent <zone> --id <id>` chaque message effectivement traité pendant la session ; ajouter à
  la synthèse (étape 3) une ligne pour tout message restant non acquitté. Non bloquant : gateway
  absente ou zone hors registre → sortie vide, poursuivre. Zone racine : ne rien relever —
  l'orchestrateur ne touche `inbox/orchestrateur/` que sur demande explicite de l'utilisateur.

- Étape 6 (ajouts) :
  - Sur `main` uniquement, si `src/domain/data/manualTestsCatalog.ts` existe : examiner les
    évolutions de la session et mettre à jour ce catalogue pour chaque test à demander à Marie. Le
    catalogue couvre tous les tests Marie encore pertinents à la fin de l'évolution, en langage
    clair, sans détails techniques ni chemins locaux. Ne pas y ajouter les validations internes
    réservées au développement.
  - Relire l'intégralité de la conversation pour repérer tout test manuel dont la nécessité a été
    actée en discussion (nouveau scénario, comportement à valider) et non encore tracé. Pour
    chacun : vérification technique réservée au développeur (fichier local, détail d'implémentation,
    contrôle de régression) → `tests_manuels.md` (créer avec la consigne standard s'il n'existe pas
    encore) ; comportement à valider par Marie sur son appareil réel → `manualTestsCatalog.ts`, en
    langage clair, sans jargon ni chemin local. Ne rien ajouter si aucun test n'a été décidé — ne
    pas en inventer. Objectif : que `/deploy` (avertissements 4.4 et 4.5) reflète l'état réel des
    tests décidés pendant la session.
  - Vérifier `COMMUNICATION/Marie/a_transmettre.md` : chaque changement visible pour Marie,
    décision attendue, écart assumé ou retour d'export encore pertinent de la session doit y
    figurer, en langage simple. Ce fichier ne contient jamais de liste de tests (ils vivent
    uniquement dans le catalogue in-app, cf. `CLAUDE.md` § Spécificités projet). Ne pas déplacer
    les documents de `COMMUNICATION/Marie/livraisons/` (historique figé des messages publiés).
  - Sur `main` uniquement, si la session a introduit un changement visible pour Marie (nouvelle
    fonctionnalité, écran, comportement modifié — pas un correctif interne ni un refacto), ajouter
    une entrée en langage clair et sans jargon technique au tableau `WHATS_NEW` de
    `src/ui/screens/onboarding/E01Welcome.tsx`. Ajout uniquement : ne jamais réécrire ni supprimer
    les entrées existantes (le tableau accumule les changements depuis le dernier déploiement, la
    modale Nouveautés de l'écran d'accueil s'appuyant dessus pour la version publiée par
    `/deploy`).
  - Sur `main` uniquement et si la zone résolue est la racine du projet : vérifier que
    `tests_manuels.md` est cohérent avant de le committer à l'étape 13 — ne jamais recréer ni
    modifier une section `[discord-auto]` que la session `discord` a supprimée pendant la session
    (elle signale un test délégué validé, cf. `.claude/commands/discord_loop.md` § 3d-bis) ;
    ajouter une nouvelle section `[discord-auto]` uniquement si un nouveau test délégable a été
    décidé en session ; une section `[discord-auto]` présente sans avoir été observée est laissée
    telle quelle (elle attend un cycle `/discord_loop` pertinent, pas une action ici).

- Étape 6 (après) : pour une zone-agent, écrire ou mettre à jour `<contexte>/statut.md` avec :
  objectif, avancement, blocages, prochain pas, commit proposé, fichiers modifiés, tests et
  migrations. Le statut remonte uniquement au parent déclaré dans `agent_role.md`.

- Étape 8 (README) et étape 9 (`CHANGELOG.md`) : n'exécuter que sur la branche `main`.

- Étape 13 (commit) : `git add <contexte>/` au lieu de `<dossier>/_contexte/` ; n'ajouter
  `CHANGELOG.md` et `README.md` que sur `main`. Sur une branche `agent/<alias>`, ne pousser
  (étape 14) que si la branche dispose déjà d'un suivi distant et si le parent l'a explicitement
  demandé ; sinon conserver le commit local et le signaler dans `statut.md`.

- Étapes 2-bis / 14-ter : le contenu des hooks de zone racine (snapshot Supabase, backup Drive)
  vit dans `_contexte/on_close.md` de la racine, pas ici.

<!-- SPECIFICITES PROJET : FIN -->
