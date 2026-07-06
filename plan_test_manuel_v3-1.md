# Plan de Test Manuel — V3-1 (bugs + nettoyage UI)

Scope basé sur `roadmap_v3.md` Phase V3-1. Ne couvre que les changements de cette phase (pas de test de l'énergie/cuillères/surcharge auto, prévu en V3-2 à V3-4).

---

## 1. Onboarding — question retirée (D2)

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 1.1 | Happy path | Parcourir l'onboarding complet (bienvenue → profil → énergie) en validant l'énergie du jour | Arrivée directe sur le Dashboard après l'énergie, aucun écran "première tâche" / "chose la plus importante" |
| 1.2 | Happy path | Parcourir l'onboarding en cliquant "Ignorer" sur l'écran énergie | Arrivée directe sur le Dashboard, aucune tâche créée |

## 2. Dashboard — nettoyage et réordonnancement (D1, D3, D4)

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 2.1 | Happy path | Ouvrir le Dashboard avec au moins une tâche du jour | Aucun bloc "Que faire maintenant ?" visible ; la section "Tâche du jour" apparaît **au-dessus** de "Planning du jour" |
| 2.2 | Fonctionnel | Comparer la taille du texte des titres dans "Tâche du jour" | Police visiblement plus grande que le reste du contenu (comparable à l'ancien "Que faire maintenant ?") |
| 2.3 | Fonctionnel | Observer la nav segmentée en bas du Dashboard | Seuls "Todo", "Planning", "Listes" sont présents — plus de bouton "Aujourd'hui" |
| 2.4 | Edge case | Dashboard sans aucune tâche du jour | Message "Rien à faire aujourd'hui" affiché dans la section "Tâche du jour" |
| 2.5 | Fonctionnel | Créer 4 tâches ou plus en statut "Tâche du jour" | Toutes les tâches sont affichées et réordonnables par glisser-déposer, sans limite à 3 |

## 3. Écran "Aujourd'hui" (E24Today) — limite retirée (Q1)

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 3.1 | Edge case | Ajouter une 4e (ou plus) tâche en "Tâche du jour" puis ouvrir l'écran "Aujourd'hui" | Toutes les tâches s'affichent, aucun message "Vous avez déjà 3 tâches aujourd'hui" |

## 4. Todo (E20Inbox) — renommage et limite retirée (D4b, Q1)

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 4.1 | Fonctionnel | Depuis Todo, observer le bouton sur une tâche pour la déplacer vers aujourd'hui | Le bouton affiche "Tâche du jour" (plus "Aujourd'hui") |
| 4.2 | Edge case | Cliquer "Tâche du jour" sur une tâche Todo alors que 3 tâches (ou plus) sont déjà en "Tâche du jour" | La tâche est déplacée directement, sans modale de remplacement |

## 5. Création de tâche (E21CreateTaskV2) — renommage et limite retirée (D4b, Q1)

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 5.1 | Fonctionnel | Ouvrir l'écran de création de tâche | Les 4 destinations affichées sont : "Todo", "Tâche du jour", "Planifier", "Mettre dans une liste" |
| 5.2 | Edge case | Créer une tâche avec destination "Tâche du jour" alors que 3 tâches (ou plus) existent déjà | Tâche créée directement, sans modale de remplacement |

## 6. Détail de tâche (E22TaskDetail) — renommage et limite retirée (D4b, Q1)

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 6.1 | Fonctionnel | Ouvrir le détail d'une tâche Todo, observer le bouton de déplacement | Le bouton affiche "Tâche du jour" |
| 6.2 | Edge case | Cliquer "Tâche du jour" alors que 3 tâches (ou plus) existent déjà | Déplacement direct, sans modale de remplacement |

## 7. Planning — pas d'état fantôme (B1)

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 7.1 | Happy path | Depuis Todo ou création, choisir "Planifier" sur une tâche, puis assigner un créneau et valider | Tâche visible au bon créneau dans le Planning et sur le Dashboard |
| 7.2 | Fonctionnel — abandon | Depuis Todo ou création, choisir "Planifier", arriver sur le Planning, puis appuyer sur la flèche "Retour" **sans** choisir de créneau | Retour au Dashboard ; en revenant sur le Planning ensuite, aucune tâche fantôme ne doit apparaître ni dans le Todo ni ailleurs |
| 7.3 | Edge case | Répéter le scénario 7.2 plusieurs fois de suite (abandons répétés) | Aucune tâche fantôme accumulée, base de données propre |

## 8. Planning — case vide propose d'ajouter une tâche (P5)

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 8.1 | Happy path | Ouvrir le Planning directement (sans tâche en attente de planification), taper sur une case vide | Un champ de saisie "Nom de la tâche" apparaît avec un bouton "Planifier" (plus de liste de tâches à choisir) |
| 8.2 | Happy path | Saisir un titre puis valider "Planifier" | Une nouvelle tâche est créée et apparaît directement plantée dans ce créneau |
| 8.3 | Edge case | Ouvrir la case vide sans saisir de titre | Bouton "Planifier" désactivé |

## 9. Planning — tâche en attente déjà existante (B1, suite)

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 9.1 | Happy path | Arriver sur le Planning avec une tâche en attente (via Todo "Planifier" ou création "Planifier"), taper une case vide | Affichage direct "Placer « titre » à Xh00" + bouton Valider (pas de champ de saisie) |
| 9.2 | Edge case | Avec une tâche en attente, taper sur une case déjà occupée par une autre tâche | Message "déjà occupé" affiché, aucun déplacement de l'autre tâche |

## 10. Planning — contraste des cases en mode clair mobile (B2)

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 10.1 | Fonctionnel | Sur téléphone, en thème clair, ouvrir le Planning | Les bordures des créneaux et la séparation heure/case sont clairement visibles |

## 11. Planning et Dashboard — tâche terminée reste affichée (P4a)

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 11.1 | Happy path | Planifier une tâche, puis la marquer "Terminer" depuis le Dashboard ("Planning du jour") | La tâche reste visible dans "Planning du jour" (barrée / grisée), le bouton "Terminer" disparaît pour elle |
| 11.2 | Fonctionnel | Ouvrir le Planning après avoir terminé une tâche planifiée | La case correspondante reste affichée dans son créneau (visuellement distincte des tâches non terminées) |

## 12. Ajout de tâche depuis Todo (B3 — non reproduit)

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 12.1 | Vérification | Depuis Todo, cliquer "Ajouter une tâche" | Écran de création standard avec les 4 destinations ; aucune proposition automatique de "faire la tâche" |

---

## Points d'attention

- **Mode surcharge** : suite à la suppression du bloc "Que faire maintenant ?" (D1), plus aucune tâche n'est visible en mode surcharge (seuls le bandeau d'état et le Centre récupération restent affichés). À valider explicitement : ce changement de comportement est-il acceptable, ou faut-il réintroduire une visibilité de tâche en surcharge dans une phase ultérieure ?
- Les tests 7.2/7.3 (abandon de planification) sont les plus importants de cette session : ils valident le bug B1 qui était la remontée la plus prioritaire (P1) de la visio du 2026-07-06.
