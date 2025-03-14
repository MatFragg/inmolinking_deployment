import { DataTypes } from 'sequelize'
import bcrypt from 'bcrypt'
import db from '../../config/db.js'

const User = db.define('users', {
    nombre: {
        type: DataTypes.STRING(65),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    }, 
    telefono: {
        type: DataTypes.STRING(15),
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tipoAgente: {
        type: DataTypes.ENUM('independiente', 'empresa'),
        allowNull: false
    },
    token: DataTypes.STRING,
    confirmado: DataTypes.BOOLEAN
},{
    hooks: {
        beforeCreate: async function(user){
            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(user.password,salt);
        }
    },
    scopes: {
        eliminarPassword: {
            attributes:{
                exclude: ['password', 'token', 'confirmado', 'createdAt', 'updatedAt']
            }
        }
    }
})
// Métodos personalizados

User.prototype.verificarPassword = function(password) {
    return bcrypt.compareSync(password, this.password)
}

export default User