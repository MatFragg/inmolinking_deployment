import bcrypt from 'bcrypt'
const users = [
    {
        nombre: 'Diego',
        email: '1234@gmail.com',
        confirmado: 1,
        password: bcrypt.hashSync('password',10)
    }
]

export default users