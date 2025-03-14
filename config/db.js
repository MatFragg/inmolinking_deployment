import Sequelize from 'sequelize'
import dotenv from 'dotenv'
dotenv.config({path: '.env'})

const db = new Sequelize( process.env.BD_NOMBRE, process.env.BD_USER, process.env.BD_PWD, {
    host: process.env.BD_HOST,
    port: process.env.BD_PORT,
    dialect: 'mysql',
    define: {
        timestamps: true
    },
    pool: {
        max: 3, /* maximas conexiones en simultaneo a mantener */
        min: 0, /* minimas conexiones en simultaneo a mantener */
        acquire: 30000, /* 30 segundos antes de marcar un error */
        idle: 10000 /* 10 segundos para finalizar una conexión */
    },
    operatorAliases: false
});

export default db