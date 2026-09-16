# Spécification — Onboarding, accueil et navigation

**Statut :** actuel (code consulté le 2026-09-16)  
**Sources :** `src/app/AppContext.tsx`, `src/app/navigation.ts`, `src/App.tsx`, `src/ui/screens/onboarding/E01Welcome.tsx`, `src/ui/screens/onboarding/E02Profile.tsx`, `src/ui/screens/onboarding/E03Energy.tsx`, `src/ui/screens/onboarding/E04Consent.tsx`, `src/ui/screens/dashboard/E10Dashboard.tsx`, `src/ui/screens/dashboard/E12WeekPlanning.tsx`.

## Objectif

Permettre l'entrée dans l'application, la création du profil local et l'accès aux parcours principaux.

## Parcours nominal

1. L'écran `E01` présente le bouton d'entrée ; il ouvre `E04`.
2. Dans `E04`, le partage pour les tests est optionnel. Accepter enregistre le consentement ; refuser n'empêche pas la suite.
3. Dans `E02`, l'utilisateur choisit un profil parmi adolescent, étudiant ou adulte ; cette action crée l'utilisateur local.
4. Dans `E03`, il renseigne une énergie de 1 à 12 ou l'ignore, puis termine l'onboarding.
5. L'application ouvre le tableau de bord `E10`.

Au démarrage ultérieur, l'application ouvre le tableau de bord si une entrée d'énergie existe pour le jour ; sinon elle ouvre `E31` pour demander le relevé quotidien. Une erreur d'initialisation mène à `init-error`.

## Accueil et navigation

Le tableau de bord affiche le planning, l'état d'énergie et les outils racine. Il propose l'accès au relevé d'énergie, aux ressources, aux retours, au centre de récupération si la surcharge est active, ainsi qu'aux dossiers, listes et budget.

La barre basse est visible hors onboarding, relevé d'énergie et parcours de retours. Elle donne accès à l'accueil, la Réception, la création de tâche et les paramètres. Les écrans accueil, relevé d'énergie, bienvenue et erreur réinitialisent la pile de navigation ; les autres écrans s'empilent et peuvent revenir à l'écran précédent.

Le planning hebdomadaire `E12` est accessible depuis l'accueil. Il affiche une semaine, permet de changer de période et ouvre le détail d'une tâche planifiée.

## Données et règles

- L'onboarding crée le profil et son paramétrage local avant sa clôture.
- Le consentement de partage est indépendant de la création du profil.
- Le bouton de validation du relevé d'énergie reste indisponible tant qu'aucune valeur n'est choisie ; l'action « Ignorer » constitue l'alternative explicite.
- Les outils ne sont pas affichés sur l'accueil lorsque le mode surcharge est actif.

## Erreurs et limites

- Un échec d'initialisation mène à un écran dédié, sans parcours de récupération détaillé dans cette spécification.
- L'absence de consentement bloque l'envoi distant, non l'usage local ni la création de retours.

## Critères d'acceptation

- L'utilisateur peut atteindre l'accueil après avoir accepté ou refusé le partage, choisi un profil et renseigné ou ignoré l'énergie.
- Un profil déjà finalisé est dirigé vers l'accueil ou le relevé quotidien selon l'existence de l'entrée du jour.
- Les quatre destinations de la barre basse ouvrent les écrans attendus.
- Le retour ne duplique pas une route identique et les écrans racine repartent d'une pile neuve.

## Preuves existantes

Les comportements ci-dessus sont tracés dans les composants et la navigation cités en sources. La recherche des tests ciblant ces écrans n'a pas retourné de fichier dédié.
