# Mémoire projet
<!-- Fichier géré via /create_memory. Ne pas modifier manuellement sauf pour supprimer des entrées. -->

## 2026-08-19 — Traitement des exports Marie
À chaque fois que l'utilisateur partage un export de données de Marie, le traiter (analyse pertes/incohérences/frictions, ingestion des résultats de tests) puis l'archiver dans le projet.

## 2026-08-19 — Vérifier la branche git en début de session
Vérifier systématiquement la branche git courante et sa divergence avec `main` (`git branch --show-current`, `git rev-list --count main..HEAD`) en tout début de session, avant tout travail — jamais supposer qu'une branche non-`main` est à jour. Incident du 2026-08-19 : plusieurs sessions de développement menées sur `sync-marie` sans vérifier sa divergence avec `main` (jamais fusionnée depuis le 2026-08-16), détecté juste avant un `/deploy`. Règle désormais intégrée à l'étape 3 de `.claude/commands/start.md`.
