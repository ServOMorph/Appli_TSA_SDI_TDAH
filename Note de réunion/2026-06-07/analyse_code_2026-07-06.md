# Analyse du code actuel — préparation V3

Objectif : cartographier les zones de code impactées par les constats (`constats_2026-07-06.md`) et proposer une refacto préalable, pour que l'implémentation V3 parte sur des bases saines. Cette analyse constitue la première phase de `roadmap_v3.md`.

---

## 1. Modèle de données — état actuel

### `TaskV2` (`src/domain/entities/taskV2.ts`)
```
status: 'todo' | 'planned' | 'completed'
essential: boolean          <-- existe, JAMAIS câblé à l'UI
scheduled_date/start/end: string | null
```
- **Aucun champ de coût d'énergie.** La demande E1 (coût 1-12 par tâche) impose un nouveau champ, ex : `energy_cost: number | null`.
- Le champ `essential` correspond **exactement** au « obligatoire » demandé (E2). Fonction `toggleEssentialV2` déjà présente dans `taskRulesV2.ts` mais jamais appelée depuis l'UI (trou fonctionnel connu, signalé depuis V2-10). À réutiliser plutôt que recréer.

### `EnergyEntry` (`src/domain/entities/energyEntry.ts`)
```
value: number | null
status: 'filled' | 'skipped'
entry_date: string
```
- Une entrée par date (`energyRepo.getByDate`). Échelle actuelle non contrainte à 1-12. E4 (check-in récurrent 1-12) suppose de fixer l'échelle et de garantir une entrée du jour à chaque connexion.

### `Settings` (`src/domain/entities/settings.ts`)
- Pas de champ couleur d'ambiance (P3) ni de stock max de cuillères (E9). À étendre : `ambiance_color?: string`, `energy_max?: number` (défaut 12).

### `db.ts`
- Tout ajout de champ persisté impose un **bump de version Dexie** (v3). Le projet assume les resets de données (roadmap V2, stratégie de rollback) → migration additive simple, pas de rétro-compatibilité lourde.

---

## 2. Zones UI impactées

| Constat | Fichier(s) | Nature |
|--------|-----------|--------|
| B1 tâche fantôme | `AppContext.tsx` (`createTaskV2Dest`, `getUnscheduledPlannedTasks`), `E21CreateTaskV2.tsx`, `E40Planning.tsx` | Cycle de vie tâche `planned` non schedulée à revoir |
| B2 cases invisibles clair | `E40Planning.tsx` (`slotRowStyle`, bordures), thème clair | Contraste |
| B3 ajout depuis Todo | `E20Inbox.tsx`, `E21CreateTaskV2.tsx` | À reproduire |
| E1/E2 énergie+obligatoire | `taskV2.ts`, `taskRulesV2.ts`, `db.ts`, nouvel écran/modale, `E21CreateTaskV2.tsx`, `E40Planning.tsx` | Schéma + UI |
| E4 check-in connexion | `AppContext.tsx` (`init`), `E31EnergyCheckIn.tsx` (existe, non routé au login) | Flux de démarrage |
| E5/E6 surcharge auto | `AppContext.tsx` (`overloadMode` manuel), `E10Dashboard.tsx`, `TopBar.tsx` | Logique + UI |
| E7/E8 cuillères | `TopBar.tsx`, `E40Planning.tsx`, `E10Dashboard.tsx` | Composant visuel réutilisable |
| D1/D2/D3/D4/D5 dashboard | `E10Dashboard.tsx`, `actionImmediateRules.ts`, `E04FirstTask.tsx` | Sections/nav |
| P1-P4 planning | `E40Planning.tsx` | Styles cases + complétion |
| P5/P6 planning flux | `E40Planning.tsx`, `AppContext.tsx` | Navigation |
| L1-L3 listes | `E60Lists.tsx`, `E61ListDetail.tsx` | Styles |
| N1/N2 nav persistante | `E10Dashboard.tsx` (nav locale), tous les écrans, `App.tsx` | **Transversal** |

---

## 3. Dettes techniques et incohérences pertinentes pour la V3

1. **Navigation locale, pas de layout partagé.** Chaque écran (`E10Dashboard`, `E20Inbox`, `E40Planning`, `E60Lists`…) porte son propre `<main>`, son propre header/nav et son bouton retour. La nav segmentée n'existe que sur le dashboard (`E10Dashboard.tsx` l.385-424). La demande N1 (barre persistante sur toutes les pages) est **impossible proprement sans extraire un composant de layout/navigation partagé**. C'est le plus gros point d'architecture de la V3 et il conditionne N1. À traiter comme une refacto structurante, pas comme un patch écran par écran.

2. **`overloadMode` est un état booléen manuel** (`AppContext.tsx` l.142, `setOverloadMode`), persisté dans `Settings.overload_mode`. E5 impose de le rendre **dérivé** (calculé depuis énergie du jour vs somme des coûts planifiés restants). Risque : si on garde un booléen manuel ET un calcul auto, on aura deux sources de vérité. Décision d'archi à acter : le mode devient une **valeur dérivée** (calcul), le bouton n'écrit plus l'état.

3. **`essential` mort mais présent.** Le câbler (E2) est l'occasion de fermer le trou fonctionnel `toggleEssentialV2` ouvert depuis V2-10. Pas de dette à créer, dette à résorber.

4. **Cycle de vie de la tâche `planned` non schedulée (B1).** `createTaskV2Dest('planned')` persiste tout de suite ; l'écran de planning lit ensuite les `planned` sans `scheduled_date`. Il n'existe aucun nettoyage si l'utilisateur abandonne. Deux options d'archi (à trancher en phase B) : (a) ne créer la `TaskV2 planned` qu'au moment de l'assignation effective d'un créneau ; (b) garder la création anticipée mais purger les `planned` non schedulées à la sortie du planning. Option (a) plus propre (pas d'état fantôme possible).

5. **Représentation de l'énergie dupliquée.** Le libellé énergie est construit à la main dans `E10Dashboard.tsx` (l.220-231). Avec les cuillères (E7) affichées à plusieurs endroits (TopBar, planning, dashboard), il faut un **composant `EnergyGauge`/`Cuilleres` réutilisable** plutôt que dupliquer le rendu.

6. **Échelle d'énergie non centralisée.** Aucune constante ne fixe le min/max (1-12). À introduire (`ENERGY_MIN`, `ENERGY_MAX`) pour éviter les nombres magiques dans check-in, coût de tâche et calcul de surcharge.

---

## 4. Refacto préalable proposée (Phase V3-0)

À faire **avant** toute nouvelle fonctionnalité, sans changement de comportement visible (couvert par les tests existants) :

- **R1** — Introduire les constantes d'échelle d'énergie (`ENERGY_MIN=1`, `ENERGY_MAX=12`) dans le domaine, et un helper de barème. Aucune UI encore.
- **R2** — Étendre le schéma (Dexie v3) : `TaskV2.energy_cost: number | null`, `Settings.ambiance_color?`, `Settings.energy_max?`. Migration additive, valeurs par défaut. Tests de repository/`db` mis à jour.
- **R3** — Extraire un composant de rendu d'énergie réutilisable (`EnergyDisplay`, sans les cuillères encore, juste la valeur) pour dé-dupliquer `E10Dashboard`. Neutre visuellement.
- **R4** — Extraire un composant de **layout/navigation partagé** (`AppShell` + `BottomNav`) depuis la nav locale du dashboard, sans encore le rendre persistant partout. Prépare N1 sans le livrer. Point de vigilance : ne pas casser les tests de navigation existants (les segments doivent garder leurs `aria-label`).
- **R5** — Décider et documenter la source de vérité du mode surcharge (dérivé vs manuel) via un sélecteur pur testable (`isOverloaded(energyDuJour, tachesPlanifiees)`), branché plus tard. À ce stade : fonction pure + tests, pas encore branchée à l'UI.

Critère de sortie Phase V3-0 : `tsc -b` clean, suite de tests au vert (aucune régression), schéma v3 en place, composants extraits mais comportement identique à la V2.

---

## 5. Points de vigilance transverses

- **Resets de données** : le bump Dexie v3 doit être testé avec une base V2 existante (Marie a déjà des données V2). Confirmer la stratégie (reset accepté vs migration) avant déploiement — cohérent avec la stratégie de rollback de `roadmap_v2.md`.
- **Interdépendance énergie** : E1→E4→E5→E6 forment une chaîne. Le calcul de surcharge (E5) n'a de sens que si coût par tâche (E1) et énergie du jour (E4) existent. D'où l'ordre imposé dans le plan.
- **N1 (nav persistante)** est transversal et risqué : le placer tard, après stabilisation des écrans, pour ne pas re-toucher chaque écran deux fois.
- **N2 (swipe)** : réserve technique réelle en PWA web. À ne pas engager sans prototype ; candidat au report.
