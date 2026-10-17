# Parcours d'accueil — de l'invitation au premier retour exploitable

Zone : ONBOARD · Phase 2 de `roadmap_accueil_testeurs.md` · Rédigé le 2026-09-05 · Révisé le 2026-10-17.

Révision du 2026-10-17 (préparation de l'arrivée de Satine) : le catalogue « Tests à faire » est retiré
de l'appli depuis le 2026-09-15 ; le code testeur se saisit pendant l'onboarding (écran E05), plus dans
Paramètres ; le profil « proche de celui de Marie » est levé depuis le 2026-09-16 ; un testeur n'a pas
accès à « Signaler un retour » (réservé au rôle admin), ses retours passent par son salon Discord
individuel, géré à la main (bot Discord arrêté).

S'appuie sur les décisions de `decisions_dispositif.md` : consentement explicite, groupe de 2 à 5
testeurs (pas nécessairement AuDHD), Marie référente/validatrice, salon Discord individuel
`#test-<code>` distinct de la supervision de Marie.

Cible globale : un testeur atteint son premier retour exploitable en **24h ouvrées** suivant la
réception du message d'invitation (T0). Cette cible n'était pas chiffrée dans les décisions de
Phase 1 (le critère 3 de `criteres_acceptation.md` s'y réfère à tort) ; elle est fixée ici, en
Phase 2.

C'est une **cible de disponibilité, pas un temps de manipulation**. En cumulant les délais visés
des étapes 2 à 6, la manipulation elle-même est de l'ordre de 35 à 40 minutes. Les 24h ouvrées
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
- **Attribution du code testeur** avant l'envoi du message d'invitation (étapes 1 et 4) : le code est
  choisi par l'équipe, sans mot de passe ; il n'a aucun privilège (rôle `testeur`).
- **Salon Discord individuel `#test-<code>`** créé et privé (invisible de `@everyone`), accès donné au
  testeur à son arrivée, aucun autre salon visible pour lui (contrôle par « Voir le serveur en tant que
  rôle »).

---

## 0. Recrutement et cadrage de l'engagement (avant T0)

- **Ce que fait le testeur** : accepte, hors app (message direct ou oral), de participer à un
  petit groupe de test sur une durée donnée.
- **Ce qu'il voit** : une présentation courte du dispositif — ce qui est demandé, ce qui est
  collecté (renvoi vers l'écran de consentement de l'étape 3), la durée d'engagement attendue.
- **Attendu de l'équipe** : aucun profil neurologique particulier n'est exigé (décision du
  2026-09-16).
- **Délai visé** : hors fenêtre des 24h — cette étape précède l'invitation elle-même.

## 1. Message d'invitation (T0)

- **Ce que fait le testeur** : reçoit un message contenant le lien de l'application, son code
  testeur à saisir pendant l'onboarding (étape 4) et l'invitation vers son salon Discord
  `#test-<code>`.
- **Ce qu'il voit** : un message court, sans jargon technique, avec une seule action immédiate
  demandée (ouvrir le lien de l'application).
- **Attendu de l'équipe** : le code testeur est choisi et associé à ce testeur avant l'envoi du
  message ; son salon Discord existe et l'invitation est à usage unique.
- **Délai visé** : T0.

## 2. Installation de la PWA sur téléphone

- **Ce que fait le testeur** : ouvre le lien sur son téléphone, suit l'invite d'installation
  (« Ajouter à l'écran d'accueil » ou équivalent selon le navigateur).
- **Ce qu'il voit** : l'application s'ouvre en plein écran depuis l'icône installée, sans barre
  de navigation du navigateur.
- **Attendu de l'équipe** : le message d'invitation inclut une capture d'écran de l'étape
  d'installation, faite sur un téléphone du même système que le testeur (iPhone : Partager, puis
  « Sur l'écran d'accueil » ; Android : menu, puis « Installer l'application »).
- **Délai visé** : ≤ 10 min après T0.

## 3. Consentement

- **Ce que fait le testeur** : lit l'écran de consentement affiché à l'onboarding (nature des
  données collectées — tâches, budget, énergie, profil —, usage, durée de conservation, droit à
  l'effacement) et accepte avant toute synchronisation. Il peut refuser le partage des seules
  données de santé (catégories et âge) tout en gardant le reste.
- **Ce qu'il voit** : la synchronisation reste inactive tant que l'écran n'est pas validé (flag
  local, décision 2).
- **Attendu de l'équipe** : le texte de consentement est relu par une personne extérieure au
  projet avant le premier envoi d'invitation (aucune ambiguïté sur ce qui est collecté). Le texte a
  changé le 2026-10-12 (santé, âge, refus partiel) : toute relecture antérieure est à refaire.
- **Délai visé** : ≤ 2 min après l'installation.

## 4. Code testeur et profil

- **Ce que fait le testeur** : saisit le code testeur reçu à l'étape 1 sur l'écran qui suit le
  consentement (champ facultatif), puis remplit son profil : catégories (TSA, TDAH, SDI, etc.) et
  âge. Aucun mot de passe n'est demandé.
- **Ce qu'il voit** : l'onboarding complet jusqu'à l'Accueil ; le code enregistré est rappelé en
  lecture seule dans Paramètres > Profil.
- **Attendu de l'équipe** : le code est propagé dans le payload de synchronisation sans action
  supplémentaire du testeur ; ses données sont classées par la sauvegarde sous
  `donnees_testeurs/<code>/`.
- **Délai visé** : ≤ 5 min après le consentement.

## 5. Premier parcours guidé

- **Ce que fait le testeur** : exécute une consigne simple donnée à l'avance par l'équipe dans son
  salon Discord `#test-<code>`, directement dans l'appli.
- **Ce qu'il voit** : la consigne écrite dans son salon, et l'écran concerné de l'appli.
- **Attendu de l'équipe** : la première consigne est choisie simple et autonome (catégorie Tâches
  ou Accueil / Planning plutôt que Budget), pour ne pas décourager dès le premier essai. Il n'existe
  plus de catalogue de tests dans l'appli : la consigne est rédigée à la main.
- **Délai visé** : ≤ 15 min après la saisie du code, dans les 24h suivant T0 (le testeur peut
  choisir son moment dans cette fenêtre).

## 6. Émission du premier retour

- **Ce que fait le testeur** : écrit dans son salon Discord ce qui a fonctionné ou non, avec une
  capture d'écran s'il le souhaite. « Signaler un retour » n'est pas disponible dans l'appli pour un
  testeur (réservé au rôle admin).
- **Ce qu'il voit** : son message dans le salon, lu par l'équipe.
- **Attendu de l'équipe** : le salon est relevé à la main (bot Discord arrêté, aucun routage
  automatique) ; l'état de l'appli côté équipe reste lisible par la synchronisation existante.
- **Délai visé** : ≤ 5 min après la fin du parcours guidé.

## 7. Accusé de réception

- **Ce que fait le testeur** : rien de plus — il a rempli sa part du parcours d'accueil.
- **Ce qu'il voit** : un message de l'équipe dans son salon Discord, confirmant la réception de
  son premier retour et le remerciant.
- **Attendu de l'équipe** : répondre sous 24h ouvrées suivant la réception du retour ; un accusé
  qui tarde au-delà est le premier signal d'un dépouillement en retard (cf. `plan_de_test.md`).
- **Délai visé** : ≤ 24h ouvrées après l'étape 6.

---

## Détection d'un abandon

Aucun tableau de bord automatisé (décision 3). Le signal d'abandon est le dépassement d'un des
délais ci-dessus sans qu'un message du testeur ne l'explique : pas d'installation sous 24h après
l'invitation, pas de premier retour sous 24h après l'installation. Dans ce cas, l'équipe relance
individuellement dans le salon du testeur — jamais de relance groupée (décision 3).
