# Contexte — TESTS

## Objectif

Préparer en parallèle l'accueil de testeurs et le remplacement progressif du Google Doc par des retours annotés dans l'application.

## État actuel

RETOURS : flux intégré dans `main` (fusion validée le 2026-09-05), en test dev sans synchro serveur.
ONBOARD : cadrage documentaire complet (Phases 1-3 FAIT), Phase 4 bloquée sur une répétition à
blanc et une relecture externe, hors portée de cette zone.

## Décisions structurantes

- 2026-09-04 : aucune fusion ni mise en production automatique.
- 2026-09-05 : fusion de `agent/retours` dans `main` validée explicitement par l'utilisateur,
  après rejeu des tests (tsc -b, lint, Vitest). `supabase/feedback.sql` volontairement non
  appliqué pour ce test dev.
