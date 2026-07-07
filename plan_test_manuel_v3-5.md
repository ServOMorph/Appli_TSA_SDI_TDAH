# Plan de Test Manuel — V3-5 (Listes)

Scope basé sur `roadmap_v3.md` Phase V3-5 (L1, L2, L3). Couvre uniquement la hiérarchie visuelle entre la vue globale des listes et l'intérieur d'une liste. Ne couvre pas la création/suppression/renommage des listes ni des éléments (comportement inchangé, déjà couvert par les tests unitaires).

---

## 1. Vue globale des listes (L2 — grosses cases)

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 1.1 | Happy path | Aller sur « Mes listes » avec au moins une liste existante | Chaque liste s'affiche dans une case large, encadrement identique à avant cette phase (aucun changement visuel ici) |
| 1.2 | Fonctionnel | Comparer visuellement une case de la vue globale avec un élément à l'intérieur d'une liste (§2) | La case de la vue globale est visiblement plus large/aérée que les éléments à l'intérieur d'une liste |

## 2. Intérieur d'une liste (L1 — cases fines)

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 2.1 | Happy path | Ouvrir une liste contenant plusieurs éléments | Chaque élément s'affiche dans une case plus fine et plus serrée que dans la version précédente (padding réduit, coins moins arrondis) |
| 2.2 | Fonctionnel | Comparer l'encadrement des éléments avec celui des listes en vue globale (§1) | L'encadrement est visiblement plus fin/serré que celui des listes en vue globale — la différence de hiérarchie est perceptible au premier coup d'œil |
| 2.3 | Edge case | Ouvrir une liste vide | Le message « Cette liste est vide » s'affiche normalement, aucun élément à comparer |

## 3. Titre de la liste (L3)

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 3.1 | Happy path | Ouvrir une liste, observer le titre en haut de l'écran | Le titre est encadré (bordure, fond, coins arrondis) |
| 3.2 | Fonctionnel | Comparer l'encadrement du titre avec celui d'une case de la vue globale des listes (§1) | Le même style d'encadrement est utilisé (mêmes bordure/coins/padding) — le titre de la liste reprend visuellement le style des listes en vue globale |
| 3.3 | Edge case | Ouvrir une liste au nom long | Le titre reste lisible dans son encadrement, sans casser la mise en page du header (bouton retour toujours visible et cliquable) |

---

## Points d'attention

- Cette phase est purement visuelle (CSS), aucun changement de comportement ou de logique métier.
- `E60Lists.tsx` (vue globale) n'a subi aucune modification de style — seule `E61ListDetail.tsx` (éléments + titre) a été modifiée.
