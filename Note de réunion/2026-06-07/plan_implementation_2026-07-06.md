# Plan d'implémentation — V3

Objectif : ordonner les changements de `constats_2026-07-06.md` pour que **chaque étape soit testable manuellement dès qu'elle est finie**, sans dépendre d'une étape future (contrainte explicite, tirée du problème vécu en V2 où des écrans n'étaient testables qu'après plusieurs phases).

Principe directeur : livrer d'abord ce qui est **indépendant et à faible risque** (bugs + nettoyage UI immédiatement observables), puis construire la **fondation de données** (schéma), puis la **chaîne énergie** dans son ordre de dépendance, et finir par le chantier **transversal risqué** (nav persistante).

---

## Chaîne de dépendances (résumé)

```
V3-0 Refacto ──► tout le reste
V3-1 Bugs + nettoyage UI (indépendants)      ◄─ testables seuls
V3-2 Schéma énergie (R2 consolidé)           ──► V3-3, V3-4, V3-5
V3-3 UI coût énergie + obligatoire (E1,E2)   ──► V3-5
V3-4 Check-in énergie récurrent (E4)         ──► V3-5
V3-5 Surcharge automatique (E5,E6)           dépend de 3+4
V3-6 Cuillères + couleurs planning (E7,E8,P1-P4)  dépend de 2
V3-7 Listes (L1-L3)                          indépendant
V3-8 Planning récurrence (P5,P6)             indépendant (après V3-1)
V3-9 Nav persistante (N1)                    transversal, en dernier
Reporté : N2 swipe, N3 dictée, E9 cuillères config, Q3 couleur au login
```

---

## Justification de l'ordre

### V3-0 — Refacto préalable (obligatoire en premier)
Voir `analyse_code_2026-07-06.md` §4 (R1-R5). Pose le schéma v3, les constantes d'énergie, les composants extraits (`EnergyDisplay`, `AppShell/BottomNav`), et le sélecteur pur de surcharge. **Pourquoi en premier** : tout le reste s'appuie dessus ; fait sans changement de comportement, donc couvert par les tests existants et non bloquant.

### V3-1 — Bugs + nettoyage UI (juste après la refacto)
Regroupe B1, B2, B3, D1, D2, D3, D4, P4 (partie « reste affichée »), P5. **Pourquoi tôt** : ces éléments sont **indépendants de la chaîne énergie**, à faible risque, et immédiatement observables par Marie. Ils nettoient l'app avant d'y greffer la grosse fonctionnalité. B1 (tâche fantôme) est traité ici car il pollue le planning que les phases suivantes vont manipuler — le corriger avant évite de déboguer sur un état sale.

Ordre interne conseillé : D1/D2/D3/D4 (dashboard) ensemble, puis B1 (cycle de vie planned), puis B2/P4/P5 (planning), puis B3 (vérif). Chacun testable isolément.

### V3-2 — Schéma énergie consolidé
Si la refacto R2 a déjà posé `energy_cost`/`energy_max`, cette phase les **exploite** : helpers domaine (barème perso E3), règles de calcul du coût total planifié restant. **Pourquoi ici** : fondation nécessaire avant toute UI énergie ; testable par tests unitaires purs (pas besoin d'UI).

### V3-3 — UI coût d'énergie + obligatoire à la planification (E1, E2)
Fenêtre à deux carrés (sélecteur 1-12 + case obligatoire), câblée dans le flux de planification. Réutilise `essential`. **Pourquoi avant le check-in et la surcharge** : c'est la saisie qui alimente tout le reste ; dès qu'elle existe, on peut assigner un coût à une tâche et le vérifier en base/à l'écran, **sans attendre** la surcharge. Testable seul.

### V3-4 — Check-in énergie récurrent (E4)
Router le check-in (`E31EnergyCheckIn`, déjà existant) à chaque connexion via `init()`, échelle 1-12. **Pourquoi après V3-3 mais avant V3-5** : indépendant de V3-3 sur le plan technique (pourrait être parallèle), mais placé ici car il complète les deux entrées (coût de tâche + énergie du jour) dont V3-5 a besoin. Testable seul : rouvrir l'app → le prompt apparaît.

### V3-5 — Mode surcharge automatique (E5, E6)
Brancher le sélecteur pur `isOverloaded()` (posé en R5) sur énergie du jour (V3-4) vs somme des coûts planifiés restants (V3-2/V3-3). Bouton TopBar rendu informatif (descriptif + case Activé/Désactivé non manuelle). Grisé/reporter des non-obligatoires, obligatoires en couleur. **Pourquoi ici** : c'est le seul point qui dépend réellement de plusieurs phases (3 + 4). En le plaçant après, il est testable de bout en bout dès sa livraison, sans zone en attente.

### V3-6 — Cuillères + couleurs du planning (E7, E8, P1, P2, P3)
Composant cuillères réutilisable, affichage du coût sur le planning, texte des cases plus gros/centré, couleur pastel configurable (Settings), version flashy à la complétion. **Pourquoi après la logique énergie** : le visuel « cuillères » habille des données qui doivent déjà exister (coût par tâche). Regroupé avec les retouches visuelles du planning (P1-P3) car même fichier (`E40Planning`).

### V3-7 — Listes (L1, L2, L3)
Purement visuel/CSS, aucun lien avec l'énergie. **Pourquoi indépendant** : peut être fait à tout moment après V3-0 ; placé ici pour ne pas fragmenter le travail sur le planning/énergie.

### V3-8 — Planning récurrence (P5 déjà partiellement en V3-1, P6)
Rester dans le planning après validation + auto-jour suivant pour les récurrences. **Pourquoi tard** : touche au flux de planification que V3-1 (B1) et V3-3 (coût énergie) ont déjà modifié ; le faire après évite de re-toucher `handleAssign` trois fois.

### V3-9 — Navigation persistante (N1)
Rendre `BottomNav` (extrait en R4) persistant sur tous les écrans, onglet actif mis en valeur, pastille Todo conservée. **Pourquoi en dernier** : transversal (touche tous les écrans) et risqué ; le faire une fois les écrans stabilisés évite de le refaire à chaque changement d'écran des phases précédentes.

### Reporté (hors V3, à confirmer)
- **N2** swipe : réserve technique PWA, prototyper avant d'engager.
- **N3** dictée vocale : reporté par Marie.
- **E9** stock de cuillères configurable : « on verra plus tard » (Marie).
- **Q3** choix couleur au login : à confirmer.
- **Q1** limite 3 tâches : décision produit à trancher (peut s'insérer en V3-1 si tranchée).

---

## Points à valider avant de démarrer (cf. constats §7)
- **Q2** — Trancher l'ambiguïté « Aujourd'hui » / « Tâche du jour » (nav vs création) avec Marie. Impacte D3/D4 et V3-1.
- **Q1** — Décision sur la limite de 3 tâches du jour.
- **Reset données** — Confirmer la stratégie au bump Dexie v3 (Marie a des données V2).
