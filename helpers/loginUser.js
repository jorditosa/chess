const Player = require('../models/Player.js');
const bcrypt = require('bcrypt');

/*
INICIAR SESIÓN
*/
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await Player.findOne({ email });
        if (!user) {
            console.log(`No player found with email ${email}`);
            res.redirect('/login');
            return; // Añade un return aquí para evitar seguir ejecutando la función
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            console.log('Password is not valid'); // Añade un log aquí para rastrear si la contraseña no es válida
            res.redirect('/login');
            return; // Añade un return aquí para evitar seguir ejecutando la función
        }

        console.log('User found:', user); // Imprime los detalles del usuario encontrado
        req.session.userID = user.token;
        req.session.username = user.username;
        req.session.accountConfirmed = user.accountConfirmed;
        console.log('Session after login:', req.session); // Imprime el estado de la sesión

        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
};

module.exports = { loginUser };