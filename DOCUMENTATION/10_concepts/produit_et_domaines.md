# Produit et domaines fonctionnels

Statut : actuel
Dernier contrôle : 2026-09-16
Sources : `README.md`, `src/App.tsx`, `src/app/navigation.ts`, `src/domain/entities/`, tests associés dans `src/**/*.test.tsx` et `e2e/`

## Objet du produit

Assistant AuDHD est une application web progressive destinée aux personnes AuDHD (TSA et TDAH).
Elle vise à alléger la charge mentale en soutenant les fonctions exécutives dans l'organisation
quotidienne. Le produit reste utilisable localement, sans compte cloud.

## Utilisateurs et rôles

- Utilisateur final : organise ses tâches, son planning, son énergie, ses outils personnels et ses
  données locales.
- Testeur : utilise l'application et peut signaler un retour depuis celle-ci. Ce rôle n'est pas
  représenté par une entité distincte dans l'interface applicative actuelle.
- Équipe : répond aux retours via le service de synchronisation ; ce rôle est extérieur au client
  React et n'est pas une session applicative documentée ici.

## Domaines fonctionnels visibles dans l'application

| Domaine | Finalité | Écrans associés |
| --- | --- | --- |
| Accueil et profil | démarrer l'application, recueillir le consentement de synchronisation et configurer le profil | E01 à E04 |
| Tâches et planning | recevoir, créer, détailler, décomposer et planifier des tâches | E20 à E23, E12 |
| Énergie et surcharge | saisir l'énergie et accéder au mode de récupération | E03, E31, E90 |
| Outils personnels | gérer listes, dossiers, compteurs et budget | E61 à E78 |
| Paramètres et données | profil, accessibilité, vie privée, export et import | E110 à E117 |
| Retours | capturer un retour annoté, suivre les réponses et le valider | E122 à E124 |
| Ressources | consulter les ressources intégrées | E120 |

Les codes d'écran et les routes sont définis dans `src/App.tsx` et `src/app/navigation.ts`.
Les règles détaillées de chaque domaine sont volontairement reportées aux concepts et
spécifications dédiés à venir.

## Limites actuelles de cette cartographie

- La présente page décrit les domaines exposés par le client actuel ; elle ne constitue pas une
  spécification de leurs règles métier.
- La documentation historique peut employer des termes ou décrire des écrans retirés. Elle ne
  prévaut pas sur le code actuel et les tests associés.
- Le produit comporte une synchronisation optionnelle. Elle ne change pas le fait que le stockage
  applicatif principal est local ; voir la décision d'architecture.
