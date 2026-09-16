# Énergie et surcharge

**Statut :** actuel (code consulté le 2026-09-16)  
**Sources :** `src/domain/entities/energyEntry.ts`, `src/domain/rules/energyRules.ts`, `src/domain/rules/taskRules.ts`, `src/app/AppContext.tsx`, `src/ui/screens/energy/E31EnergyCheckIn.tsx`, `src/ui/screens/overload/E90OverloadRecovery.tsx`.

## Relevé quotidien

L'utilisateur peut renseigner son énergie du jour sur une échelle entière de 1 à 12, ou indiquer qu'il ignore ce relevé. Une entrée est associée à une date. Le dernier relevé rempli peut servir de repère à l'interface.

## Énergie planifiée

Chaque tâche planifiée peut recevoir un coût d'énergie entre 1 et 12. Le coût planifié est la somme des coûts des tâches principales à l'état `planned`. Les tâches sans coût ne contribuent pas à cette somme. Lorsque l'énergie du jour est renseignée, l'interface peut présenter l'énergie planifiée sur l'énergie disponible.

## Surcharge

Le mode surcharge est actif lorsque le coût d'énergie planifié est strictement supérieur à l'énergie renseignée pour le jour. Sans relevé d'énergie, il ne s'active pas.

L'écran de récupération associé annonce une interface simplifiée et des notifications réduites, puis propose des conseils de régulation et un retour au tableau de bord. Il ne modifie pas les tâches ni le relevé d'énergie.

Voir aussi : [Tâches et planification](taches_et_planification.md).
