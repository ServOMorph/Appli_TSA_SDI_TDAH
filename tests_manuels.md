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

## Export / import des données (E117Export) — fiabiliser comme chemin de sauvegarde

Objectif : valider que Marie peut faire ses propres sauvegardes via « Exporter en JSON », et
qu'un fichier ainsi produit permet une restauration complète côté dév après perte de données.
Prérequis acté : `feedbackReports` (retours annotés) est volontairement hors périmètre de
l'export — perte assumée à la restauration, décision utilisateur.

- Round-trip dev complet : couvert par `e2e/11-export-import-roundtrip.spec.ts` (T59 export ->
  perte totale -> réimport -> données restaurées ; T60 fichier illisible / version future
  refusés sans effacement). Rejouer si le format d'export change.
- Téléchargement réel sur iPhone (Safari) : depuis l'appareil de Marie ou un iPhone de test,
  « Exporter en JSON » → vérifier que le fichier est bien créé et récupérable (app Fichiers).
  Point de vigilance : `a.click()` sur Blob URL sous iOS Safari est historiquement capricieux.
  Serveur préparé : `npx vite preview --host 0.0.0.0 --port 4173` (build `dist/dev`),
  `http://192.168.1.162:4173/` ; règle pare-feu entrante TCP 4173 à créer en PowerShell admin.
- Pendant la même session iPhone, contrôler E21 variante « planifiée » (création depuis le
  planning / tableau de bord) : titre + heure de début + durée > 0 renseignés → le bouton
  « Valider » doit s'activer. Si le bouton reste grisé alors que les trois champs sont remplis,
  suspecter un bug iOS Safari des `<select>` de `DurationRoller` (`onChange` non émis) et le
  consigner comme retour. `canSubmit` : `src/ui/screens/tasks/E21CreateTaskV2.tsx:165`.
- Une fois les points verts : instruire Marie sur la procédure de sauvegarde autonome
  (sa demande) et consigner l'exclusion `feedbackReports` comme limite connue.

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

Manifeste rafraîchi le 2026-09-10 (225 fichiers). L'upload vers Drive n'est pas exécutable en
auto-mode (classifieur). À lancer manuellement, dans un terminal normal, depuis la racine du
projet :
```
python claude-vibecoding-kit/backup_project.py . --upload
```
Retirer cette section une fois l'upload confirmé effectué.
