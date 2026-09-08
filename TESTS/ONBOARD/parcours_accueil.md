# Parcours d'accueil — de l'invitation au premier retour exploitable

Zone : ONBOARD · Phase 2 de `roadmap_accueil_testeurs.md` · Rédigé le 2026-09-05.

S'appuie sur les 5 décisions de `decisions_dispositif.md` : code testeur en Paramètres,
consentement explicite, groupe de 2 à 5 testeurs profil AuDHD, Marie référente/validatrice,
canal Discord testeurs distinct de la supervision de Marie.

Cible globale : un testeur atteint son premier retour exploitable en **24h ouvrées** suivant la
réception du message d'invitation (T0). Cette cible n'était pas chiffrée dans les décisions de
Phase 1 (le critère 3 de `criteres_acceptation.md` s'y réfère à tort) ; elle est fixée ici, en
Phase 2.

C'est une **cible de disponibilité, pas un temps de manipulation**. En cumulant les délais visés
des étapes 2 à 6, la manipulation elle-même est de l'ordre de 35 minutes. Les 24h ouvrées
couvrent le fait que le testeur choisit librement son moment dans la fenêtre — en particulier à
l'étape 5, premier parcours guidé — et que l'équipe accuse réception sous 24h ouvrées (étape 7).

---

## Prérequis techniques à confirmer par TESTS avant la première invitation

Le parcours ci-dessous suppose acquis les points suivants, qu'aucune vérification de cette zone
n'a établis. À confirmer par TESTS avant tout envoi d'invitation réelle :

- **Manifest PWA installable** sur les navigateurs cibles des testeurs (étape 2) — installation
  « Ajouter à l'écran d'accueil » fonctionnelle, ouverture en plein écran depuis l'icône.
- **Déploiement multi-utilisateurs sur URL unique** : plusieurs testeurs sur la même adresse sans
  collision d'état ni de session (étapes 2 à 6).
- **Génération et remise du code testeur** avant l'envoi du message d'invitation (étapes 1 et 4)
  — dépend de la demande d'évolution D1 de `demandes_evolution.md`.

---

## 0. Recrutement et cadrage de l'engagement (avant T0)

- **Ce que fait le testeur** : accepte, hors app (message direct ou oral), de participer à un
  petit groupe de test sur une durée donnée.
- **Ce qu'il voit** : une présentation courte du dispositif — ce qui est demandé, ce qui est
  collecté (renvoi vers l'écran de consentement de l'étape 3), la durée d'engagement attendue.
- **Attendu de l'équipe** : vérifier que le profil correspond à la décision 3 (proche du profil
  AuDHD de Marie) avant d'envoyer l'invitation.
- **Délai visé** : hors fenêtre des 24h — cette étape précède l'invitation elle-même.

## 1. Message d'invitation (T0)

- **Ce que fait le testeur** : reçoit un message contenant le lien de l'application, un code
  testeur à saisir plus tard (étape 4) et un lien vers le canal Discord testeurs.
- **Ce qu'il voit** : un message court, sans jargon technique, avec une seule action immédiate
  demandée (ouvrir le lien).
- **Attendu de l'équipe** : le code testeur est généré et associé à ce testeur avant l'envoi du
  message (dépendance : demande d'évolution D1 de `demandes_evolution.md`).
- **Délai visé** : T0.

## 2. Installation de la PWA sur téléphone

- **Ce que fait le testeur** : ouvre le lien sur son téléphone, suit l'invite d'installation
  (« Ajouter à l'écran d'accueil » ou équivalent selon le navigateur).
- **Ce qu'il voit** : l'application s'ouvre en plein écran depuis l'icône installée, sans barre
  de navigateur.
- **Attendu de l'équipe** : le message d'invitation inclut une capture d'écran de l'étape
  d'installation, pour éviter tout aller-retour avant même le premier lancement.
- **Délai visé** : ≤ 10 min après T0.

## 3. Consentement

- **Ce que fait le testeur** : lit l'écran de consentement affiché au premier lancement (nature
  des données collectées — tâches, budget, énergie —, usage, durée de conservation, droit à
  l'effacement) et accepte avant toute synchronisation.
- **Ce qu'il voit** : la synchronisation reste inactive tant que l'écran n'est pas validé (flag
  local, décision 2).
- **Attendu de l'équipe** : le texte de consentement est relu par une personne extérieure au
  projet avant le premier envoi d'invitation (aucune ambiguïté sur ce qui est collecté).
- **Délai visé** : ≤ 2 min après l'installation.

## 4. Saisie de l'identifiant testeur

- **Ce que fait le testeur** : va dans Paramètres, saisit le code testeur reçu à l'étape 1.
- **Ce qu'il voit** : une confirmation visuelle que le code est enregistré (le champ n'est pas
  laissé sans retour).
- **Attendu de l'équipe** : le code est propagé dans le payload de synchronisation sans action
  supplémentaire du testeur (dépendance : D1).
- **Délai visé** : ≤ 2 min après le consentement.

## 5. Premier parcours guidé

- **Ce que fait le testeur** : exécute un parcours du catalogue de tests, désigné à l'avance par
  l'équipe (cf. `plan_de_test.md` pour le principe d'attribution), en suivant ses étapes.
- **Ce qu'il voit** : le parcours dans l'écran « Tests à faire », avec ses étapes détaillées.
- **Attendu de l'équipe** : le premier parcours attribué est choisi simple et autonome (catégorie
  Tâches ou Accueil / Planning plutôt que Budget), pour ne pas décourager dès le premier essai.
- **Délai visé** : ≤ 15 min après la saisie de l'identifiant, dans les 24h suivant T0 (le testeur
  peut choisir son moment dans cette fenêtre).

## 6. Émission du premier retour

- **Ce que fait le testeur** : enregistre le résultat du parcours (Validé ou Non validé, avec
  commentaire si Non validé) directement dans l'écran « Tests à faire ».
- **Ce qu'il voit** : le résultat apparaît dans l'historique du test consulté.
- **Attendu de l'équipe** : aucune action manuelle requise du testeur en dehors de l'app pour que
  ce retour soit visible côté équipe (il remonte par la synchronisation existante).
- **Délai visé** : ≤ 5 min après la fin du parcours guidé.

## 7. Accusé de réception

- **Ce que fait le testeur** : rien de plus — il a rempli sa part du parcours d'accueil.
- **Ce qu'il voit** : un message de l'équipe sur le canal Discord testeurs, confirmant la
  réception de son premier retour et le remerciant.
- **Attendu de l'équipe** : répondre sous 24h ouvrées suivant la réception du retour ; un accusé
  qui tarde au-delà est le premier signal d'un dépouillement en retard (cf. `plan_de_test.md`).
- **Délai visé** : ≤ 24h ouvrées après l'étape 6.

---

## Détection d'un abandon

Aucun tableau de bord automatisé (décision 3). Le signal d'abandon est le dépassement d'un des
délais ci-dessus sans qu'un message du testeur ne l'explique : pas d'installation sous 24h après
l'invitation, pas de premier retour sous 24h après l'installation. Dans ce cas, l'équipe relance
individuellement sur le canal Discord testeurs — jamais de relance groupée (décision 3).
