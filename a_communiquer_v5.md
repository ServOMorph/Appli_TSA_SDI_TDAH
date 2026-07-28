# À communiquer à Marie — livraison V5.0

Préparé le 2026-07-28, pour la session où la V5.0 lui sera fournie. Ne pas envoyer avant : décisions actées avec l'utilisateur, plus rien à faire trancher par Marie sur ce périmètre. Sources : `roadmap_v5.0.md` (arbitrages), `Note de réunion/2026-07-28/a_communiquer_2026-07-28.md` (version de travail, superflue une fois ce fichier en place).

---

## 1. Changement par rapport à ce qui a été vu en visio

### Plus de glisser-déposer sur le planning — modification via la fiche de la tâche `[Q10]`

En visio, un premier rendu avait été envisagé (grille révélée pendant un déplacement au doigt). Tranché différemment ensuite, directement avec l'utilisateur : on reprend le fonctionnement exact de l'application de référence de Marie. On clique sur une tâche, sa fiche s'ouvre, et chaque information (date, horaire, alerte, énergie...) est cliquable pour la modifier — cf. capture `Capture d'écran 2026-07-28 160841.png`. Plus simple, plus fiable, et strictement ce que Marie avait dit apprécier chez l'application de référence.

## 2. Écarts assumés par rapport à sa demande

### Les dossiers n'auront qu'un seul niveau `[E20, Q9]`
Sur sa maquette, les huit outils sont tous côte à côte, sans aucun dossier. Un dossier peut contenir des outils, mais pas d'autres dossiers. Réversible si le besoin apparaît à l'usage.

### Le bouton « + » de la nav ne proposera pas « ajouter une dépense » `[Q12]`
Il crée directement une tâche, sans écran de choix. La dépense se saisit en un tap depuis le bloc Comptes de l'accueil. (Le « + » du bloc outils, lui, sert à ajouter un outil ou un dossier — pas concerné.)

### La partie Comptes n'est pas encore le tableau à colonnes libres dessiné `[E32, Q5]`
Version V4.1 rebranchée telle quelle (catégories, périodicités, livrets, reste disponible en haut). À faire évoluer avec son retour d'usage réel plutôt que sur plan.

## 3. Ce qui est repoussé, et dans quel ordre

Les cinq outils spécialisés décrits par Marie ne sont pas dans cette livraison — elle n'a jamais utilisé la version avec comptes et listes, livrer cinq outils de plus avant son retour reproduirait le problème actuel en plus gros.

Ordre de priorité tranché avec l'utilisateur : **Comptage en premier** (usage quotidien concret déjà identifié : cigarettes, médicaments, vérifications).

1. **Comptage** (ex-« joint », nom acté) — bouton +1 en haut de l'accueil, ligne horodatée automatique, vue statistique hebdomadaire.
2. **Météo du jour** (ex-« Sentiments », nom acté) — grille mensuelle, une émotion/jour, couleurs froid/chaud, note libre.
3. Comptes refondus — tableau à colonnes configurables, revenu et cagnotte en tête, livrets reliés.
4. Routine — routines nommées avec étapes, planification en série.
5. Tableau prévisions — grille jours × moments, historique conservé.

Mis de côté plus longtemps (hors V5) : anniversaires, cercles de proximité — périmètre trop large.

## 4. Ce que contient cette livraison

Nouvelle barre de navigation, écran d'accueil avec planning déroulant, planning et tâches refondus (logos, couleurs, durée en jours, tâches récurrentes, fiche cliquable), rangement en dossiers et listes, Comptes V4.1 rebranché.

## 5. Questions à poser une fois qu'elle aura utilisé la livraison

À ne pas poser avant, elle ne peut pas y répondre sans avoir manipulé.

- Le planning sans lignes est-il réellement plus lisible, ou manque-t-il des repères ?
- La fiche de tâche pour tout modifier (au lieu du glisser-déposer) est-elle pratique à l'usage ?
- La question « cette occurrence ou toutes les occurrences » à chaque modification d'une tâche récurrente est-elle utile ou pénible ?
- Le rangement en dossiers sert-il vraiment, ou les outils restent-ils tous à la racine comme sur sa maquette ?
- Les comptes actuels suffisent-ils, ou le tableau à colonnes libres est-il indispensable ?
