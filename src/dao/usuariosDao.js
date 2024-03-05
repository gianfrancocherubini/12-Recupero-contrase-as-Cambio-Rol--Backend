import { UsuariosModelo } from "./models/usuarios.model.js";

export class UsuariosMongoDao {

    async getUsuarios(usuarioId) {
        try {
            const usuarios = await UsuariosModelo.findById({ _id: usuarioId, rol: "usuario" });
            return usuarios;
        } catch (error) {
            req.logger.error(`Error al obttener el usuario por id ${error}`);
            throw error;
        }
    }

    async getUsuarioAdmin(adminId) {
        try {
            const administrador = await UsuariosModelo.findById({ _id: adminId, rol: "administrador" });
            return administrador;
        } catch (error) {
            req.logger.error(`Error al obtener administrador, ${error}`);
            throw error;
        }
    }

    async getTodosUsuarios() {
        try {
            const todosUsuarios = await UsuariosModelo.find().lean();
            return todosUsuarios;
        } catch (error) {
            req.logger.error(`Error al obtener todos los usuarios,${error}`);
            throw error;
        }
    }

    async getUsuarioByEmail(email){
        try {
            let existe=await UsuariosModelo.findOne({email})
            return existe;
        }catch(error){
            // req.logger.error(`Error al obtener el usuario por email,${error}`);
            throw error;
        }
    }

    async getUsuarioById(id){
        try {
            let usuario=await UsuariosModelo.findOne({id})
            return usuario;
        }catch(error){
            req.logger.error(`Error al obtener el usuario por email,${error}`);
            throw error;
        }
    }

    async createAdmin(nombre, email, password, rol) {
        try {
            let usuario = await UsuariosModelo.create({ nombre, email, password, rol: 'administrador' });
            return usuario;
        } catch (error) {
            req.logger.error(`Error al crear administrador,${error}`);
            throw error;
        }
    }

    async crearUsuarioRegular(nombre, email, password, idCarrito) {
        try {
            const usuario = await UsuariosModelo.create({ nombre, email, password,carrito: idCarrito });
            return usuario;
        } catch (error) {
            req.logger.error(`Error al crear usuario regular,${error}`);
            throw error;
        }
    }

    async getUsuarioByEmailLogin(email) {
        try {
            const usuario = await UsuariosModelo.findOne({ email }).lean();
            return usuario;
        } catch (error) {
            // req.logger.error(`Error al crear usuario regular,${error}`);
            console.log(error);
        }
    }


    async crearUsuarioGitHub(nombre, email) {
        try {
            const nuevoUsuario = { nombre, email };
            const usuario = await UsuariosModelo.create(nuevoUsuario);
            return usuario;
        } catch (error) {
            req.logger.error("Error al crear usuario GitHub");
            throw error;
        }
    }

    async modificarUsuarioRol(usuarioId, rolNuevo){
        try {

            const usuarioModificar = await UsuariosModelo.findByIdAndUpdate(
                usuarioId,
                { $set: { rol: rolNuevo } },
                { new: true }
            );
            return usuarioModificar;
            
            
        } catch (error) {
            console.log(`error de funcion modificar usuario, ${error}`)
            req.logger.error(`Error al modificar el usuario,${error}`);
            throw error;
        }
    }


}

