# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-06-25)

## Actions ouvertes
- [P1|ouvert] Tests utilisateurs AuDHD réels (Phase 7)
  - fait quand: 5 à 10 sessions de test réalisées, résultats documentés dans un fichier dédié
  - réf: `roadmap.md` Phase 7
- [P1|ouvert] Valider fix scroll latéral mobile en build prod
  - fait quand: build prod lancé, DevResetButton absent, scroll latéral absent sur iOS Safari
  - réf: `src/index.css` — overflow-x: clip sur html/body

## Questions ouvertes

## Échéances

## Blocages

## Contexte chaud
- Phase 6 close — MVP stable, 46/46 E2E Playwright + 241 tests Vitest (99.34%), validé mobile physique
- Fix scroll latéral : overflow-x: clip posé, mais à revalider sans le bouton dev (position:fixed top-right qui déborde lui aussi)

## Dernière session (2026-06-25)

# Session du 2026-06-25 — fix scroll latéral mobile

## Décisions prises
- `overflow-x: clip` sur html/body : bloque le scroll latéral causé par le sr-only de dnd-kit (-1px hors viewport). À valider en build prod sans le bouton dev.

## Livrables produits ou modifiés
- `src/index.css` : overflow-x: clip sur html et body (remplace overflow-x: hidden + max-width)
- `src/main.tsx` : outil de debug débordement ajouté puis retiré (propre)

## Hypothèses validées / invalidées
- INVALIDE : overflow-x: hidden suffit → ne bloque pas les enfants position:fixed/absolute
- VALIDE : overflow-x: clip contraint aussi les enfants fixed/absolute — résout le cas dnd-kit sr-only
- EN ATTENTE : validation en build prod (sans DevResetButton)

## Prochaine étape exacte
1. Passer l'app en build prod et retirer l'affichage dev (DevResetButton)
2. Tester le scroll latéral sur mobile en prod pour confirmer le fix
3. Démarrer Phase 7 : recruter 5 à 10 utilisateurs AuDHD réels

## Question bloquante pour la session suivante
Le scroll latéral est-il résolu en mode prod sans le bouton dev ?
