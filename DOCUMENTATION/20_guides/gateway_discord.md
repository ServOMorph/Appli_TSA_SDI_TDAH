# Gateway Discord

## Règle d'exploitation

Toute communication Discord passe par la gateway. Aucun agent ne doit appeler directement le client, l'API ou un webhook Discord, ni modifier les fichiers internes de file d'attente.

## Déposer une demande

```bash
python DISCORD/discord_com/gateway.py enqueue \
  --source orchestrateur \
  --to marie \
  --kind question \
  --expect-reply \
  --file corps_du_message.txt
```

Le fichier contient uniquement le fond définitif du message. La gateway et son agent de sortie gèrent la validation, le format et l'envoi. Une demande normale reste en attente tant qu'elle n'est pas approuvée.

## Lire une réponse

```bash
python DISCORD/discord_com/gateway.py poll --agent orchestrateur
python DISCORD/discord_com/gateway.py ack --agent orchestrateur --id <id>
```

Lire avant d'acquitter : l'acquittement marque le message comme traité. L'option urgente ne relève pas du fonctionnement courant : elle peut produire un envoi réel et n'est réservée qu'aux situations explicitement prévues par la procédure du projet.

## Limites et confidentialité

Ne pas déposer de secret, de données personnelles ou de contenu non finalisé. Ce guide n'a pas été exécuté : même une demande de test modifie la file locale et peut déclencher une communication externe.

La documentation opérationnelle détaillée de la gateway reste la source de référence du dépôt.
