# Plan de test manuel — Phase V3-6 (nav persistante, N1)

## 1. Présence de la nav sur tous les écrans

- [ ] Depuis le Dashboard : la barre "Ajouter une tâche" + Accueil/Todo/Planning/Listes est visible en bas d'écran sans scroller.
- [ ] Onglet "Accueil" mis en valeur (couleur/gras) quand on est sur le Dashboard.
- [ ] Aller dans Todo, Planning, Listes, Détail d'une liste, Réglages, Ressources, Détail d'une tâche, Décomposer, Vue énergie : la nav reste visible en bas sur chacun de ces écrans.
- [ ] Sur chaque écran ci-dessus, aucun contenu (bouton, texte) n'est caché/coupé par la barre de nav.
- [ ] La nav est absente sur les écrans d'onboarding (bienvenue, profil, énergie initiale) et sur le check-in énergie quotidien.

## 2. Onglet actif

- [ ] Sur Todo, l'onglet "Todo" est mis en valeur.
- [ ] Sur Planning, l'onglet "Planning" est mis en valeur.
- [ ] Sur Listes (vue globale ET détail d'une liste), l'onglet "Listes" est mis en valeur.
- [ ] Sur les autres écrans (Réglages, Détail tâche, etc.), aucun onglet n'est mis en valeur.

## 3. Aucun écran ne perd son point d'entrée

- [ ] Depuis n'importe quel écran secondaire (Réglages > Profil, Détail tâche, etc.), l'onglet "Accueil" ramène bien au Dashboard.
- [ ] Depuis Réglages, Todo, Planning, Listes : possibilité de naviguer directement vers un autre onglet sans repasser par le Dashboard.
- [ ] Pastille rouge sur "Todo" toujours visible si des tâches sont en attente, sur n'importe quel écran affichant la nav.

## 4. Mode surcharge

- [ ] En mode surcharge, la nav (bouton Ajouter + onglets) reste masquée comme avant sur tous les écrans (comportement inchangé, confirmé volontaire).
- [ ] Sortie du mode surcharge : la nav réapparaît normalement.

## 5. Non-régression

- [ ] Aucun bug d'affichage (chevauchement, contenu caché) sur mobile (test réel téléphone, `npm run dev -- --host`).
- [ ] Aucun bug d'affichage en clair et en sombre.
