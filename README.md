**Ce projet en NodeJs crée un coffre-fort de mots de passe sécurisé.**


**Prérequis** : Node.js (version LTS recommandée), un gestionnaire de bases de données (DB Browser for SQLite recommandé), l'ensemble des dépendances listées dans package.json, un fichier .env avec l'ensemble des variables d'environnement, un dossier config avec un config.js (contient les variables port, db, secret, smtp) et un dbConfig.js (qui renvoie un objet pool).

La base de données et sa méthode de connexion dépend de l'utilisation que vous souhaitez en faire.

Pour lancer l'application : _node index.js_

**Fonctionnalités** :


_1 - Interface EJS claire et intuitive pour les utilisateurs_

  En cas d'accès à une page nécessitant une connexion, redirection vers l'écran de connexion
  
  Ecran de connexion - Travail terminé
  
  Ecran d'inscription - Travail terminé
  
  Ecran d'oubli de mot de passe - Ecran terminé mais fonctionnalité non développée (pas de service mail associé)
  
  
  Après connexion
  
  Ecran d'accueil permettant de choisir entre l'accès au dashboard et la modification des paramètres du compte - Travail terminé
  
  Ecran Dashboard - Affichage des mots de passe stockés - Travail terminé
    
  Ecran Dashboard - Ajout de mots de passe - Travail terminé
    
  Ecran Dashboard - Suppression de mots de passe - Travail terminé
  
  Ecran Paramètres - Modification du mot de passe - Travail terminé
    
  Ecran Paramètres - Suppression du compte - Fonctionnalité encore en cours

  Ecran Dashboard - Bouton de déconnexion - Travail terminé
  

_2 - Fonctionnalités simples et efficaces_

  API séparée des écrans - Travail terminé
  
  Gestion des actions BDD et des routes séparément - Travail terminé
  
  Gestion d'un envoi de mail si oubli du mot de passe - fonctionnalité non développée (pas de service mail associé)
  

_3 - La sécurité avant tout_

  Hashage du mot de passe maître - Travail terminé

  Double cryptage via clé secrète et clé privée de l'utilisateur - Travail terminé
  
