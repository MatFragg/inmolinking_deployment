import express from 'express'
import {body} from 'express-validator'
import {admin, crear,save,agregarImagen,almacenarImagen,editarPropiedad,guardarCambios,eliminar,cambiarEstado,mostrarPropiedad,sendMessage,showMessages} from '../controllers/propiedadController.js'
import protectRoute from '../middleware/protectRoute.js'
import upload from '../middleware/subirImagen.js'   
import indentifyUser from '../middleware/identificarUsuario.js'

/*value= data.titulo ? data.titulo : '' sirve para que los campos no se vacien al momento de encontrar errores
selected= data.categoria ? data.categoria == categoria.id ? true : false : null)
Si existe categoria compara que la opción seleccionada sea igual a la que se esta imprimiendo sobre la cual se itera , retorna los valores de true, false y null(la primera vez)*/

// Validación en el Router

const router = express.Router()

router.get('/mis-propiedades', protectRoute ,admin)
router.get('/propiedades/crear', protectRoute, crear)
router.post('/propiedades/crear', protectRoute,
    body('titulo').notEmpty().withMessage('El titulo del anuncio es obligatorio'),
    body('descripcion')
        .notEmpty().withMessage('La descripción no puede ir vacia')
        .isLength({max:200}).withMessage('La descripción es muy Larga'),
    body('categoria').isNumeric().withMessage('Selecciona una categoria'),
    body('precio').isNumeric().withMessage('Selecciona una precio'),
    body('estado').isNumeric().withMessage('Selecciona un estado'),
    body('habitaciones').isNumeric().withMessage('Seleccionar la Cantidad de Habitaciones'),
    body('estacionamientos').isNumeric().withMessage('Seleccionar la Cantidad de Estacionamientos'),
    body('wc').isNumeric().withMessage('Seleccionar la Cantidad de Baños'),
    body('lat').notEmpty().withMessage('Ubica la Propiedad en el Mapa'),
        save)

router.get('/propiedades/agregar-imagen/:id', protectRoute, agregarImagen)
router.post('/propiedades/agregar-imagen/:id',protectRoute,
    upload.single('imagen'),
    almacenarImagen
)

router.get('/propiedades/editar/:id',protectRoute, editarPropiedad)

router.post('/propiedades/editar/:id', protectRoute,
    body('titulo').notEmpty().withMessage('El titulo del anuncio es obligatorio'),
    body('descripcion')
        .notEmpty().withMessage('La descripción no puede ir vacia')
        .isLength({max:200}).withMessage('La descripción es muy Larga'),
    body('categoria').isNumeric().withMessage('Selecciona una categoria'),
    body('precio').isNumeric().withMessage('Selecciona una precio'),
    body('estado').isNumeric().withMessage('Selecciona un estado'),
    body('habitaciones').isNumeric().withMessage('Seleccionar la Cantidad de Habitaciones'),
    body('estacionamientos').isNumeric().withMessage('Seleccionar la Cantidad de Estacionamientos'),
    body('wc').isNumeric().withMessage('Seleccionar la Cantidad de Baños'),
    body('lat').notEmpty().withMessage('Ubica la Propiedad en el Mapa'),
        guardarCambios)

router.post('/propiedades/eliminar/:id',
    protectRoute,
    eliminar
)

router.put('/propiedades/:id',
    protectRoute,
    cambiarEstado
)

// Area Publica
router.get('/propiedad/:id',
    indentifyUser,
    mostrarPropiedad
)

// Almacenar Mensajes
router.post('/propiedad/:id',
    indentifyUser,
    body('mensaje').isLength({min:10}).withMessage('El mensaje debe tener al menos 10 caracteres'),
    sendMessage
)


router.get('/mensajes/:id',
    protectRoute,
    showMessages
)
export default router