import Sequelize from 'sequelize'
import dotenv from 'dotenv'
dotenv.config({path: '.env'})

const db = new Sequelize( process.env.BD_NOMBRE, process.env.BD_USER, process.env.BD_PWD, {
    host: process.env.BD_HOST,
    port: 3306,
    dialect: 'mysql',
    define: {
        timestamps: true
    },
    pool: {
        max: 5, /* maximas conexiones en simultaneo a mantener */
        min: 0, /* minimas conexiones en simultaneo a mantener */
        acquire: 3000, /* 30 segundos antes de marcar un error */
        idle: 1000 /* 10 segundos para finalizar una conexión */
    },
    operatorAliases: false
});

export default db