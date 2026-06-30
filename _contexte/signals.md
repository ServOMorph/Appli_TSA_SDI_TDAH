# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-06-30)

## Actions ouvertes

### Phase 7 — Tests utilisateurs (1/5–10 sessions)
- [P2|ouvert] Sessions test 2 à 5+ avec Marie et autres testeurs AuDHD
  - fait quand: 5 à 10 sessions réalisées, retours consolidés dans fichier dédié
  - réf: `Note de réunion/synthese_reunion_marie_2026-06-29.md` + `Note de réunion/analyse_conduite_visio_marie.md`

### V2 — En cours
- [P1|ouvert] Démarrer Phase V2-7 (Listes — référentiel personnel)
  - fait quand: page Listes, ajout élément, création liste à la volée, tests ≥ 85 %
  - réf: `roadmap_v2.md` Phase V2-7

## Questions ouvertes
- Quand Marie vivra une vraie surcharge, elle détaillera son ressenti pour définir le critère "essentiel" exact (masquage tâches non-essentielles V2-9)

## Échéances

## Blocages
Aucun.

## Contexte chaud
- Branche `v2` active ; tag `v1.0-mvp` posé ; `dist_v1/` archivé (rollback V1 opérationnel)
- `npm run test` passe 337/337 ; `npm run test:e2e` : 46/46 passent
- V2-0 à V2-6 closes — prochaine phase : V2-7 (Listes)
- `TopBar.tsx` : bouton "Mode surcharge" isolé en haut (top-right), `overloadActive` prop, `aria-pressed`, style actif/inactif ; chip énergie seul dans la seconde ligne
- `E10Dashboard.tsx` : toggle instantané surcharge (bandeau "Mode surcharge actif" + "Centre récupération") — plus de bascule de page
- Masquage `essential=false` en mode surcharge : non implémenté (todayTasks = Task V1 sans champ essential) — tracé dans `roadmap_v2.md` V2-6, différé V2-9

## Dernière session (2026-06-30)

## Décisions prises
- V2-6 close (mécanique) : bouton surcharge isolé dans TopBar avec état aria-pressed, toggle instantané sans navigation, bandeau inline "Mode surcharge actif" + accès Centre récupération. Masquage `essential=false` explicitement différé à V2-9 (todayTasks V1 n'a pas de champ essential).

## Livrables produits ou modifiés
- `src/ui/components/TopBar.tsx` : prop `overloadActive: boolean`, bouton isolé top-right avec style actif/inactif, suppression chip "Mode surcharge" du flux énergie
- `src/ui/screens/dashboard/E10Dashboard.tsx` : suppression branche full-page overload, toggle instantané, bandeau surcharge inline, passage `overloadActive` + `onOverloadClick={() => setOverloadMode(!overloadMode)}` à TopBar
- `src/ui/screens/dashboard/E10Dashboard.test.tsx` : section D10B réécrite (5 tests, +1 net → 337/337)
- `roadmap_v2.md` : Phase V2-6 mise à jour (mécaniques [x], masquage bloqué documenté)

## Hypothèses validées / invalidées
- VALIDE : toggle instantané sans navigation de page implémentable sur l'existant (337/337)
- CONSTATÉ : masquage tâches `essential=false` impossible sur `todayTasks` V1 — `Task` n'a pas de champ `essential` ; aucune tâche `TaskV2` n'arrive encore dans le dashboard ; différé V2-9

## Prochaine étape exacte
Démarrer V2-7 — Listes (référentiel personnel) : entités `List` + `ListItem`, page Listes, ajout/création à la volée.

## Question bloquante pour la session suivante
Quand Marie vivra une vraie surcharge, quelle est la définition exacte du critère `essential` (quelles tâches masquer en mode surcharge) ?
