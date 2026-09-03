# Roadmap — Synchronisation automatique des données de Marie

Version créée 2026-08-15. Remplace le flux manuel export JSON -> envoi -> ingestion par une synchronisation automatique en arrière-plan. Les travaux historiques sont sur `sync-marie` ; l'intégration et la suite de la roadmap se font sur `main`.

Légende : `[ ]` non démarrée · `[~]` en cours · `[x]` terminée.
Gate commun : tests créés et verts · test manuel de la phase · doc à jour · aucun écran ne perd son point d'entrée · critère de sortie.

## Décisions actées (2026-08-15)

- Toutes les données applicatives de Marie sont concernées (pas seulement les résultats de tests manuels).
- Pas d'écran de connexion : un identifiant/secret généré automatiquement par appareil sécurise l'envoi, aucune saisie pour Marie.
- Statut visible dans Paramètres : « vos données de test sont partagées avec le développeur » — pas de sync silencieuse invisible, en rupture assumée avec le flux d'export actuel où l'envoi était un geste explicite.
- Sauvegarde régulière (fréquence à trancher Phase 2, proposition par défaut : au démarrage de l'app + au retour au premier plan, throttlé à au plus une fois par heure).
- Ajout des nouveautés (`WHATS_NEW`) et du catalogue de tests manuels reste sur l'édition de fichiers actuelle — hors périmètre de cette roadmap.
- Ne pas fusionner ni cherry-pick intégralement `sync-marie` : la branche a divergé et contient des travaux hors synchronisation. Reporter sélectivement le socle Supabase sur une branche d'intégration créée depuis `main`, puis fusionner cette branche dans `main` après validation.
- Les variables `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont réservées au navigateur. `SUPABASE_SERVICE_ROLE_KEY` est réservée au script développeur et ne doit jamais être exposée dans le bundle ou les variables publiques Netlify.

## Prérequis externe [FAIT — 2026-08-15]

Backend Supabase (région UE, cf. `contexte.md`) — projet créé par l'utilisateur (`aslxfetpkuytrqwidxig`, région Frankfurt), API de données activée, RLS automatique activé, clés (URL + clé publiable) ajoutées à `.env` et aux variables d'environnement du site Netlify de prod. Site de test (dev) pas encore confirmé. Aucune dépendance Supabase présente dans `package.json` à ce jour — à ajouter en Phase 1.

---

## Phase 1 — Backend : schéma et projet Supabase [FAIT]

> Basculer sur le modèle Opus (/model opus) avant de démarrer cette phase (migration structurelle).

- Projet Supabase créé par l'utilisateur, région UE, clés (URL + clé anonyme) ajoutées à `.env` (jamais commitées).
- Schéma de snapshot miroir des données Dexie, une ligne par appareil identifié par son secret.
- Politique d'accès : écriture seule depuis l'appareil avec son propre secret, pas de lecture croisée entre appareils.
- Client Supabase ajouté aux dépendances (`@supabase/supabase-js`).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 2 — Client de synchronisation [FAIT]

- Génération et stockage local (`localStorage`) d'un secret d'appareil unique à la première ouverture.
- Fonction de sync : sérialise les tables Dexie, pousse vers Supabase avec le secret en en-tête.
- Déclenchement : au démarrage de l'app + retour au premier plan, throttlé (fréquence à confirmer avec l'utilisateur en ouverture de phase).
- Gestion hors-ligne : échec silencieux, nouvelle tentative au prochain déclenchement, jamais de blocage de l'usage de l'app.
- Tests : fonction de sync testée en isolation (mock réseau), throttle testé.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 3 — Statut visible côté Marie [FAIT]

- Nouvel indicateur dans Paramètres (zone à définir, cohérente avec l'écran existant) : « vos données de test sont partagées avec le développeur », avec date/heure de dernière synchronisation réussie.
- Pas de bascule marche/arrêt dans le périmètre de cette phase (à signaler si l'utilisateur en veut une).
- Tests : affichage du statut et de la date, composant testé.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 4 — Intégration et validation sur `main` [FAIT]

- [x] Branche `integration/supabase-main` créée depuis `main` et socle Supabase de `sync-marie` reporté sélectivement : `src/data/sync/`, `src/app/AppContext.tsx`, `src/app/contexts/useSettingsState.ts`, `src/ui/components/SyncStatusCard.tsx`, `src/ui/screens/settings/E110Settings.tsx`, `supabase/schema.sql`, `scripts/read_device_snapshots.py` et `@supabase/supabase-js`.
- [x] `package.json` et `package-lock.json` revus dans le contexte de `main` : seule la dépendance Supabase a été ajoutée.
- [x] Variables navigateur `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` et variables script `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` configurées dans `.env` ; documentées dans `.env.example`.
- [x] `supabase/schema.sql` exécuté dans le projet Supabase (session 2026-08-30).
- [x] Régressions de l'export manuel vérifiées ; `npm test` (640 tests), `npm run build` et le lint réussissent.
- [x] Synchronisation vérifiée en réel le 2026-08-31 : écriture depuis un appareil mobile (snapshot `app_version` v5.68) + lecture via `scripts/read_device_snapshots.py` (19 snapshots, le plus récent daté). Confirmation grandeur nature = 1re sync de Marie sur v5.69.
- [x] `integration/supabase-main` fusionnée dans `main` (fast-forward) le 2026-08-31.
- [x] `/deploy` v5.69 exécuté depuis `main` le 2026-08-31.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 5 — Bascule et retrait du flux manuel [FAIT]

Préalable levé le 2026-09-01 : 1re synchronisation réelle de Marie sur v5.69 confirmée par
lecture Supabase (device `192f2411`, `synced_at` 2026-09-01 10:47 UTC, `app_version` v5.69).

- Retirer les bannières urgentes demandant réimport/réexport (`E01Welcome.tsx`, `E121ManualTests.tsx`) après confirmation de la synchronisation réelle.
- Réviser ou retirer l'étape 0 de `.claude/commands/deploy.md` relative au traitement des exports de Marie.
- Conserver un chemin de lecture développeur des snapshots Supabase et documenter le remplacement effectif de l'ingestion manuelle.
  Brique déjà livrée (2026-09-01) : `scripts/backup_marie_snapshot.py` archive le `payload` daté dans
  `donnees_marie/` (format identique aux exports historiques), branché en étape 4 de `/start`.
  Reste à documenter la bascule et le retrait de `/traiter_export_marie` du flux nominal.
- Tests : absence de régression des écrans concernés ; parcours de synchronisation et de lecture du snapshot reproductible.

### Bascule effectuée le 2026-09-01

- Bannières urgentes de réimport/réexport : déjà retirées de `E01Welcome.tsx` et `E121ManualTests.tsx` lors de la session du 2026-08-16 (devenues obsolètes) ; aucune trace restante dans le code (grep `bannière`/`réimport`/`réexport` + lecture des deux fichiers).
- `.claude/commands/deploy.md` étape 0 révisée : ne réclame plus les exports manuels de Marie. Elle rafraîchit le snapshot Supabase via `scripts/backup_marie_snapshot.py` (idempotent, déjà lancé en étape 4 de `/start`), analyse le dernier snapshot de `donnees_marie/` puis l'ingère via `scripts/ingest_manual_tests.py` (le payload du snapshot a le même format que les exports historiques). Étapes 0.4-0.6 (revue du Google Doc) inchangées ; les deux scripts Python ajoutés à `allowed-tools`.
- Chemin de lecture développeur conservé : `scripts/read_device_snapshots.py` (lecture directe Supabase) et `scripts/backup_marie_snapshot.py` (archive datée). Ingestion manuelle remplacée par : sync auto -> `/start` archive -> `/deploy` étape 0 analyse.
- `/traiter_export_marie` sorti du flux nominal : en-tête « Repli manuel » ajouté, n'est plus appelé par `/deploy`. Conservé pour ré-ingérer un ancien export ou un envoi manuel résiduel.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.
