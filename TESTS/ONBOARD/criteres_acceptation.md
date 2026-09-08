# Critères d'acceptation — Accueil des testeurs

Zone : ONBOARD · Phase 2 de `roadmap_accueil_testeurs.md` · Rédigé le 2026-09-05.

Chaque critère est formulé pour être vérifiable par observation directe, sans jugement
d'appréciation. Renvoie aux étapes de `parcours_accueil.md`.

## 1. Autonomie du parcours

Un testeur va de l'invitation (étape 1) au premier retour (étape 6) sans aide humaine hors des
documents fournis (message d'invitation, écrans de l'application, catalogue de tests).

**Vérification** : lors de la répétition à blanc (Phase 4), noter toute question posée par le
pilote en dehors du protocole. Zéro question de ce type = critère satisfait.

## 2. Rattachement automatique de l'identité

Le premier retour du testeur (étape 6) est rattaché à son identité sans intervention manuelle de
l'équipe.

**Vérification** : le retour porte le code testeur saisi à l'étape 4, visible dans le snapshot
sans recoupement manuel. Dépend de la demande d'évolution D1 (`demandes_evolution.md`) — tant
qu'elle n'est pas livrée, ce critère ne peut pas être vérifié en conditions réelles.

## 3. Délai d'accueil

Le temps entre l'invitation (étape 1) et le premier retour exploitable (étape 6) tient dans la
cible de **24h ouvrées** fixée en Phase 2 (`parcours_accueil.md`). C'est une cible de
disponibilité — le testeur choisit son moment dans la fenêtre — et non un temps de manipulation
(de l'ordre de 35 min cumulées).

**Écart signalé** : la roadmap (Phase 2) attribuait la fixation de cette cible à la Phase 1 ;
`decisions_dispositif.md` ne contient aucune valeur chiffrée à ce sujet. La cible est donc posée
ici, dans ce document, plutôt que reprise d'un arbitrage antérieur qui n'existe pas.

**Vérification** : horodatage du message d'invitation contre horodatage du premier résultat de
test enregistré pour ce testeur.

## 4. Consentement préalable

Aucune donnée personnelle ne remonte avant le consentement (étape 3).

**Vérification** : la synchronisation reste inactive (flag local non posé) tant que l'écran de
consentement n'a pas été validé. Contrôle direct sur un appareil de test avant tout déploiement
aux testeurs réels.

## 5. Détection d'un abandon

Un abandon en cours de parcours est détecté par l'équipe, et non découvert par hasard.

**Vérification** : les seuils de `parcours_accueil.md` (§ Détection d'un abandon) sont surveillés
manuellement à chaque cycle de dépouillement (cf. `plan_de_test.md`). Un testeur qui dépasse un
seuil sans relance documentée constitue un échec de ce critère, indépendamment du testeur
lui-même.

---

## Gate de sortie de la Phase 2

Une relecture à blanc de `parcours_accueil.md` par une personne extérieure au projet ne laisse
aucune étape ambiguë ni aucun prérequis implicite. Cette relecture n'a pas été effectuée par
cette zone (hors de son périmètre d'exécution) : elle reste une action à mener par le
coordinateur (TESTS) avant tout envoi d'invitation réelle.
