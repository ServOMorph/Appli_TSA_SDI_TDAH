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

Depuis la Phase 6 `roadmap_integration_onboard.md`, tant que le `tester_code` (`marie`) n'est pas
enregistré côté serveur, ses snapshots Supabase tombent dans `donnees_testeurs/_sans_code/` au lieu
de `donnees_testeurs/marie/`. L'appareil concerné est désormais identifié : `103c9b92…` (identité
confirmée le 2026-09-21, remplace la référence à `192f2411`). Cause du blocage actuel connue et
corrigée en code (`updateSettings()` déclenche `syncNow()`, commit `72481be`) mais pas encore
déployée — reconfirmé au hook `/close` du 2026-09-22 :
`snapshot-supabase-103c9b92-20260922-1145z.json` toujours archivé en `_sans_code/`. Risque concret :
`/deploy` étape 0.2-0.3 lirait `donnees_testeurs/marie/`, qui ne contient pas le snapshot le plus
récent. Une fois le correctif déployé et un cycle de synchronisation passé : vérifier que le
prochain `python scripts/backup_testeur_snapshots.py` range bien le snapshot de `103c9b92` dans
`marie/` et non plus dans `_sans_code/`. Retirer cette section une fois vérifié.

## Vérifier le garde-fou export ajouté à /deploy (étape 4ter)

Ajouté le 2026-09-13 suite à l'incident de perte de données de Marie (import raté sans export
préalable). Nouvelle étape 0.1 : alerte urgente à Marie dès le tout début de `/deploy` pour
exporter ses données avant qu'une nouvelle version soit en ligne. Nouvelle étape 4ter : avant le
build, confirmation explicite demandée à l'utilisateur que Marie a exporté — sinon arrêt.

**Étape 0.1 observée en conditions réelles le 2026-09-16** : message envoyé en mode urgent
(id gateway `20260916T125042_899231`, Discord `1549764473798008873`) et journalisé dans
`historique_conversation_marie.md` (commit `cb2339c`). Reste à observer : que l'étape 4ter bloque
effectivement la suite du même `/deploy` tant que la confirmation n'est pas donnée. Retirer cette
section une fois observé.

## Vérifier le tunnel cloudflared sur téléphone réel

Ajouté le 2026-09-16 (`vite.config.ts`, `allowedHosts: ['.serenia-tech.fr']`) pour afficher le site
de développement local directement sur téléphone sans passer par Netlify. Jamais testé en
conditions réelles depuis un appareil mobile. Retirer cette section une fois le tunnel confirmé
fonctionnel depuis un téléphone.

## Sauvegarde Drive en attente

Manifeste rafraîchi le 2026-09-23 (319 fichiers). L'upload vers Drive n'est pas exécutable en
auto-mode (classifieur). À lancer manuellement, dans un terminal normal, depuis la racine du
projet :
```
python claude-vibecoding-kit/backup_project.py . --upload
```
Retirer cette section une fois l'upload confirmé effectué.
