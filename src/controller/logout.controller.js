export class LogoutController {
    constructor(){}

    static async logoutUsuario(req,res){

        req.logger.info(`Logout del usuario ${req.session.usuario.nombre}`)
        req.session.destroy(error => {
            if (error) {
                res.status(500).redirect('/login?error=fallo en el logout');
                return;
            }
            
            res.redirect('/login');
        });
    
    }

}