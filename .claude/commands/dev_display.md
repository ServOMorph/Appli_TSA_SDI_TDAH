# Affichage dev (haut à droite) — Basculer

Affiche ou masque l'outil de dev en haut à droite de l'appli (`DevResetButton` : date simulée +
bouton Reset DB), visible uniquement sur `npm run dev` (jamais sur un build déployé). Bascule un
seul et même état à chaque appel — pas d'argument.

## Utilisation

```
/dev_display
```

## Processus

### Étape 1 : Lire l'état actuel

```bash
grep -q '^VITE_HIDE_DEV_TOOLS=1$' .env.local 2>/dev/null && echo "actuellement masque" || echo "actuellement affiche"
```

`.env.local` n'existe pas encore la première fois : traiter comme « actuellement affiché ».

### Étape 2 : Basculer

- Si actuellement affiché (ligne absente ou différente) : ajouter/écrire `VITE_HIDE_DEV_TOOLS=1`
  dans `.env.local` (créer le fichier s'il n'existe pas).
- Si actuellement masqué : retirer la ligne `VITE_HIDE_DEV_TOOLS=1` de `.env.local` (supprimer le
  fichier s'il devient vide).

### Étape 3 : Rien d'autre à faire

Vite surveille `.env.local` et redémarre tout seul dès l'écriture (log attendu :
`.env.local changed, restarting server...` puis `server restarted.`). Ne pas relancer le serveur
manuellement, ne pas tuer de processus.

### Étape 4 : Confirmation

Afficher à l'utilisateur le nouvel état : « Affichage dev réaffiché. » ou « Affichage dev masqué. »
