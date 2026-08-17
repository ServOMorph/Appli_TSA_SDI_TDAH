# Roadmap — Refonte du budget (Montant total)

## Contexte
Retour de Marie suite au bug « retrait de livret n'augmente pas le mois » (export 08-16 22h35) : le
modèle actuel (catégories revenu à montant fixe récurrent + « Il me reste » déconnecté des livrets)
ne correspond pas à sa logique. Nouveau modèle validé par Marie :

```
Montant total (alimenté manuellement par Marie, au fil de ses revenus réels)
├── Mon compte
│    ├── Mois   → catégories existantes (Courses, Santé, ...)
│    └── Semaine → catégories existantes (Plaisirs, Clopes, ...)
└── Livrets (les différents livrets enregistrés)
```

Règles validées :
1. Marie saisit elle-même chaque revenu (pas de calcul automatique depuis des catégories fixes).
2. Toute somme allouée à une catégorie « Mon compte » (Semaine ou Mois) ou déposée sur un livret
   se soustrait du Montant total.
3. Conversion Semaine → Mois : nombre réel de semaines du mois affiché (pas un coefficient fixe
   type 4,5, qui dériverait d'un mois à l'autre).
4. L'outil « Compte » continue d'ajouter une dépense qui se soustrait du budget prévu/reste d'une
   catégorie (comportement déjà existant, inchangé).

## Décisions ouvertes (à trancher en cours de route, ne bloquent pas le démarrage)
- Format d'une entrée de revenu : montant + date + libellé optionnel (calqué sur `BudgetEntry`
  existant). Assomption de conception, à valider avec Marie si le formulaire lui semble mal adapté.
- Devenir des catégories `kind: 'income'` actuelles de Marie (Mcdo, Maman, Livret jeune, APL) :
  tranché en Phase 4 — conversion en revenus historiques ponctuels (`BudgetIncomeEntry`) puis
  suppression des catégories `income` (migration Dexie version 14).

## Phases

### Phase 1 — Entité revenu et calcul du Montant total [FAIT]
- Nouvelle entité `BudgetIncomeEntry` (id, amount, label optionnel, date, created_at) + migration
  Dexie (nouvelle version, table `budgetIncomeEntries`).
- Fonction `getTotalIncomeEntries` (somme des revenus du mois affiché) dans `budgetRules.ts`.
- Écran/formulaire d'ajout d'un revenu (montant, date, libellé), accessible depuis l'écran Budget.
- Tests unitaires (règle de calcul + formulaire).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

### Phase 2 — Rattachement des livrets au Montant total [FAIT]
- Un dépôt sur un livret soustrait du Montant total du mois ; un retrait le recrédite (vérifier et
  adapter la logique de signe déjà existante sur `BudgetDeposit`).
- Affichage du Montant total incluant l'effet des livrets sur l'écran Budget principal.
- Tests unitaires.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

### Phase 3 — Rattachement de « Mon compte » au Montant total [FAIT]
- Catégories « Mois » : leur montant budgété soustrait du Montant total du mois.
- Catégories « Semaine » : leur montant budgété × nombre réel de semaines du mois affiché,
  soustrait du Montant total.
- Fonction utilitaire du nombre de semaines dans un mois donné (cas limites : mois à 4 vs 5
  semaines civiles).
- Tests unitaires, y compris cas limites.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

### Phase 4 — Écran Budget principal et migration des données de Marie [FAIT]
- Le Montant total (revenus − Mon compte − Livrets) devient l'indicateur central de l'écran
  Budget, en complément ou remplacement de « Il me reste ».
- Décision tranchée sur le devenir des catégories `income` existantes (cf. Décisions ouvertes) et
  migration Dexie correspondante si nécessaire.
- Tests unitaires + test manuel dédié ajouté à `manualTestsCatalog.ts`.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.
