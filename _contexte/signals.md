# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-07-07 e2e)



## Actions ouvertes

### V3 — Roadmap close (branche `v3`), reste à valider avec Marie
- [P2|ouvert] Reconfirmer avec Marie le comportement de l'action « Reporter » (E6) — implémenté à titre provisoire (replanification au lendemain, même créneau), non validée par elle sur ce mécanisme précis
  - fait quand: réponse de Marie obtenue et, si besoin, comportement ajusté en conséquence
  - réf: `Note de réunion/a demander a Marie.md` ; `postponeTaskV2` (`taskRulesV2.ts`), `postponeTask` (`AppContext.tsx`)
- [P2|ouvert] Reconfirmer avec Marie la fréquence du check-in énergie (une fois/jour vs à chaque ouverture de l'app) — Marie a dit « à chaque connexion » mais hésite elle-même dans la transcription
  - fait quand: réponse de Marie obtenue, comportement ajusté si besoin (actuellement : une fois par jour calendaire, re-saisie libre via bouton "Modifier")
  - réf: `Note de réunion/a demander a Marie.md` ; `AppContext.tsx` `init()`, `todayDate()`
- [P2|ouvert] Reconfirmer avec Marie le mécanisme de récurrence (P6, « Répéter demain ») — implémenté comme bouton explicite (1 clic = 1 jour dupliqué), écart assumé par rapport à la lecture littérale de la transcription qui décrivait un flux plus rapide (« clac, clac, clac » sur plusieurs jours d'affilée sans clic dédié). Le premier essai (avance automatique de jour après chaque tâche planifiée, sans bouton) a été testé et rejeté (masquait la tâche qu'on venait de placer).
  - fait quand: réponse de Marie obtenue sur si le rythme « 1 clic par jour » lui convient pour les tâches récurrentes, ou si un flux plus rapide est nécessaire
  - réf: `Note de réunion/2026-06-07/input_2026-07-06_2043.txt` l.448-467 ; `duplicateTaskV2ToNextDay` (`taskRulesV2.ts`), `repeatTaskTomorrow` (`AppContext.tsx`)
- [P2|ouvert] Reconfirmer avec Marie le masquage du bouton « Mode surcharge » hors surcharge (`TopBar.tsx`) — retiré le 2026-07-07 sur demande de l'utilisateur, **contredit la demande explicite antérieure de Marie** (bouton visible, grisé, informatif hors surcharge)
  - fait quand: décision actée avec Marie (masquage confirmé ou bouton informatif réintroduit)
  - réf: `Note de réunion/a demander a Marie.md` ; `TopBar.tsx`
- [P3|ouvert] Planification indépendante des sous-tâches (chaque `SubTask` planifiable à son propre horaire) — décision explicitement reportée
  - fait quand: décision produit prise sur l'implémentation (piste retenue si besoin confirmé : chaque sous-tâche devient sa propre `TaskV2` avec `parent_task_id` optionnel)
  - réf: `Archives/roadmap_v2.md` § "Fonctionnalité reportée (décision 2026-07-06)"
- [P2|ouvert] Finaliser V2-10 (branche `v2`) : mode offline (13.2), doc V2, déploiement Netlify — resté en suspens pendant tout le développement V3
  - fait quand: 13.2 codé/testé, doc V2 à jour, déploiement Netlify effectué
  - réf: `Archives/roadmap_v2.md`

### Tests e2e
- [P3|ouvert] Supprimer T19 (`e2e/02-tasks.spec.ts`) — teste une limite de 3 tâches/jour avec modale de remplacement ("Remplacer une tâche") qui n'existe plus dans le code (`moveTask`, `AppContext.tsx` L402-407, ne fait qu'un update de statut). **Élément retrouvé dans `_contexte/archive_decisions.md`** (entrée "2026-07-06, archivé depuis close V3-6") : ce retrait est **intentionnel**, décision Q1 de la relecture visio Marie du 2026-07-06, "jugée non nécessaire par Marie" — ce n'est pas une régression. Priorité abaissée en conséquence (P2→P3) : suppression du test à faire, pas d'investigation supplémentaire nécessaire.
  - fait quand: T19 supprimé de `e2e/02-tasks.spec.ts`, 44/44 tests e2e verts
  - réf: `e2e/02-tasks.spec.ts` T19 (L105-121) ; `_contexte/archive_decisions.md` entrée Q1 (2026-07-06)

## Questions ouvertes

## Échéances

## Blocages
Aucun.

## Contexte chaud
- **Roadmap V3 intégralement close (2026-07-07)** : 7 phases (V3-0 à V3-6) closes, gate complet sur chacune. Reste uniquement la validation par Marie de 4 mécanismes implémentés à titre provisoire (Reporter, fréquence check-in, rythme récurrence, masquage bouton surcharge — voir Actions ouvertes).
- Symbole d'énergie : cuillères (`SpoonIcon`/`SpoonCost`) remplacées par une icône batterie (`BatteryIcon`/`BatteryCost`, `src/ui/components/`) — moins connotée spoon theory (communauté maladies chroniques, pas spécifiquement AuDHD). Câblée sur le Dashboard, le Planning, et affichée en plus sur les 3 écrans de check énergie (`E03Energy.tsx`, `E31EnergyCheckIn.tsx`, `E30EnergyView.tsx`), qui n'avaient auparavant aucun symbole.
- Titre du Dashboard renommé "Appli pour AuDHD" → "AuDHD" (`E10Dashboard.tsx`).
- Planning (`E40Planning.tsx`) : hauteur des créneaux (`slotRowStyle`) ne repose plus sur un `minHeight` fixe de 64px. Les créneaux occupés s'ajustent à leur contenu réel ; les créneaux vides reçoivent un placeholder invisible (`emptySlotPlaceholderStyle`, même padding/police que la case de tâche) pour réserver exactement la même hauteur — objectif : espace haut/bas symétrique autour de chaque case, cohérence visuelle uniforme du planning.
- Nav persistante (Phase V3-6) : `BottomNav` monté une seule fois dans `App.tsx` (position fixe), affiché sur tous les écrans sauf onboarding (`welcome`/`profile`/`energy`) et check-in énergie (`energy-checkin`) ; 4 onglets (Accueil/Todo/Planning/Listes), onglet actif mis en valeur, pastille Todo conservée. Chaque écran réserve `padding-bottom: var(--bottomnav-h)` (CSS var définie dans `index.css`) pour ne rien cacher derrière la nav fixe. **BottomNav rend une nav vide (aucun bouton) quand `overloadMode` est actif** — piège pour les tests e2e qui doivent naviguer via un bouton d'écran (ex. "Retour") plutôt que la nav du bas pendant une surcharge.
- Couleur d'ambiance configurable (`Settings.ambiance_color`, sélecteur dans Accessibilité) : pilote la couleur pastel (case placée) et flashy (case terminée) du planning et du dashboard — `src/ui/styles/ambiance.ts` (`pastelBackground`/`mutedBackground`/`flashyBackground`, défaut `DEFAULT_AMBIANCE_COLOR`).
- Navigation en surcharge : `BottomNav.tsx` masque intentionnellement Todo/Planning/Listes/Ajouter une tâche (seuls Dashboard et Centre récupération restent accessibles) — confirmé voulu par l'utilisateur, pas un bug.
- TopBar : bouton « Mode surcharge » désormais masqué (au lieu de grisé) quand la surcharge n'est pas active — écart avec la demande de Marie, à reconfirmer (voir Actions ouvertes).
- **Mode surcharge 100% automatique depuis V3-3** : plus de toggle manuel (`Settings.overload_mode` retiré du code). Le déclenchement se fait en planifiant une tâche dont le coût énergétique dépasse l'énergie du jour restante (`isOverloaded`, `energyRules.ts`) ; la désactivation se fait en terminant/reportant la tâche en cause, pas via un bouton dédié.
- Tests e2e Playwright (`e2e/`) : 44/45 verts après correction de session (voir Dernière session). Seul T19 reste en échec — teste la limite "3 tâches/jour" retirée intentionnellement en V3-1 (décision Q1, pas une régression), reste à supprimer le test (voir Actions ouvertes).
- Serveur de test téléphone (dev V3) : `npm run dev -- --host`, adresse réseau affichée dans le terminal (même Wi-Fi). Bouton "Reset DB" (dev) pour repartir d'une base propre avant test.

## Dernière session (2026-07-07, e2e — correction tests Playwright cassés)

## Décisions prises
- Cause racine des tests e2e cassés élargie au-delà du signal initial (écran `E04FirstTask` supprimé) : titre Dashboard obsolète (`Appli pour AuDHD` → `AuDHD`) propagé dans 6 fichiers, bouton « Ajouter une tâche » dupliqué (BottomNav persistante + bouton propre à `E20Inbox.tsx`) causant des violations de mode strict Playwright, libellé « Aujourd'hui » remplacé par « Tâche du jour » dans les `aria-label` de déplacement, et mode surcharge devenu 100% automatique (plus de bouton "Activer/Désactiver le mode surcharge").
- Tous ces écarts corrigés côté tests (pas de changement de code applicatif) — `05-overload.spec.ts` réécrit intégralement pour déclencher/désactiver la surcharge via le mécanisme automatique réel (planifier une tâche coûteuse en énergie, la terminer).
- T19 laissé en échec en fin de session, puis élucidé : `archive_decisions.md` confirme que la limite 3 tâches/jour a été retirée intentionnellement en V3-1 (décision Q1, "jugée non nécessaire par Marie") — pas une régression. Suppression du test à faire en ouverture de la prochaine session.

## Livrables produits ou modifiés
- `e2e/helpers/reset.ts` : `completeFastOnboarding` corrigé (suppression du clic "Ignorer" fantôme post-onboarding, attente du titre "AuDHD")
- `e2e/01-onboarding.spec.ts` : T04-T07 réécrits selon le flux réel (energy → dashboard direct, plus d'écran "Première tâche")
- `e2e/02-tasks.spec.ts` : locators désambiguïsés (`getByRole('main')` scoping) pour "Ajouter une tâche"/"Todo" ; libellé "vers Tâche du jour" corrigé (T14, T19)
- `e2e/03-energy.spec.ts`, `e2e/04-settings.spec.ts` : titre "AuDHD"
- `e2e/05-overload.spec.ts` : réécrit intégralement (T40-T45), mécanisme automatique de surcharge
- `e2e/06-offline.spec.ts` : titre "AuDHD", locators désambiguïsés

## Hypothèses validées / invalidées
- VALIDE : le signal initial (E04FirstTask supprimé) était correct mais partiel — 4 causes distinctes cumulées identifiées et corrigées.
- VALIDE : T19 teste une fonctionnalité retirée intentionnellement (décision Q1, V3-1), pas une régression — confirmé via `archive_decisions.md`.

## Prochaine étape exacte
Supprimer T19 (`e2e/02-tasks.spec.ts`) — feature intentionnellement retirée (voir `archive_decisions.md`, décision Q1) — puis relancer `npx playwright test e2e/` pour confirmer 44/44 verts.

## Question bloquante pour la session suivante
Aucune — résolue en cours de session (voir `archive_decisions.md`, décision Q1 du 2026-07-06).
