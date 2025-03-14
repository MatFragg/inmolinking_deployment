import express from 'express'
import csrf from 'csurf'
import cookieParser from 'cookie-parser'
import userRoutes from './routes/userRoutes.js'
import propiedadesRoutes from './routes/propiedadesRoutes.js'
import appRoutes from './routes/appRoutes.js'
import apiRoutes from './routes/apiRoutes.js'
import healthRoutes from './routes/healthRoutes.js'
import db from './config/db.js'
import identifyUser from './middleware/identificarUsuario.js';


// Crear la app
const app = express()

// Habilitar lectura de datos de formularios (Usuarios)
app.use(express.urlencoded({extended: true}))

// Habilitar Cookie Parser
app.use(cookieParser());

// Habilitar CSRF
app.use(csrf({cookie: true}))

// Conexión a la Data Base
try {
    await db.authenticate();
    db.sync()
    console.log('Conexión Correcta a la Base de datos')
} catch (error) {
    console.log(error)  
}

app.use(identifyUser);
app.use((req, res, next) => {
    res.locals.isAuthenticated = !!req.user;
    next();
});

// Habilitar Pug
app.set('view engine' , 'pug')
app.set('views', './views')

// Public Folder
app.use(express.static('public'))

// Routing
app.use('/',appRoutes)
app.use('/auth', userRoutes)
app.use('/', propiedadesRoutes)
app.use('/api', apiRoutes)
app.use('/', healthRoutes)


// Definicion del puerto y arrancar el project
const port = process.env.port || 4950;
app.listen(port, () => {
    console.log('El servidor esta funcionando en el puerto %d',port)
});

process.on('SIGINT', async () => {
    console.log('Cerrando conexiones de la base de datos...');
    await db.close();
    process.exit(0);
});
