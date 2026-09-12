# Tests manuels développeur en attente

File d'attente des contrôles manuels non validés, réservés au développeur (fichiers locaux,
détails d'implémentation, régressions de protocole). Après validation d'un test, supprimer
immédiatement sa section. Quand la file est vide, vider intégralement ce fichier.

Un titre de section marqué `[discord-auto]` désigne un test dont la condition se vérifie
d'elle-même au fil de l'usage normal de `/discord_loop`, sans que quiconque ait besoin de la
provoquer — la session `discord` le valide et supprime la section dès qu'elle observe la
condition décrite (`.claude/commands/discord_loop.md` § Tests manuels délégués). Un sous-point
annoté « (hors délégation, à provoquer manuellement) » à l'intérieur d'une section `[discord-auto]`
reste un test dev classique, jamais validé passivement. Ajouter un futur test `[discord-auto]` ne
demande d'éditer que ce fichier — jamais `discord_loop.md`.

## Vérifier le classement du snapshot de Marie après saisie de son code testeur

Depuis la Phase 6 `roadmap_integration_onboard.md`, tant que Marie n'a pas saisi son `tester_code`
(`marie`) dans Paramètres > Profil, ses nouveaux snapshots Supabase tombent dans
`donnees_testeurs/_sans_code/` au lieu de `donnees_testeurs/marie/` (constaté au hook `/close` du
2026-09-12 : `snapshot-supabase-192f2411-20260912-0951z.json` archivé en `_sans_code/`). Risque
concret : `/deploy` étape 0.1-0.2 continue de lire `donnees_testeurs/marie/`, qui ne contiendra
alors que l'historique migré (dernier daté du 2026-09-11), pas le snapshot réellement le plus
récent. Une fois que Marie a saisi son code : vérifier que le prochain
`python scripts/backup_testeur_snapshots.py` range bien son snapshot dans `marie/` et non plus dans
`_sans_code/`, et que `/deploy` analyse alors le bon fichier. Retirer cette section une fois vérifié.

## Sauvegarde Drive en attente

Manifeste rafraîchi le 2026-09-12 (259 fichiers). L'upload vers Drive n'est pas exécutable en
auto-mode (classifieur). À lancer manuellement, dans un terminal normal, depuis la racine du
projet :
```
python claude-vibecoding-kit/backup_project.py . --upload
```
Retirer cette section une fois l'upload confirmé effectué.
