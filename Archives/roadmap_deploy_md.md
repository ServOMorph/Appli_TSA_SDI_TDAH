# Roadmap — Revue de `.claude/commands/deploy.md`

Origine : demande explicite de l'utilisateur, 2026-09-26. Objectif : relire chaque étape de
`deploy.md` par rapport à l'état réel du code/des scripts/des autres commandes, corriger les
désynchronisations trouvées, avec validation explicite de l'utilisateur avant chaque modification.
Pas de développement de code ici — gate de sortie de chaque phase : chaque écart trouvé est
validé (corrigé ou explicitement écarté) par l'utilisateur, et le fichier `deploy.md` reflète le
résultat.

Découpage en 4 phases suivant la structure de `deploy.md` (pré-déploiement / gates / build-déploiement /
communication), pour garder chaque session de revue à taille raisonnable.

---

## Phase 1 — Pré-déploiement (étapes 0, 1, 2 de deploy.md) [FAIT]

Périmètre : traitement des données de Marie avant déploiement (étape 0), exécution de `/close`
(étape 1), détermination de la version (étape 2).

**Réalisé (2026-09-26)** :
1. Étape 1 : « à son étape 12 » corrigé en « à son étape 15 » — `close.md` affiche le bilan des
   résidus non commités à son étape 15 (« Afficher un bilan des résidus non commités »), pas 12
   (« Relire les étapes 3 à 9 une par une »). Référence numérique désynchronisée, corrigée.
2. Étape 0 (intro) : `roadmap_sync_marie.md` et `roadmap_integration_onboard.md` préfixés
   `Archives/` — les deux fichiers sont archivés, cohérence avec la convention du reste du projet
   (`signals.md`, `contexte.md`).

Points vérifiés sans écart : `scripts/backup_testeur_snapshots.py`, `donnees_testeurs/marie/`,
`scripts/reply_feedback_report.py`, `gateway.py enqueue --urgent`, format de la 1ère ligne de
`CHANGELOG.md` (`## vX.Y — AAAA-MM-JJ`, compatible avec `grep -m1 '^## v'`).

**Décision structurante actée en marge de cette phase (2026-09-26)** : le dépôt du commentaire de
livraison en `.docx` sur Google Drive (mécanisme actuel de l'étape 11, `pandoc`/`rclone`) est
retiré. Toute la communication passe désormais par le fil de retours conversationnels de Marie
(E122-E124) et par la fonctionnalité « Nouveautés » (`WHATS_NEW`, bouton sur `E123FeedbackList`).
Impact à traiter dans les phases suivantes :
- **Phase 2** : le point de vérification bloquante 3.7 (« Communication prête » — présence de
  `a_transmettre.md`/`rclone.conf`, disponibilité de `pandoc`/`rclone`, accès Drive) devient sans
  objet et doit être retiré ou remplacé par un contrôle pertinent pour le nouveau mécanisme.
- **Phase 4** : les étapes 10 (inventaire de communication), 11 (publication Drive — à retirer
  entièrement), 12 (message de livraison, actuellement bâti autour du renvoi vers le `.docx`) et 13
  (rapport final) sont à revoir en profondeur. À clarifier en Phase 4 : devenir de
  `COMMUNICATION/Marie/a_transmettre.md`/`livraisons/vX.Y.md` (contenu qui alimentait le docx —
  reversé dans `WHATS_NEW` ? dans le message Discord directement ? autre ?), et cohérence avec le
  gabarit du message de livraison de `CLAUDE.md` § « Messages pour Marie » (qui référence encore
  `commentaires_marie_<X.Y>.docx`, à corriger séparément, hors `deploy.md`).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 2 — Vérifications & avertissements (étapes 3, 4, 4bis, 4ter) [FAIT]

Périmètre : vérifications bloquantes (arbre propre, `.env`, CHANGELOG, tests, tsc, lint,
communication prête, branche, roadmaps `[EN COURS]`), avertissements (commits non poussés, `dist/`
déjà présent, tests manuels en attente, roadmap partielle), revue de code cumulée, confirmation de
l'export de Marie.

**Réalisé (2026-09-26)** : point 3.7 (« Communication prête » — `a_transmettre.md`/`rclone.conf`/
`pandoc`/`rclone`/accès Drive) retiré entièrement, sans remplacement — aucun outil externe
équivalent à vérifier pour le nouveau mécanisme (fil de retours + Nouveautés), `gateway.py` étant
déjà utilisé ailleurs dans `deploy.md` sans gate de disponibilité préalable. Renumérotation en
cascade : 3.8 → 3.7 (« Branche de production »), 3.9 → 3.8 (« Aucune roadmap avec une phase en
cours »). Référence croisée de l'étape 4.5 (« la vérification bloquante 3.9... ») corrigée en 3.8.

Points vérifiés sans écart : `.env.example` (clés `NETLIFY_AUTH_TOKEN`/`NETLIFY_SITE_ID`
présentes), `package.json` (scripts `lint`/`test` existants), `tsconfig.json` (mode composite pour
`tsc -b`), absence confirmée de `manualTestsCatalog.ts`, `tests_manuels.md` et
`_contexte/dernier_deploiement.md` cohérents avec ce que `deploy.md` en attend.

**Écarts trouvés hors périmètre de cette phase, à traiter dans les phases suivantes** :
- **Phase 3 (étape 7, déploiement Netlify)** : `_contexte/signals.md` § Contexte chaud indique que
  depuis la migration Netlify du 2026-09-21, le déploiement est **manuel côté utilisateur**
  (identifiants du nouveau compte inconnus de l'agent) — `npx netlify deploy --prod` documenté à
  l'étape 7 ne correspond plus au flux réel actuel. À vérifier/corriger en Phase 3.
- **Phase 4 (étape 12, message de livraison)** : l'URL de production codée en dur
  (`https://appli-audhd.netlify.app/`) est obsolète — l'adresse réelle actuelle est
  `https://appli-marie.netlify.app` (`_contexte/dernier_deploiement.md`, `_contexte/signals.md`). À
  corriger en Phase 4. Note : la ligne 246 de `deploy.md` (étape 11, « validée à l'étape 3.7 ») n'a
  pas été corrigée ici — l'étape 11 entière est retirée en Phase 4 (décision Phase 1), donc cette
  référence disparaît avec elle.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 3 — Build & déploiement (étapes 5, 6, 7, 8, 8bis) [FAIT]

Périmètre : build versionné, contrôle du budget bundle, déploiement Netlify, vérification de
fumée, republication des réponses en attente, mise à jour de `dernier_deploiement.md`, vidage de
`WHATS_NEW`, archivage des roadmaps terminées.

**Réalisé (2026-09-26)** :
1. Étape 8 : « Vider intégralement le tableau `WHATS_NEW` de `src/ui/screens/onboarding/E01Welcome.tsx` »
   corrigé en `src/domain/data/whatsNew.ts` (confirmé par grep — `WHATS_NEW` y vit désormais, ainsi
   que dans `E123FeedbackList.tsx`, depuis le déplacement du point d'entrée « Nouveautés » du
   2026-09-21). `close.md` étape 6 a la même référence obsolète, hors périmètre de cette roadmap —
   à signaler séparément.
2. Étape 7 (déploiement Netlify) : réécrite entièrement. L'utilisateur dispose de deux comptes
   Netlify (contournement des limitations du plan gratuit) et veut que le mode de déploiement soit
   demandé explicitement à chaque `/deploy`, jamais figé dans le fichier. Nouvelle étape 7 :
   demande du mode (automatique via CLI Netlify avec les credentials de `.env`, ou manuel — upload
   par l'utilisateur, confirmation explicite + URL de production attendues avant de poursuivre).
   Conséquence sur le gate 3.2 (bloquant) : l'exigence de clés `NETLIFY_AUTH_TOKEN`/`NETLIFY_SITE_ID`
   non vides dans `.env` était vérifiée dès l'étape 3, avant même que le mode soit choisi à l'étape
   7 — incohérent si le mode manuel est retenu. Gate 3.2 allégé à la seule présence de `.env`
   (`test -f .env`, toujours requis pour Supabase à l'étape 0.2) ; le contrôle des clés Netlify est
   déplacé à l'étape 7, conditionné au choix « automatique ». Étapes 8 (smoke test) et 13 (rapport
   final) mises à jour pour utiliser « l'URL de production retenue à l'étape 7 » au lieu de « l'URL
   renvoyée par Netlify » (qui suppose le mode automatique).

Points vérifiés sans écart : étape 5 (`VITE_APP_VERSION` alimente bien le bouton d'
`E01Welcome.tsx:40`), étape 6 (`scripts/check_bundle_budget.mjs` et `bundle.budget.json` existent),
étape 8 (`scripts/republish_pending_feedback_replies.py` existe), étape 8bis (archivage des
roadmaps terminées, cohérent avec `CLAUDE.md` § Roadmap « Clôture »).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 4 — Communication à Marie (étapes 9, 10, 11, 11bis, 11ter, 12) [FAIT]

Périmètre : préparation du rapport, inventaire de communication, composition et validation du
message de livraison, vérification de sa sortie de l'outbox, rapport final.

**Réalisé (2026-09-26)** :
1. Décision actée par l'utilisateur : retrait entier de `COMMUNICATION/Marie/a_transmettre.md` et
   `livraisons/vX.Y.md` du flux `/deploy` (Option B) — `WHATS_NEW` devient la seule source de
   communication des changements à Marie. Ces fichiers deviennent un reliquat, non traités dans
   cette roadmap (hors périmètre `deploy.md` — voir « Écarts hors périmètre » ci-dessous).
2. Ancienne étape 11 (figer le commentaire dans `livraisons/`, conversion `.docx` via `pandoc`,
   dépôt Drive via `rclone`) retirée entièrement. `allowed-tools` du frontmatter allégé
   (`Bash(pandoc:*)`, `Bash(rclone:*)` retirés — plus aucun usage dans le fichier).
3. Étape 10 (inventaire) : puce `COMMUNICATION/Marie/a_transmettre.md` retirée, cohérente avec (1).
4. Étape 12 (message de livraison, ex-13) : lien de production codé en dur
   (`https://appli-audhd.netlify.app/`, obsolète depuis la migration Netlify — écart déjà relevé en
   Phase 2) remplacé par la référence dynamique « URL de production retenue à l'étape 7 » (choix
   de mode introduit en Phase 3). Renvoi vers le `.docx` remplacé par la mention du bouton
   « Nouveautés » in-app (décision utilisateur), sans renvoi vers un document externe.
5. Renumérotation en cascade : 12→11 (message de livraison), 12bis→11bis (validation), 12ter→11ter
   (vérification outbox), 13→12 (rapport final, puce « nom du document Drive déposé » retirée).
   Références croisées internes corrigées (« étape 12 »→« étape 11 » en 11bis, « étape 12bis »→
   « étape 11bis » en 11ter, « étape 12ter »→« étape 11ter » en 12, et la référence de l'étape 7
   au rapport final : « étape 13 »→« étape 12 »). Vérifié par grep qu'aucune référence à
   pandoc/rclone/Drive/docx/a_transmettre ou à un ancien numéro ne subsiste.
6. Étape 9 : « URL renvoyée par Netlify » généralisée en « URL de production retenue à l'étape 7 »
   (cohérence Phase 3, ce point restait à traiter dans le périmètre de cette phase).

**Écarts hors périmètre de `deploy.md`, traités en marge (2026-09-26, sur demande explicite)** :
- `COMMUNICATION/Marie/a_transmettre.md` : décision utilisateur — vidé (contenu accumulé depuis le
  17/09 et en-tête obsolète retirés), remplacé par une note factuelle indiquant le retrait du
  mécanisme. `livraisons/`/`commentaires/` conservés tels quels comme archive historique (non
  alimentés désormais).
- `CLAUDE.md` § « Messages pour Marie » : gabarit corrigé (renvoi vers `commentaires_marie_<X.Y>.docx`
  remplacé par la mention du bouton « Nouveautés »), note « Modifié le 2026-09-26 » ajoutée ; la
  distinction de `historique_conversation_marie.md` avec `a_transmettre.md`/`livraisons/` et la
  section « Validation des retours par Marie » mises à jour en cohérence (fichiers désormais figés,
  plus alimentés).
- `close.md` étape 6 : référence `WHATS_NEW` corrigée (`E01Welcome.tsx` → `src/domain/data/whatsNew.ts`,
  et « bouton Nouveautés de l'écran Mes retours » au lieu de « modale de l'écran d'accueil ») ; puce
  « Vérifier `a_transmettre.md` » retirée (fichier retiré du flux, cf. ci-dessus).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Application

Une fois les 4 phases validées et `deploy.md` corrigé, exécuter `/deploy` pour le lot cumulé déjà
en attente (cf. `_contexte/signals.md` § Prochaine étape exacte).
