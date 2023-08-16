const nodeMailer = require('nodemailer');

const emailRegister = async (player) => {
    var transport = nodeMailer.createTransport({ 
        host: process.env.EMAIL_HOST, 
        port: process.env.EMAIL_PORT, 
        auth: { 
            user: process.env.EMAIL_USER, 
            pass: process.env.EMAIL_PASS } 
        });

        const { username, email, token } = player;

        // Enviar el email
        await transport.sendMail({
            from: "Chess 10xApp",
            to: email,
            subject: "Bienvenido a Chess 10xApp",
            html: `
                <h1>Bienvenido a Chess 10xApp</h1>
                <p>Hola ${username}, gracias por registrarte en Chess 10xApp</p>

                <p>Esperamos que disfrutes de la aplicación</p>
                <p>Para finalizar tu registro, por favor, haz click en el siguiente enlace:</p>
                <a href="${process.env.BACKEND_URL}/confirmAccount/${token}">Confirmar mi cuenta</a>
            `
        })
}

module.exports = {
    emailRegister
}