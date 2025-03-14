import {Propiedad,Precio,Categoria,Estado} from '../models/Index.js'
const propiedades = async (req,res) => {

    const propiedades = await Propiedad.findAll({
        include: [
            {model: Precio, as: 'precio'},
            {model: Categoria, as: 'categoria'},
            {model: Estado, as: 'estado'}
        ]
    })
    res.json(propiedades)
}

export { propiedades }