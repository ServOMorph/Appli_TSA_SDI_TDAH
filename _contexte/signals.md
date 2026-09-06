# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-09-07)

## Contexte chaud
- **Roadmap de fiabilisation `roadmap_refactorisation_2026-09-06.md` : phases 1 à 5 `[FAIT]`.** Phase 5 (2026-09-07) : opérations de série rendues atomiques via `src/data/services/seriesPersistence.ts` (`persistSeriesBatch` — transaction unique `tasks` + `taskRecurrences`) ; `usePlanningState` route créations, éditions et suppressions de série par ce service. Phase 6 (borner les requêtes réseau, délai injectable D5, verrou de tentative) à reprendre.
- **Volet UX du retour E10 traité (2026-09-07, commit `6f4a8d1`, sur `main`).** Sous-étapes dépliées DANS la carte de tâche du planning, carte qui s'agrandit, heure de fin au niveau de la dernière sous-étape. Parcours in-app `sous-etapes-dans-la-carte-planning` passé `revision: 1` : repassera « à faire » pour Marie au prochain `/deploy`.
- Suite complète sur `main` : **98 fichiers / 805 tests verts**, tsc `app`/`node` exit 0, lint 0, budget bundle OK (chunk d'entrée 262,97 kB < 266,43). Contrôle navigateur de l'horizon des récurrences toujours en attente dans `tests_manuels.md` ; contrôle dev « Opérations de série atomiques (Phase 5) » ajouté au même fichier.
- v5.92 en production ; la session n'est pas déployée. `_contexte/dernier_deploiement.md` : v5.92, 2026-09-05. `CHANGELOG.md` à v5.101 — changements applicatifs (E10 UX + Phase 5) prêts pour une prochaine livraison.
- Livraison v5.92 à Marie : 12 parcours in-app en attente de sa validation (le parcours E10 s'y ajoutera au prochain deploy).
- `roadmap_supprimer_tache_du_jour.md` : Phase 3 `[TODO — BLOQUÉ]`, attend D2 (réponse de Marie), à regrouper avec sa validation des tests v5.92.
- `DISCORD/_contexte/memory.md` (non suivi) : travail zone `discord`, hors périmètre du `/close` racine.

## Questions ouvertes
- [P1] **Marie confirme-t-elle que « Relancer » fait passer ses retours en « Envoyé » ?** Risque résiduel : `submit_feedback` exige une ligne `device_snapshots` pour le `device_id` + `device_secret` de son iPhone. — fait quand : réponse de Marie dans `inbox/orchestrateur/` lue et `ack` (OK → clore ; KO → investiguer `device_snapshots` + endpoints `/rest/v1/rpc/submit_feedback` et `/storage/v1/object/feedback/`) — réf : `src/data/sync/feedbackClient.ts`, `src/data/sync/feedbackStorage.ts`, `supabase/feedback.sql`, gateway `20260906T204529_830899`
- [P1] **6 demandes (33 reprise Doc, #34-38) livrées en v5.92 — pas encore validées par Marie.** — fait quand : Marie valide les 12 parcours du catalogue (`ok`/`nok`) — réf : `_contexte/marie_modifications_suivi.md` lignes 33-38, `src/domain/data/manualTestsCatalog.ts`
- [P2] **Phase 6 de `roadmap_refactorisation_2026-09-06.md` : borner les requêtes réseau et fiabiliser la relance.** Décision D5 (délai réseau, valeur initiale proposée 30 s, injectable) à consigner dans la phase. — fait quand : délai injectable + annulation effective + libération du verrou de tentative après succès/erreur/expiration, contrats réseau conservés, suite verte — réf : `roadmap_refactorisation_2026-09-06.md` § Phase 6, `src/data/sync/rpc.ts`, `src/data/sync/feedbackClient.ts`, `src/data/sync/feedbackStorage.ts`, `src/data/sync/syncClient.ts`
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

## Dernière session (2026-09-07 — retour E10 volet UX + roadmap fiabilisation Phase 5)

## Décisions prises
- Volet UX du retour E10 traité directement sur `main` (politique de branche), pas replié dans la Phase 1 de `roadmap_refactorisation`.
- Phase 5 : les opérations de série passent par un service dédié à transaction unique (`persistSeriesBatch`, `tasks` + `taskRecurrences`) ; l'occurrence isolée non récurrente reste sur le chemin direct `taskRepo`.

## Livrables produits ou modifiés
- `src/ui/screens/dashboard/PlanningBoard.tsx` (+ `.test.tsx`) : sous-étapes dépliées DANS la carte, carte qui s'agrandit, heure de fin au niveau de la dernière sous-étape (retour E10). 3 tests E10 + test #24 adapté à la structure colonne.
- `src/domain/data/manualTestsCatalog.ts` : parcours `sous-etapes-dans-la-carte-planning` → `revision: 1`, étapes réécrites sur la cible E10.
- `src/data/services/seriesPersistence.ts` (+ `.test.ts`, 9 cas dont 5 pannes injectées) : nouveau service transaction unique.
- `src/app/contexts/usePlanningState.ts` : créations / éditions / suppressions de série routées via `persistSeriesBatch`.
- `roadmap_refactorisation_2026-09-06.md` : Phase 5 `[FAIT]`. `tests_manuels.md` : contrôle dev Phase 5 ajouté.
- Suite complète : 98 fichiers / 805 tests verts, tsc app+node exit 0, lint 0, budget bundle OK (262,97 kB < 266,43).

## Hypothèses validées / invalidées
- VALIDÉ : un échec en cours d'opération de série est annulé intégralement (pannes injectées : création de règle, mi-série, avant suppression de source, édition de série, suppression de série) — source conservée, aucune règle orpheline, aucune occurrence partielle.
- VALIDÉ navigateur (Playwright, spec temporaire supprimée) : création d'une série quotidienne → série entière + une seule règle persistées via la transaction, IndexedDB réel.
- EN ATTENTE : réponse de Marie sur la relance des retours (`inbox/orchestrateur/` vide au moment du `/close`).

## Prochaine étape exacte
Checkpoint Phase 5 posé (utilisateur a fait `/compact`). Sur reprise : `/start` puis Phase 6 — verrouiller URL/méthode/en-têtes/erreurs des appels réseau, ajouter une requête qui ne termine pas (horloge simulée), introduire un délai injectable (D5, 30 s proposé) + annulation + nettoyage du timer, garantir la libération du verrou de tentative.

## Question bloquante pour la session suivante
Aucune.
