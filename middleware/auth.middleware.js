function checkAuth(req, res, next) {
    // Liste des routes publiques
    const publicRoutes = ['/login', '/register', '/api/register', '/forgotpwd', '/api/login', '/api/logout', '/api/verifytoken', '/api/sendmail', '/api/newpassword'];
    // console.log(req.path, req.session.user);
    // Si l'utilisateur n'est pas connecté et essaie d'accéder à une route protégée
    if (!req.session.user && !publicRoutes.includes(req.path)) {
        return res.redirect('/login');
    }
    
    next();
}

module.exports = checkAuth;