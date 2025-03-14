import db from "../../config/db.js";
import { DataTypes } from 'sequelize'

const AgenteEmpresa = db.define("agente_empresa", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    razon_social: {
        type: DataTypes.STRING(225),
        allowNull: false
    },
    ruc: {
        type: DataTypes.STRING(15),
        allowNull: false,
        unique: true,
        validate: {
            isNumeric: true
        }
    }
});

export default AgenteEmpresa;