import { Router } from 'express';
import { PerfilController } from '../controller/perfil.controller.js';
import { isUsuario } from '../config/config.auten.autoriz.js';



export const router=Router()

router.post('/consultasWs', isUsuario, PerfilController.ConsultasWs);
router.post('/premium/:cid', PerfilController.CambiarUsuario);
