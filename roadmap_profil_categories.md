# Roadmap — Catégories de profil et âge à l'onboarding

Créée le : 2026-10-11. Décisions de l'utilisateur (même date) :
- Les choix Adolescent / Étudiant / Adulte sont remplacés par une liste multi-choix : TSA, TDAH, SDI, Avec DI, Neurotypique, Je ne sais pas. « Je ne sais pas » est exclusif.
- L'âge (en années) est demandé sur le même écran (E02) et stocké.
- Catégories et âge modifiables dans Paramètres > Profil (E111).
- Utilisateurs déjà installés : liste vide, aucune conversion de l'ancienne valeur.
- Catégories et âge inclus dans la synchronisation Supabase (choix contre la recommandation de l'agent, risque exposé : données de santé) ; le texte du consentement (E04) est modifié en conséquence.
- Ajout du 2026-10-12 : catégorie « HPI » (cumulable) et bouton « ? » de définition par catégorie.
- Dérogation à `CLAUDE.md` § Roadmap : pas de checkpoint `/compact` entre les phases, sur demande explicite de l'utilisateur.

Décisions complémentaires (2026-10-11, après la première livraison du code) :
- « Neurotypique » est exclusif comme « Je ne sais pas » : le cocher décoche les autres catégories.
- Utilisateurs existants : écran de rattrapage (E02) à chaque ouverture tant que catégories et âge manquent.
- Consentement : renouvelé pour tout le monde (décision du 2026-10-11 : initialement limité aux administrateurs), une seule fois (version de consentement), à la première ouverture après le déploiement qui embarque ces écrans. Refuser retire le partage.
- La spec `DOCUMENTATION/40_specs/onboarding_accueil_navigation.md` est mise à jour directement.

Légende : `[TODO]` · `[EN COURS]` · `[FAIT]`. Une seule phase `[EN COURS]` à la fois. Statuts mis à jour par `/close`.

## Phase 1 — Modèle de données et règles [FAIT]

- `User` : `neuro_categories?: NeuroCategory[]`, `age?: number` ; `profile_type` devient optionnel et hérité (anciens enregistrements et anciens exports).
- Aucune migration Dexie : la table `users` n'est indexée que sur `id`, les nouveaux champs ne sont pas indexés.
- `src/domain/rules/profileRules.ts` : catégories et libellés, bascule avec exclusivité de « Je ne sais pas », validation de l'âge.
- `createUser` prend les catégories et l'âge ; nouveau `updateProfile` (écrit puis `syncNow`).
- Import : un profil sans `profile_type` est accepté, catégories et âge invalides sont écartés.
- Tests : règles, `createUser`, `updateProfile`, import (ancien et nouveau format), snapshot.

## Phase 2 — Écran d'onboarding et consentement [FAIT]

- `E02Profile` : cases à cocher des 6 catégories, champ âge, bouton « Continuer » désactivé tant qu'aucune catégorie ni âge valide.
- `E04Consent` : le texte « Ce qui est envoyé » mentionne les catégories choisies et l'âge, données de santé, avec le retrait possible du consentement.
- Tests unitaires `E02Profile` et `E04Consent`, e2e `helpers/reset.ts`, `01-onboarding.spec.ts`, `11-export-import-roundtrip.spec.ts`.

## Phase 3 — Paramètres et documentation [FAIT]

- `E111Profile` : édition des catégories et de l'âge, mention du partage quand le consentement est actif.
- Documentation du modèle (`_docs/docs de dev/6- MODÈLE DE DONNÉES & ARCHITECTURE BACKEND.md`).
- Gates : `tsc`, `eslint`, suite de tests complète, e2e d'onboarding.

## Phase 4 — Rattrapage, renouvellement du consentement, exclusivité [FAIT]

- Version du consentement (`syncConsent.ts`) : un consentement hérité ou tacite est de version ancienne ; l'export porte `sync_consent_version`, l'import la restaure.
- `startRoute.ts` : au démarrage et après un import, consentement à renouveler (tout consentement de version ancienne) puis rattrapage du profil (catégories ou âge manquants), puis destination.
- `E04Consent` : « Continuer sans partager » retire le consentement existant ; `E02Profile` : mode rattrapage (met à jour le profil existant).
- « Neurotypique » exclusif.
- Spec `DOCUMENTATION/40_specs/onboarding_accueil_navigation.md` mise à jour.
- Gates : `tsc`, `eslint`, suite de tests complète.
