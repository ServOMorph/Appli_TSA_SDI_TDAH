# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-07-18)



## Actions ouvertes

### V4 — Roadmap active (racine `roadmap_v4.md`), issue de la visio Marie 2026-07-16
- [P1|ouvert] Coder le reste de la Phase V4-1 (Quick wins UI) : D2 libellés « maintenant », E7 indicateur surcharge visible/grisé hors surcharge, D4 ne pas proposer « planifier » depuis Todo
  - fait quand: V4-1 codée intégralement, gate passé (tests verts, test manuel, doc)
  - réf: `roadmap_v4.md` Phase V4-1
- [P2|ouvert] E2 — gestion du chevauchement de plage + comptage du coût énergétique (une fois par tâche vs par créneau) à trancher avec Marie
  - fait quand: réponse obtenue ; bloque V4-3 (E2b/E2c)
  - réf: `roadmap_v4.md` § Q à trancher (E2)
- [P2|ouvert] E8 — confirmer avec Marie le remplacement du report automatique au lendemain par un choix de créneau vide dans le planning
  - fait quand: réponse obtenue ; bloque V4-4 (E8)
  - réf: `roadmap_v4.md` § Q à trancher (E8)
- [P2|ouvert] E9 — structure de données des sous-tâches planifiables (rattachées au parent vs `parent_task_id` indépendant)
  - fait quand: décision actée ; bloque V4-5 (E9a) et sa migration
  - réf: `roadmap_v4.md` § Q à trancher (E9)
- [P3|ouvert] E3 — module budget/comptes + rubrique « Outil » remplaçant « Todo » : cadrage produit complet requis (gros chantier, reporté)
  - fait quand: cadrage fait avec Marie (périmètre, structure des données comptes, arborescence Outil)
  - réf: `Note de réunion/2026-07-16/constats_2026-07-18.md` E3 ; `roadmap_v4.md` § Reporté hors V4

### V2 — reste en parallèle (branche `v2`)
- [P2|ouvert] Finaliser V2-10 : doc V2, déploiement Netlify — en suspens depuis le début du développement V3
  - fait quand: doc V2 à jour, déploiement Netlify effectué
  - réf: `Archives/roadmap_v2.md`

### Tests e2e
Aucune action ouverte. 44/44 tests e2e verts (état V3, code inchangé depuis le 2026-07-09). **À surveiller dès le codage de V4-2/V4-3/V4-4** : ces phases suppriment ou modifient des éléments ciblés par les specs (bouton « Terminer », « Répéter demain », mécanisme de « Reporter ») — gates e2e explicitées dans `roadmap_v4.md`.

## Questions ouvertes
- Voir section « Q à trancher » de `roadmap_v4.md` (E2, E8, E9, E3) — à valider avec Marie, chacune bloquant sa phase respective. B1 tranché le 2026-07-18 (périmètre large).

## Échéances

## Blocages
Aucun.

## Contexte chaud
- **Branche `v4` créée et active** (depuis `v3`). `roadmap_v3.md` archivé (`Archives/roadmap_v3.md`), `roadmap_v4.md` promu à la racine — roadmap active.
- **Phase V4-0 close** : `taskSlotRange`/`taskOccupiesSlot` (`taskRulesV2.ts`) remplacent l'ancien `taskSlot()` local dans `E40Planning.tsx` ; `--color-accent` injecté dans `AppContext.tsx` (fallback `--color-primary`), défini dans `index.css`.
- **B1 tranché et codé** : la couleur d'ambiance s'applique à tous les boutons utilisant le bleu clair de base (`Button`, `BottomNav`, `E120Resources`, `E31EnergyCheckIn`, `E03Energy`, `E21CreateTaskV2`, `E40Planning`) — périmètre large confirmé par Marie/l'utilisateur.
- Écart identifié entre le codé et le voulu : l'action « Reporter » avance aujourd'hui automatiquement au lendemain même créneau (`postponeTaskV2`) ; Marie attend un choix explicite de créneau vide dans le planning (E8, réutilise le flux de déplacement E6).
- Nav persistante : `BottomNav` rend une nav vide quand `overloadMode` est actif — toujours vrai en V4, piège pour les tests e2e.
- Serveur de test téléphone (dev) : `npm run dev -- --host`, adresse réseau affichée dans le terminal. Bouton « Reset DB » (dev) pour repartir d'une base propre avant test.
- `validation_manuelle.md` (racine) : créé pour la Phase V4-0, 20 points, tous validés par l'utilisateur.

## Dernière session (2026-07-18, suite)

## Décisions prises
- Phase V4-0 (refacto préalable) codée et validée manuellement intégralement.
- B1 tranché : périmètre large — tous les boutons sur le bleu clair de base suivent la couleur d'ambiance, pas seulement les deux boutons initialement cités.

## Livrables produits ou modifiés
- `src/domain/rules/taskRulesV2.ts` : ajout `taskSlotRange`, `taskOccupiesSlot` (+ tests)
- `src/ui/screens/planning/E40Planning.tsx` : bascule sur occupation par plage ; boutons énergie/obligatoire/valider sur `--color-accent`
- `src/app/AppContext.tsx`, `src/index.css` : injection de `--color-accent`
- `src/ui/components/Button.tsx`, `BottomNav.tsx` : variant primaire / onglet actif sur `--color-accent`
- `src/ui/screens/resources/E120Resources.tsx`, `energy/E31EnergyCheckIn.tsx`, `onboarding/E03Energy.tsx`, `tasks/E21CreateTaskV2.tsx` : boutons de sélection sur `--color-accent`
- `validation_manuelle.md` (racine) : créé, 20/20 points validés
- `roadmap_v4.md` : V4-0 et B1 cochés, Q à trancher mise à jour

## Hypothèses validées / invalidées
- VALIDE : périmètre B1 large (tous les boutons bleu clair de base, pas seulement les 2 cités)
- EN ATTENTE : gestion chevauchement/comptage E2, confirmation du nouveau mécanisme de Reporter (E8), structure de données des sous-tâches (E9), cadrage du module budget (E3)

## Prochaine étape exacte
Terminer la Phase V4-1 (Quick wins UI) : D2 (libellés « maintenant »), E7 (indicateur surcharge visible/grisé hors surcharge), D4 (ne pas proposer « planifier » depuis Todo).

## Question bloquante pour la session suivante
Aucune — les 4 questions ouvertes (E2, E8, E9, E3) bloquent chacune leur phase spécifique, aucune ne bloque la suite de V4-1.
