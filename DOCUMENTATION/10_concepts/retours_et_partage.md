# Retours et partage des données

**Statut :** actuel (code consulté le 2026-09-16)  
**Sources :** `src/domain/entities/feedbackReport.ts`, `src/domain/entities/feedbackMessage.ts`, `src/domain/rules/feedbackRules.ts`, `src/data/sync/feedbackClient.ts`, `src/data/sync/syncConsent.ts`, `src/ui/screens/feedback/E122FeedbackCapture.tsx`, `src/ui/screens/feedback/E124FeedbackDetail.tsx`.

## Créer un retour

Un retour associe un code d'écran, une capture d'image, un commentaire et/ou des annotations dessinées. La capture est obligatoire, doit être une image et sa taille est limitée à 8 Mo dans l'écran de saisie.

Le retour est d'abord enregistré localement avec son image, la version de l'application et un état d'envoi. L'annotation est aplatie dans l'image avant l'enregistrement. Il peut rester en attente ou en échec d'envoi.

## Échanges et résolution

Un retour possède un fil de discussion : l'utilisateur peut ajouter des messages et l'équipe peut en envoyer. Les messages vides ou de plus de 2 000 caractères ne sont pas acceptés. L'ouverture du fil marque les messages reçus comme lus.

L'utilisateur peut valider un retour résolu. Cette action le ferme localement et déclenche une synchronisation lorsqu'elle est disponible ; le retour disparaît alors de sa liste.

## Consentement au partage

Le partage est conditionné par le consentement de synchronisation et par la configuration du service distant. Si le partage est désactivé, le retour et les messages restent sur l'appareil, en attente d'un envoi ultérieur. Le partage ne rend pas la création du retour impossible.

La synchronisation de retours transmet les retours en attente, leurs images et les messages ; elle récupère également les messages de l'équipe pour l'appareil concerné.

Voir aussi : [Architecture générale](../30_decisions/architecture_generale.md).
