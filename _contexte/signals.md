# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-07-21)

## Actions ouvertes

### Roadmap V4.1 active (`roadmap_v4.1.md`, Phase V4.1-3 à démarrer)
- [P1|ouvert] Phase V4.1-3 — Budget : configuration, état/actions dédiés, écran `E71Budget.tsx`, gestion des catégories et des livrets
  - fait quand: la configuration réelle prévue peut être reproduite, tests écran/contexte verts, validation manuelle faite et gate de phase coché.
  - réf: `roadmap_v4.1.md` § Phase V4.1-3
- [P2|ouvert] Phase V4.1-4 — Budget : usage courant, saisie des dépenses et dépôts, soldes, historique et corrections
  - fait quand: le flux complet configurer/saisir/consulter/corriger fonctionne, tests unitaires et e2e verts, validation manuelle faite et gate de phase coché.
  - réf: `roadmap_v4.1.md` § Phase V4.1-4

## Questions ouvertes
- Phase V4.1-3 : décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique.
- Reste hors périmètre V4.1 (voir `roadmap_v4.1.md` § Reporté hors V4.1) : liste courses « particulière » (besoin jamais précisé par Marie), intégration accueil du budget, date butoir Todo, retraits/virements livrets, câblage global du chiffrement.

## Échéances

## Blocages
Aucun.

## Contexte chaud
- Roadmap `roadmap_v4.1.md` active à la racine (branche `v4.1`) : phases V4.1-0 à V4.1-2 closes ; phases V4.1-3 et V4.1-4 restantes.
- Cadrage Budget acté avec l'utilisateur (pas encore avec Marie) : périodicités semaine+mois uniquement, reset auto par période avec historique conservé, pas d'intégration accueil en V4.1, livrets simples (dépôt seul, pas de retrait/virement), données en clair (pas de chiffrement, cohérent avec le reste du modèle actuel qui n'a jamais câblé le mécanisme AES-GCM existant).
- Phase V4.1-2 codée : quatre entités/tables Budget, migration Dexie v4→v5, quatre repositories et règles pures de périodes/calculs, sans UI ni chiffrement.
- Vérifications finales : 27/27 tests Budget verts, build et lint verts ; suite complète à 454/455 avec un échec intermittent pré-existant dans `AppContext.test.tsx` sur `scheduleSubTaskV2`.
- `getListItems` est stabilisé par `useCallback` et déclaré dans les dépendances du `useEffect` d'`E61ListDetail`, ce qui supprime l'avertissement lint.
- `AppContext.tsx` est déjà volumineux — vigilance en V4.1-3 : extraire la logique Budget si son ajout alourdit excessivement le contexte.

## Dernière session (2026-07-21, suite 6)

## Décisions prises
- Phase V4.1-2 close : modèle Budget stocké en clair dans quatre tables Dexie v5, calculs de période et de solde portés par des règles pures.

## Livrables produits ou modifiés
- `src/domain/entities/budget*.ts`, `src/data/repositories/budget*Repository.ts` : modèle Budget et accès aux données.
- `src/data/db.ts` : migration Dexie v5 avec quatre nouvelles tables ; test de migration v4 existante ajouté.
- `src/domain/rules/budgetRules.ts` : bornes semaine/mois, calculs par catégorie, totaux, reste non budgétisé et solde livret.
- Tests Budget : 27 tests ciblés verts ; build et lint verts.
- `src/app/AppContext.tsx`, `src/ui/screens/lists/E61ListDetail.tsx` : dépendance `getListItems` stabilisée, avertissement lint corrigé.
- `roadmap_v4.1.md` : Phase V4.1-2 marquée `[FAIT]`.

## Hypothèses validées / invalidées
- VALIDE : migration Dexie v4→v5 sans perte des données existantes ; règles Budget testées aux changements de semaine, mois et année.
- EN ATTENTE : interface de configuration et validation manuelle du Budget en Phase V4.1-3.

## Prochaine étape exacte
Démarrer la Phase V4.1-3 : état/actions Budget, écran `E71Budget.tsx`, gestion des catégories et livrets, puis tests et validation manuelle.

## Question bloquante pour la session suivante
Aucune.
