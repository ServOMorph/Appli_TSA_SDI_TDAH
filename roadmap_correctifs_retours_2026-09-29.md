# Roadmap — Correctifs du fil de retours et du versionnage (2026-09-29)

Origine : demande explicite de l'utilisateur, 2026-09-29, à la suite du diagnostic du bug
« Échec d'envoi » remonté par Marie (Safari iPhone, commentaires sur ses retours « mode surcharge »
et « mouvement des jours »). Objectif : débloquer Marie, livrer les correctifs déjà codés, puis
traiter les défauts structurels découverts pendant le diagnostic.

## Diagnostic établi (2026-09-29)

- Sur `appli-audhd`, Marie est l'appareil **`192f2411-9e09-495c-97ec-6df563f01732`** (v6.9). Ses
  19 anciens retours et les réponses associées appartiennent à **`103c9b92-81ab-42f3-b141-e1c6869e3e84`**
  (ancienne adresse, v5.139, figé depuis le 2026-09-28 21:56 UTC).
- L'export fait depuis l'ancienne adresse (v5.139) ne contient pas l'identité d'appareil (ajoutée
  en v6.7) : l'import n'a donc pas repris `103c9b92`.
- `submit_feedback_message` et `close_feedback_report` (`supabase/feedback.sql`) exigent que le
  retour appartienne à l'appareil émetteur : commentaires et validations de Marie sur ses anciens
  fils sont refusés à chaque tentative. Le client relance sans fin et affiche « Échec d'envoi ».
  Les 19 retours ont `resolved_at = null` pour la même raison.
- Ses nouveaux retours sous `192f2411` arrivent normalement (5 reçus, dont « Test version »).
- Non établi : comment les anciens fils se retrouvent en local sous `192f2411`. Ne change pas le
  mécanisme.

## Acquis de la session du 2026-09-29 (codés, tests verts, non commités, non déployés)

- Version affichée en bas de Paramètres (`E110Settings.tsx`, `__APP_DEV_VERSION__`) + test.
- Import : quand l'identité d'appareil importée diffère de l'actuelle, les retours déjà envoyés
  (et leurs messages) sont retirés, les autres sont remis en attente d'envoi sans chemin d'image
  (`useSettingsState.ts`, `detachFeedbackFromPreviousIdentity`) + 2 tests.
- `tsc -b` OK, suite complète 1048/1048.

---

## Phase 1 — Débloquer le fil de retours de Marie (données, sans code) [TODO — BLOQUÉ]

- **Réattribution Supabase** : `device_id` de `feedback_reports` et `feedback_messages` passé de
  `103c9b92…` à `192f2411…` (19 retours, 20 messages). Écriture en production, refusée par le mode
  auto le 2026-09-29 : **confirmation explicite de l'utilisateur requise** avant exécution.
  Conserver la liste des identifiants modifiés (réversible par l'opération inverse sur ces lignes).
  Les chemins d'image (`103c9b92/<id>.jpg`) restent valides : ils ne sont contrôlés qu'à l'insertion.
- **Effet attendu, à vérifier en base** : à la prochaine ouverture d'un fil, ses commentaires en
  échec arrivent (`author = user`, `device_id = 192f2411`), ses validations renseignent
  `resolved_at`, les réponses d'agent redescendent sans doublon (`saveReceived` idempotent).
- **Message à Marie** (zone `discord` en pause : confirmation explicite puis `enqueue --urgent`,
  consigné dans `COMMUNICATION/Marie/historique_conversation_marie.md`) : rouvrir ses retours, les
  commentaires et validations repartent seuls ; signaler si « Échec d'envoi » persiste.
- **Identité de suivi** : vérifier le `tester_code` du snapshot `192f2411` et son classement dans
  `donnees_testeurs/marie/` (`python scripts/backup_testeur_snapshots.py`) ; mettre à jour la
  section de `tests_manuels.md` qui vise encore `103c9b92`. Le `[P1]` correspondant de
  `_contexte/signals.md` est à réorienter au `/close`.
- Limite assumée : l'ancienne adresse (`appli-marie`, v5.139, identité `103c9b92`) ne pourra plus
  commenter ces fils. Sans impact, Marie a migré.

### Avancement (2026-09-29 → 2026-10-06)

- **Réattribution faite et vérifiée en base** (2026-09-29, sur autorisation explicite) : 19 retours et
  20 messages passés de `103c9b92` à `192f2411` ; 0 ligne restante sous l'ancien appareil, 24 retours
  et 20 messages sous le nouveau. Liste des identifiants : `_contexte/reattribution_marie_2026-09-29.json`.
  Nécessitait `grant update … to service_role` (SQL Editor) et un `patch_rows` dans `scripts/_supabase.py`.
- **Message à Marie envoyé** (Discord, 2026-09-29) puis, après sa réponse du 2026-10-01 (« toujours pas
  envoyé »), demande de vérification depuis « Mes retours » (2026-10-01).
- **Constat du 2026-10-01** : son commentaire du 29/09 00h37 sur le retour « mouvement des jours »
  (`6f90c375…`, bien réattribué) n'existe pas en base : bloqué côté client. L'écran de détail E124 n'a
  aucun bouton « Relancer » (il n'existe que sur la liste E123). Anomalie non expliquée : une entrée de
  son fil est datée du 07/09 alors que le retour date du 19/09 côté serveur (hypothèse non vérifiée :
  doublon local jamais confirmé, que `syncMessages` ne pousse jamais tant que son retour parent n'est
  pas `sent`).
- **État au 2026-10-06** : aucun message ni validation de Marie en base sous `192f2411` depuis la
  réattribution (requête de contrôle) ; aucune réponse de sa part connue (zone `discord` en pause).

**Gate de sortie** : au moins un commentaire ou une validation de Marie sur un ancien fil arrive en
base sous `192f2411`, ou Marie confirme que l'envoi fonctionne ; `tests_manuels.md` à jour.
**Non atteint au 2026-10-07.** Bloquée jusqu'au déploiement de la v6.10 : les correctifs `078ddef` et `1a3fa8e` ciblent la cause supposée (retour local inconnu du serveur). Réponse de Marie du 2026-10-06 : « Échec d'envoi » sans « Relancer » dans le fil.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 2 — Versionnage fiable et livraison des correctifs codés [TODO]

- **`/close` étape 9** : ajouter dans le bloc `SPECIFICITES PROJET` de `.claude/commands/close.md`
  (préservé par `/update`) une règle « Étape 9 : » — ne créer une nouvelle version que si `src/` a
  changé depuis le dernier déploiement (`_contexte/dernier_deploiement.md`) ; si la version en tête
  de `CHANGELOG.md` n'est pas encore déployée, amender ce bloc au lieu d'en créer un. Résout le
  `[P2]` de `signals.md` (v6.10 créé deux fois le 2026-09-28 sans changement de code).
- **`CHANGELOG.md`** : intégrer les acquis du 2026-09-29 dans le bloc `v6.10` existant (jamais
  déployé), pas dans une v6.11.
- **E124** : la version s'affiche « vv6.9 » (`E124FeedbackDetail.tsx:139`, préfixe `v` en double,
  la valeur contient déjà le `v`). Corriger + test.
- Redémarrer le serveur de dev (sa version est figée au démarrage, il affiche encore v6.8) et
  vérifier « Version v6.10 » dans Paramètres.
- **`/deploy`** (compteur Netlify : 1/10 sur la période en cours au 2026-09-28).
- Tests : `tsc -b`, suite complète, e2e via `/deploy`.

**Gate de sortie** : v6.10 en production, Marie lit « Version v6.10 » dans Paramètres, `close.md`
amendé et vérifié sur un `/close` sans changement de `src/` (aucune nouvelle version créée).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 3 — Traiter les nouveaux retours de Marie [TODO]

- Lancer `/traiter_retours` sur les retours de `192f2411` reçus le 2026-09-28 au soir :
  E77 (catégories et « livret jeune »), E10 (dossiers et rangement des outils), E21 (case
  « dépense » liée à « Mon compte »), E124 (« commentaire qui ne s'envoie pas », `b1e179f4`).
- `b1e179f4` : réponse directe via `scripts/reply_feedback_report.py` dès la Phase 1 validée — le
  correctif est une opération de données, déjà effectif, rien à différer.
- « Test version » (`5b8d7ed1`, E123) : réponse courte, à valider par Marie elle-même.
- Répondre aux commentaires de Marie sur « mode surcharge » et « mouvement des jours » une fois
  arrivés en base (Phase 1).
- `/traiter_retours` produit sa propre roadmap pour les correctifs produit : cette phase ne fait que
  la déclencher et suivre les réponses.

**Gate de sortie** : chacun des retours ci-dessus a une réponse déposée ou mise en attente de
déploiement (`_contexte/reponses_retours_en_attente_deploiement.json`).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 4 — Refus serveur explicites au lieu d'« Échec d'envoi » sans fin [FAIT]

Problème : les RPC renvoient `false` pour toutes les causes de refus. Le client ne distingue pas
un refus définitif (retour d'un autre appareil) d'un refus transitoire (appareil neuf pas encore
enregistré, plafond anti-abus) ni d'une panne réseau. Traiter `false` comme définitif côté client
seul bloquerait à tort les retours d'un appareil neuf envoyés avant sa première synchronisation.

- **Décision préalable** : l'utilisateur accepte une modification SQL appliquée à la main dans le
  SQL Editor Supabase.
- **SQL** : nouvelles fonctions renvoyant un motif (ex. `ok`, `device_unknown`,
  `report_not_owned`, `rate_limited`, `invalid`), sous un nouveau nom : `create or replace` ne peut
  pas changer le type de retour, et un `drop` est marqué destructif par le SQL Editor
  (`supabase/feedback.sql:282`). Conserver les anciennes fonctions pour les clients non mis à jour
  (l'ancienne adresse tourne en v5.139).
- **Refacto intégré en début de phase** : factoriser la charpente commune de `sendReport`,
  `sendMessage` et `closeReport` (`feedbackClient.ts`, déjà signalé `[P3]` dans `signals.md`)
  avant d'y ajouter la gestion des motifs, pour ne pas la tripler.
- **Client** : motifs transitoires → `failed` et relance ; motifs définitifs → nouveau statut
  `rejected`, sans relance, message explicite dans E124 (messages) et E123 (retours). Constat du
  2026-10-01 à traiter ici : E124 n'a aucun bouton « Relancer » sur un message en échec (retry
  automatique au montage seulement), et un message dont le retour parent local n'est pas `sent`
  reste muet (`feedbackClient.ts:125`).
- Tests : unitaires `feedbackClient` et affichage E124/E123 ; appel réel par motif sur un appareil
  de test, données supprimées ensuite.

**Réalisé (2026-10-06/07)** : RPC v2 à motifs, statut `rejected`, bouton Relancer dans E124 (`078ddef`) ; un `report_not_found` sur un message remet son retour parent en file (`1a3fa8e`). Suite 1058/1058. Non livré en production avant la v6.10. Résiduel tracé `[P2]` : messages muets d'un retour `rejected`.

**Gate de sortie** : tests verts, SQL appliqué et vérifié par un appel réel pour chaque motif. **Atteint.**

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 5 — Retrouver « Mes retours » après un changement d'adresse [TODO]

Problème (`[P2]` de `signals.md`) : `E123FeedbackList` ne lit que la table locale ; ni
`feedbackReports` ni `feedbackMessages` ne sont exportés (images en `Blob`). Tout changement
d'adresse ou réinstallation fait disparaître le fil du testeur.

- **Décision préalable** entre :
  - A. Redescente depuis Supabase : RPC authentifiée renvoyant les retours et messages de
    l'appareil ; image sans téléchargement (image locale rendue facultative) ou via URL signée.
  - B. Retours et messages inclus dans l'export (images encodées) : fichier plus lourd, aucun
    changement serveur.
- Tests : unitaires sur le chemin retenu, e2e export/import ou redescente.

**Gate de sortie** : après un changement d'adresse simulé (navigateur vierge + identité restaurée),
les retours et leurs fils réapparaissent et restent commentables.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Écarté ou hors périmètre

- Avertir à l'import quand l'export ne contient pas d'identité : écarté le 2026-09-29. L'écran
  d'import se ferme dès le succès, et seule l'ancienne adresse produit encore ce type d'export.
- Invite « nouvelle version disponible » du service worker (`[P3]` de `signals.md`) : non traitée ici.
- Leçon de diagnostic : chercher les retours d'un testeur sur tous ses appareils, pas sur un seul
  `device_id`. Piste non engagée : option de `scripts/read_feedback_reports.py` qui résout les
  appareils d'un `tester_code`.
