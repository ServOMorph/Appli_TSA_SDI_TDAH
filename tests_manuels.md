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

## Vérifier la republication des réponses en attente au prochain /deploy

Depuis le 2026-09-25, les réponses aux retours testeur d'un correctif pas encore déployé sont mises
en attente dans `_contexte/reponses_retours_en_attente_deploiement.json`
(`scripts/queue_pending_feedback_reply.py`) au lieu d'être déposées immédiatement sur Supabase.
`/deploy` (étape 8, juste après le smoke test) doit les republier automatiquement via
`scripts/republish_pending_feedback_replies.py`. Le fichier contient actuellement 16 entrées (lot
`roadmap_retours_2026-09-22.md`), jamais encore republiées en conditions réelles — ce mécanisme n'a
pas encore tourné dans un vrai `/deploy`. Au prochain `/deploy` : vérifier que le fichier se vide
(ou ne contient plus que d'éventuels échecs) et qu'un aperçu Supabase confirme les réponses
déposées avec les bons accents (le dépôt en ligne de commande est sensible à l'encodage — vérifier
en relisant le contenu, pas seulement l'affichage terminal). Retirer cette section une fois vérifié.

## Vérifier sur le téléphone réel l'affichage du mois sur une seule ligne (E10)

Signalé le 2026-09-25 : le libellé mois/année du dashboard (E10) passait sur 2 lignes pour certains
mois (« Septembre 2026 », « Novembre 2026 ») mais pas d'autres (« Octobre 2026 »), sur un téléphone
réel — non reproductible dans Chromium, reproduit ensuite via WebKit émulé (iPhone SE 320px, Pixel 9
360px) avec le bouton « Aujourd'hui » affiché. Correctif : police du bouton mois
(`monthButtonStyle`, `PlanningBoard.tsx`) réduite à `0.75rem` + `whiteSpace: nowrap`. Vérifié sur les
12 mois aux largeurs 320/360/390px en WebKit émulé, jamais sur l'appareil physique d'origine. Faire
défiler les 12 mois sur le téléphone réel : chacun doit tenir sur une seule ligne, sans retour à la
ligne ni débordement à droite. Retirer cette section une fois vérifié.








