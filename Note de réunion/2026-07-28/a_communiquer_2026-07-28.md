# À communiquer à Marie — suite de la visio du 2026-07-28

Points issus des arbitrages pris après la séance (voir `roadmap_v5.0.md` § Arbitrages). Formulés pour être dits tels quels, sans vocabulaire technique. Les références entre crochets servent à retrouver l'origine dans `constats_2026-07-28.md` et `captures_2026-07-28.md`.

---

## 1. À montrer, sans en discuter avant

### Les repères horaires du planning reviennent pendant qu'on déplace une tâche `[D5, C14, C37]`

Tu as demandé un planning épuré, sans cases ni lignes. C'est fait : au repos, il n'y a plus aucune ligne.

Mais l'application dont tu t'es inspirée ne permet pas de déplacer une tâche avec le doigt — pour changer l'heure, il faut ouvrir la fiche de la tâche. La nôtre le permet, et sans repère horaire on déplace une pastille dans le vide sans savoir où elle va atterrir.

Proposition : les repères réapparaissent en fond très léger **uniquement pendant** le déplacement, et disparaissent dès qu'on lâche. À essayer avant d'en juger.

---

## 2. Écarts assumés par rapport à ta demande

### Les dossiers n'auront qu'un seul niveau pour l'instant `[E20, C27, C29]`

Tu as décrit un rangement à la manière d'un ordinateur : un dossier, puis des sous-dossiers, puis les outils dedans.

Sur ta maquette d'accueil, les huit outils que tu as dessinés (Sentiments, Comptes, Liste courses, Comptes joints, A acheter, To Do, Routines, planning repas) sont tous côte à côte, sans aucun dossier. On part donc sur un seul niveau : un dossier peut contenir des outils, mais pas d'autres dossiers.

C'est réversible : si le besoin de sous-dossiers apparaît à l'usage, on l'ajoutera.

### Le bouton « + » ne proposera pas « ajouter une dépense » `[E17, Q12]`

Tu as demandé que le « + » ouvre un choix entre « ajouter une tâche » et « ajouter une dépense ».

Le problème : ajouter une tâche est le geste le plus fréquent de l'application, et on vient justement de supprimer une étape intermédiaire à cet endroit. Remettre un menu ajoute un clic sur le chemin le plus emprunté.

Tu as toi-même dit, à propos du comptage : « des fois je ne note pas juste parce que c'est chiant, il faut que j'aille dans des sous-dossiers ». C'est exactement le même raisonnement.

Proposition : le « + » crée directement une tâche, et la dépense se saisit en un seul tap depuis le bloc Comptes posé sur l'accueil.

### La partie Comptes que tu vas découvrir n'est pas encore celle que tu as dessinée `[E32, C50]`

Une première version des comptes existe déjà : catégories de dépenses, périodicité semaine ou mois, livrets, reste disponible affiché en haut.

Ce n'est pas encore le tableau à colonnes libres que tu as dessiné sur ta page 5. On te la met entre les mains telle quelle pour que tu l'utilises vraiment, et on la fera évoluer avec ton retour d'usage plutôt que sur plan.

---

## 3. Ce qui est repoussé, et pourquoi

Tu as décrit cinq nouveaux outils : Sentiments, Liste comptage, Comptes refondus, Routine, Tableau prévisions. Ils sont tous notés et rien n'est perdu.

Ils ne seront pas dans la prochaine livraison. La raison est simple : **tu n'as encore jamais utilisé la version précédente**, celle avec les comptes et les listes. Livrer cinq outils de plus avant que tu aies pu dire ce qui marche ou pas, c'est prendre le risque de construire longtemps dans la mauvaise direction.

La prochaine livraison contient donc : la nouvelle barre de navigation, l'écran d'accueil avec le planning qui se déroule, le planning et les tâches refondus (logos, couleurs, durée en jours, tâches récurrentes), et le rangement en dossiers avec les listes.

Une fois que tu l'auras utilisée quelques semaines, on reprend les cinq outils dans l'ordre que tu voudras.

Sont mis de côté plus longtemps, parce qu'ils élargissent beaucoup le sujet : les anniversaires et le classement des amis en cercles `[E39, E40]`.

---

## 4. À lui demander

### Le nom de « Sentiments » `[Q2]`
Tu avais accepté d'en changer et j'avais dit que je proposerais un nom. À trancher quand on développera l'outil.

### Le mot « joint » pour le comptage `[Q3]`
Il faut un autre nom pour cet outil : « comptage joint » se comprend spontanément comme un compte bancaire partagé, ce qui n'a rien à voir. Comment veux-tu l'appeler ?

### Ce que tu veux voir en premier après cette livraison `[Q7]`
Des cinq outils reportés, lequel te manque le plus au quotidien ?

---

## 5. Questions à poser une fois qu'elle aura utilisé la livraison

À ne pas poser maintenant, elle ne peut pas y répondre sans avoir manipulé.

- Le planning sans lignes est-il réellement plus lisible, ou est-ce qu'il manque des repères ? `[D5]`
- Les repères qui réapparaissent pendant le déplacement suffisent-ils ? `[Q10]`
- La question « cette occurrence ou toutes les occurrences » posée à chaque modification d'une tâche récurrente est-elle utile ou pénible ? `[E25, Q11]`
- Le rangement en dossiers sert-il vraiment, ou les outils restent-ils tous à la racine comme sur ta maquette ? `[E20, Q9]`
- Les comptes actuels suffisent-ils, ou le tableau à colonnes libres est-il indispensable ? `[E32, Q5]`
