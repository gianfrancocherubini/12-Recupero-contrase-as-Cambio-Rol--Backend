import { enviarWs } from "../config/config.whatsApp.js";
import { UsuariosMongoDao } from '../dao/usuariosDao.js';
const usuariosDao =new UsuariosMongoDao()


export class PerfilController {
    constructor(){}

    static async perfilUsuario(req,res){

    let usuario = req.session.usuario;
    res.setHeader('Content-Type', 'text/html');
    res.status(200).render('perfil', { usuario, login: true });
    
    }

    static async ConsultasWs(req,res){
        
        const consulta = req.body.consulta; 
        try {
            let usuario = req.session.usuario;
            let mensajeEnviado= await enviarWs(consulta);
            req.logger.info(consulta)
            res.setHeader('Content-Type', 'text/html');
            res.status(201).render('perfil',{ mensajeEnviado, usuario, login: true });
        } catch (error) {
            req.logger.error("Error al enviar consulta")
            res.setHeader('Content-Type', 'text/html');
            res.status(500).send("Error al enviar la consulta. Por favor, inténtalo de nuevo más tarde.");
        }
    }

    static async CambiarUsuario(req, res) {

        const usuarioId = req.params.cid;
        let usuario = req.session.usuario;
    
        try {

            let nuevoRol;
            if (usuario.rol === 'usuario') {
                nuevoRol = 'premium';
            } else if (usuario.rol === 'premium') {
                nuevoRol = 'usuario';
            }
    
            await usuariosDao.modificarUsuarioRol(usuarioId, nuevoRol);
    
            usuario.rol = nuevoRol;
            req.session.usuario = usuario;
    
            req.logger.info("Rol de usuario cambiado exitosamente.");
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(`Usuario: ${usuarioId} cambiado de rol`);
        } catch (error) {
            req.logger.error(`Error al cambiar el rol del usuario ${error}`);
            res.setHeader('Content-Type', 'application/json');
            res.status(500).json("Error al cambiar el rol del usuario. Por favor, inténtalo de nuevo más tarde.");
        }
    }
}


