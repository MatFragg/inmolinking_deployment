import db from "../../config/db.js";
import { DataTypes } from 'sequelize'

const AgenteIndependiente = db.define("agente_independientes", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    dni: {
        type: DataTypes.STRING(8),
        allowNull: false
    }
});

export default AgenteIndependiente;