# Architecture du code

## Organisation

| Dossier | Responsabilité |
| --- | --- |
| `src/domain/` | Entités et règles métier pures. |
| `src/data/` | Base Dexie, dépôts, services et synchronisation. |
| `src/app/` | Navigation, contexte et assemblage de l'état applicatif. |
| `src/ui/` | Écrans et composants React. |
| `src/test/` | Configuration et utilitaires partagés des tests. |
| `e2e/` | Scénarios Playwright. |

L'application est une PWA React/TypeScript construite avec Vite. La navigation et le contexte applicatif coordonnent les écrans ; les règles métier restent dans `domain`, tandis que les accès à la base locale passent par les dépôts de `data`.

## Frontière de données

Dexie encapsule IndexedDB. Le schéma contient notamment le profil, les tâches et leurs récurrences, les listes, outils, énergie, budget, paramètres et retours. Les migrations Dexie font évoluer les bases déjà installées ; une installation neuve crée directement le schéma courant.

La construction d'un snapshot centralise les données exportées et synchronisées. Toute nouvelle table utilisateur doit donc être ajoutée au schéma, aux dépôts concernés, au snapshot et aux tests associés.

## Synchronisation

La synchronisation globale envoie un snapshot de l'appareil vers le backend configuré après accord de l'utilisateur. Sans configuration, sans consentement ou en cas d'échec, elle ne bloque pas l'usage local. Les tentatives ordinaires sont espacées d'une heure.

Le circuit de retours est distinct : il envoie les captures et messages en attente, récupère les réponses de l'équipe, puis synchronise la clôture validée par l'utilisateur. Il exige lui aussi la configuration et le consentement.

Voir [Architecture générale](../30_decisions/architecture_generale.md) pour les choix structurants.
