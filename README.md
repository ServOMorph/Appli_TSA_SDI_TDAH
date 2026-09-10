# Assistant AuDHD — planification et gestion d'énergie neuroinclusive

Assistant AuDHD est une application web progressive (PWA) conçue pour aider les personnes AuDHD (TSA et TDAH) à alléger leur charge mentale. Construite avec React, TypeScript, Vite et Dexie.js, elle fournit un système local de soutien aux fonctions exécutives : tâches, planification, énergie, outils personnels et tests manuels.

**English summary.** Assistant AuDHD is a neuroinclusive React and TypeScript PWA for autistic and ADHD people. It stores data locally with IndexedDB and helps users manage tasks, daily planning, energy, and personal tools without a cloud account.

![Écran d'accueil de l'application Assistant AuDHD](_docs/images/onboarding.png)

## Fonctionnalités

- Réception et gestion de tâches, avec sous-étapes, durée, récurrence et exceptions.
- Planification quotidienne et suivi d'énergie, avec un mode de récupération en cas de surcharge.
- Listes, dossiers et outil Budget, organisés pour réduire les frictions de l'usage quotidien.
- Export et import local des données ; le stockage applicatif repose sur IndexedDB.
- Catalogue de tests manuels en langage clair, destiné à recueillir et archiver les retours d'usage.

## État actuel

Au 10 septembre 2026, la **v5.92** reste en production et un lot de travail non déployé s'est accumulé (jusqu'à la v5.120 du journal des changements) : améliorations d'affichage, corrections de fiabilité, correctif de zoom sur iPhone, refonte de la fiche de tâche, et les premières briques du dispositif d'accueil de testeurs additionnels (écran de consentement à la synchronisation, code testeur dans le profil). La refonte du dispositif d'accueil des testeurs est planifiée en six phases (`roadmap_integration_onboard.md`) : les cinq premières sont réalisées, la sixième — généraliser le nommage aujourd'hui centré sur une seule personne — est cadrée pour transformer aussi bien la testeuse principale que le développeur en testeurs identifiés par un code, sur le même modèle que les nouveaux testeurs. Elle sera menée après le prochain déploiement.

Le 10 septembre 2026, la campagne de tests automatisés de bout en bout, passée au rouge (22 échecs sur 59) et jamais rejouée faute de mise en ligne depuis la v5.92, a été réparée : **59 tests sur 59 au vert** (deux exécutions consécutives). Les échecs venaient de dérives entre les tests et l'application, accumulées sans mise en ligne : le nouvel écran de consentement inséré dans le parcours d'accueil, la durée devenue obligatoire pour planifier une tâche à une heure, des libellés d'écrans du Budget renommés, un bouton d'action rendu ambigu par le bouton flottant « Signaler un retour ». Un défaut applicatif a été corrigé au passage : la fiche d'une tâche planifiée n'affichait pas tout de suite une modification faite sur place (titre, horaire, date) tant qu'on ne quittait pas l'écran. Le déploiement du lot n'est plus bloqué.

La version **v5.92** est en production (déployée le 5 septembre 2026). Elle met en ligne `roadmap_demandes_marie_2026-09-04.md` (demandes 33 reprise Doc, 34 à 38) et `roadmap_supprimer_tache_du_jour.md` (Phases 1-2) : le bandeau des jours de l'accueil, le logo énergie et les cartes des outils n'ont plus de fond coloré (contour seul) ; un nouveau réglage dans Paramètres > Accessibilité permet de créer des catégories de couleur pour les tâches, reprises ensuite comme raccourci de couleur à la création ; la fiche de tâche est refaite (bandeau titre coloré, informations en cases sur deux colonnes modifiables directement au clic, l'écran de création reprend la même présentation) et remplace le correctif abandonné du cadre Date/Heure ; le glissement du bandeau des jours ne saute plus d'un coup à la fin du geste ; la catégorie « Tâche du jour » est retirée, ajouter une tâche depuis la Réception ne demande plus que le titre. La dernière phase de `roadmap_supprimer_tache_du_jour.md` reste bloquée en attendant la réponse de Marie sur le point d'entrée de l'accueil. Le message annonçant cette livraison a d'abord été retenu par le contrôle qualité interne : un trou dans le catalogue de tests manuels (la refonte de la fiche de tâche n'avait aucun test associé) a été comblé le 6 septembre 2026, et le message a ensuite été envoyé — douze parcours attendent Marie dans l'écran « Tests à faire ».

Le 6 septembre 2026, Marie a signalé par capture d'écran (retour « E10 ») que ses retours envoyés depuis l'application restaient bloqués sur « Échec d'envoi ». Le flux de retours annotés avait été mis en ligne avec la v5.92 sans sa partie serveur : la base, la fonction d'enregistrement et l'espace de stockage des images n'avaient jamais été créés côté Supabase. Ce socle serveur (`supabase/feedback.sql`) a été appliqué en production le jour même ; un message a été envoyé à Marie pour qu'elle relance ses retours en échec et confirme leur passage à « Envoyé ». Le même retour demandait aussi un changement d'affichage des sous-tâches dans la carte d'une tâche : c'est fait le 7 septembre 2026 — les sous-tâches dépliées tiennent maintenant dans la carte, qui s'agrandit au besoin, et l'heure de fin de la tâche s'aligne sur la dernière sous-tâche. Par ailleurs, la contradiction sur la base de tests (« 783 tests verts » annoncés alors que les outils échouaient localement) est levée : après réinstallation à l'identique des dépendances dans une copie de travail isolée, la suite complète repasse au vert (783 tests) — la cause était une installation locale incomplète, pas le code.

La roadmap de fiabilisation et de refactorisation (`roadmap_refactorisation_2026-09-06.md`, huit phases) est réalisée jusqu’à la phase 6 : les commentaires de livraison sont rangés hors de la racine, l’import est validé et atomique, les nouvelles séries de tâches ne créent plus de dates au-delà de leur horizon de 90 jours, la création, la modification et la suppression d’une série de tâches sont désormais tout-ou-rien (un incident en cours d’opération est annulé entièrement, sans série à moitié écrite ni règle de répétition orpheline), et les appels réseau de synchronisation abandonnent au bout de 30 secondes au lieu de rester bloqués : un envoi de retour qui n’aboutit pas repasse en « Échec » et peut être relancé sans doublon. Les séries déjà créées restent intactes ; aucun changement de protocole côté serveur. Les deux dernières phases (7 et 8), des refactorisations conditionnelles, ont été reportées le 8 septembre 2026 faute de bénéfice mesuré, et la roadmap a été archivée. Les contrôles complets comptent 817 tests passants.

Le 8 septembre 2026, la friction signalée par Marie « la page zoome quand je touche "Ajouter" depuis la Réception » est corrigée : sur iPhone, toucher un champ de saisie dont le texte est plus petit que 16 pixels fait zoomer la page sans qu'elle revienne. Une règle d'affichage globale fixe désormais une taille minimale de 16 pixels pour tous les champs de l'application (tout en respectant le réglage « grande » taille de texte de l'accessibilité) ; vérifié sur un vrai iPhone. Trois contrôles développeur en attente ont par ailleurs été passés (import d'un fichier invalide, horizon d'une série de tâches répétées, opérations « toute la série ») ; le contrôle de coupure réseau, non reproductible sans serveur de synchronisation local, sera confié à Marie au prochain déploiement.

Le 6 septembre 2026, le processus `/deploy` a été durci sans changement pour l'application : il refuse désormais de déployer tant qu'une roadmap a une phase en cours, avertit quand une roadmap n'est livrée qu'en partie, et propose d'archiver les roadmaps terminées. Le commentaire de livraison n'est plus publié sous forme de lien Google Drive public : il est déposé dans le dossier Drive partagé (accès restreint aux comptes autorisés) et référencé par son nom de fichier. Trois résidus techniques ont aussi été corrigés : le titre de l'onglet du navigateur, un décalage de date en mode développeur, et un bouton HTML imbriqué dans la ligne de tâche du planning. Les références à une ancienne branche Git supprimée (`sync-marie`) ont ensuite été retirées des commandes `/start` et `/close`, et la file d'attente des contrôles manuels développeur a été vidée : hooks de début et de fin de session (zones `discord` et racine), file d'attente des commandes du bot Discord et sauvegarde du dernier snapshot de Marie à la clôture, tous vérifiés en conditions réelles.

Le 5 septembre 2026, un mécanisme générique de « hooks de zone » a été ajouté à `/start` et `/close` : chaque zone peut définir ses propres actions de début/fin de session (`_contexte/on_start.md`/`on_close.md`), au lieu d'accumuler des cas particuliers dans les commandes génériques. La zone `discord` (relance/arrêt automatique du bot) et la zone racine (sauvegarde Supabase, copie Drive) l'utilisent déjà. La messagerie Discord peut désormais transporter une pièce jointe (utile pour les échanges trop longs pour un simple message).

`roadmap_demandes_marie_2026-09-02.md` (demandes 23 à 33) est complète et déployée : texte des tâches sans couleur lisible une fois cochées ; couleur d'un outil appliquée à sa carte d'accueil ; sur le planning, nom et heure de début en haut de la case, heure de fin en bas, durée obligatoire pour planifier une tâche à une heure ; l'outil « Comptes » renommé « Mon compte » et l'écran Budget équivalent renommé « Prévisions » ; « Solde du mois » en tête de « Mon compte » qui baisse à chaque dépense ; carte « Prévisions » du Budget en positif et vert ; réglage de couleur pour la carte « Mon compte » ; retour de l'écran d'énergie directement vers l'accueil, avec suppression de l'ancien écran « Mon énergie » ; sous-tâches d'un élément de liste dépliables et cochables depuis la page de la catégorie ; et la correction des cadres qui débordaient à droite dans Paramètres > Accessibilité et dans le formulaire de tâche (traitée sur deux captures d'écran de Marie). Marie doit maintenant valider ces changements sur son téléphone : seize parcours l'attendent dans l'écran « Tests à faire ».

La synchronisation automatique des données de test vers Supabase (livrée en v5.69) reste en place : les données de chaque appareil sont sauvegardées toutes seules, sans export ni envoi manuel. Un script développeur (`scripts/backup_marie_snapshot.py`, lancé à chaque `/start` et `/close`) archive une copie datée du dernier snapshot de Marie dans `donnees_marie/`, pour pallier l'absence d'historique côté Supabase.

La roadmap `roadmap_sav_snapshot_marie.md` (trois phases) est close : les dix défauts relevés au test du 1er septembre 2026 sont corrigés. Une coupure réseau donne maintenant un message court au lieu d'une longue erreur technique ; une sauvegarde n'est réécrite que si le contenu a réellement changé (et non à chaque changement d'heure de synchronisation) ; le nom de fichier est horodaté en temps universel sans ambiguïté ; le script refuse d'écrire une sauvegarde vide. L'accès à Supabase est désormais partagé entre le script de sauvegarde et le script de lecture développeur. Un nettoyage du dossier `donnees_marie/` est disponible à la demande (`--prune`), jamais automatique. Une batterie de 31 tests automatiques couvre ces comportements. La sauvegarde est lancée à l'ouverture **et** à la clôture de chaque session de travail, pour raccourcir le délai pendant lequel une perte de données chez Marie pourrait effacer la dernière copie utilisable.

Le point rouge « Tests à faire » de l'accueil et la liste associée (commit `2d5c0b8`, déployé en v5.84) s'éteignent désormais dès qu'un test a été passé, qu'il soit marqué « Validé » ou « Non validé », et ne se rallument que pour un test neuf ou un test corrigé à repasser. Cela répond au retour de Marie du 1er septembre 2026. La roadmap `roadmap_sync_marie.md` est close et archivée : les données de Marie arrivent uniquement par synchronisation automatique, `/deploy` analyse le dernier snapshot Supabase archivé par `/start` et le traitement d'un export manuel devient un simple repli.

La roadmap `roadmap_gateway_discord_service.md` (trois phases) est close et archivée : l'agent DISCORD est devenu le point de contact unique du canal — il filtre la pertinence des messages sortants vers Marie (gardien de sortie), collecte et répartit tous les messages entrants vers le bon agent, et l'envoi réel de la file d'attente Discord est automatique (plus aucun envoi manuel). La troisième phase a été livrée sans mécanisme de « hooks » : toute la communication Discord se gère dans une session dédiée (`/discord_loop`, lancée automatiquement par `/start discord`) et les autres sessions ne s'en occupent que sur demande explicite. Un guide de forme (`DISCORD/discord_com/gateway/STYLE.md`) fixe le ton et les formulations des messages sortants, par destinataire, relu avant chaque validation d'envoi. Certains contrôles manuels développeur sont désormais délégués à `/discord_loop` (convention `[discord-auto]` dans `tests_manuels.md`) : ils se valident tout seuls au fil de l'usage normal de la boucle. `/start` et `/close` (zone racine) relisent ce fichier en miroir, pour ne jamais perdre ce qui a été validé côté `discord` entre deux sessions.

Le 3 septembre 2026, Marie a transmis les deux captures d'écran demandées (Paramètres et formulaire de tâche) : la phase 10 de `roadmap_demandes_marie_2026-09-02.md` a été débloquée et corrigée le jour même, puis `/deploy` a été relancé (cible v5.84). Marie a depuis testé la v5.84 sur son téléphone : huit nouveaux résultats de parcours, dépouillés et réconciliés dans le registre de suivi des demandes — le débordement de l'écran Paramètres (#32) est validé, celui du formulaire de tâche (#3) échoue pour la 3e fois (nouvelle piste identifiée, appareil de Marie inconnu).

La roadmap `roadmap_supprimer_tache_du_jour.md` (demande de Marie du 4 septembre 2026, hors Google Doc) est en cours, pas encore déployée : la catégorie « Tâche du jour » est retirée du code (les tâches déjà classées ainsi repartent automatiquement en Réception) et l'ajout d'une tâche depuis la Réception ne demande plus que son titre. La dernière phase — une tâche ajoutée depuis l'accueil serait planifiée d'office — reste bloquée en attendant la réponse de Marie sur le point d'entrée concerné.

Les branches Git obsolètes ont été supprimées le 31 août 2026 et `main` a été vérifié (build, tests et lint verts, arbre propre, synchronisé avec le distant). Les roadmaps `roadmap_bundle_2026-08-31.md` (bundle JavaScript ramené de 767 à 242 ko, −68 % : retrait de la bibliothèque cliente Supabase du navigateur, chargement différé des écrans, garde-fou automatique bloquant tout déploiement en cas de régression de taille) et `roadmap_e2e_2026-09-01.md` (57 tests end-to-end repassés au vert) sont closes et archivées dans `Archives/`. Le travail du bundle a été déployé en v5.84.

La roadmap `roadmap_planning_accueil_2026-08-29.md` (demandes 18-22 du Google Doc « Modifications » de Marie, toutes « Accueil / Planning », 5 phases) est close et archivée : hauteur de planning fixe sans plier/déplier, cases de tâches colorées sur toute leur hauteur, bandeau des jours au fond coloré (pas seulement le contour), défilement interne des jours avec grossissement du jour central, et nouvelle vue « Planning de la semaine » en pleine page (sept jours côte à côte, tâches en icônes, navigation identique à l'accueil). Les phases 1 et 2 étaient déjà en ligne avec v5.69 ; les phases 3, 4 et 5 sont déployées avec v5.84. Marie a tranché la navigation de la vue semaine (par semaine si les sept jours tiennent à l'écran, sinon par jour) ; ce point reste à confirmer sur son téléphone.

La version **v5.63** ajoute un registre de suivi des demandes du Google Doc de Marie réconcilié par `/analyser_googledoc`, `/deploy` et `/traiter_export_marie`, plus le champ `docRefs` du catalogue de tests.

La version **v5.62** rallume le point rouge de l’icône « Tests à faire » dès qu’un test reste à valider (révision comprise), en suivant exactement la liste de l’écran « Tests à faire ».

La version **v5.61** ajoute les montants temporaires par catégorie et période ; le parcours « Suivre ses dépenses avec Comptes » a été validé par Marie le 27 août.

Les roadmaps des 23 et 24 août sont archivées ; la roadmap du 25 août est livrée : retrait de « Terminer », couleur des outils dans Paramètres et accès direct à la modification d’énergie. La décision #11 reste à confirmer avec Marie pour les catégories mensuelles.

La version **v5.60** est déployée en production (voir le [CHANGELOG](CHANGELOG.md), HTTP 200 vérifié le 27 août 2026). Le parcours de tests manuels de Marie réaffiche désormais chaque test dont les étapes ont changé ; une validation est associée à la révision testée. Les tests sont regroupés en 7 catégories, repliées par défaut.

`roadmap_demandes_marie_2026-08-24.md` (17 demandes numérotées) est livrée avec v5.56 : menu de fiche de tâche simplifié, Budget repassé sur les montants prévus, ajout de dépense via la fiche de catégorie, formulaire de catégorie de liste corrigé sur mobile et retour direct à l’accueil après validation de l’énergie. Les décisions #7 (contenu de « Montant total ») et #11 (prévision limitée à une semaine) restent à clarifier avec Marie.

Le déploiement public est disponible sur [appli-audhd.netlify.app](https://appli-audhd.netlify.app).

Les éléments à transmettre à Marie sont centralisés dans [COMMUNICATION/Marie/a_transmettre.md](COMMUNICATION/Marie/a_transmettre.md) ; chaque déploiement en conserve une copie versionnée et la publie sur Drive.

Le flux de retours annotés (capture d'écran, annotation au crayon, code d'écran visible, commentaire), conçu dans la branche isolée `agent/retours`, a été relu et fusionné dans `main` le 5 septembre 2026 après rejeu de la suite de tests. Sa partie interface a été mise en ligne avec la v5.92 ; son socle serveur (`supabase/feedback.sql`) a été appliqué en production le 6 septembre 2026, l'envoi des retours étant en cours de validation avec Marie. En parallèle, la zone `ONBOARD` a produit le cadrage complet de l'accueil de nouveaux testeurs (parcours, critères d'acceptation, plan de test, demandes d'évolution). Le 8 septembre 2026, ce cadrage a été analysé et converti en plan d'intégration dans l'application : `roadmap_integration_onboard.md` (six phases — spécification, écran de consentement conditionnant la synchronisation, code testeur dans les Paramètres, dépouillement de plusieurs appareils, canaux Discord dédiés, généralisation du nommage). Les **cinq premières phases sont réalisées** (jusqu'au 9 septembre 2026) : la spécification est sur la branche principale, un écran de consentement s'insère au premier lancement et la synchronisation ne démarre qu'après accord (l'écran « Vie privée » décrit désormais ce qui est réellement envoyé), un champ « code testeur » a été ajouté aux Paramètres, le script de sauvegarde archive chaque appareil séparément, et un canal Discord privé par testeur a été mis en place avec une visibilité strictement asymétrique — un testeur ne voit jamais les commentaires de Marie sur ses retours. La sixième phase (généralisation du nommage, aujourd'hui centré sur une seule personne) reste à faire. La vérification en conditions réelles des canaux Discord attend l'arrivée du premier testeur (Satine) sur le serveur. Deux décisions de cadrage restent ouvertes (identité par résultat de test, cadence des cycles) sans bloquer le code.

Le 9 septembre 2026, le script de sauvegarde développeur (`backup_marie_snapshot.py`) a été rendu silencieux sur les appareils fantômes (essais avortés, sans aucune donnée) qu'il rencontre dans la base : il ne signale plus d'erreur pour chacun d'eux, seuls les problèmes réels restent visibles. Une relance a par ailleurs été envoyée à Marie pour les douze tests de la v5.92 en attente depuis sa livraison ; elle a répondu les avoir déjà faits — son écran « Tests à faire » est vide de son côté. Ce n'est pas un désaccord : un parcours quitte cette liste dès qu'un résultat y est enregistré, validé ou non. L'écart tient à un retard de dépouillement côté développement (le journal des tests s'arrête au 4 septembre 2026) ; le prochain déploiement ingérera son dernier snapshot et réconciliera l'état des demandes 33 à 38.

## Prérequis

- Node.js et npm.
- Un navigateur récent pour utiliser ou tester la PWA.

## Installation et lancement

```bash
git clone https://github.com/ServOMorph/Appli_TSA_SDI_TDAH.git
cd Appli_TSA_SDI_TDAH
npm install
npm run dev
```

Ouvrez ensuite l'URL affichée par Vite, habituellement `http://localhost:5173`.

## Commandes utiles

```bash
npm run build          # vérification TypeScript et build de production
npm run preview        # prévisualisation du build
npm run lint           # ESLint sans avertissement accepté
npm test               # tests unitaires et d'intégration Vitest
npm run test:coverage  # couverture de tests
npm run test:e2e       # scénarios Playwright
```

## Architecture

```text
src/
  domain/    Logique métier pure : entités et règles de gestion
  data/      Persistance Dexie.js, IndexedDB et migrations
  ui/        Composants et écrans React accessibles
  app/       Navigation, providers et état applicatif
  test/      Utilitaires et configuration de tests partagés
scripts/     Scripts de développement et d'ingestion des retours de test
_docs/       Documentation produit, technique et ADR
_contexte/  Contexte et journal de suivi du projet
```

L'interface React reste séparée des règles métier et de la persistance. Les données utilisateur sont stockées localement dans IndexedDB ; la synchronisation cloud est un sujet post-MVP.

## Documentation

- [Changelog](CHANGELOG.md) : historique versionné des évolutions.
- [Roadmap des tests manuels](Archives/roadmap_tests_marie.md) : état du recueil des retours d'usage.
- [Décisions d'architecture](_docs/adr/) : choix techniques structurants.
- [Guide pour agents et IA](llms.txt) : synthèse du projet et de ses points d'entrée.

## Licence

Ce projet est distribué sous licence [MIT](LICENSE).
