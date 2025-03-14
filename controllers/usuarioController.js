// Dependencias
import {check, validationResult} from 'express-validator'
import bcrypt from 'bcrypt'

// Archivos
import User  from '../models/Entidades/User.js'
import AgenteIndependiente from '../models/Entidades/AgenteIndependiente.js'
import AgenteEmpresa from '../models/Entidades/AgenteEmpresa.js'

import { generateId,generateJWT } from '../helpers/tokens.js'
import { emailRegister,emailRecoverPwd } from '../helpers/emails.js'

const formularioLogin = (req,res) => {
    res.render('auth/login', {
        pagina: 'Iniciar Sesión',
        csrfToken: req.csrfToken()
    })
}

const autenticar = async (req,res) => {
    // Validación
    await check('email').isEmail().withMessage('El emaill es obligatorio').run(req)
    await check('password').notEmpty().withMessage('La contraseña es obligatoria').run(req)

    let resultado = validationResult(req)

    // Verificar que el resultado este vacio
    if(!resultado.isEmpty()){
        // Errores
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    } 

    const { email, password } = req.body

    // Comprobar si el usuario existe
    const user = await User.findOne({where: {email}})
    console.log("Valor de user:", user);
    console.log("Tipo de user:", typeof user);
    
    if(!user){
        console.log("El usuario no fue encontrado en la base de datos.");
        // Errores
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El Usuario No Existe'}]
        })
    } 

    //Confirmar si el usuario se encuentra registrado
    if(!user.confirmado){
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'Tu cuenta no ha sido confirmada'}]
        })
    } 

    // Revisar Contraseña
    if(!user.verificarPassword(password)){
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken : req.csrfToken(),
            errores: [{msg: 'La contraseña es incorrecta'}]
        })
    }

    // Autenticar el usuario
    const token = generateJWT({id: user.id, nombre: user.nombre})
    console.log(token)

    // Almaccenar en un cookie
    return res.cookie('_token',token, {
        httpOnly:true
    }).redirect('/mis-propiedades')
}

const cerrarSesion = (req,res) => {
    return res.clearCookie('_token').status(200).redirect('/auth/login')
}   

const formularioRegistro = (req,res) => {
    res.render('auth/registro', {
        pagina: 'Crear Cuenta',
        csrfToken: req.csrfToken()
    })
}

const register = async (req,res) => {

    // Validación
    await check('nombre').notEmpty().withMessage('No es un nombre').run(req)
    await check('email').isEmail().withMessage('No es un email').run(req)
    await check('telefono').isLength({ min: 9, max: 9}).notEmpty().withMessage('El telefono es obligatorio').run(req);
    await check('password').isLength({ min: 6 }).withMessage('La contraseña debe contener al menos 6 caracteres').run(req)
    await check('repetir_password').equals(req.body.password).withMessage('Las contraseñas no son iguales').run(req)
    await check('tipoAgente').isIn(['independiente','empresa']).withMessage('Selecciona un Tipo de Agente').run(req)

    if(req.body.tipoAgente === 'independiente'){
        await check('dni').isLength({ min: 8, max: 8 }).notEmpty().withMessage('El número de DNI es obligatorio').run(req);
    } else if(req.body.tipoAgente === 'empresa'){
        await check('razon_social').notEmpty().withMessage('La razón social es obligatoria').run(req);
        await check('ruc').isLength(11).notEmpty().withMessage('El RUC es obligatorio').run(req);
    }

    let resultado = validationResult(req)

    //return res.json(resultado.array())

    if (!resultado.isEmpty()) {
        console.log('Validation Errors:', resultado.array());
    }
    // Verificar que el resultado este vacio
    if(!resultado.isEmpty()){
        // Errores
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
            user: {
                nombre: req.body.nombre,
                email: req.body.email,  
                telefono: req.body.telefono,
                tipoAgente: req.body.tipoAgente,
                dni: req.body.dni || '',
                razon_social: req.body.razon_social || '',
                ruc: req.body.ruc || '',
            }
        })
    } 


    // Extraer los Datos
    const { nombre, email, telefono, password , tipoAgente, dni, razon_social, ruc} = req.body

    // Verificar que el usuario no se encuentre ya registrado
    const userExists = await User.findOne({ where: {email}})
    if(userExists){
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El email ya esta registrado'}],
            user: {
                nombre: req.body.nombre,
                email: req.body.email,
                telefono: req.body.telefono,
                tipoAgente,
                dni,
                razon_social,
                ruc
            }
        })
    }
    
    // Crea el objeto de Usuario
    const user = await User.create({
        nombre,
        email,
        telefono,
        password,
        tipoAgente,
        token:generateId()
    })

    // Insert de acuerdo al tipo de Agente
    if (tipoAgente === 'independiente') {
        await AgenteIndependiente.create({
            id: user.id,
            dni
        });
    } else if (tipoAgente === 'empresa') {
        await AgenteEmpresa.create({
            id: user.id,
            nombre_empresa,
            ruc
        });
    }

    // Envia Email de Confirmación
    emailRegister({
        nombre: user.nombre,
        email: user.email,
        token: user.token
    })

    // Mostrar mensaje de confirmación
    res.render('templates/message', {
        pagina: 'Cuenta creada Correctamente',
        message: 'Hemos Enviado un Email de confirmación , presiona en el enlace'
    })
}

// Verificador de cuentas
const confirmar = async (req,res) => {
        const {token} = req.params;
        const user = await User.findOne({where: {token}})
        if(!user) {
            return res.render('auth/confirm-account',{
                pagina: 'Error al confirmar tu cuenta',
                message: 'Hubo un error al confirmar tu cuenta, intenta nuevamente',
                error: true
            })
        }
    // Confirmar Cuenta
    user.token = null;
    user.confirmado = true;
    await user.save();

    res.render('auth/confirm-account',{
        pagina: 'Cuenta Confirmada',
        message: 'La cuenta fue confirmada correctamente',
    })
}

const formularioOlvidePassword = (req,res) => {
    res.render('auth/olvide-password', {
        pagina: 'Recupera tu acceso a Bienes Raices',
        csrfToken: req.csrfToken()
    })
}

const resetPassword = async (req,res) => {
    await check('email').isEmail().withMessage('Eso no parece un email').run(req)
    let resultado = validationResult(req)

    // Comprobar que el resultado este vacio
    if(!resultado.isEmpty()){
        return res.render('auth/olvide-password',{
            pagina: 'Recupera tu acceso a Bienes Raices',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    }   

    // Buscar Usuario
    const {email} = req.body
    const user = await User.findOne({where: {email}})
    if(!user){
        return res.render('auth/olvide-password',{
            pagina: 'Recupera tu acceso a Bienes Raices',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El Email no Pertenece a ningún Usuario'}]
        })
    }

    // Generar token y enviar correo
    user.token = generateId();
    await user.save();

    //Enviar un email
    emailRecoverPwd({
        email: user.email,
        nombre: user.nombre,
        token: user.token
    })

    // Renderizar un mensaje
    res.render('templates/message', {
        pagina: 'Restablece tu Contraseña',
        message: 'Hemos Enviado un Email con las instrucciones , presiona en el enlace'
    })
}

const comprobarPorToken = async (req,res) => {
    const {token} = req.params;

    const user = await User.findOne({where:{token}}) 
    if(!user){
        return res.render('auth/confirm-account',{
            pagina: 'Restablecer Contraseña',
            message: 'Hubo un error al validar tu información, intenta nuevamente',
            error: true
        })
    }
    // Mostrar Formulario para modificar la contraseña
    res.render('auth/reset-password',{
        pagina: 'Restablece tu Password',
        csrfToken: req.csrfToken()
    })  
}

const nuevaPWD = async (req,res) => {
    // Validar Password
    await check('password').isLength({ min: 6 }).withMessage('La contraseña debe contener al menos 6 caracteres').run(req)

    let resultado = validationResult(req)

    //return res.json(resultado.array())
    // Verificar que el resultado este vacio
    if(!resultado.isEmpty()){
        // Errores
        return res.render('auth/reset-password', {
            pagina: 'Restablecer Contraseña',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    } 

    const {token} = req.params
    const {password} = req.body

    // Identificar quien realiza el cambio de contraseña
    const user = await User.findOne({where:{token}})
    
    // Hashear
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(password,salt);
    user.token = null;

    await user.save()
    res.render('auth/confirm-account',{
        pagina: 'Cambio de Contraseña',
        message: 'Se cambio la contraseña satisfactoriamente'
    })
}

export {
    formularioLogin,
    autenticar,
    cerrarSesion,
    formularioRegistro,
    register,
    confirmar,
    formularioOlvidePassword,
    resetPassword,
    comprobarPorToken,
    nuevaPWD
}