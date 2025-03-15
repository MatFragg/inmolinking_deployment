import { unlink } from 'node:fs/promises'
import { validationResult } from 'express-validator'
import { Precio, Categoria,Propiedad,Estado,Mensaje, User} from '../models/Index.js'
import {esVendedor,formatDate} from '../helpers/index.js'

const admin = async (req,res) => {
    
    // Leer QueryString
    const {pagina: paginaActual} = req.query

    // Expresion Regular solo acepta digitos del 0-9 , esto se usa para que acepte hasta 9 paginas , ^ significa que siempre inicia con un digito y $ que siempre finaliza con uno
    const expresion = /^[0-9]$/

    // Aqui se revisa el patron de la variable de arriba
    if(!expresion.test(paginaActual)){
        return res.redirect('/mis-propiedades?pagina=1')
    }

    try {
        const { id } = req.user

        // Limites y Offset para el paginador
        const limit = 5;
        const offset = ((paginaActual * limit)- limit) 
        const [propiedades, total] = await Promise.all([
            Propiedad.findAll({
                limit,
                offset,
                where: {
                    usuarioId: id
                },
                include: [
                    // Aqui se incluye el modelo del index.js/models el cual contiene las relaciones
                    {model: Categoria, as: 'categoria'},
                    {model: Precio, as: 'precio'},
                    {model: Estado, as: 'estado'},
                    {model: Mensaje, as: 'mensajes'}
                ],
            }),
            Propiedad.count({
                where: {
                    usuarioId: id
                }
            })
        ])
        res.render('propiedades/admin',{
            pagina: 'Mis Propiedades',
            propiedades,
            csrfToken: req.csrfToken(),
            paginas: Math.ceil(total / limit),
            paginaActual: Number(paginaActual),
            total,
            offset,
            limit
        })
    } catch (error) {
        console.log(error)
    }

}

// Formulario para crear una nueva propiedad
const crear = async (req,res) => {
    // Consultar Modelo de Precio y Categoria
    const [categorias,precios,estados] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll(),
        Estado.findAll()
    ])

    res.render('propiedades/crear',{
        pagina: 'Crear Propiedad',
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        estados,
        data: {}
    })
}

const save = async (req,res) => {
    // Validación
    let result = validationResult(req)

    if(!result.isEmpty()){
            // Consultar Precio y Categoria
        const [categorias,precios,estados] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll(),
            Estado.findAll()
        ])

        return res.render('propiedades/crear',{
            pagina: 'Crear Propiedad',
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            estados,
            errores: result.array(),
            data: req.body
        })
    }

    // Crear un Registro
    const { titulo,descripcion,habitaciones,estacionamientos,wc,calle,lat,lng,precio:precioId,categoria:categoriaId,estado:estadoId} = req.body

    const { id: usuarioId} = req.user
    //const { id: userId } = req.user

    try {
        const propiedadGuardada = await Propiedad.create({
            titulo,
            descripcion,
            habitaciones,
            estacionamientos,
            wc,
            calle,
            lat,
            lng,
            precioId,
            categoriaId,
            usuarioId,
            estadoId,
            imagen: ''
        })

        const { id } = propiedadGuardada
        res.redirect('/propiedades/agregar-imagen/' + id)
    } catch (error) {
        console.log(error)
    }
}

const agregarImagen = async (req,res) => {
    const {id} = req.params 
    // Validando que la propiedad exista en la BD
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad) {
        return res.redirect('/mis-propiedades')
    }
    // Validar que la propiedad no este publicada
    if(propiedad.publicado) {
        return res.redirect('/mis-propiedades')
    }

    // Validar que la propiedad pertenezca al usuario que visita esta página
    if(req.user.id.toString() !== propiedad.usuarioId.toString()){
        return res.redirect('/mis-propiedades')
    }


    res.render('propiedades/agregar-imagen',{
        pagina: `Agregar Imagenes: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        propiedad
    })
}

const almacenarImagen = async (req,res,next) => {
    const {id} = req.params 
    // Validando que la propiedad exista en la BD
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad) {
        return res.redirect('/mis-propiedades')
    }
    // Validar que la propiedad no este publicada
    if(propiedad.publicado) {
        return res.redirect('/mis-propiedades')
    }

    // Validar que la propiedad pertenezca al usuario que visita esta página
    if(req.user.id.toString() !== propiedad.usuarioId.toString()){
        return res.redirect('/mis-propiedades')
    }

    try {
        console.log(req.file)
        // Almacenar la imagen y publicar propiedad
        propiedad.imagen = req.file.filename
        propiedad.publicado = 1

        await propiedad.save()
        next()

    } catch (error) {
        console.log(error)
    }
}


const editarPropiedad = async (req,res) => {
    // Validar que existe la propiedad
    const { id } = req.params
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    // Validar que quien visita la propiedad es quien la creo
    if(propiedad.usuarioId.toString() !== req.user.id.toString()){
        return res.redirect('/mis-propiedades')
    }


    const [categorias,precios,estados] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll(),
        Estado.findAll()
    ])

    res.render('propiedades/editar',{
        pagina: `Editar Propiedad:  ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        estados,
        data: propiedad
    })
}

const guardarCambios = async (req,res) => {
    // Verificar la validacion
    let result = validationResult(req)

    if(!result.isEmpty()){
            // Consultar Precio y Categoria
        const [categorias,precios,estados] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll(),
            Estado.findAll()
        ])

        return res.render('propiedades/editar',{
            pagina: 'Editar Propiedad',
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            estados,
            errores: result.array(),
            data: req.body
        })
    }

    // Validar que existe la propiedad
    const { id } = req.params
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    // Validar que quien visita la propiedad es quien la creo
    if(propiedad.usuarioId.toString() !== req.user.id.toString()){
        return res.redirect('/mis-propiedades')
    }

     // Actualizar el objeto y reescribirlo
    try {
        // Crear un Registro
        const { titulo,descripcion,habitaciones,estacionamientos,wc,calle,lat,lng, precio:precioId,categoria:categoriaId, estado:estadoId} = req.body
        propiedad.set({
            titulo,
            descripcion,
            habitaciones,
            estacionamientos,
            wc,
            calle,
            lat,
            lng,
            precioId,
            categoriaId,
            estadoId
        })
        await propiedad.save();

        return res.redirect('/mis-propiedades')

        } catch (error) {
        console.log(error)
    }
    
}

const eliminar = async (req,res) => {
    const { id } = req.params
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    // Validar que quien visita la propiedad es quien la creo
    if(propiedad.usuarioId.toString() !== req.user.id.toString()){
        return res.redirect('/mis-propiedades')
    }
    // Eliminar imagenes
    await unlink(`public/uploads/${propiedad.imagen}`)
    console.log(`Se eliminó la imagen ${propiedad.imagen}`)
    // Eliminar la propiedad
    await propiedad.destroy()
    res.redirect('/mis-propiedades')
}


// Nodifica el estado de la propiedad
const cambiarEstado = async (req,res) => {
    const { id } = req.params
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    // Validar que quien visita la propiedad es quien la creo
    if(propiedad.usuarioId.toString() !== req.user.id.toString()){
        return res.redirect('/mis-propiedades')
    }

    // Actuailizar el estado
    propiedad.publicado = !propiedad.publicado

    await propiedad.save()

    res.json({
        resultado: 'ok'
    })
}

// Muestra una propiedad
const mostrarPropiedad = async(req,res) => {
    const {id} =req.params

    // Comprobar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id,{
        include: [
            {model: Precio, as : 'precio'  },
            {model: Categoria, as: 'categoria'},
            {model: Estado, as: 'estado'},
        ]
    })
    if(!propiedad || !propiedad.publicado) {
        return res.redirect('/404')
    }

    // Optional Changing "?" means the object may exist or not
    //console.log(esVendedor(req.user?.id , propiedad.usuarioId))

    res.render('propiedades/mostrar',{
        propiedad,
        pagina:propiedad.titulo,
        csrfToken: req.csrfToken(),
        user: req.user,
        esVendedor: esVendedor(req.user?.id , propiedad.usuarioId)
    })
}

const sendMessage = async (req,res) => {
    const {id} =req.params

    // Comprobar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id,{
        include: [
            {model: Precio, as : 'precio'  },
            {model: Categoria, as: 'categoria'},
            {model: Estado, as: 'estado'},
        ]
    })
    if(!propiedad) {
        return res.redirect('/404')
    }

    // Validación
    let result = validationResult(req)

    if(!result.isEmpty()){
        // Consultar Precio y Categoria
        return  res.render('propiedades/mostrar',{
            propiedad,
            pagina:propiedad.titulo,
            csrfToken: req.csrfToken(),
            user: req.user,
            esVendedor: esVendedor(req.user?.id , propiedad.usuarioId),
            errores: result.array()
        })  
    }

    // Almacenar el mensaje

    const { mensaje } = req.body
    const {id: propiedadId} = req.params
    const {id: usuarioId} = req.user

    await Mensaje.create({
        mensaje,
        propiedadId,
        usuarioId
    })

    res.redirect(`/propiedad/${propiedadId}`)
}



// LEER MENSAJES
const showMessages = async (req,res) => {
    const { id } = req.params
    const propiedad = await Propiedad.findByPk(id, {
        include: [
            // Aqui se incluye el modelo del index.js/models el cual contiene las relaciones
            {model: Mensaje, as: 'mensajes', 
                include: [{model: User.scope('eliminarPassword'), as: 'user'}]
            },
        ],
    })

    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    // Validar que quien visita la propiedad es quien la creo
    if(propiedad.usuarioId.toString() !== req.user.id.toString()){
        return res.redirect('/mis-propiedades')
    }
    res.render('propiedades/mensajes',{
        pagina: 'Mensajes',
        mensajes: propiedad.mensajes,
        formatDate
    })
}

export {
    admin,
    crear,
    save,
    agregarImagen,
    almacenarImagen,
    editarPropiedad,
    guardarCambios,
    eliminar,
    cambiarEstado,
    mostrarPropiedad,
    sendMessage,
    showMessages
}