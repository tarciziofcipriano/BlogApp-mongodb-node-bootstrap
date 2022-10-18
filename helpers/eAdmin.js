// Verificar se um usuário está autenticado e se ele é admin para poder acessar a rota
module.exports = {
    eAdmin: function(req, res, next){
        if(req.isAuthenticated() && req.user.eAdmin == 1){
            return next();
        }
        req.flash("error_msg", "Você precisa ser um admin")
        res.redirect("/")
    }
}