import jwt from 'jsonwebtoken'
import User from '../models/Entidades/User.js'

const indentifyUser =  async (req,res,next) =>{
    // Indentificar si hay un token en las cookies

    const {_token} = req.cookies
    if(!_token) {
        req.User = null;
        return next();
    }

    // Comprobar el token

    try {
        const decoded = jwt.verify(_token ,process.env.JWT_SECRET)
        const user = await User.scope('eliminarPassword').findByPk(decoded.id)
        // Almacenar el usuario al Req
        if(user){
            req.user = user
        } else {
            req.user = null;
        }
        return next();
    } catch(error) {

        return res.clearCookie('_token').redirect('/auth/login')
    }
}

export default indentifyUser