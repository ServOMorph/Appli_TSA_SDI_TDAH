# Roadmap — Retours conversationnels (fil de discussion + clôture)

Demande de l'utilisateur du 2026-09-13. Objectif : transformer le retour « une capture + un
commentaire, puis plus rien » en un fil de discussion entre le testeur et l'agent, clos
explicitement par le testeur.

## Parcours cible

1. Bouton `+` (`FeedbackFab`) → **E122 Nouveau retour** (inchangé : capture, annotation,
   commentaire, envoi).
2. Le retour envoyé apparaît dans **E123 Mes retours** (comportement actuel).
   *Correctif de vocabulaire : la liste est E123, pas E121 (E121 = « Tests à faire », sans rapport).*
3. Chaque retour de E123 devient cliquable → **E124 Détail du retour** (nouvel écran).
4. E124 affiche les détails (écran concerné, image annotée, date, version) puis un fil :
   - message 1 = le commentaire initial saisi en E122 ;
   - message suivant = la réponse rédigée par l'agent une fois la modification faite
     (synthétique, sans jargon) ;
   - le testeur peut répondre, autant de fois que nécessaire.
5. Bouton « Valider » dans E124 : le testeur déclare la modification satisfaisante. Le retour
   disparaît de E123.

## Production des réponses de l'agent : mode manuel (tranché le 2026-09-13)

Aucune IA embarquée côté client, aucune détection automatique de lien entre un retour et un
commit. La réponse est **rédigée par l'agent en session**, après avoir traité le retour, et
déposée côté Supabase par un script développeur (clé `service_role`, même famille que
`scripts/read_feedback_reports.py`). Elle redescend ensuite sur l'appareil du testeur par la
synchro.

Conséquence directe : le client doit acquérir un **chemin de lecture serveur → client**, qui
n'existe pas aujourd'hui. C'est le point structurant de cette roadmap (Phase 4).

## État de l'existant (lu le 2026-09-13)

- `src/ui/screens/feedback/E122FeedbackCapture.tsx` — création, puis `goTo('feedback-list')`.
- `src/ui/screens/feedback/E123FeedbackList.tsx` — liste plate, cartes non cliquables, statut
  d'envoi + relance.
- `src/domain/entities/feedbackReport.ts` — pas de notion de fil ni de clôture.
- `src/data/db.ts` — table `feedbackReports` (schéma v19), pas de table de messages.
- `src/data/sync/feedbackClient.ts` — pousse les retours en attente, ne lit jamais le serveur.
- `src/data/sync/rpc.ts` — `callRpc` générique (PostgREST, clé anon, timeout 30 s).
- `supabase/feedback.sql` — table `feedback_reports` + RPC `submit_feedback`, authentifiée par
  le couple `device_id` / `device_secret` vérifié dans `device_snapshots`.
- `scripts/read_feedback_reports.py` — lecture développeur des retours + images (service_role).

Prochaine phase à démarrer : **Phase 1**.

## Phase 1 — Modèle de données local (fil + clôture) [TODO]

- Nouvelle entité `FeedbackMessage` (`src/domain/entities/feedbackMessage.ts`) : `id`,
  `report_id`, `author` (`'user' | 'agent'`), `body`, `created_at`, `sync_status`
  (`'pending' | 'sent' | 'failed'`, sans objet pour un message d'agent reçu, à poser à `'sent'`).
- Nouveau champ `resolution_status` (`'open' | 'validated'`) sur `FeedbackReport`, plus la date
  de validation. Les retours validés sont conservés en base, seulement filtrés à l'affichage.
- Migration Dexie v20 : table `feedbackMessages` (index `report_id`, `created_at`, `sync_status`),
  rétro-remplissage de `resolution_status = 'open'` sur les retours existants.
- Décision de conception à trancher pendant la phase : le commentaire initial reste dans
  `FeedbackReport.comment` (source de vérité, déjà poussée au serveur) et E124 le rend comme
  premier message du fil — **pas** de duplication en `feedbackMessages`, pour ne pas créer deux
  vérités sur la même donnée.
- Repository `feedbackMessageRepository` (création, lecture par retour triée, marquage de sync)
  + extension de `feedbackReportRepository` (clôture, liste filtrée sur `open`).
- **Tests** : migration v19 → v20 dans `db.test.ts` (données préexistantes conservées), repos
  (`feedbackMessageRepository.test.ts`, ajouts sur `feedbackReportRepository.test.ts`), règles
  de domaine si une validation de message est introduite (corps non vide, longueur maximale).
- **Critère de sortie** : `tsc -b`, `eslint .`, `vitest run` verts ; aucune modification d'écran.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 2 — Écran E124 et fil local [TODO]

- Nouvelle route `feedback-detail` (`reportId`) dans `src/app/navigation.ts`, code écran `E124`
  dans `src/domain/data/screenCodes.ts` (libellé « Détail du retour »), chargement paresseux dans
  `App.tsx` comme les autres écrans.
- `E124FeedbackDetail.tsx` : en-tête (écran concerné, date, version, statut d'envoi), image
  annotée, fil de messages ordonné, zone de saisie d'un nouveau commentaire, bouton « Valider ».
- E123 : cartes cliquables vers E124, liste filtrée sur `resolution_status === 'open'`.
- `FeedbackFab` : masquer le bouton `+` sur `feedback-detail` (même règle que `feedback` et
  `feedback-list`), sinon on propose de signaler un retour depuis l'écran de retour.
- Validation : confirmation explicite avant clôture (action non réversible côté testeur),
  formulation à valider avec l'utilisateur au moment de l'implémentation.
- **Tests** : `E124FeedbackDetail.test.tsx` (rendu du fil, ajout d'un commentaire, clôture),
  `E123FeedbackList.test.tsx` (navigation vers le détail, disparition d'un retour validé),
  `screenCodes.test.ts`, `FeedbackFab.test.tsx`, `App.suspense.test.tsx`.
- **Critère de sortie** : parcours complet jouable hors ligne (création → détail → commentaire →
  validation → disparition), gates verts.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 3 — Aller serveur : messages du testeur et clôture [TODO]

- `supabase/feedback.sql` : table `feedback_messages` (`id`, `report_id` → `feedback_reports`,
  `device_id`, `author`, `body`, `created_at`), index par `report_id`, RLS activée, `anon`
  révoqué ; colonnes de clôture sur `feedback_reports` (`resolved_at`).
- RPC `submit_feedback_message` et `close_feedback_report`, mêmes garde-fous que
  `submit_feedback` : vérification `device_id` / `device_secret` contre `device_snapshots`, et
  refus si le retour visé n'appartient pas à cet appareil.
- `feedbackClient.ts` : pousser les messages `pending` et les clôtures en attente, avec la même
  discipline que l'existant (throttle, marquage `failed`, rejeu, verrou `inFlight`, aucune
  exception qui remonte).
- Consentement : rien ne part sans partage actif, comme pour les retours — les messages restent
  locaux et partent à l'activation.
- **Tests** : `feedbackClient.test.ts` (envoi, échec, rejeu, absence de consentement),
  `rpc.contract.test.ts` pour les nouveaux appels.
- **Critère de sortie** : un commentaire saisi en E124 et une validation remontent réellement en
  base Supabase (vérification manuelle avec `scripts/read_feedback_reports.py` étendu ou requête
  ad hoc), gates verts.
- **Dette assumée à surveiller** : le SQL n'est pas appliqué automatiquement (fichier à jouer
  dans l'éditeur SQL Supabase) — le noter dans la phase et ne pas considérer la phase close
  tant que la migration n'a pas été appliquée sur le projet réel.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 4 — Retour serveur : première lecture client (point structurant) [TODO]

- RPC `fetch_feedback_messages(p_device_id, p_device_secret, p_since)` : renvoie les messages des
  retours de cet appareil uniquement. Aucun élargissement de surface : pas de `select` PostgREST
  direct depuis le client, on reste sur le modèle « RPC `security definer` + secret d'appareil ».
- `feedbackClient.ts` : cycle de lecture (au démarrage, au retour en ligne, à l'ouverture de E123
  et E124), insertion idempotente des messages reçus (clé primaire = identifiant serveur),
  curseur de dernière lecture persisté.
- Signalement à l'utilisateur d'une réponse non lue : pastille sur l'entrée « Mes retours » et sur
  la carte du retour concerné. **À confirmer avec l'utilisateur avant implémentation** : emprise
  exacte de la pastille (accès aux retours seul, ou aussi tableau de bord).
- **Risque identifié** : c'est le premier flux serveur → client de l'application. Toute erreur de
  périmètre expose les retours d'un appareil à un autre. La phase inclut un test de contrat
  vérifiant qu'un `device_secret` invalide ou étranger ne renvoie rien.
- **Tests** : `feedbackClient.test.ts` (lecture, idempotence, curseur, hors ligne, sans
  consentement), test de contrat d'isolation par appareil, `E124FeedbackDetail.test.tsx`
  (apparition d'un message d'agent), `E123FeedbackList.test.tsx` (pastille).
- **Critère de sortie** : un message déposé côté serveur apparaît dans E124 sur l'appareil
  concerné et sur lui seul, gates verts.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 5 — Outil développeur de réponse [TODO]

- `scripts/reply_feedback_report.py` (service_role, jamais affichée) : liste les retours ouverts
  sans réponse, dépose une réponse d'agent sur un retour donné, signale le retour comme traité.
  Même structure que `scripts/read_feedback_reports.py` (`_supabase.py`, `SupabaseError`, sortie
  JSON, code de retour).
- Règle de rédaction, à consigner dans `.claude/CLAUDE.md` (section « Spécificités projet ») :
  réponse **synthétique, sans jargon, sans nom de fichier ni de commit**, une idée par phrase —
  alignée sur le style déjà exigé pour les messages à Marie. Un retour reste ouvert tant que le
  testeur n'a pas validé : l'agent ne clôt jamais un retour à sa place.
- Point d'accrochage dans le processus : quand l'agent traite un retour, il répond dans le même
  mouvement (à rattacher à `/close` ou `/deploy` — **à trancher avec l'utilisateur** ; par défaut,
  aucune automatisation, appel explicite du script).
- **Tests** : `scripts/test_reply_feedback_report.py` (même forme que
  `scripts/test_read_feedback_reports.py`), sans appel réseau réel.
- **Critère de sortie** : un aller-retour complet joué de bout en bout (retour créé sur un
  appareil, réponse déposée par le script, lue dans E124, commentaire de réponse du testeur relu
  côté serveur, validation finale, disparition de E123).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Décisions non tranchées

- **Pastille de nouveau message** (Phase 4) : périmètre d'affichage.
- **Confirmation avant validation** (Phase 2) : formulation et réversibilité côté testeur.
- **Retours validés** : conservés en base et simplement masqués. Aucun écran d'archive prévu ;
  à demander si le besoin apparaît.
- **Déclenchement de la réponse** (Phase 5) : manuel par défaut, rattachement éventuel à `/deploy`
  ou `/close` à décider.
