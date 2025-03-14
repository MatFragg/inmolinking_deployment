import { exit } from 'node:process'
import categorias from './categorias.js'
import precios from './precios.js'
import users from './usuario.js'
import estados from './estado.js'

import db from '../config/db.js'
import {Propiedad,Precio,Categoria,Usuario,Estado } from '../models/Index.js'


const importarDatos = async () => {
    try {
        // Autenticar
        await db.authenticate()

        // Generar las Columnas
        await db.sync()

        // Insertamos los datos
        await Promise.all([
            Precio.bulkCreate(precios),
            Categoria.bulkCreate(categorias),
            Usuario.bulkCreate(users),
            Estado.bulkCreate(estados)
        ])
        console.log('Datos Importados Correctamente')
        exit(0)

    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

const eliminarData = async () => {
    try{
        // Forma 1
        /*await Promise.all([
            Precio.destroy({where: {}, truncate: true}),
            Categoria.destroy({where: {}, truncate: true})
        ])*/
        
        // Forma 2
        await db.sync({force: true})
        
        console.log('Datos Eliminados Correctamente')
        exit(0)
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

if(process.argv[2] === "-i") {
    importarDatos();
}

if(process.argv[2] === "-e") {
    eliminarData();
}
