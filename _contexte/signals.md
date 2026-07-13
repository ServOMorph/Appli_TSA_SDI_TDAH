# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-07-13)



## Actions ouvertes

### V4 — Roadmap brouillon (dossier réunion), issue de la visio Marie 2026-07-13
- [P2|ouvert] B1 — couleur d'ambiance non propagée aux boutons « Ajouter une tâche »/« Nouvelle liste »
  - fait quand: Q validée (périmètre : ces 2 boutons ou tous les boutons primaires) puis phase V4-1 codée
  - réf: `Note de réunion/2026-07-13/constats_2026-07-13.md` B1 ; `Note de réunion/2026-07-13/roadmap_v4.md` V4-1
- [P3|ouvert] D1 — libellé « Todo » → « To Do »
  - fait quand: phase V4-1 codée (`BottomNav.tsx:99`, `E20Inbox.tsx:135`)
  - réf: `Note de réunion/2026-07-13/roadmap_v4.md` V4-1
- [P2|ouvert] E1 — déplacement tactile (appui long + glisser) d'une tâche du planning, 4 directions
  - fait quand: Q validée (glisser vers date passée autorisé ?) puis phase V4-3 codée
  - réf: `Note de réunion/2026-07-13/constats_2026-07-13.md` E1 ; `Note de réunion/2026-07-13/roadmap_v4.md` V4-3
- [P2|ouvert] E2 — tâche planifiée sur plusieurs créneaux (sélection début→fin, occupation visuelle)
  - fait quand: Q validée (gestion chevauchement, comptage du coût énergétique) puis phase V4-2 codée
  - réf: `Note de réunion/2026-07-13/constats_2026-07-13.md` E2 ; `Note de réunion/2026-07-13/roadmap_v4.md` V4-2
- [P3|ouvert] D2 — libellés du check-in énergie « aujourd'hui » → « maintenant »
  - fait quand: Q validée (formulation exacte) puis phase V4-1 codée
  - réf: `Note de réunion/2026-07-13/constats_2026-07-13.md` D2 ; `E31EnergyCheckIn.tsx:56,58`
- [P3|ouvert] E3 — module de gestion de comptes/budget intégré (reporté hors V4)
  - fait quand: cadrage produit complet fait avec Marie (périmètre, structure des données)
  - réf: `Note de réunion/2026-07-13/constats_2026-07-13.md` E3
- [P2|ouvert] Q1 — pertinence du bouton « Répéter demain » remise en question par Marie, idée alternative non captée (visio coupée)
  - fait quand: reprise avec Marie à la prochaine visio, décision actée (garder/retirer/remplacer)
  - réf: `Note de réunion/2026-07-13/constats_2026-07-13.md` Q1

### V3 — reste à valider avec Marie (non traité lors de la visio du 2026-07-13, écourtée)
- [P2|ouvert] Reconfirmer avec Marie le comportement de l'action « Reporter » (E6) — implémenté à titre provisoire (replanification au lendemain, même créneau), non validée par elle sur ce mécanisme précis
  - fait quand: réponse de Marie obtenue et, si besoin, comportement ajusté en conséquence
  - réf: `Note de réunion/a demander a Marie.md` ; `postponeTaskV2` (`taskRulesV2.ts`), `postponeTask` (`AppContext.tsx`)
- [P2|ouvert] Reconfirmer avec Marie la fréquence du check-in énergie (une fois/jour vs à chaque ouverture de l'app) — Marie a dit « à chaque connexion » mais hésite elle-même dans la transcription
  - fait quand: réponse de Marie obtenue, comportement ajusté si besoin (actuellement : une fois par jour calendaire, re-saisie libre via bouton "Modifier")
  - réf: `Note de réunion/a demander a Marie.md` ; `AppContext.tsx` `init()`, `todayDate()`
- [P2|ouvert] Reconfirmer avec Marie le masquage du bouton « Mode surcharge » hors surcharge (`TopBar.tsx`) — retiré le 2026-07-07 sur demande de l'utilisateur, **contredit la demande explicite antérieure de Marie** (bouton visible, grisé, informatif hors surcharge)
  - fait quand: décision actée avec Marie (masquage confirmé ou bouton informatif réintroduit)
  - réf: `Note de réunion/a demander a Marie.md` ; `TopBar.tsx`
- [P3|ouvert] Planification indépendante des sous-tâches (chaque `SubTask` planifiable à son propre horaire) — décision explicitement reportée
  - fait quand: décision produit prise sur l'implémentation (piste retenue si besoin confirmé : chaque sous-tâche devient sa propre `TaskV2` avec `parent_task_id` optionnel)
  - réf: `Archives/roadmap_v2.md` § "Fonctionnalité reportée (décision 2026-07-06)"
- [P2|ouvert] Finaliser V2-10 (branche `v2`) : doc V2, déploiement Netlify — resté en suspens pendant tout le développement V3. Test 13.2 (mode offline) validé le 2026-07-09 sur `dist/v3`.
  - fait quand: doc V2 à jour, déploiement Netlify effectué
  - réf: `Archives/roadmap_v2.md`

### Tests e2e
Aucune action ouverte. 44/44 tests e2e verts (état V3, aucun code touché depuis).

## Questions ouvertes
- Voir section "Q à trancher" de `Note de réunion/2026-07-13/roadmap_v4.md` (B1, D2, E1, E2) — à valider avec Marie avant de démarrer le code V4.

## Échéances

## Blocages
Aucun.

## Contexte chaud
- **Visio Marie du 2026-07-13 écourtée** (« pas eu le temps de tout faire, on continue plus tard ») — les 4 points de validation V3 en attente n'ont pas été abordés. `roadmap_v4.md` est un **brouillon** dans `Note de réunion/2026-07-13/`, pas encore promu à la racine ni codé.
- **Roadmap V3 intégralement close (2026-07-07)**, code inchangé depuis le 2026-07-09.
- Nav persistante (Phase V3-6) : `BottomNav` monté une seule fois dans `App.tsx` (position fixe), affiché sur tous les écrans sauf onboarding et check-in énergie. **BottomNav rend une nav vide quand `overloadMode` est actif** — piège pour les tests e2e (naviguer via un bouton d'écran plutôt que la nav du bas pendant une surcharge).
- Couleur d'ambiance configurable (`Settings.ambiance_color`, Accessibilité) — pilote aujourd'hui uniquement les couleurs pastel/flashy du planning et du dashboard, pas les boutons primaires (voir B1 ci-dessus).
- **Mode surcharge 100% automatique depuis V3-3** : plus de toggle manuel. Déclenchement via coût énergétique planifié dépassant l'énergie du jour restante.
- `TaskV2` porte déjà `scheduled_start`/`scheduled_end` (`taskV2.ts`) mais `E40Planning.tsx` ne raisonne qu'au créneau de début (`taskSlot`) — base de la phase V4-0/R1 (E2).
- Serveur de test téléphone (dev V3) : `npm run dev -- --host`, adresse réseau affichée dans le terminal. Bouton "Reset DB" (dev) pour repartir d'une base propre avant test.

## Dernière session (2026-07-13)

## Décisions prises
Aucune décision de code actée — session d'analyse uniquement (aucun fichier `src/` touché).

## Livrables produits ou modifiés
- `Note de réunion/2026-07-13/constats_2026-07-13.md` : créé — 7 constats (B1, D1, E1, E2, E3, D2, Q1)
- `Note de réunion/2026-07-13/roadmap_v4.md` : créé — brouillon roadmap V4, 4 phases (V4-0 à V4-3), non promu à la racine

## Hypothèses validées / invalidées
- EN ATTENTE : périmètre exact de B1 (accent global vs 2 boutons), formulation D2, gestion du chevauchement/coût pour E2, autorisation date passée pour E1 — à trancher avec Marie.

## Prochaine étape exacte
Reprendre la visio avec Marie : traiter les 4 points V3 non couverts (Reporter, check-in, bouton surcharge, sous-tâches) + capter la suite de Q1 (alternative à « Répéter demain », coupée dans la transcription) + trancher les Q de `roadmap_v4.md` avant de démarrer le code.

## Question bloquante pour la session suivante
Aucune (pas de blocage technique — la suite dépend d'une disponibilité de Marie, hors du contrôle de la session dev).
