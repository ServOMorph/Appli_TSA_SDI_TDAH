# ADR-002 — Architecture en couches

Date : 2026-06-23  
Statut : Accepté

## Contexte

L'application doit rester testable, maintenable et portable (PWA → mobile Capacitor). La logique métier ne doit pas dépendre du stockage ni de l'UI.

## Décision

Structure `src/` en 5 couches strictement isolées :

```
src/
  domain/    — logique métier pure (zéro import Dexie / React)
  data/      — repositories Dexie, migrations, chiffrement transparent
  ui/        — composants React, écrans, hooks
  crypto/    — wrapper Web Crypto (AES-GCM, PBKDF2)
  app/       — point d'entrée, routing, providers
  test/      — setup Vitest, helpers partagés
```

### Règles d'import autorisées

```
ui        → domain, data, crypto
data      → domain, crypto
domain    → (rien — pur TypeScript)
crypto    → (rien — Web Crypto API native)
app       → ui, data, domain
```

Toute violation de ces règles est une erreur d'architecture.

## Conséquences

- Le domaine est testable sans navigateur ni Dexie.
- Le portage Capacitor ne touche que `app/` et `data/`.
- La couverture ≥ 85 % est atteignable en priorité sur `domain/` (logique pure).
