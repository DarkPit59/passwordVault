Ce projet en NodeJs crée un coffre-fort de mots de passe sécurisé.

1 - Interface EJS claire et intuitive pour les utilisateurs
  En cas d'accès à une page nécessitant une connexion, redirection vers l'écran de connexion

  Ecran de connexion - Travail terminé
  Ecran d'inscription - Travail terminé
  Ecran d'oubli de mot de passe - Ecran terminé mais fonctionnalité non développée (pas de service mail associé)

  Après connexion
  Ecran d'accueil permettant de choisir entre l'accès au dashboard et la modification des paramètres du compte - Travail terminé
  Ecran Dashboard 
    Affichage des mots de passe stockés - Travail terminé
    Ajout de mots de passe - Travail terminé
    Suppression de mots de passe - Travail terminé
  Ecran Paramètres
    Modification du mot de passe - Travail terminé
    Suppression du compte - Fonctionnalité encore en cours
  Bouton de déconnexion - Travail terminé

2 - Fonctionnalités simples et efficaces
  API séparée des écrans - Travail terminé
  Gestion des actions BDD et des routes séparément - Travail terminé
  Gestion d'un envoi de mail si oubli du mot de passe - fonctionnalité non développée (pas de service mail associé)

3 - La sécurité avant tout
  Hashage du mot de passe maître - Travail terminé
  Double cryptage via clé secrète et clé privée de l'utilisateur - Travail terminé
