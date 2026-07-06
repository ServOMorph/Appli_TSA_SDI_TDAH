# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-07-06)



## Actions ouvertes

### V3 — En cours (branche `v3`, post-visio Marie 2026-07-06)
- [P1|ouvert] Démarrer Phase V3-1 (bugs + nettoyage UI) — Phase V3-0 close (refacto validée par test manuel)
  - fait quand: items B1-B3, D1-D4b, P4a, P5, Q1 traités et gate de phase respecté
  - réf: `roadmap_v3.md` Phase V3-1
- [P3|ouvert] Planification indépendante des sous-tâches (chaque `SubTask` planifiable à son propre horaire) — décision explicitement reportée
  - fait quand: décision produit prise sur l'implémentation (piste retenue si besoin confirmé : chaque sous-tâche devient sa propre `TaskV2` avec `parent_task_id` optionnel)
  - réf: `Archives/roadmap_v2.md` § "Fonctionnalité reportée (décision 2026-07-06)"

## Questions ouvertes

## Échéances

## Blocages
Aucun.

## Contexte chaud
- Phase V3-0 (refacto préalable) close : R1-R5 codées, 353/353 tests verts, `tsc -b` clean, validée par test manuel utilisateur.
- Nouvelle règle process : toute phase de refacto (roadmap générée par `/analyse_visio` ou existante) démarre par un rappel de bascule sur `/model opus`. Ajouté à `.claude/commands/analyse_visio.md` et à `roadmap_v3.md` (Phase V3-0).
- `dist/v2/` à jour (export corrigé + créneaux 30 min inclus) ; `vite.config.ts` fixe `build.outDir: 'dist/v2'` — reste sur la branche `v2`.
- Serveur de test téléphone : `npx vite preview --host --outDir dist/v2`, adresse réseau `http://192.168.1.180:4173` (même Wi-Fi). Penser à vider le cache du site / désinstaller la PWA sur le téléphone après chaque nouveau build.

## Dernière session (2026-07-06, suite 6)

## Décisions prises
- Phase V3-0 (refacto préalable) validée par test manuel utilisateur — aucune régression constatée.
- Nouvelle règle process actée : basculer sur le modèle Opus avant toute phase de refacto ; intégrée à la commande `/analyse_visio` (génération future) et à `roadmap_v3.md` (rétroactif, Phase V3-0).

## Livrables produits ou modifiés
- `src/domain/rules/energyRules.ts` + test : `ENERGY_MIN`/`ENERGY_MAX`, `isValidEnergyValue`, `getEnergyLabel`, `isOverloaded` (R1, R3, R5)
- `src/domain/entities/taskV2.ts`, `settings.ts`, `src/data/db.ts` : schéma Dexie v3 — `energy_cost`, `ambiance_color`, `energy_max` (R2)
- `src/ui/components/EnergyDisplay.tsx`, `AppShell.tsx`, `BottomNav.tsx` (nouveaux) + `TopBar.tsx`, `E10Dashboard.tsx` adaptés (R3, R4)
- `src/data/db.test.ts` : version attendue passée à 3
- `roadmap_v3.md` : Phase V3-0 cochée (R1-R5), rappel Opus ajouté
- `.claude/commands/analyse_visio.md` : rappel Opus ajouté pour toute phase de refacto générée
- `_contexte/signals.md` : action V3-0 close, Phase V3-1 devient prochaine action
- Commits : `2f44350` (nettoyage signals), `32c7939` (refacto V3-0), `7172038` (signals), `d527b68` (rappel Opus)

## Hypothèses validées / invalidées
- VALIDE : la refacto préalable (R1-R5) n'introduit aucune régression visible — confirmé par test manuel utilisateur sur build `dist/v3`

## Prochaine étape exacte
Démarrer Phase V3-1 (`roadmap_v3.md`) sur la branche `v3` : bugs (B1-B3) + nettoyage UI (D1-D4b, P4a, P5, Q1).

## Question bloquante pour la session suivante
Aucune.
