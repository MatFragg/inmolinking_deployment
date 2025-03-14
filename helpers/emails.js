import nodemailer from 'nodemailer'

const emailRegister = async(data) => {
    var transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PWD
        }
    });
    const { email,nombre,token} = data

    // Enviar email
    await transport.sendMail({
        from: 'InmoLinking.com',
        to: email,
        subject: 'Confrimación de cuenta para InmoLinking.com',
        text: 'Confirma tu cuenta en InmoLinking.com',
        html: `
            <p>Hola ${nombre}, comprueba tu cuenta en InmoLinking.com</p>
            <p>Tu cuenta ya esta lista, solo debes confirmarla en el siguiente enlace:
            <a href="${process.env.BKND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}">Confirmar Cuenta</a></p>

            <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje</p>
        `
    })
}

const emailRecoverPwd = async(data) => {
    var transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PWD
        }
    });
    const { email,nombre,token} = data

    // Enviar email
    await transport.sendMail({
        from: 'InmoLinking.com',
        to: email,
        subject: 'Restablecer contraseña',
        text: 'Recupera el acceso a tu cuenta en InmoLinking.com',
        html: `
            <p>Hola ${nombre}, hemos recibido tu solicitud para recuperar tu contraseña de tu cuenta en InmoLinking.com</p>
            <p>Ingresa al siguiente enlace para que generes una contraseña nueva!:
            <a href="${process.env.BKND_URL}:${process.env.PORT ?? 3000}/auth/olvide-password/${token}">Restablecer Contraseña</a></p>

            <p>Si tu no solicitaste el cambio de contrasela, puedes ignorar el mensaje</p>
        `
    })

}

export {
    emailRegister,
    emailRecoverPwd
}