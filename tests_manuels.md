# Tests manuels en attente

## Phase V5-2b — Planning épuré (M5)

### 3.2 Sous-étapes dépliables (tactile réel, à tester sur téléphone)
Créer une tâche avec des sous-étapes, la planifier → dans le planning, vérifier le compteur
n/N et le dépliement/repliement de la liste des sous-étapes au tactile, les cases à cocher
individuelles.

## Bugs signalés le 2026-08-06, non reproduits par lecture de code ni par test automatisé (Playwright, build reconstruit) — à reproduire avec la console navigateur ouverte (F12 côté PC, ou outils de dev à distance sur téléphone)

### Suppression d'une tâche récurrente sans effet
Depuis la fiche d'une tâche récurrente, « Supprimer » → la boîte de dialogue « cette
occurrence / toutes les occurrences » s'affiche, mais choisir une option ne supprime rien.
Code relu (`E22TaskDetail.tsx` `handleDelete`/`confirmScope`, `usePlanningState.deleteTaskScoped`,
`TaskRepository.deleteWithChildren`) sans trouver de défaut expliquant ce comportement.
À la reproduction, noter si une erreur apparaît dans la console au moment du clic sur
« Cette occurrence » / « Toutes les occurrences ».

### Impossible d'ajouter une sous-tâche depuis la fiche d'une tâche existante
Depuis « Décomposer » (fiche d'une tâche déjà créée), le champ « Ajouter une sous-étape »
ne fonctionne pas. Code relu (`E23Decompose.tsx` `handleAdd`, `useTasksState.addSubTask`)
sans trouver de défaut. À la reproduction, noter le message exact si un message apparaît,
et si le champ reste vide après clic sur « Ajouter » ou si rien ne se passe du tout.
