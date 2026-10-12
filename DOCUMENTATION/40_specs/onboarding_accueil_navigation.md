# Spécification — Onboarding, accueil et navigation

**Statut :** actuel (code consulté le 2026-09-16 ; profil, consentement et démarrage remis à jour le 2026-10-11)  
**Sources :** `src/app/AppContext.tsx`, `src/app/startRoute.ts`, `src/data/sync/syncConsent.ts`, `src/domain/rules/profileRules.ts`, `src/ui/components/NeuroCategoryPicker.tsx`, `src/app/navigation.ts`, `src/App.tsx`, `src/ui/screens/onboarding/E01Welcome.tsx`, `src/ui/screens/onboarding/E02Profile.tsx`, `src/ui/screens/onboarding/E03Energy.tsx`, `src/ui/screens/onboarding/E04Consent.tsx`, `src/ui/screens/dashboard/E10Dashboard.tsx`, `src/ui/screens/dashboard/E12WeekPlanning.tsx`.

## Objectif

Permettre l'entrée dans l'application, la création du profil local et l'accès aux parcours principaux.

## Parcours nominal

1. L'écran `E01` présente le bouton d'entrée ; il ouvre `E05`.
2. Dans `E05`, le code testeur est facultatif ; il est demandé avant tout le reste et sert à créer les réglages de l'utilisateur. Pour une identité administrateur (`marie`, `dev`), un champ mot de passe apparaît : s'il est renseigné, il est vérifié avant de continuer et seule la clé dérivée est conservée dans les réglages ; laissé vide, le code reste un code testeur ordinaire (rôle testeur).
3. Dans `E04`, le partage pour les tests est optionnel. Accepter enregistre le consentement ; refuser n'empêche pas la suite.
4. Dans `E02`, l'utilisateur coche une ou plusieurs catégories parmi TSA, TDAH, SDI, avec DI, HPI, neurotypique et « je ne sais pas », puis saisit son âge en années (1 à 120) ; cette action crée l'utilisateur local. « Neurotypique » et « Je ne sais pas » sont exclusifs : les cocher décoche toutes les autres catégories (et inversement, ils se décochent mutuellement).
5. Dans `E03`, il renseigne une énergie de 1 à 12 ou l'ignore, puis termine l'onboarding.
6. L'application ouvre le tableau de bord `E10`.

Au démarrage ultérieur, l'application ouvre le tableau de bord si une entrée d'énergie existe pour le jour ; sinon elle ouvre `E31` pour demander le relevé quotidien. Une erreur d'initialisation mène à `init-error`.

Deux écrans peuvent s'intercaler avant cette destination (`src/app/startRoute.ts`), dans cet ordre :

1. **Renouvellement du consentement** (`E04`) : pour toute personne dont le partage a été accepté avant l'envoi des catégories et de l'âge (version de consentement ancienne). Accepter enregistre la version courante ; refuser retire le partage. Dans les deux cas la question n'est plus posée.
2. **Rattrapage du profil** (`E02` en mode rattrapage) : pour tout utilisateur existant sans catégorie ni âge (ancien profil adolescent / étudiant / adulte, ou export antérieur). Il met à jour le profil existant puis mène à la destination, et revient à chaque ouverture tant qu'il n'est pas rempli.

Après un import, les mêmes écrans s'appliquent, et l'écran de consentement est aussi proposé à un appareil sans consentement.

## Accueil et navigation

Le tableau de bord affiche le planning, l'état d'énergie et les outils racine. Il propose l'accès au relevé d'énergie, aux ressources, aux retours, au centre de récupération si la surcharge est active, ainsi qu'aux dossiers, listes et budget.

La barre basse est visible hors onboarding, relevé d'énergie et parcours de retours. Elle donne accès à l'accueil, la Réception, la création de tâche et les paramètres. Les écrans accueil, relevé d'énergie, bienvenue et erreur réinitialisent la pile de navigation ; les autres écrans s'empilent et peuvent revenir à l'écran précédent.

Le planning hebdomadaire `E12` est accessible depuis l'accueil. Il affiche une semaine, permet de changer de période et ouvre le détail d'une tâche planifiée.

## Données et règles

- L'onboarding crée le profil et son paramétrage local avant sa clôture.
- Le consentement de partage est indépendant de la création du profil.
- Les catégories (données de santé) et l'âge font partie du profil synchronisé : le texte du consentement les mentionne, et le consentement porte une version (`syncConsent.ts`). Un consentement hérité (ou posé tacitement par l'historique de synchronisation) est de version ancienne.
- Catégories et âge sont modifiables dans Paramètres > Profil, qui rappelle l'envoi quand le partage est actif.
- Le bouton de validation du relevé d'énergie reste indisponible tant qu'aucune valeur n'est choisie ; l'action « Ignorer » constitue l'alternative explicite.
- Les outils ne sont pas affichés sur l'accueil lorsque le mode surcharge est actif.

## Erreurs et limites

- Un échec d'initialisation mène à un écran dédié, sans parcours de récupération détaillé dans cette spécification.
- L'absence de consentement bloque l'envoi distant, non l'usage local ni la création de retours.

## Critères d'acceptation

- L'utilisateur peut atteindre l'accueil après avoir accepté ou refusé le partage, choisi ses catégories, renseigné son âge et renseigné ou ignoré l'énergie.
- Un profil déjà finalisé est dirigé vers l'accueil ou le relevé quotidien selon l'existence de l'entrée du jour ; un profil sans catégorie ni âge passe d'abord par le rattrapage.
- Les quatre destinations de la barre basse ouvrent les écrans attendus.
- Le retour ne duplique pas une route identique et les écrans racine repartent d'une pile neuve.

## Preuves existantes

Les comportements ci-dessus sont tracés dans les composants et la navigation cités en sources. La recherche des tests ciblant ces écrans n'a pas retourné de fichier dédié.
