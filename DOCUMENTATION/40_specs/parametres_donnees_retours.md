# Spécification — Paramètres, données et retours

**Statut :** actuel (code consulté le 2026-09-16)  
**Sources :** `src/ui/screens/settings/E110Settings.tsx`, `src/ui/screens/settings/E111Profile.tsx`, `src/ui/screens/settings/E112Accessibility.tsx`, `src/ui/screens/settings/E116Privacy.tsx`, `src/ui/screens/settings/E117Export.tsx`, `src/ui/screens/feedback/E122FeedbackCapture.tsx`, `src/ui/screens/feedback/E123FeedbackList.tsx`, `src/ui/screens/feedback/E124FeedbackDetail.tsx`, `src/domain/rules/feedbackRules.ts`, `src/data/sync/syncConsent.ts`, `src/data/sync/feedbackClient.ts`.

## Objectif

Permettre à l'utilisateur d'adapter son application, de gérer ses données locales et de transmettre un retour de test suivi d'un échange.

## Paramètres et données

`E110` centralise les entrées vers profil, accessibilité, confidentialité et export. Les écrans dédiés portent les réglages correspondants. La confidentialité permet d'activer ou désactiver le partage de données de test.

`E117` exporte toutes les données de l'appareil dans un fichier JSON après confirmation. Il permet aussi de sélectionner un fichier JSON précédemment exporté. L'import demande une confirmation et remplace définitivement les données locales ; les erreurs d'import sont affichées à l'écran.

## Cycle complet d'un retour

Depuis `E122`, l'utilisateur choisit ou colle une image, éventuellement l'annote, renseigne le code de l'écran et ajoute un commentaire. L'image est obligatoire, doit être une image et ne peut pas dépasser 8 Mo. Le retour est enregistré localement avant toute synchronisation.

`E123` liste les retours ouverts et leur statut d'envoi. En cas d'échec et si le partage est actif, l'utilisateur peut relancer l'envoi. Sans partage, les retours restent locaux et l'écran oriente vers les paramètres de confidentialité.

`E124` présente la capture et le fil de discussion. Ouvrir le fil marque les messages reçus comme lus. L'utilisateur peut ajouter un message non vide de 2 000 caractères au plus, puis valider la résolution après confirmation. La validation ferme le retour et le retire de la liste ouverte.

## Erreurs et limites

- Une capture non image ou supérieure à 8 Mo est refusée avec un message d'erreur.
- En l'absence de contenu dans le presse-papier, l'écran l'indique ou propose le sélecteur de fichier selon les capacités du navigateur.
- Un échec d'enregistrement local ou d'envoi affiche un message ; l'échec d'envoi peut être relancé lorsque le partage est actif.
- L'import de données est destructif après confirmation explicite.

## Critères d'acceptation

- L'utilisateur peut créer un retour sans activer le partage ; il apparaît alors comme conservé localement.
- Une image invalide ou trop lourde empêche la création du retour et explique le problème.
- Un retour envoyé ou en échec affiche son statut dans la liste ; la relance est proposée pour un échec avec partage actif.
- Un message reçu devient lu après ouverture du détail.
- Valider la résolution après confirmation retire le retour de la liste des retours ouverts.
- L'import ne remplace les données qu'après la confirmation dédiée.

## Preuves existantes

Les composants et règles référencés décrivent ces validations et transitions. La recherche des tests ciblant ces écrans n'a pas retourné de fichier dédié.
