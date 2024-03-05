import { enviarWs } from "../config/config.whatsApp.js";
import { UsuariosMongoDao } from '../dao/usuariosDao.js';
import jwt from "jsonwebtoken";
import { creaHash } from "../utils.js";
import { enviarEmail } from "../mails/mails.js";
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

    static async renderRecuperoPassword(req,res){
        let {error, mensaje} =req.query;
        let usuario = req.session.usuario;
        res.setHeader('Content-Type', 'text/html');
        res.status(200).render('recupero', { usuario, login: false, error, mensaje });
    }

    static async recuperoPassword01 (req, res){
        let {email} = req.body
        let usuario = await usuariosDao.getUsuarioByEmailLogin(email);
        req.logger.info(usuario.email);
        if(!usuario){
            return res.redirect('/recuperoPassword?error=No se encontro el usuario con el email proporcionado, verifique si es el correcto!')
        }
        
        let token=jwt.sign({...usuario}, "CoderCoder123", {expiresIn:"1h"})
        console.log(`el token es `,token)
        let mensaje=`Hola. Ha solicitado recuperar su contraseña!.
            Haga click en el siguiente link: <a href="http://localhost:3012/recuperoPassword02?token=${token}">Recuperar Contraseña</a>
            para reestablecer su contraseña`;

        let respuesta = await enviarEmail(email, "Recupero Password", mensaje)
        console.log(respuesta)
        if(respuesta.accepted.length>0){
            res.redirect('/recuperoPassword?mensaje=Recibira al instante un mail para recuperar la contraseña! Verifique su casilla de correo.')
        }else{
            res.redirect('/recuperoPassword?mensaje=Error al intentar recuperar contraseña')

        }
    }

    static async renderRecuperoPassword02(req, res) {
        
        try {
            let { token, mensaje, error } = req.query;
            // Verifica el token y extrae los datos del usuario si el token es válido
            let datosToken = jwt.verify(token, "CoderCoder123");
            console.log(`los datos del token sonnnn`, datosToken)
            
            res.setHeader('Content-Type', 'text/html');
            res.status(200).render("recupero02", { token, mensaje, error });
        } catch (error) {
            // Si hay un error al verificar el token, redirige con un mensaje de error
            res.redirect("/recuperoPassword02?error=Error token: " + error.message);
        }
    }

    static async recuperoPassword03 (req,res){

        let {password, password2, token} = req.body

        if(password !== password2){
            res.redirect("/recuperoPassword02?error=Las claves deben coincidir");
        }
        if(!req.body.password || !req.body.password2){
            res.redirect("/recuperoPassword02?error=Debe ingresar las claves");
        }

        try {
            // let datosToken=jwt.verify(token, "CoderCoder123")
            // console.log('los datos del token: ', datosToken)
            // console.log(datosToken.email)
            // let usuario=await usuariosDao.getUsuarioByEmailLogin(datosToken.email);
            // console.log(usuario)
            // if(!usuario){
            //     res.setHeader('Content-Type','application/json');
            //     return res.status(400).json({error:`Error de usuario`})
            // }

            // if(bcrypt.compareSync(password, usuario.password)){
            //     res.redirect("/recuperoPassword02?error=Ha ingresado una contraseña utilizada en el pasaso, debe ingrezar una nueva.");
                
            // }
            // // console.log("llego 01")
            // let usuarioActualizado={...usuario, password: creaHash(password)}
            // // console.log("llego 02")
    
            // console.log(usuarioActualizado)
            // // await usuariosModelo.updateOne({email:datosToken.email}, usuarioActualizado)
            // // console.log("llego 03")
    
            // // res.redirect("http://localhost:3000/index.html?mensaje=Contraseña reseteada...!!!")
        } catch (error) {
            res.setHeader('Content-Type','application/json');
            return res.status(500).json({error:`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`})
        }
    }

}


