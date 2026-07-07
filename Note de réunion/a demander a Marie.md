# À demander à Marie — prochaine réunion

## Comportement de l'action « Reporter » (mode surcharge, Phase V3-3)

**Contexte :** en mode surcharge, les tâches non-obligatoires grisées peuvent afficher un libellé « Reporter » (visio 2026-07-06, transcription `input_2026-07-06_2043.txt` l.578-589, constat `constats_2026-07-06.md` E6, l.47-52). Marie a dit que c'est **elle qui décide** de reporter ou non — mais elle n'a pas précisé le mécanisme technique : où va la tâche une fois reportée, et pour quand.

**Piste écartée :** renvoyer la tâche au statut `todo`. Refusée car aucun écran de l'app n'affiche ce statut aujourd'hui — la tâche deviendrait invisible, un orphelin (même défaut que le bug B1 corrigé en V3-1).

**Piste envisagée non actée :** replanifier automatiquement la tâche au lendemain, au même créneau horaire. Cohérente avec le modèle de données actuel (pas de nouveau statut) et avec le comportement déjà prévu pour les tâches récurrentes (P6), mais **jamais validée explicitement par Marie** pour ce cas précis.

**Question à poser :** quand elle clique sur « Reporter » sur une tâche grisée en surcharge, qu'est-ce qu'elle attend qu'il se passe concrètement ? La tâche doit-elle réapparaître le lendemain au même créneau, un autre jour à choisir, ou ailleurs (ex. dans une liste « à reprogrammer ») ?

**Statut :** implémenté à titre provisoire (2026-07-07) selon la piste « replanifier au lendemain, même créneau » — faute de précision de Marie sur le mécanisme exact, c'est la seule option qui ne casse rien techniquement (pas de nouveau statut, pas d'orphelin). Reste à confirmer avec elle : si elle attend un autre comportement (choix du jour, liste dédiée...), il faudra ajuster. Bloque toujours la clôture définitive du gate de la Phase V3-3 (test manuel + doc restants) ; le reste du développement (V3-4, V3-5) peut continuer sans attendre cette confirmation.

## Fréquence du check-in énergie : à chaque ouverture de l'app, ou une fois par jour ? (E4)

**Contexte :** Marie a dit à plusieurs reprises vouloir que l'app redemande l'énergie « à chaque fois qu'on se connecte » (transcription l.31-33, 519, 525), mais elle hésite elle-même dans le même passage : « ou alors chaque jour, je ne sais pas, il faudrait trouver » (l.33) — elle n'a jamais tranché explicitement entre ces deux options.

**Ce qui a été codé :** le check-in ne se déclenche qu'**une fois par jour calendaire** (tant qu'une entrée d'énergie existe pour la date du jour, même si elle a été ignorée via « Ignorer », l'app ne redemande plus jusqu'au lendemain). Re-saisie possible à tout moment via le bouton « Modifier », mais pas de re-demande automatique à chaque ouverture. C'est une interprétation du développeur, pas une décision actée avec Marie sur ce point précis.

**Pourquoi ce choix :** redemander l'énergie à chaque ouverture de l'app (potentiellement plusieurs fois par jour) risque d'être intrusif et fatiguant pour un public AuDHD — à l'inverse de l'objectif de réduction de la charge mentale. Mais ce n'est qu'un arbitrage, pas la volonté explicite de Marie.

**Question à poser :** est-ce qu'une fois par jour lui convient (avec re-saisie libre via « Modifier »), ou veut-elle vraiment être resollicitée à chaque ouverture de l'app, même plusieurs fois dans la même journée ?

**Statut :** comportement actuel non remis en cause en attendant sa réponse — à confirmer ou ajuster à la prochaine session.
