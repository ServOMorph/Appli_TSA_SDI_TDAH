# ADR-003 : Séparation domaine/infra et isolement des dépendances

Date : 2026-06-24

## Statut

Accepté

## Contexte

Phase 1 introduit une architecture en trois couches : domaine (logique métier pure), infra (données et persistance), et UI (réactions utilisateur). L'objectif est de rendre la logique métier testable et indépendante des frameworks et de la base de données.

## Décision

### Règle d'isolement strict : `src/domain/` ne contient aucun import de

- `dexie` (la base de données)
- `@/data/*` (la couche infra)
- `@/crypto/*` (le chiffrement)
- `@/app/*` ou `@/ui/*` (UI)

### Dépendances admises dans `src/domain/`

- Types provenant de `@/domain/entities/*`
- Code pur (pas d'I/O, d'appels async API, pas de side-effects)
- Optionnellement : utilitaires type dans `/utils` si vraiment nécessaire

### Dépendances admises dans `src/data/repositories/`

- Dépendent de `@/domain/entities/*` (pour les types)
- Optionnellement des `@/crypto/*` (si chiffrement transparent)
- Dépendent de `@/data/db` (pour accéder à Dexie)
- **Ne dépendent jamais de `@/domain/rules/*`** (inversion de dépendances)

### Dépendances admises dans `src/data/db.ts`

- Dépend uniquement de `@/domain/entities/*`
- Définit la structure Dexie
- Exporte l'instance singleton et la classe pour les tests

## Conséquences

### Avantages

1. **Testabilité** : domaine testable sans base de données, avec des mocks simples
2. **Réutilisabilité** : règles métier utilisables dans n'importe quel contexte (CLI, API, UI)
3. **Maintenabilité** : changements de base de données n'affectent pas le domaine

### Obligations

1. Les tests de domaine ne doivent jamais instancier Dexie ou fake-indexeddb
2. Les tests des repositories utilisent fake-indexeddb, mais ne testent pas le domaine directement
3. Toute violation doit être signalée lors de la revue de code

## Vérification

```bash
grep -r "from.*dexie\|from.*@/data\|from.*@/crypto" src/domain/
```

Attendu : aucun résultat.

## Références

- Phase 1 de la roadmap — Couche données & domaine
- Doc 6 — MODÈLE DE DONNÉES & ARCHITECTURE BACKEND
