# Validation manuelle — Phase V4-4 (Interactions sur une tâche planifiée)

Branche : `v4` — Date : 2026-07-19

Objectif de la phase : E6 (menu déplacer/renommer/supprimer), E1 (appui long + glisser tactile),
E8 (report via choix de créneau, remplace l'avance automatique au lendemain).

Lancer : `npm run dev` (ou `npm run dev -- --host` pour tester au téléphone).
Repartir d'une base propre via le bouton « Reset DB » (dev) si besoin.

---

## E6 — Menu sur une tâche planifiée

- [x] 1.1 — Depuis le Planning, taper sur une tâche déjà placée : un menu s'ouvre avec trois choix
      (Déplacer, Renommer, Supprimer).
- [x] 1.2 — « Déplacer » ferme le menu et affiche le bandeau « "X" est en cours de déplacement. »
      au-dessus de « Ajouter une tâche » (même bandeau que E5), planning affiché en arrière-plan.
      Naviguer entre les jours avec ‹ › puis taper une case cible déplace la tâche sans la dupliquer
      et referme le bandeau.
- [x] 1.3 — « Renommer » ouvre un champ pré-rempli avec le titre actuel ; enregistrer met à jour le
      titre affiché sur le planning et sur l'accueil.
- [x] 1.4 — « Supprimer » demande confirmation puis retire définitivement la tâche du planning.
- [x] 1.5 — Pendant un déplacement, taper une case déjà occupée par une autre tâche affiche une
      erreur et laisse le bandeau ouvert (la tâche déplacée n'est pas perdue).
- [x] 1.6 — Le bouton « Annuler » du bandeau referme le déplacement sans modifier la tâche.

## E1 — Glisser tactile

- [x] 2.1 — À la souris sur PC : maintenir le clic enfoncé ~400 ms sans bouger sur une tâche, puis
      glisser en gardant le bouton enfoncé. Un overlay (titre de la tâche + aperçu de la cible) suit
      le curseur. Relâcher sur un créneau du planning pose la tâche **sous le curseur** (lecture
      directe de la ligne survolée, plus de calcul par distance).
- [x] 2.2 — Glisser vers le haut ou le bas : l'overlay affiche l'heure survolée (ex. « → 10h00 ») ;
      relâcher pose la tâche à ce créneau.
- [x] 2.3 — **Sans relâcher**, amener la tâche dans la zone à droite du planning et l'y maintenir :
      après ~0,65 s le planning bascule sur le jour suivant (la tâche reste en main). Rester dans la
      zone fait défiler les jours l'un après l'autre. Ramener le curseur sur la grille et relâcher
      sur le créneau voulu pose la tâche à ce jour/créneau. Relâcher dans la zone de bord **annule**
      le déplacement (la tâche ne bouge pas).
- [x] 2.4 — Maintenir la tâche dans la zone à gauche quand le planning affiche aujourd'hui : aucun
      effet ; l'overlay affiche « Retour impossible ».
- [x] 2.5 — Depuis un jour futur, maintenir la tâche dans la zone à gauche : le planning revient au
      jour précédent après ~0,65 s (même mécanique que 2.3), jamais avant aujourd'hui.
- [x] 2.6 — Un appui bref (sans maintien) ouvre le menu E6 au lieu de déclencher un déplacement.

## E8 — Report via choix de créneau

- [x] 3.1 — En mode surcharge, le bouton « Reporter » d'une tâche non essentielle affiche directement
      le bandeau « "X" est en cours de déplacement. » (pas de modale) et bascule automatiquement le
      planning sur le lendemain.
- [x] 3.2 — Taper une case sur le lendemain (ou un autre jour après navigation) déplace la tâche à cet
      endroit, referme le bandeau, et affiche un badge « Reporté » sur la tâche.
- [x] 3.3 — Depuis le Dashboard, le bouton « Reporter » de la carte « Planning du jour » navigue vers
      le Planning avec le même bandeau déjà affiché et le planning déjà basculé sur le lendemain.

---

## Résultat

- [x] Tous les points passés → phase V4-4 validée.
- [x] Écarts constatés : voir note sous 1.4 (report codé, cf. `roadmap_v4.md`).
