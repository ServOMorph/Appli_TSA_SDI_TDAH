---
description: (Re)lance la surveillance du log ROBERTO côté TSA (assistant vocal téléphone partagé)
argument-hint: (aucun)
model: haiku
---

# /roberto

## Objectif

Le bridge ROBERTO (assistant vocal téléphone) est partagé et hébergé par le projet Roberto
(`D:\ServOMorph\Roberto\com_telephone\`). Cette commande ne démarre **aucun** process
serveur : elle met (ou remet) la session Claude Code TSA en écoute du log de messages propre à TSA,
pour que les messages envoyés depuis l'appli téléphone (projet `TSA` sélectionné) arrivent à l'agent
sans redémarrage de session.

Contexte complet : `ROBERTO/com_telephone/README.md` (racine de ce projet).

## Constantes

- Log surveillé :
  `D:\ServOMorph\Roberto\com_telephone\voice-code-bridge\server\logs\messages_tsa.log`
- Fichier de verrou (trace le Monitor actif d'une session à l'autre) :
  `D:\ServOMorph\Appli_TSA_SDI_TDAH\ROBERTO\com_telephone\_commands\monitor_tsa.lock`

## Procédure

1. Vérifier que les 3 process partagés tournent (informatif, ne pas les lancer) :
   ```
   py -3.11 "D:\ServOMorph\Roberto\com_telephone\_commands\com_manager.py" status
   ```
   Si un process est `[KO]`, le signaler : demander à l'utilisateur de lancer
   `com_manager.py start` côté Roberto. Continuer quand même la mise en écoute.

2. Se fier au fichier de verrou, jamais à la mémoire de la conversation (un Monitor `persistent`
   ne survit pas forcément à un changement de session) :
   1. Si `monitor_tsa.lock` existe, lire le `task_id` qu'il contient et appeler `TaskStop` dessus
      (échec silencieux accepté si le Monitor n'existait déjà plus). Ne pas sauter cette étape :
      deux Monitor en parallèle = notifications en double pour chaque message.
   2. Lancer un nouveau Monitor :
      ```
      command: tail -f --retry -n 0 "D:/ServOMorph/Roberto/com_telephone/voice-code-bridge/server/logs/messages_tsa.log"
      persistent: true
      ```
   3. Écrire le `task_id` retourné dans `monitor_tsa.lock` (écrasant tout contenu précédent).

3. Confirmer à l'utilisateur que TSA est en écoute (préciser : bien sélectionner `TSA` dans l'appli
   téléphone pour que les messages arrivent ici et pas dans une autre session).

## Répondre aux messages reçus

Tout message apparaissant dans `messages_tsa.log` (ligne sans `[DEBUG]`) doit recevoir une réponse
via `POST http://127.0.0.1:5000/send`, corps JSON avec les clés `text` (le message, non vide) et
`project` (`"tsa"`) — pas `message`, pas `body`. Un envoi sans `text` valide est rejeté en HTTP 400.
Exemple PowerShell et détails : `ROBERTO/com_telephone/README.md`. Un message commençant par `!`
est une commande directe : appliquer `.claude/commands/<nom>.md` de ce projet.
