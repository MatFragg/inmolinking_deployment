import express from "express";
import { formularioLogin, autenticar,cerrarSesion, formularioRegistro, register, confirmar,formularioOlvidePassword,resetPassword,comprobarPorToken,nuevaPWD } from "../controllers/usuarioController.js";
const router = express.Router();

// Routing
router.get('/login', formularioLogin)
router.post('/login', autenticar)

//Cerrar sesion
router.post('/cerrar-sesion', cerrarSesion)

router.get('/registro', formularioRegistro)
router.post('/registro', register)

router.get('/confirmar/:token', confirmar)

router.get('/olvide-password', formularioOlvidePassword)
router.post('/olvide-password', resetPassword)

// Nueva Contraseña
router.get('/olvide-password/:token', comprobarPorToken)
router.post('/olvide-password/:token', nuevaPWD)

export default router