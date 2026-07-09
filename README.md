# Appli TSA/SDI/TDAH — AuDHD

Application neuroinclusive (web PWA + mobile) pour personnes AuDHD (TSA sans déficience intellectuelle + TDAH, 14–40 ans).

## Objectif

Agir comme un système externe de fonctions exécutives : réduire la charge mentale quotidienne, soutenir les routines, maintenir les relations sociales, gérer l'énergie. Pas un outil de productivité classique.

## Lancement local

```bash
npm install
npm run dev        # serveur de développement http://localhost:5173
npm run build      # build de production
npm run preview    # prévisualisation du build
npm test               # tests unitaires (Vitest)
npm run test:coverage  # couverture (seuil 85 %)
npm run test:e2e       # tests E2E Playwright (build + 45 scénarios)
npm run test:e2e:report  # ouvrir le rapport HTML Playwright
npm run lint       # ESLint
npm run format     # Prettier
```

## État actuel

V2 quasi close sur branche `v2` (V2-0 à V2-9 closes, V2-5 retirée). Reste sur V2-10 : doc V2, déploiement Netlify (test 13.2 mode offline validé). Tag `v1.0-mvp` + `dist/v1/` archivé (rollback opérationnel), `dist/v2/` à jour.

Branche `v3` active. Roadmap V3 (`roadmap_v3.md`, racine), 7 phases (V3-0 à V3-6) — **toutes closes.** Build de production basculé sur `dist/v3` (`vite.config.ts`). V3-3 (check-in + surcharge automatique) : surcharge dérivée de l'énergie du jour vs coût planifié restant (plus de toggle manuel), action « Reporter » sur les tâches non-obligatoires grisées implémentée (replanification automatique au lendemain, même créneau — décision provisoire non validée par Marie, voir `Note de réunion/a demander a Marie.md`), navigation restreinte au Dashboard et au Centre récupération en surcharge (confirmé intentionnel en test manuel).

**Modale de planification (E1/E2)** refondue en flux 3 étapes séquentielles : nom de la tâche (Valider) → grille de sélection d'énergie 1-12 avec option Passer → choix « Obligatoire ? » (deux boutons Oui/Non, finalisation directe).

**Phase V3-4** (Planning : couleurs, récurrence) : coût d'énergie affiché sur le planning, cases pastel (couleur d'ambiance configurable dans Accessibilité, `Settings.ambiance_color`) devenant flashy une fois la tâche terminée, bouton « Terminer » ajouté au planning (déjà présent au dashboard), « Planning du jour » du dashboard en cartes pastel comme « Tâche du jour », et récurrence (P6) : bouton « Répéter demain » sur chaque tâche planifiée, qui la duplique au lendemain au même créneau et ouvre directement le jour du duplicata.

**Phase V3-5** (Listes) : hiérarchie visuelle entre la vue globale des listes (grosses cases, `E60Lists.tsx` inchangé) et l'intérieur d'une liste (`E61ListDetail.tsx`) — éléments encadrés plus fin/serré (padding `--spacing-xs`, radius `--radius-sm`), titre de la liste encadré du même style que les listes en vue globale.

**Phase V3-6 close** (nav persistante, N1) : `BottomNav` monté une seule fois dans `App.tsx` en position fixe (bottom), affiché sur tous les écrans sauf l'onboarding et le check-in énergie quotidien — onglet actif mis en valeur, pastille rouge Todo conservée, 4ᵉ onglet « Accueil » ajouté pour revenir au Dashboard depuis n'importe quel écran. Test manuel passé intégralement le 2026-07-07 (`plan_test_manuel_v3-6.md`).

**Itérations UI hors phase** (roadmap V3 close) : titre du Dashboard renommé "Appli pour AuDHD" → "AuDHD" ; symbole d'énergie changé de cuillères à batterie (`BatteryIcon`/`BatteryCost`, remplace `SpoonIcon`/`SpoonCost`), affiché sur le Dashboard, le Planning, et désormais aussi sur les 3 écrans de check énergie (`E03Energy.tsx`, `E31EnergyCheckIn.tsx`, `E30EnergyView.tsx`) ; espacement des créneaux du Planning rendu symétrique (haut/bas égaux autour de la case de tâche), créneaux vides alignés sur la même hauteur qu'un créneau occupé ; bouton « Mode surcharge » de la TopBar désormais masqué (au lieu de grisé) hors surcharge — écart avec une demande explicite antérieure de Marie, à reconfirmer.

Tests unitaires verts (374 + ajustements E40Planning), `tsc -b` clean, `eslint` 0 erreur. Tests e2e Playwright : 44/44 verts.

## Stack

- React + TypeScript, PWA (Vite)
- Stockage local : IndexedDB via Dexie.js
- Chiffrement : Web Crypto API (AES-GCM / PBKDF2)
- Mobile futur : Capacitor (même codebase web)
- Sync cloud : post-MVP, Supabase région UE

## Structure

```
src/
  domain/    — logique métier pure (zéro import Dexie / React)
  data/      — repositories Dexie, migrations
  ui/        — composants React, écrans, hooks
  crypto/    — wrapper Web Crypto (AES-GCM, PBKDF2)
  app/       — point d'entrée, routing, providers
  test/      — setup Vitest, helpers partagés
docs/adr/    — Architecture Decision Records
_docs/       — Documentation produit (cahier des charges + 6 docs de dev)
_contexte/   — Contexte de session (protocole vibecoding)
roadmap_v3.md    — Roadmap V3 active (7 phases, pilotée par tests utilisateurs)
plan_test_manuel_v3-*.md — Plans de test manuel V3, un par phase
Archives/        — Roadmaps V1 et V2 archivées
Note de réunion/ — Transcriptions de visios testeurs + documents d'analyse générés (`/analyse_visio`)
```

## Prochaine étape

Roadmap V3 close. Deux fronts en parallèle : reconfirmer avec Marie le comportement de l'action « Reporter », la fréquence du check-in énergie (une fois par jour vs à chaque ouverture), le rythme du bouton « Répéter demain », et le masquage du bouton « Mode surcharge » hors surcharge — voir `Note de réunion/a demander a Marie.md` et `_contexte/signals.md` — et finaliser V2-10 sur la branche `v2` : mode offline (13.2), doc V2, déploiement Netlify.

## Licence

MIT — voir [LICENSE](LICENSE).
