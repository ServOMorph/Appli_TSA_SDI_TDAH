# Roadmap — Retours annotés depuis le téléphone

## Origine

Consigne initiale de `TESTS` (`_contexte/messages.md`, traitée le 2026-09-04) et
`agent_role.md` : concevoir et réaliser, dans la branche isolée `agent/retours`, un retour de
test créé depuis un téléphone — capture partagée, annotation au crayon, numéro d'écran visible,
commentaire, stockage privé dans Supabase Storage, métadonnées exploitables.

Objectif de fond (`_contexte/contexte.md`) : remplacer progressivement le Google Doc par des
retours annotés créés dans l'application. Le flux Google Doc n'est pas supprimé tant que la
validation utilisateur n'est pas donnée.

## État constaté dans le code (2026-09-04, worktree `agent/retours`)

Backend et identité :
- `supabase/schema.sql` (65 lignes) : une seule table `device_snapshots` + une fonction
  `sync_device_snapshot` en `security definer`. Le rôle `anon` n'a **aucun accès direct** aux
  tables (RLS sans policy, `revoke all`), seulement le droit d'exécuter cette fonction.
- `src/data/sync/rpc.ts` : pas de SDK Supabase, `fetch` natif vers `POST {url}/rest/v1/rpc/{name}`
  avec `apikey` + `Authorization: Bearer <anon>`. Ne lève jamais, tout remonte en `{ error }`.
- `src/data/sync/deviceIdentity.ts` : `deviceId` + `deviceSecret` générés une fois et persistés en
  `localStorage`. Aucun écran de connexion, aucune Supabase Auth.
- `src/data/sync/syncConfig.ts` : `getSyncConfig()` retourne `null` si les variables d'env sont
  absentes — invariant du projet : *l'app reste pleinement utilisable sans backend*, `null` n'est
  jamais une erreur.
- `src/data/sync/syncClient.ts` : envoi throttlé (1 h), échec toujours silencieux.
- `scripts/_supabase.py` : accès dev en `SUPABASE_SERVICE_ROLE_KEY` ; `fetch_snapshots()` est
  **codé en dur sur `device_snapshots`** — un lecteur de retours devra généraliser ou ajouter sa
  propre requête.

Application :
- `src/App.tsx` : tous les écrans en `lazy(...)`, mappés sur `Route` (`src/app/navigation.ts`,
  32 routes, chaînes de caractères type `'manual-tests'`).
- Les codes d'écran `E##` **n'existent que dans les noms de fichiers** (`E121ManualTests.tsx`).
  Aucun registre route → code, aucun code affiché dans l'UI (`grep` : occurrences uniquement dans
  `App.tsx`, `E110Settings`, `DevResetButton`).
- `src/data/db.ts` : Dexie en `version(18)`. Un nouveau stockage local = `version(19)`.
- `src/ui/screens/tests/E121ManualTests.tsx` : écran « Tests à faire », modale résultat
  `ok`/`nok` + commentaire texte, historique. C'est le voisin fonctionnel du futur écran de retour.
- **Aucun code image existant** : `grep` sur `capture|camera|canvas|getUserMedia|input type=file`
  → aucun fichier. Tout est à créer.
- **Pas de PWA** : `index.html` n'a ni `manifest`, ni service worker, ni `VitePWA`.
- Pattern d'entrée d'image éprouvé dans un projet voisin (`D:\ServOMorph\Roberto\com_telephone\
  voice-code-bridge\mobile\app.js`, `server.js`) : `<input type="file" accept="image/*" hidden>`
  + bouton « coller » (`navigator.clipboard.read()`, repli sur l'input si l'API est absente ou ne
  contient pas d'image), plafond de taille (8 Mo côté client et serveur). Aucun manifest PWA, pas
  de Web Share Target. Confirmé avec l'utilisateur (2026-09-04) : reprendre ce pattern d'UI dans
  l'app TSA, sans dépendance vers le projet Roberto (infra distincte : ce bridge écrit sur disque
  local via WebSocket, hors périmètre de cet agent et hors objectif Supabase de `agent_role.md`).
- `bundle.budget.json` : contrôle bloquant au `/deploy` (`entryBytes` ≤ 266 428, mesure actuelle
  242 207). Le flux de retour doit rester en chunk `lazy`, hors chunk d'entrée.
- Tests : Vitest (~719 tests) + Playwright e2e (`e2e/`).

## Décisions produit

- **D1 — TRANCHÉE (2026-09-04, utilisateur) — Entrée de la capture.**
  `<input type="file" accept="image/*" hidden>` + bouton « coller » (`navigator.clipboard.read()`,
  repli sur l'input si l'API est absente ou sans image). Marie fait sa capture d'écran système,
  puis l'ouvre depuis la galerie ou la colle directement dans l'écran de retour. Pattern repris
  de celui, déjà éprouvé en réel, du bridge ROBERTO (`Roberto/com_telephone/voice-code-bridge/
  mobile/app.js`) — sans dépendance vers ce projet, seule l'UI est reprise. L'alternative
  « partage direct depuis le menu Partager » (Web Share Target) impose un manifest PWA **et un
  service worker** dans une app qui n'en a aucun, n'existe pas sur iOS, et interfère avec le
  schéma de déploiement versionné `dist/vX.Y` sur Netlify — écartée.
- **D2 — TRANCHÉE (2026-09-04, utilisateur) — Numéro d'écran.** Registre `route → code E##` +
  badge discret **permanent** (pas de réglage « mode retour » à activer). Cohérent avec la
  consigne (« numéro d'écran visible ») et évite que Marie doive penser à activer un mode avant de
  constater un problème. Le code est repris automatiquement dans le formulaire (écran d'où part le
  retour) **et** modifiable, la capture pouvant concerner un autre écran.
- **D2bis — TRANCHÉE (2026-09-04, utilisateur) — Point d'entrée du flux.** Bouton flottant global,
  accessible depuis n'importe quel écran de l'app — pas seulement une entrée dans les Paramètres.
  Cohérent avec l'usage réel de Marie (elle commente au fil de l'usage, pas uniquement pendant un
  parcours de « Tests à faire »). Conséquence sur la Phase 3 : composant de montage global
  (au niveau `App.tsx`, comme le badge D2), pas une simple entrée de menu.
- **D3 — TRANCHÉE (2026-09-04, utilisateur) — Stockage.** Bucket Supabase Storage privé (imposé
  par `agent_role.md`), risque accepté : la clé `anon` est publique (déjà embarquée dans le
  bundle), donc la policy `insert` sur `storage.objects` pour `anon` rend le dépôt de fichiers
  ouvert à quiconque lit le bundle. Alternative écartée (Edge Function + URL signée) : fermerait
  le trou mais introduirait le premier usage d'Edge Functions dans ce projet, hors périmètre
  déclaré de l'agent RETOURS. Atténuations retenues : aucune policy `select`/`update`/`delete`,
  limite de taille et de types MIME sur le bucket, chemin préfixé par `device_id`. Risque résiduel
  = dépôt parasite, pas de fuite de données.
- **D4 — Image envoyée : aplatie (capture + annotation fusionnées en une seule image).**
  Un seul fichier lisible côté dev. Les traits vectoriels sont conservés en JSON dans les
  métadonnées (peu coûteux, permet un rejeu ultérieur) — à retirer si le poids gêne.
- **D5 — Compression client obligatoire** : redimensionnement (côté long ≤ 1600 px) et export
  JPEG/WebP qualité ~0,8 avant envoi. Sans cela, une capture de téléphone moderne pèse plusieurs
  Mo et l'envoi en 4G devient hasardeux.
- **D6 — Hors-ligne : le retour est d'abord écrit en local (Dexie), l'envoi est opportuniste et
  rejouable.** Aligné sur l'invariant existant : aucune fonctionnalité ne dépend du réseau.
- **D7 — Coexistence avec le Google Doc : aucune suppression, aucun basculement.** Le flux
  nouveau est additif tant que la validation utilisateur n'est pas donnée.

## Contraintes de périmètre (agent RETOURS)

- Écriture limitée à `TESTS/RETOURS/`, `src/`, `supabase/` et les tests liés, dans ce worktree.
- Interdits : `.env`, `donnees_marie/`, `CHANGELOG.md`, `WHATS_NEW`, `manualTestsCatalog.ts`,
  artefacts de release, déploiement. **Aucun parcours in-app n'est donc ajouté par cet agent** :
  les tests destinés à Marie sont proposés au coordinateur dans `statut.md`.
- Commits sur `agent/retours` uniquement. Jamais de fusion, de rebase ni de déploiement.

---

## Phase 1 — Socle domaine et persistance locale [FAIT]

- `src/domain/entities/feedbackReport.ts` : entité `FeedbackReport` (`id`, `screen_code`,
  `comment`, `image_path`, `image_bytes`, `strokes` (D4), `app_version`, `created_at`,
  `sync_status: 'pending' | 'sent' | 'failed'`, `last_attempt_at`).
- `src/data/db.ts` : `version(19)` avec le store `feedbackReports` (index `created_at`,
  `sync_status`). Migration non destructive, montée de version testée.
- `src/data/repositories/feedbackReportRepository.ts` sur le modèle de
  `manualTestResultRepository.ts` (`create`, `getAll`, `getPending`, `markSent`, `markFailed`).
  Stockage du binaire en `Blob` dans Dexie, pas en base64 (poids ×1,33 sinon).
- `src/domain/rules/feedbackRules.ts` : règle de validité d'un retour (image obligatoire,
  commentaire ou annotation obligatoire, code d'écran obligatoire), purge des retours envoyés
  au-delà de N jours.
- Tests : repository, règles, migration Dexie v18 → v19 sur une base peuplée.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 2 — Numéro d'écran visible [FAIT]

Placée avant l'UI de retour : le code d'écran est une donnée d'entrée du formulaire.

- `src/domain/data/screenCodes.ts` : registre unique `Route['name'] → { code: 'E121', label }`,
  couvrant les 32 routes de `src/app/navigation.ts`.
- Composant `src/ui/components/ScreenCodeBadge.tsx` : badge discret **permanent** (coin haut,
  faible contraste, `aria-hidden` non — reste lisible au lecteur d'écran). Pas de réglage
  d'activation (D2).
- Injection au niveau de `App.tsx` (un seul point de montage, pas de badge à recopier dans chaque
  écran) — au même point que le bouton flottant de retour (Phase 3, D2bis).
- Tests : exhaustivité du registre (test qui échoue si une route n'a pas de code), badge présent
  sur un échantillon d'écrans, code affiché correspond à la route active.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 3 — Capture, annotation au crayon, commentaire [FAIT]

- `src/domain/rules/annotationStrokes.ts` : **module pur** — points, traits, `undo`, `clear`,
  simplification. jsdom n'a pas de contexte 2D : toute la logique testable doit être hors canvas.
- `src/ui/components/AnnotationCanvas.tsx` : rendu des traits sur `<canvas>`, `pointerdown` /
  `pointermove` / `pointerup` (Pointer Events, tactile et souris), épaisseur et couleur fixes.
- `src/data/images/flattenImage.ts` : adaptateur d'aplatissement + compression (D4, D5),
  isolé pour être mocké en test.
- `src/ui/screens/feedback/E122FeedbackCapture.tsx` (`lazy`, nouvelle route `feedback`) :
  choix de l'image (D1), annotation, code d'écran pré-rempli avec la route active au moment de
  l'ouverture et modifiable (Phase 2), commentaire, bouton « Envoyer ».
- `src/ui/components/FeedbackFab.tsx` : bouton flottant global (D2bis), monté au même point que
  `ScreenCodeBadge` dans `App.tsx`, navigue vers `feedback`. Masqué sur l'écran `feedback`
  lui-même (pas de bouton pour ouvrir l'écran depuis l'écran).
- `src/ui/screens/feedback/E123FeedbackList.tsx` : liste locale des retours et de leur état
  d'envoi (`pending` / `sent` / `failed`), avec relance manuelle.
- Tests : module de traits (unitaire, exhaustif), écran en RTL avec `flattenImage` et
  `getContext` mockés (formulaire désactivé sans image, envoi crée bien un `FeedbackReport`
  local), bouton flottant présent sauf sur `feedback`, non-régression du budget bundle
  (`npm run bundle:check`).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 4 — Backend Supabase : bucket privé et métadonnées [FAIT]

- `supabase/feedback.sql` (fichier séparé, `supabase/schema.sql` non réécrit) :
  - table `feedback_reports` (`id uuid pk`, `device_id`, `screen_code`, `comment`,
    `storage_path`, `image_bytes`, `strokes jsonb`, `app_version`, `created_at`), RLS activée,
    `revoke all ... from anon` comme `device_snapshots` ;
  - fonction `submit_feedback(...)` en `security definer` validant `device_secret` contre
    `device_snapshots` (même schéma d'authentification que `sync_device_snapshot`), `grant
    execute ... to anon` ;
  - bucket privé `feedback` + policies `storage.objects` : `insert` pour `anon` restreint au
    bucket, **aucune** policy `select` / `update` / `delete` ; limite de taille et types MIME
    posés sur le bucket (D3).
- `src/data/sync/feedbackStorage.ts` : upload en `fetch` natif
  (`POST {url}/storage/v1/object/feedback/{device_id}/{id}.jpg`), style et contrat d'erreur
  calqués sur `rpc.ts` (ne lève jamais).
- Tests : test de contrat sur `feedbackStorage` (URL, en-têtes, corps, gestion des codes
  d'erreur) avec `fetch` mocké, sur le modèle de `rpc.contract.test.ts` — aucun appel réseau réel
  en suite de tests.
- Le SQL n'est **pas** appliqué en production par cet agent : il est remis au coordinateur.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 5 — Envoi de bout en bout et file d'attente [FAIT]

- `src/data/sync/feedbackClient.ts` : orchestration `upload image → RPC métadonnées → markSent`,
  reprise des `pending` / `failed`, throttle des tentatives, échec silencieux si
  `getSyncConfig()` est `null` (D6). Déclenchement à l'envoi, au retour en ligne et au démarrage.
- Rollback partiel : image envoyée mais RPC en échec → l'objet orphelin est toléré (le chemin
  reste connu localement, la relance réutilise le même chemin, pas de doublon).
- Tests : succès, échec réseau, sync désactivée, relance d'un `failed`, absence de double envoi.
- e2e Playwright (`e2e/10-feedback.spec.ts`) : parcours complet avec une image factice et le
  réseau Supabase intercepté — vérifie le parcours, jamais le backend réel.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 6 — Lecture côté dev et remise au coordinateur [FAIT]

- `scripts/read_feedback_reports.py` : liste les retours et télécharge les images depuis le
  bucket privé en `SUPABASE_SERVICE_ROLE_KEY`. Nécessite de généraliser `fetch_snapshots()` de
  `scripts/_supabase.py` (aujourd'hui figé sur `device_snapshots`) ou d'ajouter une fonction
  voisine ; auto-tests `unittest` stdlib, sur le modèle de `scripts/test_backup_marie_snapshot.py`.
- `TESTS/RETOURS/README.md` : schéma du flux, SQL à appliquer, variables d'environnement,
  procédure de lecture.
- `TESTS/RETOURS/_contexte/statut.md` pour le coordinateur : commit proposé, migrations SQL et
  Dexie, tests exécutés, **points à valider** (D1, D2, D3 et son risque de dépôt parasite, D4),
  parcours in-app à ajouter par le coordinateur (interdits à cet agent), et demande d'intégration.
- Contrôle final : `tsc -b`, `npm run lint`, suite complète Vitest, `npm run bundle:check`,
  e2e. Aucun déploiement, aucune fusion.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.
