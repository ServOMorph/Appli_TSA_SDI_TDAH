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

## Export / import des données (E117Export) — suite à donner

Test manuel iPhone joué le 2026-09-10 (Morphéus, iPhone Safari, preview LAN) : téléchargement
JSON OK (message vert, fichier dans Téléchargements), structure complète (21 tables,
`version` 3.6), réimport qui écrase bien (tâche jetable disparue, données d'origine + budget
restaurés, aucune erreur), `feedbackReports` absent de l'export comme prévu. Le point de
vigilance `a.click()` iOS Safari ne mord pas sur cet appareil. Variante planifiée E21
également OK après correctif du débordement de grille `TaskCardLayout`.

Reste à faire, hors test :
- Instruire Marie sur la procédure de sauvegarde autonome (« Exporter en JSON », sa demande).
- Consigner l'exclusion `feedbackReports` comme limite connue de la restauration.

## Collage d'image dans un commentaire de retour (iOS Safari) — ne fonctionne pas

Constat 2026-09-10 (Morphéus, iPhone Safari, preview LAN `http://192.168.1.162:4173/`) :
dans l'appli, au moment de rédiger un commentaire / retour, coller une image depuis le
presse-papier ne fonctionne pas. À investiguer : flux de capture de retour
(`E122FeedbackCapture`), gestion du collage presse-papier et repli vers le sélecteur de
fichier (point D1 de `TESTS/RETOURS/_contexte/statut.md`). Reporté : à traiter plus tard.

## Bornage des requêtes réseau et reprise après coupure (Phase 6) — à porter au catalogue in-app

Pas testable en dev (aucun backend de synchronisation configuré localement). À convertir en
parcours du catalogue in-app (`src/domain/data/manualTestsCatalog.ts`) au prochain `/deploy`,
regroupé avec la question ouverte [P1] « Marie confirme-t-elle que "Relancer" fait passer ses
retours en "Envoyé" ? » (`_contexte/signals.md`). Comportement à faire valider par Marie :
- couper le réseau (mode avion), déclencher un envoi de retour annoté : la tentative se règle
  d'elle-même après ~30 s sans figer l'appli, le retour passe « Échec d'envoi » ;
- rétablir le réseau, relancer : le retour part sans doublon (image déjà déposée non renvoyée)
  et passe « Envoyé ».

## Sauvegarde Drive en attente

Manifeste rafraîchi le 2026-09-10 (217 fichiers). L'upload vers Drive n'est pas exécutable en
auto-mode (classifieur). À lancer manuellement, dans un terminal normal, depuis la racine du
projet :
```
python claude-vibecoding-kit/backup_project.py . --upload
```
Retirer cette section une fois l'upload confirmé effectué.
