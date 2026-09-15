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

## Phase 1 — Modèle de données local (fil + clôture) [FAIT]

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
- **Réalisé (2026-09-14)** : `FeedbackMessage` (`src/domain/entities/feedbackMessage.ts`) créée ;
  `FeedbackReport` étendue de `resolution_status` (`'open' | 'validated'`) et `validated_at`.
  Migration Dexie v20 : table `feedbackMessages` (index `report_id`, `created_at`, `sync_status`),
  rétro-remplissage `resolution_status = 'open'` / `validated_at = null` sur les retours existants.
  Décision de conception confirmée : le commentaire initial reste dans `FeedbackReport.comment`,
  pas de duplication en `feedbackMessages`. `FeedbackMessageRepository` (création, lecture par
  retour triée, marquage `sent`/`failed`) + `FeedbackReportRepository` étendu (`getOpen`, `validate`)
  ; les deux enregistrés dans `src/app/repositories.ts`. `resolution_status` filtré en mémoire
  (`.filter()`) plutôt qu'indexé Dexie — volume de retours trop faible pour le justifier. Ajustement
  mécanique de `E122FeedbackCapture.tsx` (nouveaux champs obligatoires du type à la création),
  aucun changement de comportement d'écran. Tests ajoutés : migration v19→v20 dans `db.test.ts`
  (message conservés vides, retour existant marqué `open`), `feedbackMessageRepository.test.ts`
  (3 tests), extension de `feedbackReportRepository.test.ts` (`getOpen`, `validate`) ; fixtures des
  tests existants complétées avec les 2 nouveaux champs. Suite complète 865 tests verts (+6),
  `tsc -b` + `eslint` clean.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 2 — Écran E124 et fil local [FAIT]

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
- **Réalisé (2026-09-14)** : route `feedback-detail` (`reportId`) ajoutée à `navigation.ts`, code
  `E124` (« Détail du retour ») dans `screenCodes.ts`, chargement paresseux dans `App.tsx`.
  `E124FeedbackDetail.tsx` créé : en-tête (écran, date, version, statut d'envoi), image annotée
  (déjà aplatie sur `FeedbackReport.image_blob`), fil de messages (commentaire initial du retour
  + `feedbackMessages` triés), zone de saisie d'un nouveau commentaire (règle de domaine
  `isFeedbackMessageValid` ajoutée à `feedbackRules.ts` : corps non vide, 2000 caractères max),
  bouton « Valider » avec modale de confirmation simple (choix tranché avec l'utilisateur) appelant
  `feedbackReportRepo.validate`. `FeedbackReportRepository.getById` ajouté. E123 : liste basculée
  sur `getOpen()`, cartes cliquables (`div[role=button]`) vers E124. `FeedbackFab` masqué aussi sur
  `feedback-detail`. Tests ajoutés/étendus : `E124FeedbackDetail.test.tsx` (fil, ajout de
  commentaire, validation, retour inexistant), `E123FeedbackList.test.tsx` (navigation vers le
  détail, mock basculé sur `getOpen`), `screenCodes.test.ts`, `FeedbackFab.test.tsx`,
  `App.suspense.test.tsx`. Suite complète 872 tests verts (+7), `tsc -b` + `eslint` clean.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 3 — Aller serveur : messages du testeur et clôture [FAIT]

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
- **Réalisé (2026-09-14), côté client uniquement** : `supabase/feedback.sql` étendu (table
  `feedback_messages`, colonne `resolved_at` sur `feedback_reports`, RPC `submit_feedback_message`
  — restreinte à `author = 'user'`, une réponse d'agent ne peut venir que du script service_role de
  la Phase 5 — et `close_feedback_report`, mêmes garde-fous `device_id`/`device_secret` que
  `submit_feedback`). Modèle local étendu (migration Dexie v21) : `FeedbackMessage.last_attempt_at`,
  `FeedbackReport.resolution_sync_status` (`'pending'|'sent'|'failed'`) et
  `resolution_last_attempt_at`, backfill sur les retours existants (`'pending'` si déjà validé
  localement, sinon `'sent'` en sentinelle « rien à pousser »). `FeedbackReportRepository` :
  `validate()` pose `resolution_sync_status: 'pending'`, ajout de `getToCloseSync`,
  `markResolutionSent`/`markResolutionFailed`. `FeedbackMessageRepository.markSent`/`markFailed`
  posent désormais `last_attempt_at`. `feedbackClient.ts` : poussée des messages `pending`/`failed`
  (seulement si le retour parent est déjà `sync_status: 'sent'` côté serveur, sinon nouvelle
  tentative au prochain cycle) et des clôtures validées non encore synchronisées, même discipline
  que l'existant (throttle 60 s, verrou `inFlight`, aucune exception qui remonte). E124 déclenche
  `syncFeedbackNow()` après l'ajout d'un commentaire et après validation, pour ne pas attendre le
  prochain redémarrage/passage en ligne. Tests : `feedbackClient.test.ts` (+5 : envoi de message,
  retour parent pas encore confirmé, échec serveur, clôture, échec de clôture),
  `rpc.contract.test.ts` (+2 : forme des appels `submit_feedback_message`/`close_feedback_report`),
  extensions `feedbackReportRepository.test.ts`/`feedbackMessageRepository.test.ts`, migration
  v20→v21 dans `db.test.ts`. Suite complète 882 tests verts (+10), `tsc -b` + `eslint` clean.
  **Non fait (2026-09-14)** : le SQL n'a pas été rejoué dans l'éditeur SQL Supabase du projet réel, et le critère
  de sortie de la phase (aller-retour réel vérifié en base) n'a donc **pas** été contrôlé — aucun
  appel serveur n'a été exécuté dans cette session. Reste à faire avant de considérer la phase
  close : appliquer `supabase/feedback.sql` sur le projet Supabase réel, puis vérifier
  manuellement qu'un commentaire E124 et une validation y remontent.
  **Contrôlé (2026-09-15)** : delta SQL (`resolved_at`, `feedback_messages`,
  `submit_feedback_message`, `close_feedback_report`) appliqué dans l'éditeur SQL du projet réel.
  Correctif additionnel nécessaire, hors script prévu : `service_role` n'avait pas de privilège
  `SELECT`/`INSERT` explicite sur `feedback_reports`/`feedback_messages` (écart par rapport au
  reste du schéma, cause non identifiée) — `grant select on feedback_reports to service_role` et
  `grant select, insert on feedback_messages to service_role` exécutés. Round-trip complet rejoué
  dans un navigateur réel (MCP Playwright, appareil de test dédié) : retour créé en E122 →
  `submit_feedback` → validé en E124 → `close_feedback_report` a retourné `true` → disparition de
  E123. Critère de sortie de la phase désormais vérifié.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 4 — Retour serveur : première lecture client (point structurant) [FAIT]

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
- **Réalisé (2026-09-14), côté client uniquement** : `supabase/feedback.sql` étendu (RPC
  `fetch_feedback_messages(p_device_id, p_device_secret, p_since)`, `returns table`, ensemble vide
  si `device_id`/`device_secret` invalide, ne renvoie que les messages `author = 'agent'` du
  `device_id` demandé — le client connaît déjà tout ce qu'il a lui-même poussé). Curseur de
  dernière lecture persisté en localStorage (`src/data/sync/feedbackMessagesCursor.ts`, même
  pattern que `deviceIdentity.ts`/`syncConsent.ts`). `feedbackClient.ts` : `fetchMessages` appelée
  dans le même cycle que les envois (`syncReports`), gate identique (config + consentement actif),
  insertion idempotente (`FeedbackMessageRepository.saveReceived`, `bulkPut`), le curseur n'avance
  que jusqu'au dernier message effectivement reçu. Décision : pas de throttle sur la lecture
  (contrairement aux envois) — elle n'est déclenchée qu'à des moments discrets (démarrage, retour
  en ligne, ouverture de E123/E124), jamais en boucle. Migration Dexie v22 : `FeedbackMessage.read_at`
  (backfill : messages `user` existants marqués lus à leur propre date de création, messages
  `agent` existants marqués non lus). `FeedbackMessageRepository` : `getUnreadReportIds`,
  `markReportRead`. E124 : synchronise (push + pull) à l'ouverture, marque le retour lu dès que le
  fil est chargé. E123 : synchronise à l'ouverture, pastille sur la carte du retour concerné.
  **Angle mort découvert et tranché avec l'utilisateur en session** : aucune entrée de navigation
  permanente « Mes retours » n'existait avant cette phase (seul accès : bouton « Voir mes retours »
  après création d'un retour en E122) — un testeur n'aurait pas pu revenir consulter une réponse
  sans recréer un retour. Entrée « Mes retours » ajoutée dans Paramètres (E110), avec pastille si
  au moins un retour a un message non lu ; pas de pastille sur le tableau de bord général (choix
  utilisateur : portée minimale). Tests ajoutés : `feedbackClient.test.ts` (+4 : réception d'un
  message et avancée du curseur, ensemble vide du serveur sans écriture ni avancée de curseur,
  échec réseau sans avancée de curseur), `rpc.contract.test.ts` (+1 :
  forme de l'appel `fetch_feedback_messages`), `feedbackMessageRepository.test.ts` (+2 :
  `saveReceived` idempotent, `getUnreadReportIds`/`markReportRead`), migration v21→v22 dans
  `db.test.ts`, `E123FeedbackList.test.tsx`/`E124FeedbackDetail.test.tsx`/`E110Settings.test.tsx`
  étendus (synchronisation à l'ouverture, marquage lu, pastilles, nouvelle entrée de menu). Suite
  complète 894 tests verts (+12), `tsc -b` + `eslint` clean.
  **Non fait (2026-09-14)** : le SQL (`fetch_feedback_messages`, comme le reste de `feedback.sql`) n'a pas été
  rejoué sur le projet Supabase réel — la dette signalée en Phase 3 s'ajoute donc à celle-ci,
  aucune application serveur n'a eu lieu depuis. La garantie d'isolation par appareil (un
  `device_secret` étranger ne renvoie rien) est une garantie SQL non vérifiable par des tests
  unitaires JS : les tests ajoutés vérifient le comportement du client face à un ensemble vide ou
  une erreur, pas l'isolation elle-même. Le critère de sortie de la phase (un message déposé côté
  serveur apparaît dans E124 sur l'appareil concerné et sur lui seul) n'a donc **pas** été
  contrôlé, et ne pourra l'être qu'après application du SQL **et** un moyen de déposer un message
  d'agent côté serveur — l'outil de la Phase 5 n'existe pas encore ; en attendant, un dépôt SQL
  manuel (`insert into feedback_messages ...`) serait nécessaire pour tester ce chemin de bout en
  bout.
  **Contrôlé (2026-09-15)** : SQL appliqué (voir note Phase 3), `reply_feedback_report.py` utilisé
  comme moyen réel de déposer un message d'agent côté serveur. `fetch_feedback_messages` vérifié en
  conditions réelles via le navigateur (MCP Playwright) : le message déposé apparaît dans le fil de
  discussion d'E124 sur l'appareil concerné. L'isolation stricte par appareil étranger (garantie
  SQL) reste non re-testée spécifiquement dans cette vérification — seul le chemin nominal a été
  rejoué.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 5 — Outil développeur de réponse [FAIT]

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
- **Réalisé (2026-09-14)** : `scripts/reply_feedback_report.py` (même structure que
  `read_feedback_reports.py` : `_supabase.py`, `SupabaseError`, sortie JSON, code de retour).
  Sans argument : liste les retours ouverts (`resolved_at is null`) n'ayant encore aucun message
  `author = 'agent'` (calculé par différence d'ensembles entre `feedback_reports` et
  `feedback_messages`, aucune colonne supplémentaire nécessaire). Avec `--report-id`/`--body` :
  dépose un message `author = 'agent'` sur ce retour (rejette corps vide et retour déjà validé par
  le testeur côté serveur, `resolved_at` non nul) — n'appelle jamais `close_feedback_report`,
  conformément à la règle « l'agent ne clôt jamais un retour à sa place ». `_supabase.py` étendu
  d'un helper d'insertion PostgREST (`insert_row`, `Prefer: return=representation`), première
  écriture du projet dans cette famille de scripts (jusqu'ici lecture seule). Règle de rédaction et
  décision d'accrochage consignées dans `.claude/CLAUDE.md` (section « Spécificités projet »).
  Décision tranchée avec l'utilisateur : aucune automatisation, appel explicite du script en
  session. Tests : `scripts/test_reply_feedback_report.py` (8 tests, aucun appel réseau réel,
  mêmes conventions que `test_read_feedback_reports.py`) ; suites Python existantes rejouées sans
  régression (`test_read_feedback_reports.py`, `test_backup_testeur_snapshots.py`).
  **Non fait (2026-09-14)** : aucune modification côté application (`src/`) dans cette phase — sans objet, le
  script est un outil développeur autonome. Le critère de sortie (aller-retour complet bout en
  bout) reste **non contrôlé** : il dépend du SQL des Phases 3 et 4, toujours pas rejoué sur le
  projet Supabase réel (dette qui s'accumule depuis la Phase 3), et d'un appel réel du script
  contre ce projet — aucun des deux n'a eu lieu dans cette session.
  **Contrôlé (2026-09-15)** : aller-retour complet rejoué en conditions réelles (projet Supabase
  réel, navigateur via MCP Playwright, appareil de test dédié) : retour créé en E122 → réponse
  déposée par `python scripts/reply_feedback_report.py --report-id ... --body ...` → lue dans le
  fil de discussion d'E124 → validée par le testeur (bouton Valider, confirmation) →
  `close_feedback_report` a retourné `true` → disparition confirmée de E123 (« Aucun retour pour le
  moment. »). Constat en cours de route, sans lien avec cette phase : `submit_feedback` refuse tout
  retour tant que l'appareil n'a pas de ligne `device_snapshots` (créée par la synchronisation
  principale, déclenchée seulement au démarrage avec un profil d'onboarding complet) — comportement
  serveur correct, pas un défaut de l'outil. Correctif de droits Supabase appliqué au passage : voir
  note Phase 3. Serveur MCP Playwright ajouté en portée utilisateur (`claude mcp add --scope user
  playwright`) pour ce diagnostic, réutilisable dans les sessions futures. Critère de sortie de la
  phase désormais vérifié — plus aucune dette serveur ouverte sur cette roadmap.
  **Incident dev du 2026-09-15 (« je ne vois pas la réponse » / « mes retours sont vides ») —
  résolu, sans défaut applicatif** : le retour avait été créé dans un onglet sur l'origine
  `http://172.28.240.1:5173` (adresse « Network » de Vite, `--host`), puis l'utilisateur a rouvert
  l'appli sur `http://localhost:5173` — deux stockages locaux distincts (IndexedDB + localStorage
  par origine), donc liste vide sur le second. Diagnostic établi par les horodatages du profil
  Chrome (blob image du retour écrit à la seconde de sa création sous l'origine 172.28.240.1) puis
  confirmé en ouvrant une copie de ce stockage dans un Chromium Playwright : retour présent,
  `resolution_status: 'open'`, réponse d'agent présente et déjà marquée lue à 11:10:56 (l'onglet
  d'origine l'avait bien reçue). La « superposition d'écrans » vue sur les captures était l'image
  jointe au retour (capture de l'écran E121), le fil de discussion étant en dessous. Enseignement :
  toujours vérifier l'origine exacte avant de raisonner sur le stockage local.
  **Correctif de présentation qui en découle (E124, 2026-09-15)** : la capture jointe s'affichait en
  pleine largeur sans cadre — prise dans l'appli en thème sombre, elle se confondait avec l'écran
  courant (barre de navigation comprise) et le fil semblait « sous les boutons ». Désormais encadrée
  (`figure` : bordure, fond de surface, hauteur limitée à 40vh, légende « Capture jointe au
  retour »). Vérifié en thème sombre via Playwright avec une vraie capture de l'appli. Gates verts.
  **Un vrai défaut découvert au passage et corrigé** : la lecture serveur re-reçoit le dernier
  message à chaque cycle (curseur inclusif `>=`, choix conservé) et `saveReceived` (`bulkPut`)
  écrasait `read_at` — pastille « Nouvelle réponse » permanente, y compris sur des retours
  validés ; aurait touché Marie au prochain déploiement. `saveReceived` n'insère plus que les
  messages inconnus (transaction, `bulkGet` + `bulkAdd`) et `getUnreadReportIds` ne compte que les
  retours encore ouverts (`feedbackMessageRepository.ts`, +2 tests, cas existant complété). Vérifié
  dans Playwright : pastille fantôme disparue après correctif.
  **Migration Dexie v23 (`db.ts`, rattrapage des champs de résolution manquants, +1 test)** :
  ajoutée sur une hypothèse intermédiaire (ligne écrite sans `resolution_status` par un onglet HMR
  mixte) que le diagnostic final a **infirmée** — aucune ligne de ce type n'a été observée. Filet
  inoffensif mais sans cas réel connu ; à retirer ou conserver sur décision de l'utilisateur.
  Gates : `tsc -b` + `eslint` clean, 897 tests verts (+3).
  **Évolution du script demandée et livrée (2026-09-15)** : `reply_feedback_report.py` ne listait
  qu'une seule fois les retours n'ayant jamais reçu de réponse d'agent — une relance du testeur
  après une première réponse (cas réel rencontré : « tout est ok ça fonctionne bien maintenant »
  sur `test de retour 1`) restait invisible. `list_unanswered_reports` renommée
  `list_reports_needing_reply` : un retour ouvert est signalé si son dernier message (par date, pas
  seulement sa présence) n'est pas de l'agent — absence totale de message ou dernier message du
  testeur. Requête `build_report_messages_query` (remplace `build_agent_messages_query`) : tous les
  auteurs, plus seulement `agent`. Tests mis à jour (8/8, cas de relance ajouté), suites
  `test_read_feedback_reports.py`/`test_backup_testeur_snapshots.py` rejouées sans régression.
  Vérifié en réel : `test de retour 1` n'apparaît plus après le dépôt de la seconde réponse
  d'agent.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 6 — Retrait du catalogue de tests in-app, remplacé par la boucle de retours [FAIT]

- **Décision produit (2026-09-15)** : la boucle de retours conversationnels (Phases 1 à 5) devient
  l'unique mécanisme de validation par Marie. Le catalogue de tests in-app (« Tests à faire »,
  `manualTestsCatalog.ts`) est déclaré obsolète : principe désormais — le testeur signale un
  problème, l'agent corrige et dépose une réponse (`scripts/reply_feedback_report.py`), le testeur
  valide lui-même. Plus de liste de tests proactive à faire rejouer.
- Icône « Tests à faire » de la TopBar (haut à droite de l'Accueil) remplacée par une icône
  « Mes retours », ouvrant directement `feedback-list`. Entrée « Mes retours » retirée de
  Paramètres (redondante une fois l'icône en place).
- Retrait complet du catalogue : écran, catalogue de données, règles de calcul de pastille, table
  locale des résultats, wiring export/import, navigation, code d'écran E121.
- Mise à jour de la documentation de gouvernance (`CLAUDE.md`, gabarit de livraison Marie) et des
  commandes (`/deploy`, `/deploy_dev`, `/close`, `/analyser_googledoc`, `/traiter_export_marie`)
  qui référençaient le catalogue.
- **Critère de sortie** : icône Accueil → Mes retours fonctionnelle, entrée Paramètres disparue,
  aucune référence orpheline au catalogue dans `src/` ou `.claude/`, gates verts.
- **Réalisé (2026-09-15)** : côté application — suppression de `E121ManualTests.tsx(.test)`,
  `manualTestsCatalog.ts(.test)`, `manualTestRules.ts(.test)`, `manualTestResultRepository.ts(.test)`,
  `useManualTestsState.ts`, `domain/entities/manualTestResult.ts`. `db.ts` : migration Dexie v24
  (`stores({ manualTestResults: null })`, historique préservé, +1 test de migration).
  `app/repositories.ts`, `useSettingsState.ts` (export/import), `buildSnapshot.ts` (payload
  synchronisé), `AppContext.tsx` (wiring, `wipeAllData`) nettoyés de toute référence. `navigation.ts`
  et `screenCodes.ts` : route et code d'écran `manual-tests`/E121 retirés. `TopBar.tsx` : props et
  icône renommées (`onFeedbackClick`/`hasUnreadFeedback`, icône bulle de discussion) ;
  `E10Dashboard.tsx` : calcule `hasUnreadFeedback` via `feedbackMessageRepo.getUnreadReportIds()`
  (même mécanisme que l'ancienne entrée Paramètres, désormais porté par l'icône Accueil) et route
  vers `feedback-list`. `E110Settings.tsx` : entrée « Mes retours » retirée. Tests mis à jour en
  conséquence (`E10Dashboard.test.tsx`, `E110Settings.test.tsx`, `App.suspense.test.tsx`,
  `screenCodes.test.ts`, `ScreenCodeBadge.test.tsx`, `testUtils.tsx`, `useSettingsState.test.tsx`,
  `db.test.ts`). Suite complète 865 tests verts, `tsc -b` + `eslint` clean. Vérifié visuellement
  dans Playwright : icône Accueil → E123 direct, entrée Paramètres absente (4 sections restantes).
  Côté gouvernance — `CLAUDE.md` : règle « Tests à faire pour Marie : uniquement dans l'appli »
  remplacée par « Validation des retours par Marie : via le fil de discussion » ; gabarit de
  livraison Marie : bulle « `<N>` tests à faire » retirée, avec note explicite qu'aucune livraison
  réelle n'a encore utilisé ce gabarit modifié — à relire avant le prochain `/deploy`.
  `.claude/commands/{deploy,deploy_dev,close,analyser_googledoc,traiter_export_marie}.md` :
  références au catalogue et à `manual_test_results` (champ retiré de l'export) mises à jour ou
  marquées obsolètes ; `ingest_manual_tests.py` signalé **no-op** dans `deploy.md` et
  `traiter_export_marie.md` (champ qu'il consommait absent des exports désormais) — script non
  supprimé sur le moment (hors périmètre de cette phase). Retiré depuis, voir « Décisions non
  tranchées » ci-dessous (tranché le 2026-09-15).
  **Vrai bug découvert et corrigé (2026-09-15, sans lien avec cette phase)** : « je clique sur
  Relancer, il ne se passe rien ». Diagnostiqué en ouvrant une copie du stockage réel de
  l'utilisateur (localhost:5173, retour « test 3 ») dans un Chromium Playwright : le retour était
  en fait `sync_status: 'sent'` — la relance avait fini par aboutir, mais pas au clic. Cause dans
  `feedbackClient.ts` : `syncFeedbackNow({ force: true })` appelé pendant qu'un cycle non forcé
  était déjà en cours (celui déclenché au montage d'E123) rejoignait silencieusement ce cycle déjà
  figé sur son lot de retours à pousser — capturé avant le `markPending()` du clic Relancer — sans
  jamais retenter l'envoi ; le retour n'était repris qu'au hasard d'un cycle ambiant ultérieur,
  d'où l'absence totale de retour visuel au clic. Corrigé : un appel `force` pendant un cycle non
  forcé enchaîne désormais un second cycle complet une fois le premier terminé, au lieu de s'y
  fondre. Reproduit et vérifié dans un navigateur réel (blocage réseau ciblé sur `submit_feedback`
  puis relance) avant et après correctif. Test ajouté (`feedbackClient.test.ts`, +1, 17/17 verts) ;
  suite complète 866 tests verts, `tsc -b` + `eslint` clean.
  **Deuxième vrai bug découvert et corrigé (2026-09-15)** : la pastille rouge sur l'icône « Mes
  retours » de l'Accueil ne se recalculait qu'une fois, au montage du tableau de bord — signalé par
  l'utilisateur (« il n'y a pas le cercle rouge alors que je n'ai pas lu ton message »). Cause :
  `startFeedbackSync()` (démarrage global de l'appli) et le premier calcul de la pastille se
  déclenchent en parallèle ; une réponse d'agent reçue par la synchronisation juste après ce
  premier calcul restait invisible jusqu'au prochain démontage/remontage du tableau de bord.
  Corrigé (`E10Dashboard.tsx`) : la pastille se recalcule une seconde fois après la fin de la
  synchronisation de fond déclenchée au montage. Test ajouté (`E10Dashboard.test.tsx`, +1) ; suite
  complète 867 tests verts, `tsc -b` + `eslint` clean.

**Purge des retours antérieurs à la boucle conversationnelle (2026-09-15, décision utilisateur)** :
13 retours `feedback_reports` (pas 12, corrigé après un premier décompte erroné), tous antérieurs
au 2026-09-13 et jamais associés à un fil de discussion, supprimés de Supabase pour repartir de
zéro. Sauvegarde intégrale du texte avant suppression :
`Archives/feedback_reports_backup_2026-09-15.md` (13 entrées, id/appareil/écran/version/date/
commentaire complet). Suppression exécutée via un script ponctuel (non versionné, exécuté puis
supprimé) : `feedback_messages` liés (0, aucun de ces retours n'avait de fil), `feedback_reports`
(13), images Storage du bucket `feedback` (13). Correctif de droits nécessaire au passage, même
écart que celui de la Phase 3 : `service_role` n'avait pas `DELETE` sur `feedback_reports`/
`feedback_messages` — `grant delete on feedback_reports to service_role` et
`grant delete on feedback_messages to service_role` exécutés par l'utilisateur. Vérifié après coup :
`reply_feedback_report.py` ne liste plus aucun retour.

**Revue de code de clôture (2026-09-15, `code-review` medium, diff depuis `4b42d79`)** : 15 pistes
relevées sur l'ensemble des Phases 1-6. 2 corrections de robustesse confirmées et appliquées avant
commit — `E124FeedbackDetail.tsx` (`sendReply`/`validate`) n'avait aucune gestion d'erreur,
contrairement au même pattern déjà présent dans `E122FeedbackCapture.tsx` : un échec Dexie (quota,
mode privé) laissait le dialogue de validation ouvert ou le champ de réponse silencieusement
inchangé, sans aucun message. Désormais un message d'erreur `role="alert"` s'affiche dans les deux
cas, +2 tests (869 tests verts au total, `tsc -b` + `eslint` clean). Les 13 autres pistes n'ont
**pas** été corrigées dans cette session — tracées `[P1]` (régressions/lacunes réelles : modale
« Nouveautés » devenue inaccessible depuis le retrait d'E121, bouton Valider sans vérification de
`sync_status`, message échoué sans indicateur, effets de montage concurrents sans garde
d'annulation) ou `[P3]` (simplifications/duplications) dans `_contexte/signals.md`.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Décisions non tranchées

- ~~**Pastille de nouveau message** (Phase 4) : périmètre d'affichage.~~ Tranché le 2026-09-14 :
  entrée « Mes retours » et carte du retour concerné uniquement, pas de tableau de bord général.
- ~~**Confirmation avant validation** (Phase 2) : formulation et réversibilité côté testeur.~~
  Tranché et livré en Phase 2 (2026-09-14) : modale de confirmation simple avant clôture
  (`E124FeedbackDetail.tsx`, choix tranché avec l'utilisateur au moment de l'implémentation) —
  entrée laissée à tort dans cette liste, corrigée à ce `/close`.
- **Retours validés** : conservés en base et simplement masqués. Aucun écran d'archive prévu ;
  à demander si le besoin apparaît.
- ~~**Déclenchement de la réponse** (Phase 5) : manuel par défaut, rattachement éventuel à
  `/deploy` ou `/close` à décider.~~ Tranché le 2026-09-14 : aucune automatisation, appel explicite
  du script en session.
- ~~**Migration Dexie v23** (Phase 5) : posée sur une hypothèse que le diagnostic du 2026-09-15 a
  infirmée (aucune ligne réelle sans `resolution_status` observée) — filet inoffensif mais sans cas
  connu.~~ Tranché le 2026-09-15 : conservée (filet sans coût réel ; une migration Dexie passée
  n'étant jamais réécrite, la retirer n'apporterait que du bruit).
- ~~**`scripts/ingest_manual_tests.py`** (Phase 6) : devenu no-op, le champ `manual_test_results`
  qu'il consommait n'existe plus dans les exports.~~ Tranché le 2026-09-15 : retiré (script +
  test), ainsi que ses références dans `deploy.md` et `traiter_export_marie.md` (étapes
  renumérotées) et la mention dans `llms.txt`. Les journaux déjà ingérés dans
  `_contexte/tests_journaux/` restent en place (simples fichiers JSON, non gitignorés) sans usage
  futur prévu.
