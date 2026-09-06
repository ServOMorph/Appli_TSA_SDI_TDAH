# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-09-06)

## Contexte chaud
- **Retour E10 de Marie (2026-09-06, capture `IMG_3397.png` dans `inbox/orchestrateur/`)** — deux volets :
  (1) UX : les sous-tâches s'affichent sous la durée de la tâche et la carte s'allonge seule ; Marie veut les sous-tâches DANS la carte (carte qui s'agrandit au besoin), heure de fin alignée sur la dernière sous-tâche (aujourd'hui les sous-tâches démarrent au niveau de l'heure de fin). **Non traité.**
  (2) Technique : « Échec d'envoi » de tous les retours. Cause = flux de retours annotés livré en v5.92 (`merge f6f5e78`) SANS backend serveur — `supabase/feedback.sql` jamais appliqué sur le projet Supabase de prod (`aslxfetpkuytrqwidxig`). **Migration appliquée par l'utilisateur pendant la session.** Message déposé + `approve`/`drain` forcés depuis la session orchestrateur (hors gardien `discord`, instruction explicite) → envoyé à Marie (Discord `1546260814401634354`, gateway `20260906T204529_830899`, `--expect-reply`) : relancer les retours en échec, confirmer « Envoyé ». Inbox `20260906T184910_113113` acquittée. Journalisé `historique_conversation_marie.md` (`eec75f6`, `b9465b6`).
- **Contradiction « 783 tests verts » levée** (contrôles menés en amont de la compaction de session). `npm ci` depuis le verrou dans le worktree isolé `refacto-p1` (`D:/ServOMorph/Appli_TSA_SDI_TDAH.worktrees/refacto-p1`, detached `f4ac862`) → tsc `app`/`node` exit 0, lint 0 avertissement, Vitest 97 fichiers / **783 tests verts**, `bundle:check` OK (chunk d'entrée 261,68 kB < 266,43). Le chiffre est exact ; cause = `node_modules` incomplet du checkout partagé, pas le code, pas une annonce non vérifiée. Worktree conservé en l'état (`node_modules` complet).
- **Checkout principal `d:\ServOMorph\Appli_TSA_SDI_TDAH` : `node_modules` toujours incomplet** (`npm ci` non exécuté — décision différée). Aucune commande `tsc`/`lint`/`Vitest` fonctionnelle sur ce checkout tel quel.
- Livraison v5.92 à Marie : 12 parcours in-app en attente de sa validation. `_contexte/dernier_deploiement.md` : v5.92, 2026-09-05. `CHANGELOG.md` à v5.100 — non déployé (aucun changement applicatif depuis v5.92).
- `roadmap_refactorisation_2026-09-06.md` : toutes phases `[TODO]`, non lancée. Verdict inchangé : Phases 1-2 lançables sous 2 confirmations (réinstall dépendances ; branche cible). Phases 3-8 gatées (baseline verte Phase 1 — désormais démontrable via `refacto-p1` — + décisions D1/D2/D4/D5, non prises).
- `roadmap_supprimer_tache_du_jour.md` : Phase 3 `[TODO — BLOQUÉ]`, attend D2 (réponse de Marie), à regrouper avec sa validation des tests v5.92.
- Messages canal du 2026-09-06 (prévention + clôture des tests techniques) : tous deux envoyés (`outbox/sent/`).
- Reste à aligner `.claude/CLAUDE.md` § « Gabarit du message de livraison » (nom de fichier au lieu de « lien »). Écart `/create_memory` (alias de zone) toujours délégué à VibeObs.
- `tests_manuels.md` : une seule section, `[discord-auto]` « Bot Discord — file d'attente » (B1/B2 validés le 2026-09-06 par la racine) — attend le passage de la session `discord` pour être retirée. Racine : ne pas y toucher.
- `DISCORD/_contexte/on_start.md` (modif non commitée) et `DISCORD/_contexte/memory.md` (non suivi) : travail zone `discord`, hors périmètre du `/close` racine.

## Questions ouvertes
- [P1] **Marie confirme-t-elle que « Relancer » fait passer ses retours en « Envoyé » ?** Risque résiduel : `submit_feedback` exige une ligne `device_snapshots` pour le `device_id` + `device_secret` de son iPhone (normalement présente, son app synchronise déjà). — fait quand : réponse de Marie dans `inbox/orchestrateur/` lue et `ack` (OK → clore ; KO → investiguer `device_snapshots` + endpoints `/rest/v1/rpc/submit_feedback` et `/storage/v1/object/feedback/`) — réf : `src/data/sync/feedbackClient.ts`, `src/data/sync/feedbackStorage.ts`, `supabase/feedback.sql`, gateway `20260906T204529_830899`
- [P2] **Volet UX du retour E10 : sous-tâches dans la carte de tâche + heure de fin alignée sur la dernière sous-tâche.** Non traité (nécessite `npm ci` sur le checkout principal + modif `src/`). — fait quand : layout corrigé, testé, parcours in-app ajouté au catalogue pour Marie — réf : `IMG_3397.png` (inbox orchestrateur), `TaskCardLayout`/`TaskFieldCard` (décision structurante 2026-09-05 Phase 3), `src/ui/screens/tasks/E22TaskDetail.tsx`
- [P1] **6 demandes (33 reprise Doc, #34-38) livrées en v5.92 — pas encore validées par Marie.** — fait quand : Marie valide les 12 parcours du catalogue (`ok`/`nok`) — réf : `_contexte/marie_modifications_suivi.md` lignes 33-38, `src/domain/data/manualTestsCatalog.ts`
- [P1] **Lance-t-on `roadmap_refactorisation_2026-09-06.md` (Phases 1-2) et sur quelle branche ?** Politique = `main`. Le volet UX E10 pourrait s'y replier (Phase 1 rétablit la toolchain sur un checkout propre). — fait quand : l'utilisateur tranche lancement + branche → `/start` puis Phase 1 — réf : `roadmap_refactorisation_2026-09-06.md` § Phase 1, `ROBERTO/plan_refacto_2026-09-06.md` § Décisions à prendre
- [P2] **D2 — point d'entrée « accueil » pour l'ajout de tâche planifiée d'office (Phase 3 `roadmap_supprimer_tache_du_jour.md`).** Interprétation dev = bouton « + » du `BottomNav` (`App.tsx:189`). À regrouper avec la réponse de Marie sur les tests v5.92. — fait quand : Marie confirme (ou corrige) → Phase 3 débloquée — réf : `roadmap_supprimer_tache_du_jour.md` § Décisions produit (D2)
- [P3] **`E12WeekPlanning.tsx` reproduit le défaut de saut au relâchement corrigé dans `PlanningBoard.tsx` (#38)** — hors périmètre #38, non corrigé. — fait quand : Marie confirme le même problème sur « Planning de la semaine » + phase dédiée — réf : `Archives/roadmap_demandes_marie_2026-09-04.md` Phase 4, `src/ui/screens/dashboard/E12WeekPlanning.tsx`
- [P2] **Zoom indésirable au clic sur « Ajouter » depuis Réception** (retour Marie 2026-09-05, hors Doc), non qualifié. — fait quand : cause identifiée dans le code, correctif appliqué et testé — réf : `_contexte/marie_modifications_suivi.md` § Précisions (friction 2026-09-05), `src/ui/screens/tasks/E20Inbox.tsx`
- [P2] **Latence « Chargement... » entre écrans** (Marie 2026-09-04) : correctif `3299a95` non validé (préchargement ciblé des 3 écrans du menu du bas encore lazy, correctif à l'aveugle). — fait quand : Marie revalide `navigation-entre-tous-les-ecrans` en `ok`, ou signale que la latence persiste — réf : `_contexte/marie_modifications_suivi.md` § Précisions, `src/App.tsx`
- [P3] **Décision produit 4 (navigation « Planning de la semaine »)** encore à valider par Marie (navigation ±1 semaine ; repli jour-par-jour si illisible). — fait quand : Marie valide `vue-planning-de-la-semaine` en `ok`, ou signale l'illisibilité — réf : `Archives/roadmap_planning_accueil_2026-08-29.md` Phase 5
- [P3] **Aligner `.claude/CLAUDE.md` § « Gabarit du message de livraison »** : remplacer « Le lien du commentaire Drive » par le nom de fichier `commentaires_marie_<version>.docx`. — fait quand : la section est mise à jour — réf : `.claude/commands/deploy.md` étapes 11-12, `.claude/CLAUDE.md` § Messages pour Marie
- [P2] **Traiter les 3 frictions du 2026-08-19** (geste de glissement planning à revoir, lien retrait de livret/catégorie budget, disparition des test IDs obsolètes). — fait quand : les 3 points tranchés ou intégrés à une roadmap — réf : `_contexte/marie_tests_journal.json` (`44f24c63`, `be0c10ef`, `6e32ace5`)
- [P2] **Appliquer le découpage en 7 catégories validé par Marie** aux autres communications/roadmaps. — fait quand : convention explicite adoptée pour les prochaines roadmaps/communications — réf : `COMMUNICATION/message_marie_categories_travail.md`
- [P2] **Périodicité d'une catégorie de dépense modifiable après création ?** (impact sur l'historique). — fait quand : décision actée avec l'utilisateur — réf : `Archives/roadmap_v5.1.md` § Q à trancher
- [P3] **Durcir `/discord_loop`** : ajouter un `stop` qui notifie Discord « Claude hors ligne » (auto-rattrapage au démarrage fait depuis le 2026-09-03). — fait quand : la commande `stop` de `/discord_loop` notifie Discord — réf : `.claude/commands/discord_loop.md`, `DISCORD/discord_com/bot.py`
- [P2] **`.claude/commands/create_memory.md` n'implémente pas l'alias de zone** documenté par `start.md` étape 2c. Correctif délégué à VibeObs (message en presse-papier le 2026-09-06). — fait quand : `create_memory.md` reconnaît un premier argument = alias de `.claude/zones.md`, résout le dossier et écrit dans `<dossier>/_contexte/memory.md` — réf : `.claude/commands/create_memory.md`, `.claude/commands/start.md` étape 2c

## Dernière session (2026-09-06 — retour E10 de Marie : diagnostic échec d'envoi + baseline 783 tests levée)

## Décisions prises
- Retour E10 de Marie : « Échec d'envoi » des retours = flux de retours annotés livré en v5.92 sans backend serveur. `supabase/feedback.sql` (table `feedback_reports`, RPC `submit_feedback`, bucket privé `feedback`, policy storage `anon`) appliqué en prod par l'utilisateur pendant la session.
- Message à Marie (relance des retours + confirmation) : déposé dans la gateway (`20260906T204529_830899`, `question`, `--expect-reply`), puis `approve` + `drain` **forcés depuis la session orchestrateur, hors gardien `discord`**, sur instruction explicite de l'utilisateur. Envoyé (Discord `1546260814401634354`).
- Contradiction « 783 tests verts » levée : `npm ci` depuis le verrou dans le worktree isolé `refacto-p1` (detached `f4ac862`) → tsc `app`/`node` exit 0, lint 0 avertissement, Vitest 97 fichiers / 783 tests verts, `bundle:check` OK. Chiffre exact ; cause = `node_modules` incomplet du checkout partagé.

## Livrables produits ou modifiés
- `COMMUNICATION/Marie/historique_conversation_marie.md` : échange E10 + envoi (`eec75f6`, `b9465b6`).
- Supabase prod : `supabase/feedback.sql` appliqué (hors dépôt).
- Worktree `refacto-p1` : `node_modules` reconstruit via `npm ci`, conservé en l'état.
- `_contexte/signals.md`, `_contexte/contexte.md`, `_contexte/archive_sessions.md`, `_contexte/archive_decisions.md`, `README.md`, `CHANGELOG.md`, `COMMUNICATION/Marie/a_transmettre.md` : ce `/close`.
- Aucun code applicatif touché.

## Hypothèses validées / invalidées
- VALIDÉ : cause de l'échec d'envoi = migration serveur jamais appliquée (source `TESTS/_contexte/signals.md:5,31` + chemins `feedbackClient.ts` / `feedbackStorage.ts` / `rpc.ts`).
- VALIDÉ : baseline verte réelle (783 tests) après `npm ci` depuis le verrou dans un worktree isolé — la contradiction venait du checkout partagé incomplet, non du code.
- EN ATTENTE : confirmation de Marie que « Relancer » fait passer ses retours en « Envoyé » (risque résiduel : ligne `device_snapshots` de son appareil).
- EN ATTENTE : volet UX E10 (sous-tâches dans la carte) non traité — nécessite `npm ci` sur le checkout principal + modif `src/`.

## Prochaine étape exacte
Attendre la réponse de Marie (`inbox/orchestrateur/`, `poll --agent orchestrateur`) sur la relance des retours. OK → traiter le volet UX E10 (sous-tâches dans la carte, heure de fin alignée) — décider branche + réinstall toolchain, éventuel repli dans `roadmap_refactorisation` Phase 1. KO → investiguer `device_snapshots` / endpoints Supabase.

## Question bloquante pour la session suivante
Le volet UX E10 se traite-t-il isolément sur `main` (avec `npm ci` sur le checkout principal), ou en le repliant dans le lancement de `roadmap_refactorisation_2026-09-06.md` Phase 1 ?
