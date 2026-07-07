# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-07-07)



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
- Nav persistante (Phase V3-6) : `BottomNav` monté une seule fois dans `App.tsx` (position fixe), affiché sur tous les écrans sauf onboarding (`welcome`/`profile`/`energy`) et check-in énergie (`energy-checkin`) ; 4 onglets (Accueil/Todo/Planning/Listes), onglet actif mis en valeur, pastille Todo conservée. Chaque écran réserve `padding-bottom: var(--bottomnav-h)` (CSS var définie dans `index.css`) pour ne rien cacher derrière la nav fixe.
- Couleur d'ambiance configurable (`Settings.ambiance_color`, sélecteur dans Accessibilité) : pilote la couleur pastel (case placée) et flashy (case terminée) du planning et du dashboard — `src/ui/styles/ambiance.ts` (`pastelBackground`/`mutedBackground`/`flashyBackground`, défaut `DEFAULT_AMBIANCE_COLOR`).
- Navigation en surcharge : `BottomNav.tsx` masque intentionnellement Todo/Planning/Listes/Ajouter une tâche (seuls Dashboard et Centre récupération restent accessibles) — confirmé voulu par l'utilisateur, pas un bug.
- Tests e2e Playwright (`e2e/01-onboarding.spec.ts` et suivants) cassés indépendamment de V3-6 : ils attendent un écran « Première tâche » (`E04FirstTask`) supprimé depuis la Phase V3-1 (2026-07-06) — pas une régression de cette session, mais à corriger ou retirer avant de s'y fier à nouveau.
- Serveur de test téléphone (dev V3) : `npm run dev -- --host`, adresse réseau affichée dans le terminal (même Wi-Fi). Bouton "Reset DB" (dev) pour repartir d'une base propre avant test.

## Dernière session (2026-07-07, Phase V3-6 — codée, testée, close — fin de la roadmap V3)

## Décisions prises
- Phase V3-6 (nav persistante, N1) codée intégralement : `BottomNav` retiré de `E10Dashboard.tsx`, monté une seule fois dans `App.tsx` en position fixe, affiché sur tous les écrans sauf onboarding et check-in énergie quotidien. Ajout d'un 4ᵉ onglet « Accueil » (absent avant), nécessaire pour revenir au Dashboard depuis n'importe quel écran une fois la nav globale.
- Roadmap V3 déclarée close : les 7 phases (V3-0 à V3-6) sont toutes closes avec gate complet. Reste hors code : validation de 3 mécanismes provisoires par Marie.

## Livrables produits ou modifiés
- `src/App.tsx` : montage global de `BottomNav`, helpers `activeTabFor`/`NO_NAV_SCREENS` exportés
- `src/ui/components/BottomNav.tsx` : réécrit (position fixe, 4 onglets, onglet actif, pastille Todo)
- `src/ui/components/AppShell.tsx` + 16 écrans : `paddingBottom: var(--bottomnav-h)` ajouté
- `src/index.css` : variable `--bottomnav-h`
- `src/ui/screens/dashboard/E10Dashboard.tsx` : retrait du montage local de `BottomNav`
- Tests : `src/ui/components/BottomNav.test.tsx` (nouveau), `src/App.test.tsx` (nouveau), `E10Dashboard.test.tsx` (tests de nav obsolètes migrés) — 374/374 verts, `tsc -b` clean, eslint 0 erreur
- `plan_test_manuel_v3-6.md` : créé (5 sections), passé intégralement le 2026-07-07
- `roadmap_v3.md` : Phase V3-6 close (gate complet), section "Sortie V3" mise à jour
- `README.md` : état actuel et prochaine étape mis à jour (V3 close, reste Marie + V2-10)
- `plan_test_manuel_v3-5.md` : absent du disque au moment du close (suit le pattern des phases précédentes : un seul plan de test manuel conservé, celui de la phase en cours)

## Hypothèses validées / invalidées
- VALIDE : nav persistante en position fixe sur tous les écrans concernés, onglet actif mis en valeur, aucun contenu caché derrière — conforme au test manuel.
- EN ATTENTE : confirmation de Marie sur le mécanisme de « Reporter », la fréquence du check-in énergie, et le rythme du bouton « Répéter demain » (inchangé depuis V3-3/V3-4).

## Prochaine étape exacte
Roadmap V3 close. Deux fronts en parallèle, aucun ne dépend de code immédiat côté Claude : (1) attendre la session test avec Marie pour trancher les 3 points en attente, (2) reprendre V2-10 (mode offline 13.2, doc V2, déploiement Netlify) resté en suspens sur la branche `v2`.

## Question bloquante pour la session suivante
Aucune.
