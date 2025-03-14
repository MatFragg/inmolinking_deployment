import db from "../../config/db.js";
import { DataTypes } from 'sequelize'

const Empresa = db.define("empresa", {
    nombre: {
        type: DataTypes.STRING(65),
        allowNull: false
    },
    direccion: {
        type: DataTypes.STRING(65),
        allowNull: false
    }
});

export default Empresa;