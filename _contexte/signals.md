# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-09-07)

## Contexte chaud
- **Roadmap de fiabilisation `roadmap_refactorisation_2026-09-06.md` : phases 1 à 6 `[FAIT]`.** Phase 6 (2026-09-07) : appels réseau de synchronisation bornés — `callRpc` / `uploadFeedbackImage` acceptent un `timeoutMs` injectable (`DEFAULT_NETWORK_TIMEOUT_MS = 30_000`, D5), `AbortController` + `clearTimeout` en `finally`, expiration → `{ data: null, error: '… a expiré (<ms> ms)' }` sans lever ; `feedbackClient.ts` libère le verrou `inFlight` via `.finally`. Contrats réseau et throttles (snapshot 1 h, retours 60 s) inchangés. **Phases 7 et 8 : refactorisations conditionnelles P3, non planifiées — sort à acter explicitement.**
- **Volet UX du retour E10 traité (2026-09-07, commit `6f4a8d1`, sur `main`).** Sous-étapes dépliées DANS la carte de tâche du planning, carte qui s'agrandit, heure de fin au niveau de la dernière sous-étape. Parcours in-app `sous-etapes-dans-la-carte-planning` passé `revision: 1` : repassera « à faire » pour Marie au prochain `/deploy`.
- Suite complète sur `main` : **99 fichiers / 816 tests verts**, tsc `app`/`node` exit 0, lint 0, budget bundle OK (chunk d'entrée 262,97 kB < 266,43, inchangé). `tests_manuels.md` : contrôles navigateur dev en attente — horizon des récurrences, opérations de série atomiques (Phase 5), reprise après coupure réseau (Phase 6).
- v5.92 en production ; la session n'est pas déployée. `_contexte/dernier_deploiement.md` : v5.92, 2026-09-05. `CHANGELOG.md` à v5.103 — changements applicatifs (E10 UX + Phases 5-6) prêts pour une prochaine livraison.
- Livraison v5.92 à Marie : 12 parcours in-app en attente de sa validation (le parcours E10 s'y ajoutera au prochain deploy).
- `roadmap_supprimer_tache_du_jour.md` : Phase 3 `[TODO — BLOQUÉ]`, attend D2 (réponse de Marie), à regrouper avec sa validation des tests v5.92.
- `DISCORD/_contexte/memory.md` (non suivi) : travail zone `discord`, hors périmètre du `/close` racine.

## Questions ouvertes
- [P1] **Marie confirme-t-elle que « Relancer » fait passer ses retours en « Envoyé » ?** Risque résiduel : `submit_feedback` exige une ligne `device_snapshots` pour le `device_id` + `device_secret` de son iPhone. — fait quand : réponse de Marie dans `inbox/orchestrateur/` lue et `ack` (OK → clore ; KO → investiguer `device_snapshots` + endpoints `/rest/v1/rpc/submit_feedback` et `/storage/v1/object/feedback/`) — réf : `src/data/sync/feedbackClient.ts`, `src/data/sync/feedbackStorage.ts`, `supabase/feedback.sql`, gateway `20260906T204529_830899`
- [P1] **6 demandes (33 reprise Doc, #34-38) livrées en v5.92 — pas encore validées par Marie.** — fait quand : Marie valide les 12 parcours du catalogue (`ok`/`nok`) — réf : `_contexte/marie_modifications_suivi.md` lignes 33-38, `src/domain/data/manualTestsCatalog.ts`
- [P3] **Phases 7-8 de `roadmap_refactorisation_2026-09-06.md` (refactorisations conditionnelles).** Phase 7 (composition/état React, D6) et Phase 8 (geste du planning, D7 — conditionnée au retour Marie sur `E12WeekPlanning`, cf. P3 ci-dessous). Ne pas lancer sans décision explicite. — fait quand : l'utilisateur tranche « lancer » ou « reporter/abandonner » pour chacune — réf : `roadmap_refactorisation_2026-09-06.md` § Phases 7-8 et § Acceptation finale
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
- [P2] **`.claude/commands/create_memory.md` n'implémente pas l'alias de zone** documenté par `start.md` étape 2c. Correctif délégué à VibeObs. — fait quand : `create_memory.md` reconnaît un premier argument = alias de `.claude/zones.md`, résout le dossier et écrit dans `<dossier>/_contexte/memory.md` — réf : `.claude/commands/create_memory.md`, `.claude/commands/start.md` étape 2c

## Dernière session (2026-09-07 — roadmap fiabilisation Phase 6 : borner les requêtes réseau)

## Décisions prises
- D5 tranchée : délai des appels réseau de synchronisation = 30 s, injectable par appel (`DEFAULT_NETWORK_TIMEOUT_MS`, `src/data/sync/rpc.ts`).
- Hygiène des 2 résidus renvoyés par la zone `discord` (`CHANGELOG.md` v5.102, section `[discord-auto]` de `tests_manuels.md`) traitée dans la même session que Phase 6, sans commit dédié.

## Livrables produits ou modifiés
- `src/data/sync/rpc.ts` : `callRpc(name, params, { timeoutMs })` ; `AbortController` + `setTimeout(abort)` + `clearTimeout` en `finally` ; expiration → `{ data: null, error: 'rpc <name> a expiré (<ms> ms)' }`. URL/méthode/en-têtes/corps inchangés (ajout `signal`).
- `src/data/sync/feedbackStorage.ts` : même bornage pour `uploadFeedbackImage`.
- `src/data/sync/feedbackClient.ts` : `void task.finally(...)` — libération inconditionnelle du verrou `inFlight`.
- `src/data/sync/syncClient.ts` : inchangé (hérite du timeout de `callRpc` ; throttle 1 h préservé sur expiration).
- Tests : `rpc.test.ts` (+5), `feedbackStorage.test.ts` (nouveau, 4), `feedbackClient.test.ts` (+2), `syncClient.test.ts` (+1) — horloge simulée.
- `CHANGELOG.md` v5.102 (hygiène discord) + v5.103 (Phase 6). `tests_manuels.md` : contrôle navigateur Phase 6 + section `[discord-auto]` hook `on_start.md`. `roadmap_refactorisation_2026-09-06.md` : Phase 6 `[FAIT]` + bloc de clôture, D5 consignée. `README.md`, `contexte.md` mis à jour.
- Suite complète : 99 fichiers / 816 tests verts, tsc app+node exit 0, lint 0, budget bundle OK (262,97 kB < 266,43, inchangé).

## Hypothèses validées / invalidées
- VALIDÉ (horloge simulée) : une requête qui ne termine pas est annulée après le délai, le timer est nettoyé, le verrou de tentative est libéré (succès, erreur, expiration, rejet).
- VALIDÉ : contrats réseau (URL, méthode, en-têtes, corps, forme des erreurs) inchangés ; throttles distincts snapshot (1 h) / retours (60 s) préservés ; aucune boucle de retry ajoutée.
- NOTE : `syncReports` a un `try/catch` global et ne rejette pas aujourd'hui — le `.finally` est défensif ; la garantie matérielle vient du timeout transport.
- EN ATTENTE : réponses de Marie (relance des retours [P1], validation des 12 parcours v5.92 [P1]).

## Prochaine étape exacte
Checkpoint Phase 6 posé (utilisateur a fait `/compact`). Phases 7-8 conditionnelles P3 : ne pas lancer sans décision explicite de l'utilisateur. Déploiement gelé jusqu'aux réponses de Marie. Contrôle navigateur dev « reprise après coupure réseau (Phase 6) » en attente dans `tests_manuels.md`.

## Question bloquante pour la session suivante
Aucune.
