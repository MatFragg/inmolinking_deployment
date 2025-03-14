import Propiedad from './Propiedad.js'
import Precio from './DatosPredeterminados/Precio.js'
import Categoria from './DatosPredeterminados/Categoria.js'
import Estado from './DatosPredeterminados/Estado.js'
import User from './Entidades/User.js'
import Mensaje from './Mensaje.js'
import Empresa from './Entidades/Empresa.js'
import AgenteEmpresa from './Entidades/AgenteEmpresa.js'
import AgenteIndependiente from './Entidades/AgenteIndependiente.js'

// De derecha a izquierda
// Precio.hasOne(Propiedad)

// De izqueirda a derecha (forma natural)
Propiedad.belongsTo(Precio, {foreignKey: 'precioId'})
Propiedad.belongsTo(Categoria, {foreignKey: 'categoriaId'})
Propiedad.belongsTo(User, {foreignKey: 'usuarioId'})
Propiedad.belongsTo(Estado, {foreignKey: 'estadoId',as: 'estado' })
Propiedad.hasMany(Mensaje,{ foreignKey: 'propiedadId'})

Mensaje.belongsTo(Propiedad, {foreignKey: 'propiedadId'})
Mensaje.belongsTo(User, {foreignKey: 'usuarioId'})

//Empresa.hasMany(AgenteEmpresa, {foreignKey: 'empresaId', as: 'agentes'})

User.hasMany(AgenteEmpresa, {foreignKey: 'id',as: 'agenteEmpresa', onDelete: 'CASCADE'})
User.hasMany(AgenteIndependiente, {foreignKey: 'id',as: 'agenteIndependiente', onDelete: 'CASCADE'})

AgenteEmpresa.belongsTo(User, {foreignKey: 'id'})
AgenteIndependiente.belongsTo(User, {foreignKey: 'id'})

export {
    Propiedad,
    Precio,
    Categoria,
    User,
    Estado,
    Mensaje,
    Empresa,
    AgenteEmpresa,
    AgenteIndependiente
}
