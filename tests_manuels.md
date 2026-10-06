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

## Sauvegarde Drive en attente (2026-09-29)

Manifeste rafraîchi (`python claude-vibecoding-kit/backup_project.py . --refresh-list`, 520
fichiers), upload non lancé (classifieur auto-mode refuse `rclone copy`). À lancer manuellement,
hors session : `python claude-vibecoding-kit/backup_project.py . --upload`. Retirer cette section
une fois l'upload effectué.

## Vérifier le classement du snapshot de Marie après saisie de son code testeur

**Correctif du 2026-09-29 : l'appareil concerné n'est plus `103c9b92…`.** Diagnostic de session :
sur l'adresse actuelle (`appli-audhd`), Marie est en réalité l'appareil `192f2411-9e09-495c-97ec-6df563f01732`
(actif, v6.9) — `103c9b92…` est un appareil devenu orphelin, lié à l'ancienne adresse (v5.139),
tracké par `roadmap_correctifs_retours_2026-09-29.md`. Reconfirmé au hook `/close` du 2026-10-06 :
`snapshot-supabase-192f2411-20261005-2251z.json` toujours archivé en `_sans_code/` — son
`tester_code` reste à saisir. Une fois saisi et un cycle de synchronisation passé : vérifier que le
prochain `python scripts/backup_testeur_snapshots.py` range le snapshot de `192f2411` dans `marie/`.
Retirer cette section une fois vérifié.

## Vérifier les en-têtes de sécurité après le prochain déploiement (2026-09-26)

`public/_headers` (CSP, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`), validé en
local sur un build servi avec ces en-têtes (onboarding complet jusqu'à E10, aucune violation).
`curl -sI https://appli-audhd.netlify.app` confirmé après le déploiement v6.9 (2026-09-28) : les
4 en-têtes sont présents en production. Reste non vérifié : Safari iOS, sync Supabase réelle,
collage d'image dans E122 (sur iPhone, sync et envoi d'un retour avec capture fonctionnent).
Retirer cette section une fois vérifié.

## Vérifier sur iPhone réel l'import depuis l'écran de bienvenue (2026-09-26)

Bouton « Retrouver mes données » ajouté à E01 (import JSON avant l'accueil) ; l'export inclut
désormais `device_id`/`device_secret`/`sync_consent_granted`, restaurés à l'import ; sans
consentement dans le fichier, l'import passe par E04 puis reprend vers l'accueil/énergie. Aucun
test automatisé n'exerce le sélecteur de fichiers de Safari iOS. Après déploiement, sur un
navigateur neuf (ou navigation privée) côté iPhone : (1) exporter depuis la version déployée ;
(2) ouvrir l'adresse vierge, « Retrouver mes données », choisir le fichier dans « Fichiers » ;
(3) vérifier arrivée sur Accueil/énergie sans repasser par l'accueil, données présentes ;
(4) Paramètres > Vie privée : partage actif ; (5) le snapshot Supabase se met à jour sur le même
`device_id` qu'avant. Retirer cette section une fois vérifié.






