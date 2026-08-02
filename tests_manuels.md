# Tests manuels en attente

Phase V5-2a (unification du modèle de tâches) — refacto sans changement de comportement visible.
Objectif : confirmer qu'aucun flux de tâche n'a régressé, et que la migration de base ne perd pas de données.

> Recharger l'application en forçant le rechargement (le service worker met `index.html` en cache).

## 110 — Migration des données existantes

Sur une installation qui contenait déjà des données avant cette session (ne pas repartir d'une base vide) :
- les tâches de la Réception sont toutes présentes, avec leurs titres corrects
- les tâches de « Tâche du jour » sont présentes
- les sous-étapes sont toujours rattachées à leur tâche parente (ouvrir une tâche décomposée)
- les sous-étapes déjà cochées apparaissent toujours cochées
- les tâches planifiées sont toujours sur le planning, au bon créneau, avec leur coût en énergie

## 111 — Réception

- créer une tâche depuis le « + » : elle apparaît en Réception
- les sous-étapes n'apparaissent **pas** comme des tâches de premier niveau dans la Réception
- le badge `n/N` de progression des sous-étapes affiche le bon compte
- « Tâche du jour », « Planifier », « Liste » fonctionnent depuis la Réception

## 112 — Décomposition

- ajouter, cocher, décocher, renommer, supprimer une sous-étape
- réordonner les sous-étapes par glisser-déposer, puis quitter et revenir : l'ordre est conservé
- planifier une sous-étape : elle apparaît sur le planning en « Parent - Étape »

## 113 — Fiche tâche

- « Terminer » termine la tâche
- « Supprimer » supprime la tâche **et** ses sous-étapes (vérifier qu'aucune sous-étape orpheline ne réapparaît ailleurs)
- déplacer une tâche décomposée vers une liste : l'avertissement de perte de sous-étapes s'affiche, puis la tâche disparaît de la Réception

## 114 — Planning

- créer une tâche directement dans un créneau vide, avec coût en énergie et « Obligatoire »
- cocher puis décocher une tâche planifiée : elle revient à l'état planifié, sur le même créneau
- cocher puis décocher une **sous-étape** planifiée : même comportement
- déplacer, renommer, supprimer une tâche et une sous-étape depuis le menu du créneau
- reporter une tâche en mode surcharge

## 115 — Accueil

- la pastille d'énergie affiche « planifié / disponible » avec le bon coût cumulé
- la liste « Tâche du jour » se réordonne par glisser-déposer et l'ordre est conservé après rechargement
- une tâche terminée aujourd'hui reste visible, barrée et teintée

## 116 — Chiffrement local

Activer le chiffrement local dans les paramètres, puis :
- créer une tâche et une sous-étape : leurs titres s'affichent correctement
- **réordonner** la liste « Tâche du jour » puis recharger : les titres ne sont pas corrompus (correctif de cette phase)

## 117 — Export

- exporter les données : le fichier ne contient plus `sub_tasks` ni `tasks_v2`, toutes les tâches et sous-étapes sont dans `tasks` avec un champ `parent_id`
