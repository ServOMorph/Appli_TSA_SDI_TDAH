# Plan de Test Manuel — V2 (pré-déploiement)

Scope basé sur les écrans implémentés (`src/ui/screens/`) et `roadmap_v2.md`. Aucune solution technique — uniquement les étapes de validation testeur.

---

## 1. Onboarding (E01–E04)

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 1.1 | Happy path | Ouvrir l'app pour la première fois → parcourir écran de bienvenue → renseigner profil → définir énergie initiale → créer une première tâche | Onboarding complet, arrivée sur le Dashboard avec la tâche créée visible — **validé 2026-07-06** |
| 1.2 | Fonctionnel | Quitter l'app avant d'atteindre le tableau de bord (à n'importe quelle étape entre bienvenue et première tâche) puis rouvrir | Redémarrage complet depuis l'écran de bienvenue, aucune donnée partielle de l'onboarding précédent conservée |
| 1.3 | Fonctionnel | Vérifier que les 3 choix de profil (Adolescent / Étudiant / Adulte) sont bien les seules options, sans possibilité de continuer sans en sélectionner un | Sélection d'un profil obligatoire pour avancer, aucun champ ou bouton "Ignorer" permettant de contourner ce choix |

## 2. Tableau de bord (E10Dashboard)

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 2.1 | Happy path | Depuis le Dashboard, naviguer vers Todo / Aujourd'hui / Planning / Listes via la nav segmentée | Chaque écran s'ouvre correctement, retour au Dashboard possible — **validé 2026-07-06** |
| 2.2 | Happy path | Cliquer "Ajouter une tâche" | Ouverture de l'écran de création (4 destinations) — **validé 2026-07-06** |
| 2.3 | Fonctionnel | Vérifier la section "Planning du jour" avec plusieurs tâches planifiées à des heures différentes | **Bug confirmé 2026-07-06** : tri par heure incorrect — action ajoutée à `roadmap_v2.md` |
| 2.4 | Fonctionnel | Vérifier badge "X/Y" sur une tâche décomposée en sous-tâches | Compteur correspond au nombre réel de sous-tâches cochées — **à vérifier**, noté dans `roadmap_v2.md` |
| 2.5 | Fonctionnel | Vérifier "Prochaine étape" affichée | Correspond à la première sous-tâche non terminée — **validé 2026-07-06** |
| 2.6 | Edge case | Dashboard sans aucune tâche (état vide) | Message ou état vide clair, pas de section cassée — **à vérifier**, noté dans `roadmap_v2.md` |
| 2.7 | Edge case | Dashboard avec un grand nombre de tâches/sous-tâches | Pas de ralentissement perceptible, affichage lisible — **validé 2026-07-06** |

## 3. Mode surcharge

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 3.1 | Happy path | Activer le mode surcharge depuis le bouton dédié | Interface simplifiée immédiatement (sans rechargement de page) — **validé 2026-07-06** |
| 3.2 | Fonctionnel | En mode surcharge, vérifier que sont masqués : icônes Planning/Ressources/Paramètres, chip énergie, bouton "Ajouter une tâche", nav segmentée, "Planning du jour", "Tâches du jour" | Tous masqués, seuls restent : titre, bouton mode surcharge, bandeau d'état, Centre récupération, action immédiate — **validé 2026-07-06** |
| 3.3 | Happy path | Cliquer "Sortir du mode surcharge" en pied de page | Retour à l'interface complète — **validé 2026-07-06** |
| 3.4 | Fonctionnel | Accéder au Centre récupération (E90OverloadRecovery) depuis le bandeau | Écran accessible et navigable en retour — **validé 2026-07-06** |
| 3.5 | Edge case | Activer/désactiver le mode surcharge plusieurs fois rapidement | Pas d'état incohérent (icônes qui restent masquées après sortie, etc.) — **validé 2026-07-06** |

## 4. Todo (E20Inbox)

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 4.1 | Happy path | Depuis Todo, choisir "Aujourd'hui" sur une tâche | Tâche déplacée vers Aujourd'hui — **validé 2026-07-06** |
| 4.2 | Happy path | Depuis Todo, choisir "Planifier" sur une tâche | Navigation vers Planning avec la tâche pré-sélectionnée — **validé 2026-07-06** |
| 4.3 | Happy path | Depuis Todo, choisir "Liste" sur une tâche | **Bug confirmé 2026-07-06** (sans liste existante) : la liste est créée mais la tâche n'y est jamais ajoutée — action ajoutée à `roadmap_v2.md` |
| 4.4 | Fonctionnel | Vérifier badge "X/Y" sur une tâche du Todo ayant des sous-tâches | Compteur correct — **validé 2026-07-06** |
| 4.5 | Edge case | Choisir "Aujourd'hui" alors que 3 tâches sont déjà prévues aujourd'hui | Modal de remplacement proposé, comportement cohérent — **validé 2026-07-06** |
| 4.6 | Edge case | Choisir "Planifier" ou "Liste" sur une tâche possédant des sous-tâches | **Bug confirmé 2026-07-06** : les sous-tâches sont perdues — action ajoutée à `roadmap_v2.md` |

## 5. Création de tâche (E21CreateTaskV2)

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 5.1 | Happy path | Créer une tâche pour chacune des 4 destinations : Todo / Aujourd'hui / Planifier / Mettre dans une liste | Chaque destination aboutit à l'emplacement attendu, visible dans l'écran correspondant — **validé 2026-07-06** |
| 5.2 | Fonctionnel | Destination "Mettre dans une liste" : sélectionner une liste existante | Élément ajouté à la bonne liste — **validé 2026-07-06** |
| 5.3 | Fonctionnel | Destination "Aujourd'hui" avec 3 tâches déjà présentes aujourd'hui | Modal de remplacement identique à celui du Todo — **validé 2026-07-06** |
| 5.4 | Edge case | Valider sans avoir choisi de destination | Bouton Valider désactivé tant qu'aucune destination n'est choisie (pas de message supplémentaire nécessaire) — **validé 2026-07-06** |
| 5.5 | Edge case | Créer une tâche avec un titre vide | Validation bloquée — **validé 2026-07-06** |
| 5.6 | Edge case | Créer une tâche avec un titre très long | Affichage correct dans tous les écrans où la tâche apparaît ensuite — **validé 2026-07-06** |
| 5.7 | Edge case | Destination "Mettre dans une liste" sans qu'aucune liste n'existe encore | **Bug confirmé 2026-07-06** (même défaut que 4.3) : la liste est créée mais la tâche n'y est jamais ajoutée — action ajoutée à `roadmap_v2.md` |

## 6. Planning (E40Planning)

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 6.1 | Happy path | Arriver sur Planning depuis "Planifier" (Todo ou création) avec une tâche en attente, taper un créneau vide | Affichage direct "Placer « titre » à Xh00" + bouton Valider unique — **validé 2026-07-06** |
| 6.2 | Happy path | Cliquer Valider | Tâche placée au bon créneau, visible dans le Planning et sur le Dashboard — **validé 2026-07-06** |
| 6.3 | Happy path | Arriver sur Planning sans tâche en attente, taper un créneau vide | **Décision produit à prendre** : message "Aucune tâche à planifier..." affiché — voir `roadmap_v2.md` |
| 6.4 | Fonctionnel | Bouton Valider désactivé tant qu'aucune sélection n'est faite (cas sans tâche en attente) | Renvoie au même cas que 6.3 — voir `roadmap_v2.md` |
| 6.5 | Fonctionnel | Déplacer une tâche déjà planifiée vers un autre créneau | Déplacement effectif, ancien créneau libéré — **validé 2026-07-06** |
| 6.6 | Fonctionnel | Naviguer jour précédent / suivant | Affichage des tâches du bon jour — **validé 2026-07-06** |
| 6.7 | Fonctionnel | Ouverture du Planning à l'heure courante | Scroll positionné sur l'heure actuelle — **à retester**, noté dans `roadmap_v2.md` |
| 6.8 | Edge case | Tenter de placer une tâche sur un créneau déjà occupé | **Bug confirmé 2026-07-06** : aucune détection de conflit — action ajoutée à `roadmap_v2.md` |
| 6.9 | Edge case | Planning sans aucune tâche non planifiée disponible | État vide clair, pas de blocage — **validé 2026-07-06** |
| 6.10 | Edge case | Placer une tâche à un horaire limite (00h00, 23h00) | Affichage correct, pas de créneau hors grille — **à tester**, noté dans `roadmap_v2.md` |

## 7. Aujourd'hui (E24Today)

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 7.1 | Happy path | Consulter les tâches du jour, cocher une sous-tâche | Badge "X/Y" mis à jour, "Prochaine étape" avance — **validé 2026-07-06** |
| 7.2 | Fonctionnel | Vérifier absence du bouton "Voir le Todo" (retiré intentionnellement) | Bouton absent — **validé 2026-07-06** |
| 7.3 | Edge case | Journée sans aucune tâche prévue | État vide clair — **à retester**, noté dans `roadmap_v2.md` |
| 7.4 | Edge case | Toutes les sous-tâches d'une tâche cochées | "Prochaine étape" affiche un état de complétion, pas de crash — **validé 2026-07-06** |

## 8. Décomposition en sous-tâches (E22TaskDetail / E23Decompose)

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 8.1 | Happy path | Ouvrir le détail d'une tâche, ajouter plusieurs sous-tâches | Sous-tâches créées et listées — **validé 2026-07-06** |
| 8.2 | Happy path | Cocher/décocher une sous-tâche depuis le détail | Mise à jour immédiate du badge sur tous les écrans (Dashboard, Todo, Aujourd'hui) — **validé 2026-07-06** |
| 8.3 | Edge case | Ajouter une sous-tâche avec un titre vide | Validation bloquée — **validé 2026-07-06** |
| 8.4 | Edge case | Ajouter un très grand nombre de sous-tâches à une même tâche | Affichage/scroll correct, pas de dégradation — **validé 2026-07-06** |

## 9. Listes (E60Lists / E61ListDetail)

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 9.1 | Happy path | Créer une nouvelle liste à la volée | Liste créée, accessible depuis la page Listes — **validé 2026-07-06** |
| 9.2 | Happy path | Ajouter/supprimer des éléments dans une liste | Modifications reflétées immédiatement — **validé 2026-07-06** |
| 9.3 | Fonctionnel | Vérifier qu'une liste n'est pas planifiable (pas d'accès au Planning depuis une liste) | Aucune action de planification proposée — **validé 2026-07-06** |
| 9.4 | Edge case | Créer une liste sans nom | Validation bloquée — **validé 2026-07-06** |
| 9.5 | Edge case | Supprimer une liste contenant des éléments | **Non implémenté 2026-07-06** : aucune suppression de liste possible dans l'UI — action ajoutée à `roadmap_v2.md` |

## 10. Énergie (E30EnergyView / E31EnergyCheckIn)

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 10.1 | Happy path | Effectuer un check-in énergie | Valeur enregistrée, reflétée dans l'app — **validé 2026-07-06** |
| 10.2 | Edge case | Effectuer plusieurs check-in consécutifs le même jour | **Décision produit à prendre** : revoir à quoi sert l'énergie dans l'appli — voir `roadmap_v2.md` |

## 11. Paramètres (E110–E117)

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 11.1 | Happy path | Modifier le profil (E111) | **Non implémenté 2026-07-06** : écran en lecture seule, aucune modification possible — action ajoutée à `roadmap_v2.md` |
| 11.2 | Happy path | Modifier les réglages d'accessibilité (E112) et de stimulation (E113) | Effet visible immédiatement dans l'UI — **à retester**, noté dans `roadmap_v2.md` |
| 11.3 | Happy path | Modifier les réglages d'organisation (E114) | **Obsolète 2026-07-06** : section "Organisation" à supprimer des Paramètres — voir `roadmap_v2.md` |
| 11.4 | Happy path | Consulter les réglages de confidentialité (E116) | Informations affichées correctes et compréhensibles — **validé 2026-07-06** |
| 11.5 | Happy path | Exporter les données (E117) | **À tester 2026-07-06** : comportement sur iPhone et viabilité du fichier JSON généré — noté dans `roadmap_v2.md` |
| 11.6 | Edge case | Exporter les données avec un volume de données important (nombreuses tâches/listes/sous-tâches) | Export complet, pas de troncature — **validé 2026-07-06** |
| 11.7 | Edge case | Exporter avec une base vide (aucune donnée) | Export ne plante pas, fichier vide ou message clair — **validé 2026-07-06** |

## 12. Ressources (E120Resources)

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 12.1 | Happy path | Consulter la section Ressources | Contenu affiché correctement, navigation retour fonctionnelle — **validé 2026-07-06** |

## 13. Transversal / Persistance / Offline

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 13.1 | Fonctionnel | Fermer complètement l'app puis la rouvrir | Toutes les données (tâches, sous-tâches, listes, réglages) restaurées à l'identique — **validé 2026-07-06** |
| 13.2 | Fonctionnel | Utiliser l'app en coupant la connexion réseau | Fonctionnement normal (offline-first) — **à tester**, noté dans `roadmap_v2.md` |
| 13.3 | Edge case | Réinitialiser toutes les données (fonction reset) | Confirmation demandée, réinitialisation complète sans résidu (y compris `TaskV2`) — **validé 2026-07-06** |
| 13.4 | Edge case | Naviguer rapidement entre tous les écrans (Dashboard/Todo/Planning/Listes/Aujourd'hui/Paramètres) sans attendre le chargement complet | Pas de blocage, pas d'écran blanc, pas d'état incohérent — **validé 2026-07-06** |
| 13.5 | Edge case | Recharger la page (F5 / refresh navigateur) sur un écran autre que le Dashboard | Retour à un état cohérent, pas de perte de contexte critique — **validé 2026-07-06** |

---

## Points d'attention

- Aucune interaction UI n'existe pour marquer une tâche planifiée comme "essentielle" ou la compléter directement depuis le Planning — ne pas chercher cette action, elle n'est pas censée exister actuellement.

## Session de test du 2026-07-06

Passage complet du plan effectué. Tous les cas non annotés ci-dessus (marqués **validé 2026-07-06**) sont conformes. Les écarts constatés (bugs, décisions produit à prendre, fonctionnalités manquantes, points à re-tester) sont détaillés directement dans les tableaux ci-dessus et consolidés dans `roadmap_v2.md` § "Constats test manuel V2-10 (session 2026-07-06)".
