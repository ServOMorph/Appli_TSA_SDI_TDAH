# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-07-19)



## Actions ouvertes

### V4 — Roadmap active (racine `roadmap_v4.md`), issue de la visio Marie 2026-07-16
- [P3|ouvert] E3 — module budget/comptes + rubrique « Outil » remplaçant « Todo » : cadrage produit complet requis (gros chantier, reporté)
  - fait quand: cadrage fait avec Marie (périmètre, structure des données comptes, arborescence Outil)
  - réf: `Note de réunion/2026-07-16/constats_2026-07-18.md` E3 ; `roadmap_v4.md` § Reporté hors V4
- [P3|ouvert] Faire le ménage à la racine du projet
  - fait quand: fichiers/dossiers non pertinents à la racine identifiés et supprimés ou déplacés
  - réf: `roadmap_v4.md` § Divers (hors phases)

### V2 — reste en parallèle (branche `v2`)
- [P2|ouvert] Finaliser V2-10 : doc V2, déploiement Netlify — en suspens depuis le début du développement V3
  - fait quand: doc V2 à jour, déploiement Netlify effectué
  - réf: `Archives/roadmap_v2.md`

### Tests e2e
Aucune action ouverte. 45/45 tests e2e verts, dont le décochage d'une tâche planifiée. **À surveiller dès le codage de V4-3/V4-4** : ces phases modifient des éléments ciblés par les specs (« Répéter demain », mécanisme de « Reporter ») — gates e2e explicitées dans `roadmap_v4.md`.

## Questions ouvertes
- E3 seule question restante (`roadmap_v4.md` § Q à trancher) : cadrage produit complet requis, gros chantier reporté.

## Échéances

## Blocages
Aucun.

## Contexte chaud
- **Phase V4-2 close** : P1 à P3, 388/388 tests unitaires, 45/45 e2e et la validation manuelle complète sont verts.
- `taskCreateOrigin`/`setTaskCreateOrigin` est utilisé pour filtrer la destination « Planifier » depuis Todo et pour retourner vers l'écran d'origine depuis `E21CreateTaskV2`.
- `validation_manuelle.md` (racine) : validation V4-2 intégralement cochée, sans écart.
- Nav persistante : `BottomNav` rend une nav vide quand `overloadMode` est actif — toujours vrai en V4, piège pour les tests e2e.
- Serveur de test téléphone (dev) : `npm run dev -- --host`, adresse réseau affichée dans le terminal. Bouton « Reset DB » (dev) pour repartir d'une base propre avant test.

## Dernière session (2026-07-19)

## Décisions prises
- Les gates V4-1 et V4-2 sont clos après validation manuelle complète.
- Le cochage des tâches planifiées est réversible depuis le Planning et le Dashboard ; le créneau est conservé lors du décochage.

## Livrables produits ou modifiés
- `TopBar.tsx`, `E21CreateTaskV2.tsx` et leurs tests : B3/B4 corrigés.
- `E40Planning.tsx`, `E10Dashboard.tsx`, `E24Today.tsx`, `taskRepository.ts` et `ambiance.ts` : V4-2 P1 à P3 livrés.
- `e2e/01-onboarding.spec.ts`, `03-energy.spec.ts`, `05-overload.spec.ts` : scénarios alignés, dont le décochage réversible.
- `validation_manuelle.md`, `roadmap_v4.md`, `README.md` : V4-1 et V4-2 clôturées.

## Hypothèses validées / invalidées
- VALIDE : D2, D4, E7, B3, B4 et P1 à P3, en automatisé et validation manuelle.
- EN ATTENTE : cadrage du module budget (E3)

## Prochaine étape exacte
Démarrer la phase V4-3 (multi-créneaux et récurrence).

## Question bloquante pour la session suivante
Aucune — E3 reste ouverte (gros chantier reporté, sans impact sur V4-2 à V4-5).
