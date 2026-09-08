# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-09-08)

## Contexte chaud
- **Roadmap de fiabilisation `Archives/roadmap_refactorisation_2026-09-06.md` : clôturée et archivée le 2026-09-08.** Phases 1 à 6 `[FAIT]` (contrats réseau et throttles snapshot 1 h / retours 60 s inchangés). Phases 7 et 8 `[REPORTÉ]` sur décision explicite : P7 (état React, D6) sans mesure de bénéfice ; P8 (geste planning, D7) double condition non remplie — reste tracée par la question ouverte P3 `E12WeekPlanning.tsx`.
- **Volet UX du retour E10 traité (2026-09-07, commit `6f4a8d1`).** Parcours in-app `sous-etapes-dans-la-carte-planning` `revision: 1` : repassera « à faire » pour Marie au prochain `/deploy`.
- **Zoom iOS au focus des champs corrigé (2026-09-08, commits `593acce` + `681be23`).** Règle CSS globale `input,select,textarea { font-size: max(16px, 1rem) }` (`src/index.css`) : plancher 16 px neutralisant l'auto-zoom Safari, sans écraser la taille de texte « grande » de l'accessibilité. Validé sur iPhone réel. Parcours `ajouter-une-tache-depuis-la-reception` `revision: 1` (repassera « à faire » pour Marie).
- Suite complète sur `main` : **100 fichiers / 817 tests verts**, `tsc -b` exit 0, lint 0, budget bundle inchangé. `tests_manuels.md` : plus aucun contrôle dev actionnable en attente — reste 2 sections `[discord-auto]` (session `discord`) + une note « contrôle réseau Phase 6 à porter au catalogue au `/deploy` ».
- v5.92 en production ; la session n'est pas déployée. `_contexte/dernier_deploiement.md` : v5.92, 2026-09-05. `CHANGELOG.md` à v5.105 — changements applicatifs (E10 UX + Phases 5-6 + zoom iOS) prêts pour une prochaine livraison.
- Livraison v5.92 à Marie : 12 parcours in-app en attente de sa validation ; s'y ajouteront au prochain deploy les parcours `sous-etapes-dans-la-carte-planning` et `ajouter-une-tache-depuis-la-reception` (revisions).
- `roadmap_supprimer_tache_du_jour.md` : Phase 3 `[TODO — BLOQUÉ]`, attend D2 (réponse de Marie), à regrouper avec sa validation des tests v5.92.
- `DISCORD/_contexte/memory.md` (non suivi) : travail zone `discord`, hors périmètre du `/close` racine.

## Questions ouvertes
- [P1] **Marie confirme-t-elle que « Relancer » fait passer ses retours en « Envoyé » ?** Risque résiduel : `submit_feedback` exige une ligne `device_snapshots` pour le `device_id` + `device_secret` de son iPhone. — fait quand : réponse de Marie dans `inbox/orchestrateur/` lue et `ack` (OK → clore ; KO → investiguer `device_snapshots` + endpoints `/rest/v1/rpc/submit_feedback` et `/storage/v1/object/feedback/`) — réf : `src/data/sync/feedbackClient.ts`, `src/data/sync/feedbackStorage.ts`, `supabase/feedback.sql`, gateway `20260906T204529_830899`
- [P1] **6 demandes (33 reprise Doc, #34-38) livrées en v5.92 — pas encore validées par Marie.** — fait quand : Marie valide les 12 parcours du catalogue (`ok`/`nok`) — réf : `_contexte/marie_modifications_suivi.md` lignes 33-38, `src/domain/data/manualTestsCatalog.ts`
- [P2] **Porter le contrôle réseau Phase 6 au catalogue in-app au prochain `/deploy`.** Non testable en dev (aucun backend de sync local) ; à regrouper avec la question [P1] « Relancer » (précondition = l'envoi de base fonctionne pour Marie). — fait quand : un parcours « coupure réseau pendant l'envoi d'un retour » existe dans `manualTestsCatalog.ts` — réf : `tests_manuels.md` § Bornage des requêtes réseau (note), `Archives/roadmap_refactorisation_2026-09-06.md` Phase 6, `_contexte/signals.md` [P1] Relancer
- [P2] **D2 — point d'entrée « accueil » pour l'ajout de tâche planifiée d'office (Phase 3 `roadmap_supprimer_tache_du_jour.md`).** Interprétation dev = bouton « + » du `BottomNav` (`App.tsx:189`). À regrouper avec la réponse de Marie sur les tests v5.92. — fait quand : Marie confirme (ou corrige) → Phase 3 débloquée — réf : `roadmap_supprimer_tache_du_jour.md` § Décisions produit (D2)
- [P3] **`E12WeekPlanning.tsx` reproduit le défaut de saut au relâchement corrigé dans `PlanningBoard.tsx` (#38)** — hors périmètre #38, non corrigé. — fait quand : Marie confirme le même problème sur « Planning de la semaine » + phase dédiée — réf : `Archives/roadmap_demandes_marie_2026-09-04.md` Phase 4, `src/ui/screens/dashboard/E12WeekPlanning.tsx`
- [P2] **Latence « Chargement... » entre écrans** (Marie 2026-09-04) : correctif `3299a95` non validé (préchargement ciblé des 3 écrans du menu du bas encore lazy, correctif à l'aveugle). — fait quand : Marie revalide `navigation-entre-tous-les-ecrans` en `ok`, ou signale que la latence persiste — réf : `_contexte/marie_modifications_suivi.md` § Précisions, `src/App.tsx`
- [P3] **Décision produit 4 (navigation « Planning de la semaine »)** encore à valider par Marie (navigation ±1 semaine ; repli jour-par-jour si illisible). — fait quand : Marie valide `vue-planning-de-la-semaine` en `ok`, ou signale l'illisibilité — réf : `Archives/roadmap_planning_accueil_2026-08-29.md` Phase 5
- [P2] **Traiter les 3 frictions du 2026-08-19** (geste de glissement planning à revoir, lien retrait de livret/catégorie budget, disparition des test IDs obsolètes). — fait quand : les 3 points tranchés ou intégrés à une roadmap — réf : `_contexte/marie_tests_journal.json` (`44f24c63`, `be0c10ef`, `6e32ace5`)
- [P2] **Appliquer le découpage en 7 catégories validé par Marie** aux autres communications/roadmaps. — fait quand : convention explicite adoptée pour les prochaines roadmaps/communications — réf : `COMMUNICATION/message_marie_categories_travail.md`
- [P2] **Périodicité d'une catégorie de dépense modifiable après création ?** (impact sur l'historique). — fait quand : décision actée avec l'utilisateur — réf : `Archives/roadmap_v5.1.md` § Q à trancher
- [P3] **Durcir `/discord_loop`** : ajouter un `stop` qui notifie Discord « Claude hors ligne » (auto-rattrapage au démarrage fait depuis le 2026-09-03). — fait quand : la commande `stop` de `/discord_loop` notifie Discord — réf : `.claude/commands/discord_loop.md`, `DISCORD/discord_com/bot.py`
- [P2] **`.claude/commands/create_memory.md` n'implémente pas l'alias de zone** documenté par `start.md` étape 2c. Correctif délégué à VibeObs. — fait quand : `create_memory.md` reconnaît un premier argument = alias de `.claude/zones.md`, résout le dossier et écrit dans `<dossier>/_contexte/memory.md` — réf : `.claude/commands/create_memory.md`, `.claude/commands/start.md` étape 2c

## Dernière session (2026-09-08 — archivage roadmap fiabilisation, report P7-P8)

## Décisions prises
- Roadmap `roadmap_refactorisation_2026-09-06.md` clôturée et archivée dans `Archives/` : phases 1-6 `[FAIT]`, phases 7-8 `[REPORTÉ]`.
- Phase 7 (composition/état React, D6) reportée : aucune mesure de re-rendus parasites, bénéfice non établi. À rouvrir seulement sur perte de perf chiffrée ou test bloqué par le couplage de l'état global.
- Phase 8 (geste du planning, D7) reportée : défaut de saut de `E12WeekPlanning.tsx` non reproduit et Marie non consultée. Reste tracée par la question ouverte P3.
- Reco actée par l'utilisateur : la priorité n'est pas la refacto P3 mais résorber le delta prod v5.92 ↔ `CHANGELOG` (relance Marie [P1] puis `/deploy`).

## Livrables produits ou modifiés
- `roadmap_refactorisation_2026-09-06.md` → `Archives/` (git mv) ; P7/P8 `[REPORTÉ]` avec motif consigné dans chaque section et dans « Acceptation finale ».
- `_contexte/signals.md` : entrée [P3] Phases 7-8 supprimée ; contexte chaud, prochaine étape et réf Phase 6 repointés vers `Archives/`.
- `_contexte/contexte.md` : chemin et statut de la roadmap.
- `README.md`, `CHANGELOG.md` (v5.105) : état reflété.
- Aucun code applicatif touché. Suite complète inchangée (100 fichiers / 817 tests verts sur `main`).

## Hypothèses validées / invalidées
- Session d'organisation : aucune hypothèse technique testée.
- EN ATTENTE : réponses de Marie ([P1] Relancer, [P1] 12 parcours v5.92) ; contrôle réseau Phase 6 (pas de backend de sync en dev).

## Prochaine étape exacte
Aucune tâche en cours. Déploiement gelé jusqu'aux réponses de Marie. Au prochain `/deploy` : porter le contrôle réseau Phase 6 dans `manualTestsCatalog.ts`.

## Question bloquante pour la session suivante
Aucune.
