import { DataTypes } from "sequelize"
import db from '../../config/db.js'

const Estado = db.define('estado_propiedades',{
    descripcion: {
        type: DataTypes.STRING(65),
        allowNull: false
    }
})

export default Estado