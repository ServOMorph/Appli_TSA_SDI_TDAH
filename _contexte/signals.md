# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-07-07 suite)



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
- [P3|ouvert] Décider s'il faut supprimer le bouton « Mode surcharge désactivé » de la TopBar hors surcharge — **attention, contredit la demande explicite de Marie** (elle voulait ce bouton visible, grisé, informatif hors surcharge)
  - fait quand: décision actée avec Marie ou assumée explicitement comme écart
  - réf: `roadmap_v3.md` § Notes diverses ; `TopBar.tsx`
- [P3|ouvert] Planification indépendante des sous-tâches (chaque `SubTask` planifiable à son propre horaire) — décision explicitement reportée
  - fait quand: décision produit prise sur l'implémentation (piste retenue si besoin confirmé : chaque sous-tâche devient sa propre `TaskV2` avec `parent_task_id` optionnel)
  - réf: `Archives/roadmap_v2.md` § "Fonctionnalité reportée (décision 2026-07-06)"
- [P2|ouvert] Finaliser V2-10 (branche `v2`) : mode offline (13.2), doc V2, déploiement Netlify — resté en suspens pendant tout le développement V3
  - fait quand: 13.2 codé/testé, doc V2 à jour, déploiement Netlify effectué
  - réf: `Archives/roadmap_v2.md`

## Questions ouvertes

## Échéances

## Blocages
Aucun.

## Contexte chaud
- **Roadmap V3 intégralement close (2026-07-07)** : 7 phases (V3-0 à V3-6) closes, gate complet sur chacune. Reste uniquement la validation par Marie de 3 mécanismes implémentés à titre provisoire (Reporter, fréquence check-in, rythme récurrence — voir Actions ouvertes).
- Symbole d'énergie : cuillères (`SpoonIcon`/`SpoonCost`) remplacées par une icône batterie (`BatteryIcon`/`BatteryCost`, `src/ui/components/`) — moins connotée spoon theory (communauté maladies chroniques, pas spécifiquement AuDHD). Câblée sur le Dashboard, le Planning, et affichée en plus sur les 3 écrans de check énergie (`E03Energy.tsx`, `E31EnergyCheckIn.tsx`, `E30EnergyView.tsx`), qui n'avaient auparavant aucun symbole.
- Titre du Dashboard renommé "Appli pour AuDHD" → "AuDHD" (`E10Dashboard.tsx`).
- Nav persistante (Phase V3-6) : `BottomNav` monté une seule fois dans `App.tsx` (position fixe), affiché sur tous les écrans sauf onboarding (`welcome`/`profile`/`energy`) et check-in énergie (`energy-checkin`) ; 4 onglets (Accueil/Todo/Planning/Listes), onglet actif mis en valeur, pastille Todo conservée. Chaque écran réserve `padding-bottom: var(--bottomnav-h)` (CSS var définie dans `index.css`) pour ne rien cacher derrière la nav fixe.
- Couleur d'ambiance configurable (`Settings.ambiance_color`, sélecteur dans Accessibilité) : pilote la couleur pastel (case placée) et flashy (case terminée) du planning et du dashboard — `src/ui/styles/ambiance.ts` (`pastelBackground`/`mutedBackground`/`flashyBackground`, défaut `DEFAULT_AMBIANCE_COLOR`).
- Navigation en surcharge : `BottomNav.tsx` masque intentionnellement Todo/Planning/Listes/Ajouter une tâche (seuls Dashboard et Centre récupération restent accessibles) — confirmé voulu par l'utilisateur, pas un bug.
- Tests e2e Playwright (`e2e/01-onboarding.spec.ts` et suivants) cassés indépendamment des sessions récentes : ils attendent un écran « Première tâche » (`E04FirstTask`) supprimé depuis la Phase V3-1 (2026-07-06) — à corriger ou retirer avant de s'y fier à nouveau.
- Serveur de test téléphone (dev V3) : `npm run dev -- --host`, adresse réseau affichée dans le terminal (même Wi-Fi). Bouton "Reset DB" (dev) pour repartir d'une base propre avant test.

## Dernière session (2026-07-07 suite, roadmap V3 close — itérations UI hors phase : titre Dashboard, symbole batterie)

## Décisions prises
- Titre du Dashboard renommé "Appli pour AuDHD" → "AuDHD" (item roadmap "Notes diverses" clos).
- Symbole d'énergie changé de cuillères à batterie, à la demande de l'utilisateur (moins connoté spoon theory), et étendu aux 3 écrans de check énergie qui n'avaient aucun symbole auparavant.

## Livrables produits ou modifiés
- `src/ui/screens/dashboard/E10Dashboard.tsx`(+`.test.tsx`) : titre "AuDHD"
- `src/ui/components/SpoonIcon.tsx`/`SpoonCost.tsx` : supprimés
- `src/ui/components/BatteryIcon.tsx`/`BatteryCost.tsx` : créés (remplacent les cuillères)
- `src/ui/screens/dashboard/E10Dashboard.tsx`, `src/ui/screens/planning/E40Planning.tsx`(+`.test.tsx`) : `SpoonCost` → `BatteryCost`
- `src/ui/screens/onboarding/E03Energy.tsx`, `src/ui/screens/energy/E31EnergyCheckIn.tsx` : `BatteryIcon` ajouté à côté du titre
- `src/ui/screens/energy/E30EnergyView.tsx` : `BatteryIcon` ajouté à côté du score du jour
- `roadmap_v3.md` : items "Notes diverses" (titre Dashboard, symbole énergie) clos
- Tests : 374/374 verts (aucun test nouveau, libellés aria mis à jour), `tsc -b` clean

## Hypothèses validées / invalidées
- VALIDE : icône batterie sur Dashboard/Planning/3 écrans de check énergie, `tsc -b` clean, tests verts — pas encore de test manuel utilisateur sur ce point précis (changement visuel mineur, hors gate de phase).
- EN ATTENTE : confirmation de Marie sur le mécanisme de « Reporter », la fréquence du check-in énergie, et le rythme du bouton « Répéter demain » (inchangé depuis V3-3/V3-4).

## Prochaine étape exacte
Roadmap V3 close, aucune phase active. Deux fronts en parallèle, aucun ne dépend de code immédiat côté Claude : (1) attendre la session test avec Marie pour trancher les 3 points en attente, (2) reprendre V2-10 (mode offline 13.2, doc V2, déploiement Netlify) resté en suspens sur la branche `v2`.

## Question bloquante pour la session suivante
Aucune.
