# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-06-25)

## Actions ouvertes
- [P1|ouvert] Tests utilisateurs AuDHD réels (Phase 7)
  - fait quand: 5 à 10 sessions de test réalisées, résultats documentés dans un fichier dédié
  - réf: `roadmap.md` Phase 7

## Questions ouvertes

## Échéances

## Blocages

## Contexte chaud
- Phase 6 close — MVP stable, 46/46 E2E Playwright + 241 tests Vitest (99.34%), validé mobile physique
- `crypto.randomUUID()` indisponible hors HTTPS : fallback `crypto.getRandomValues` dans `AppContext.tsx`
- Accès mobile local : `npm run dev -- --host` puis URL Network affichée par Vite

## Dernière session (2026-06-25)

# Session du 2026-06-25 — clôture Phase 6

## Décisions prises
- `crypto.randomUUID()` remplacé par un fallback `crypto.getRandomValues` dans AppContext pour compatibilité HTTP non-sécurisé (accès mobile par IP locale)
- Tests mobiles Phase 6 validés sur appareil physique réel — clôture Phase 6 officielle

## Livrables produits ou modifiés
- `src/app/AppContext.tsx` : fix newId() — fallback UUID v4 sans secure context

## Hypothèses validées / invalidées
- VALIDE : flux principaux (onboarding, tâche, énergie, offline) fonctionnels sur mobile physique réel
- VALIDE : accès réseau local via `npm run dev --host` opérationnel
- INVALIDE : `crypto.randomUUID()` disponible hors HTTPS → plante silencieusement sur IP locale

## Prochaine étape exacte
Phase 7 — Recruter 5 à 10 utilisateurs AuDHD réels, organiser les sessions de test, documenter les frictions.

## Question bloquante pour la session suivante
Aucune
