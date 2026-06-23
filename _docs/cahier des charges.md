# 📱 Cahier des charges — Application web & mobile

## TSA sans DI + TDAH (AuDHD) — Organisation, routines, social, énergie

---

# 1. Vision produit

Créer une application **neuroinclusive** destinée aux personnes TSA sans déficience intellectuelle associée à un TDAH (14–40 ans), visant à :

* réduire la charge mentale quotidienne
* faciliter l'organisation personnelle
* soutenir les routines
* maintenir les relations sociales
* réguler l'énergie (cuillères)

👉 L'application n'est pas un outil de productivité classique, mais un **système externe de fonctions exécutives**.

---

# 2. Principes généraux UX

## Principes fondamentaux

* Réduction maximale de la charge cognitive
* Minimisation des choix simultanés
* Prévisibilité de l'interface
* Capture rapide des informations
* Pas de culpabilisation
* Priorité à l'action immédiate ("what now?")
* Interface stable et non surchargée

## Principes spécifiques AuDHD

L'AuDHD n'est pas la somme du TSA et du TDAH — c'est une combinaison avec des tensions propres. Le TDAH pousse à la nouveauté et à l'impulsivité ; le TSA a besoin de prévisibilité et de routine. Ces deux besoins peuvent être contradictoires chez le même utilisateur le même jour.

L'interface doit donc être **prévisible dans sa structure** tout en étant **légèrement variable dans son contenu** (suggestions, formulations) sans jamais déstabiliser la navigation.

## Références générales

* [https://www.w3.org/TR/coga-usable/](https://www.w3.org/TR/coga-usable/)
* [https://www.w3.org/WAI/GL/task-forces/coga/](https://www.w3.org/WAI/GL/task-forces/coga/)
* [https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Cognitive_accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Cognitive_accessibility)
* [https://www.nngroup.com/articles/recognition-and-recall/](https://www.nngroup.com/articles/recognition-and-recall/)

---

# 3. PHASE 1 — Capture des tâches

## Décision

### Ajout de tâche

* Champ texte unique uniquement
* Aucun champ obligatoire supplémentaire
* Pas de priorité
* Pas de catégorie obligatoire

### Flux

1. Bouton "Ajouter une tâche"
2. Saisie texte
3. Validation immédiate

### Destination

Toutes les tâches vont dans une **Inbox**

---

## Inbox

* Zone unique de capture
* Sans organisation obligatoire
* Sans tri automatique en V1

---

## Références Phase 1

* [https://www.nngroup.com/articles/web-form-design/](https://www.nngroup.com/articles/web-form-design/)
* [https://www.w3.org/TR/coga-usable/](https://www.w3.org/TR/coga-usable/)
* [https://www.verywellmind.com/decision-fatigue-5215463](https://www.verywellmind.com/decision-fatigue-5215463)

---

# 4. PHASE 2 — Structure des tâches

## Décision

Structure simplifiée :

* Inbox
* Aujourd'hui
* Plus tard

## Contraintes

* Maximum 3 tâches dans "Aujourd'hui"
* Pas de notion de retard affichée
* Pas de priorité visible
* Pas de liste longue visible

## ✅ Ajout V1 — Décomposition manuelle des tâches

Une tâche peut être décomposée en sous-étapes manuellement. Cette fonctionnalité est nécessaire en V1 (et non reportée à la V2) car le blocage à l'initiation est directement causé par des tâches trop vagues ("faire la déclaration d'impôts", "appeler le médecin").

### Fonctionnement

* Option "Décomposer" accessible depuis n'importe quelle tâche
* Ajout libre de sous-étapes en texte
* Sous-étapes cochables indépendamment
* Aucune structure imposée

---

## Références Phase 2

* [https://www.healthline.com/health/adhd/how-to-use-to-do-lists-for-adhd-management](https://www.healthline.com/health/adhd/how-to-use-to-do-lists-for-adhd-management)
* [https://www.reddit.com/r/ADHD/](https://www.reddit.com/r/ADHD/)
* [https://www.getdoable.app/](https://www.getdoable.app/)

---

# 5. PHASE 3 — Planification quotidienne

## Décision

### Système hybride

* L'application propose 3 tâches
* L'utilisateur valide ou remplace

## Logique

Proposition fondée sur des règles explicites et déterministes (aucune décision opaque, cf. Phase 12). En V1, l'énergie n'altère pas la sélection (liaison énergie ↔ tâches reportée en V2).

Règle de proposition V1 :

1. Tâches déjà présentes dans "Aujourd'hui" (conservées)
2. Complétées jusqu'à 3 par les tâches les plus anciennes de l'Inbox (par date de création)

L'utilisateur reste libre de valider, retirer ou remplacer chaque proposition. Aucune proposition n'est imposée.

Note : si cette règle s'avère trop simple à l'usage, la sélection automatique peut être retirée du MVP (l'utilisateur choisit manuellement ses 3 tâches) sans impact sur le reste de l'architecture.

---

## Références Phase 3

* [https://www.healthline.com/health/adhd/how-to-use-to-do-lists-for-adhd-management](https://www.healthline.com/health/adhd/how-to-use-to-do-lists-for-adhd-management)
* [https://www.reddit.com/r/ADHDers/](https://www.reddit.com/r/ADHDers/)
* [https://chadd.org/about-adhd/executive-function-skills-and-adhd/](https://chadd.org/about-adhd/executive-function-skills-and-adhd/)

---

# 6. PHASE 4 — Gestion de l'énergie

## Décision

### Spoon Theory

* L'utilisateur choisit ses cuillères chaque jour
* Valeur proposée = historique (hier / moyenne)

---

## Fonctionnement

* Check-in quotidien ultra rapide
* 1 question : "Combien de cuillères aujourd'hui ?"
* Ajustable manuellement

## ⚠️ Mise en garde opérationnelle

La Spoon Theory est une métaphore utile mais non validée empiriquement comme outil de mesure. Les personnes AuDHD présentent fréquemment une alexithymie qui rend difficile l'estimation fiable de leur propre énergie disponible.

### Conséquences sur le design

* La valeur proposée est **indicative**, jamais prescriptive — le libellé de l'interface doit le refléter explicitement
* Pas de jugement si la valeur déclarée diffère fortement de l'historique
* Calibration progressive envisagée en V2 (l'app apprend avec l'utilisateur)

---

## Références Phase 4

* [https://butyoudontlooksick.com/articles/written-by-christine/the-spoon-theory/](https://butyoudontlooksick.com/articles/written-by-christine/the-spoon-theory/)
* [https://www.verywellhealth.com/what-is-spoon-theory-6822953](https://www.verywellhealth.com/what-is-spoon-theory-6822953)
* [https://getspoons.app/](https://getspoons.app/)

---

# 7. PHASE 5 — Routines

## Décision

### Modèle retenu : routines par événements (anchors)

Exemples :

* après réveil
* avant de sortir
* après repas
* avant de dormir

---

## Structure

* Séquences (pas d'horaires obligatoires)
* Adaptation selon énergie
* Version simplifiée V1

---

## Références Phase 5

* [https://www.cohorty.app/blog/adhd-time-blindness-strategies-that-actually-work](https://www.cohorty.app/blog/adhd-time-blindness-strategies-that-actually-work)
* [https://www.neurodiversion.org/](https://www.neurodiversion.org/)
* [https://pubmed.ncbi.nlm.nih.gov/23179340/](https://pubmed.ncbi.nlm.nih.gov/23179340/)

---

# 8. PHASE 6 — Social

## Décision

### Module relationnel

* Fiches contacts
* Dernier échange
* Fréquence souhaitée
* Rappels de reconnexion
* Notes personnelles

---

## Objectif

* Maintenir les relations dans le temps
* Réduire l'oubli social
* Soutenir la mémoire prospective

## ✅ Ajout V1 — Accès direct aux modèles sociaux depuis la fiche contact

La bibliothèque de modèles de communication (Phase 14) doit être accessible directement depuis chaque fiche contact, et non uniquement depuis un module séparé. Le problème courant en TSA n'est pas seulement d'oublier de recontacter, mais de ne pas savoir quoi dire au moment de le faire. L'accès contextuel réduit cette friction.

---

## Références Phase 6

* [https://chadd.org/about-adhd/executive-function-skills-and-adhd/](https://chadd.org/about-adhd/executive-function-skills-and-adhd/)
* [https://www.autism.org.uk/](https://www.autism.org.uk/)
* [https://www.reddit.com/r/AutismInWomen/](https://www.reddit.com/r/AutismInWomen/)

---

# 9. PHASE 7 — Notifications

## Décision

### Philosophie : Calm by default

* Maximum 2 notifications/jour
* Notifications critiques uniquement
* Pas de spam de tâches
* Pas de culpabilisation

---

## Types

* Critiques (RDV, médicaments)
* Check-in quotidien
* Rappels sociaux discrets

---

## Références Phase 7

* [https://adhdphone.pasho.dev/blog/the-adhd-users-guide-to-reminders](https://adhdphone.pasho.dev/blog/the-adhd-users-guide-to-reminders)
* [https://www.reddit.com/r/AutisticWithADHD/](https://www.reddit.com/r/AutisticWithADHD/)

---

# 10. PHASE 8 — Priorisation

## Décision

### Aucun système de priorité visible

* Pas de High / Medium / Low
* Pas d'Eisenhower matrix
* Pas de tags obligatoires

---

## Logique

* priorité implicite via cuillères
* sélection quotidienne guidée

---

## Références Phase 8

* [https://www.verywellmind.com/decision-fatigue-5215463](https://www.verywellmind.com/decision-fatigue-5215463)
* [https://www.reddit.com/r/ADHD/](https://www.reddit.com/r/ADHD/)

---

# 11. PHASE 9 — Dashboard (écran principal)

## Décision finale

### Élément principal

👉 **"Que dois-je faire maintenant ?"**

---

## Composition écran

* Action immédiate principale
* Cuillères restantes
* 3 tâches du jour max
* Routine en cours
* Bouton ajouter tâche

---

## Références Phase 9

* [https://innermap.tools/blog/adhd-productivity-dashboard/](https://innermap.tools/blog/adhd-productivity-dashboard/)
* [https://www.w3.org/TR/coga-usable/](https://www.w3.org/TR/coga-usable/)
* [https://www.nngroup.com/articles/minimalism/](https://www.nngroup.com/articles/minimalism/)

---

# 12. ARCHITECTURE PRODUIT

## Modules

* Inbox
* Tâches
* Aujourd'hui
* Plus tard
* Routines
* Social
* Énergie (cuillères)
* Dashboard

---

# 13. PRINCIPES PRODUIT FINAUX

* Capture > organisation
* Action > planification
* Énergie > temps
* Simplicité > exhaustivité
* Assistance > automation
* Contrôle utilisateur permanent

---

# 14. PHASE 10 — Adaptation cognitive de l'interface

## Décision

### Architecture unique avec niveau de stimulation ajustable

L'application conserve une structure, une navigation et des fonctionnalités identiques pour tous les utilisateurs.

L'utilisateur peut choisir un niveau de stimulation visuelle :

#### Mode Calme

* Animations minimales
* Contrastes doux
* Feedbacks visuels réduits
* Environnement sensoriel stable

#### Mode Standard

* Réglage par défaut
* Équilibre entre lisibilité et engagement

#### Mode Dynamique

* Feedbacks visuels renforcés
* Renforcement positif plus visible
* Contrastes plus marqués
* Micro-récompenses discrètes

---

## Principes

* Une seule architecture produit
* Aucune fonctionnalité exclusive à un mode
* Changement de mode à tout moment
* Préférences utilisateur prioritaires
* Réduction maximale de la surcharge sensorielle

---

## Références Phase 10

* https://welcomingweb.com/learn/designing-for-neurodiversity-adhd-ux
* https://tgth.pl/knowledge-hub/neurodivergent-ux-design-how-to-build-interfaces-for-all-minds/
* https://www.my-ux.com/en/conditions-overview/adhd
* https://www.w3.org/TR/coga-usable/

---

# 15. PHASE 11 — Personnalisation de l'interface

## Décision

### Personnalisation progressive

L'application propose une expérience simple et immédiatement utilisable sans configuration obligatoire.

Les options de personnalisation sont accessibles dans les paramètres mais ne sont jamais imposées lors de l'onboarding.

---

## Paramètres disponibles

### Accessibilité visuelle

* Taille du texte
* Niveau de contraste
* Mode clair / sombre
* Réduction des animations

### Adaptation cognitive

* Niveau de stimulation
* Taille des cartes
* Densité d'informations affichées

### Organisation

* Ordre des modules principaux
* Affichage ou masquage de modules secondaires

---

## Contraintes

* Aucun paramètre obligatoire
* Valeurs par défaut optimisées
* Retour au profil par défaut en un clic
* Pas de constructeur d'interface complexe

---

## Références Phase 11

* https://www.w3.org/TR/coga-usable/
* https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Cognitive_accessibility
* https://www.nngroup.com/articles/recognition-and-recall/
* https://www.w3.org/WAI/GL/task-forces/coga/

---

# 16. PHASE 12 — Assistance et automatisation

## Décision

### Aucune IA en V1

L'application ne repose sur aucun modèle d'intelligence artificielle pour ses fonctionnalités principales.

Toutes les suggestions et automatisations sont basées sur des règles explicites et prévisibles.

---

## Fonctionnement

Exemples :

* Proposition des tâches du jour à partir de règles définies
* Sélection des routines selon le contexte
* Suggestions de reconnexion sociale basées sur la fréquence choisie
* Calcul des tâches compatibles avec le niveau d'énergie

---

## Principes

* Prévisibilité maximale
* Fonctionnement explicable
* Aucune décision opaque
* Contrôle utilisateur permanent
* Faible coût technique
* Fonctionnement possible hors ligne

---

## Références Phase 12

* https://www.w3.org/TR/coga-usable/
* https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Cognitive_accessibility
* https://www.nngroup.com/articles/recognition-and-recall/

---

# 17. PHASE 13 — Profils de vie

## Décision

### Produit unique avec profils de vie

Lors de la première configuration, l'utilisateur choisit un profil :

* Adolescent
* Étudiant
* Adulte

---

## Adaptations

### Adolescent

* devoirs
* révisions
* projets scolaires
* activités extrascolaires

### Étudiant

* cours
* examens
* logement
* administratif

### Adulte

* travail
* santé
* administratif
* gestion du foyer

---

## Contraintes

* Architecture identique
* Fonctionnalités identiques
* Seuls les contenus et exemples changent

---

## Références Phase 13

* https://www.w3.org/TR/coga-usable/
* https://chadd.org/about-adhd/executive-function-skills-and-adhd/
* https://www.autism.org.uk/
* https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Cognitive_accessibility

---

# 18. PHASE 14 — Aide à la communication sociale

## Décision

### Bibliothèque facultative de modèles sociaux

Le module social fonctionne indépendamment des modèles de communication.

Une bibliothèque optionnelle de formulations et d'exemples est accessible à tout moment, **et directement depuis chaque fiche contact** (voir Phase 6).

---

## Objectifs

* Réduire l'anxiété liée à la formulation
* Faciliter l'initiation des échanges
* Réduire la charge cognitive rédactionnelle

---

## Contenus proposés

### Maintien du lien

* reprendre contact
* remercier
* prendre des nouvelles

### Limites personnelles

* refuser une invitation
* reporter un rendez-vous
* exprimer un besoin

### Organisation

* confirmer un rendez-vous
* relancer une personne

---

## Références Phase 14

* https://www.autism.org.uk/
* https://embrace-autism.com/
* https://thinkingautismguide.com/
* https://www.w3.org/TR/coga-usable/

---

# 19. PHASE 15 — Préparation des interactions

## Décision

### Fiche de préparation rapide

Fonction optionnelle destinée aux appels, rendez-vous, réunions et démarches importantes.

---

## Structure

### Avant l'interaction

#### Objectif

Pourquoi ai-je cette interaction ?

#### Points importants

Les informations essentielles à transmettre.

#### Informations à obtenir

Questions et réponses attendues.

---

### Pendant

#### Notes libres

Zone de prise de notes rapide.

---

### Après

#### Actions de suivi

* tâche à créer
* document à envoyer
* rendez-vous à planifier

---

## Références Phase 15

* https://www.autism.org.uk/
* https://chadd.org/about-adhd/executive-function-skills-and-adhd/
* https://www.w3.org/TR/coga-usable/
* https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Cognitive_accessibility

---

# 20. PHASE 16 — Gestion avancée de l'énergie (V2)

## Décision

### Reportée à la V2

Aucune liaison automatique entre les cuillères et les tâches n'est prévue dans la V1.

---

## Questions de recherche V2

* Les utilisateurs souhaitent-ils catégoriser l'effort des tâches ?
* Une estimation énergétique est-elle fiable ?
* Une assistance intelligente apporte-t-elle une valeur réelle ?
* Comment intégrer la calibration progressive pour compenser l'alexithymie ?

---

## Références Phase 16

* https://butyoudontlooksick.com/articles/written-by-christine/the-spoon-theory/
* https://www.verywellhealth.com/what-is-spoon-theory-6822953
* https://getspoons.app/

---

# 21. PHASE 17 — Gestion de la surcharge sensorielle

## Décision

### Aucune détection automatique en V1

L'utilisateur reste seul décisionnaire de son état interne.

---

## États disponibles

* État normal
* Fatigue importante
* Surcharge légère
* Surcharge importante
* Besoin de récupération

---

## ✅ Modification critique — Activation en accès direct

L'activation du mode surcharge doit être possible **en moins de 2 secondes depuis n'importe quel écran**, via un bouton persistant ou un geste rapide, sans navigation vers les paramètres.

Lors d'une surcharge, l'utilisateur AuDHD n'a souvent pas la capacité cognitive d'aller dans les réglages. Un accès indirect rend cette fonctionnalité inutilisable précisément quand elle est nécessaire.

## Effets possibles

* réduction des notifications
* simplification de l'interface
* mise en avant des routines de récupération

---

## Références Phase 17

* https://www.autism.org.uk/
* https://www.w3.org/TR/coga-usable/
* https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Cognitive_accessibility
* https://butyoudontlooksick.com/articles/written-by-christine/the-spoon-theory/

---

# 22. PHASE 17b — Time blindness (AJOUT V1)

## Contexte

La cécité temporelle (time blindness) est l'un des déficits les plus invalidants en AuDHD. Elle n'est pas adressée par les routines par ancres seules. Elle nécessite des outils de représentation visuelle du temps distincts des horloges ou chiffres abstraits.

## Décision

### Visualisation du temps en V1

* **Barre de progression temporelle** : le temps restant avant un événement ou une transition est représenté sous forme visuelle (barre qui se vide), pas comme un chiffre
* **Alerte de transition** : notification "dans X minutes" avant tout événement planifié, configurable par l'utilisateur
* **Pas d'horloge abstraite** sur le dashboard principal — le temps est représenté contextuellement (temps avant le prochain événement), pas en absolu

---

## Références Phase 17b

* https://www.cohorty.app/blog/adhd-time-blindness-strategies-that-actually-work
* https://chadd.org/about-adhd/executive-function-skills-and-adhd/
* https://www.w3.org/TR/coga-usable/

---

# 23. PHASE 17c — Transitions entre tâches (AJOUT V1)

## Contexte

Passer d'une tâche à une autre est une difficulté spécifique liée à l'inertie exécutive et à l'hyperfocus. Une tâche terminée ne signifie pas que l'utilisateur est prêt cognitivement à en commencer une autre.

## Décision

### Micro-moment de transition

* Confirmation explicite de fin de tâche ("C'est fait ✓")
* Proposition d'un temps libre court (2–5 minutes) avant la tâche suivante
* La tâche suivante n'est affichée qu'après validation de ce temps libre ou demande explicite
* Aucun enchaînement automatique

---

## Références Phase 17c

* https://chadd.org/about-adhd/executive-function-skills-and-adhd/
* https://www.w3.org/TR/coga-usable/

---

# 24. PHASE 17d — Onboarding (AJOUT V1)

## Contexte

L'onboarding est un point de rupture à fort risque d'abandon pour les personnes AuDHD. Une séquence trop longue, trop chargée ou sans valeur perçue immédiate conduit à la désinstallation.

## Décision

### Onboarding en 3 étapes maximum

* **1 décision par écran** — jamais deux choix simultanés
* **Aucune configuration obligatoire** — tout peut être ignoré et configuré plus tard
* **Valeur perçue avant la fin de la première session** — l'utilisateur doit avoir pu réaliser une action utile (ajouter une tâche, voir son dashboard) avant la fin de l'onboarding
* **Pas de tutoriel long** — découverte progressive en contexte d'utilisation réelle

---

## Références Phase 17d

* https://www.w3.org/TR/coga-usable/
* https://www.nngroup.com/articles/recognition-and-recall/
* https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Cognitive_accessibility

---

# 25. PHASE 18 — Architecture des données

## Décision

### Offline-first avec synchronisation cloud optionnelle

L'application fonctionne intégralement sans connexion Internet.

---

## Fonctionnement

### Stockage local

* tâches
* routines
* énergie
* contacts
* notes

### Synchronisation optionnelle

* sauvegarde cloud
* multi-appareils
* restauration

---

## Références Phase 18

* https://offlinefirst.org/
* https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
* https://web.dev/articles/offline-cookbook
* https://www.w3.org/TR/coga-usable/

---

# 26. PHASE 19 — Confidentialité et protection des données

## Décision

### Confidentialité renforcée par défaut

Toutes les données utilisateur sont considérées comme sensibles.

---

## Principes

* Privacy by Design
* Privacy by Default
* Minimisation des données
* Contrôle utilisateur permanent

---

## Mesures

### Stockage local

* Chiffrement local

### Synchronisation

* TLS
* Chiffrement serveur

### Exploitation

* Aucune revente
* Aucun tracking publicitaire
* Aucun partage commercial

---

## Références Phase 19

* https://gdpr.eu/
* https://www.cnil.fr/
* https://www.edpb.europa.eu/
* https://owasp.org/www-project-top-ten/

---

# 27. PHASE 20 — Portabilité et export des données

## Décision

### Export RGPD complet

L'utilisateur peut récupérer l'intégralité de ses données à tout moment.

---

## Formats disponibles

### Export machine

* JSON complet

### Export humain

* PDF lisible
* CSV tabulaires

---

## Suppression

Avant toute suppression :

* proposition d'export
* confirmation explicite
* suppression complète des données

---

## Références Phase 20

* https://gdpr.eu/article-20-right-to-data-portability/
* https://www.cnil.fr/fr/comprendre-mes-droits/le-droit-la-portabilite
* https://eur-lex.europa.eu/eli/reg/2016/679/oj
* https://gdpr-info.eu/art-20-gdpr/

---

# 28. DÉCISIONS PRODUIT VALIDÉES

## Décisions retenues

* Interface unique avec niveau de stimulation ajustable
* Personnalisation progressive
* Aucune IA en V1
* Profils de vie (adolescent, étudiant, adulte)
* Bibliothèque facultative de modèles sociaux
* Accès direct aux modèles sociaux depuis la fiche contact
* Préparation rapide des interactions
* Décomposition manuelle des tâches en V1
* Time blindness : représentation visuelle du temps
* Micro-moments de transition entre tâches
* Onboarding en 3 étapes maximum, 1 décision par écran
* Mode surcharge activable en accès direct (< 2 secondes)
* Liaison énergie ↔ tâches reportée à la V2
* Surcharge sensorielle déclarative uniquement
* Offline-first avec synchronisation optionnelle
* Confidentialité renforcée
* Export RGPD complet

---

## Philosophie finale du produit

* Capture > organisation
* Action > planification
* Énergie > temps
* Simplicité > exhaustivité
* Assistance > automatisation
* Contrôle utilisateur permanent
* Confidentialité par défaut
* Fonctionnement hors ligne prioritaire

---

# 29. ÉVOLUTIONS FUTURES (V2+)

* IA de priorisation invisible
* Décomposition automatique des tâches
* Détection fatigue/surcharge
* Calibration progressive de l'estimation énergétique (compensation alexithymie)
* Analyse comportementale douce
* Assistant vocal (dictée tâches)
* Mode crise (burnout / overload)
* Suggestions sociales intelligentes

---

> **Note sur les références** : plusieurs liens présents dans ce document sont des articles de blog ou des discussions Reddit. Pour un document destiné à des investisseurs, une équipe produit ou des développeurs, il est recommandé de les remplacer ou compléter par des publications scientifiques (PubMed), les recommandations W3C COGA, CHADD, National Autistic Society, WCAG, CNIL, RGPD, et articles Nielsen Norman Group.