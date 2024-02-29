import passport from 'passport'
import local from 'passport-local'
import github from 'passport-github2'
import { creaHash, validaPassword } from '../utils.js'
import { UsuariosMongoDao } from '../dao/usuariosDao.js'
import { CarritoMongoDao } from '../dao/carritoDao.js'


const usuariosDao = new UsuariosMongoDao();
const carritoDao=new CarritoMongoDao();

// exporto 
export const inicializarPassport=()=>{

// ESTRATEGIA LOCAL
    passport.use('registro', new local.Strategy(
        {
            passReqToCallback: true, usernameField: 'email' 
        },
        async(req, username, password, done)=>{
            try { 
                let {nombre, email}=req.body
                
                if(!nombre || !email || !password){
                    return done(null, false)
                }
            
                let regMail=/^(([^<>()\[\]\\.,;:\s@”]+(\.[^<>()\[\]\\.,;:\s@”]+)*)|(“.+”))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$/

                if(!regMail.test(email)){
                     return done(null, false)
                }
            
                let existe=await usuariosDao.getUsuarioByEmail(email)
                if(existe){
                    return done(null, false)
                }

                if (email === 'adminCoder@coder.com') {
                    try {
                        let hashedPassword = creaHash(password);
                        let usuario = await usuariosDao.createAdmin(nombre, email, hashedPassword, 'administrador');
                        delete usuario.password
                        req.logger.info(`Se registro el usuario ${usuario}`)
                        return done(null, usuario)
                    } catch (error) {
                        return done(null, false)
                    }
                } else {
                    password = creaHash(password);
                    try { 
                        let {_id:carrito} = await carritoDao.createEmptyCart()
                        let usuario = await usuariosDao.crearUsuarioRegular(nombre, email, password, carrito);
                        delete usuario.password
                        req.logger.info(`Se registro el usuario ${usuario}`)

                        return done(null, usuario)
                    } catch (error) {
                        return done(null, false)
                    }
                }
                   
            } catch (error) {
                return done(error)
            }
        }
    ))

    passport.use('login', new local.Strategy(
        {
            usernameField: 'email'
        },
        async(username, password, done)=>{
            try {
                
                if (!username || !password) {
                    return done(null, false)
                }
            
                let usuario = await usuariosDao.getUsuarioByEmailLogin(username);
            
                if (!usuario) {
                    return done(null, false)
                }
            
                if (!validaPassword(usuario, password)) {
                    return done(null, false)
                } 
                
                delete usuario.password
                return done(null, usuario);
                
                 
            } catch (error) {
                done(error, null)
            }
        }
    ))


    // ESTRATEGIA DE LOGIN CON GITHUB O 3EROS
    passport.use('github', new github.Strategy(
        {
            clientID: "Iv1.fbe5e6fd3004c588", 
            clientSecret: "2c5119157bc2b281398a3edc7feef65c90682651", 
            callbackURL: "http://localhost:3012/api/login/callbackGithub", 
        },
        async(accessToken, refreshToken, profile, done)=>{
            try {
                // console.log(profile)
                let usuario=await usuariosDao.getUsuarioByEmailLogin(profile._json.email)
                if(!usuario){
                    usuario = await usuariosDao.crearUsuarioGitHub(profile._json.name, profile._json.email);
                }
                delete usuario.password
                return done(null, usuario)


            } catch (error) {
                return done(error)
            }
        }
    ))
    
    
    // configurar serializador y deserializador porque uso passport con session
    passport.serializeUser((usuario, done)=>{
        return done(null, usuario._id)
    })

    passport.deserializeUser(async(id, done)=>{
        let usuario=await usuariosDao.getUsuarioById(id)
        return done(null, usuario)
    })

} 