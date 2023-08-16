const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const Player = require('../models/Player.js')
const bcrypt = require('bcrypt');
const { generarToken } = require('../helpers/generateToken.js');
const { registerUser } = require ('../helpers/registerUser.js');
const { loginUser } = require ('../helpers/loginUser.js');

/*
    CONFIRMAR CUENTA
*/
const confirmAccount = async (req, res) => {
    // Buscar en la base de datos el usuario con el token que se recibe como parámetro
    const { token } = req.params;
    const user = await Player.findOne({ token });

    // Si no se encuentra el usuario, redirigir a la página de registro
    if (!user) {
        return res.redirect('/register');
    }

    // Actualizar el campo accountConfirmed a true
    user.accountConfirmed = true;

    // Guardar el usuario
    await user.save();

    // Redirigir al usuario a la página de inicio de sesión
    res.redirect('/login');
};

/*
    OBTENER DASHBOARD
*/
const getDashboard = async (req, res) => {
    // Validar si el usuario está logueado, sino redirigir a /login
    if (!req.session.userID || req.session.accountConfirmed === false) {
        console.log('User not logged in or account not confirmed:', req.session); // Imprime el estado de la sesión
        return res.redirect('/login');
    }

    try {
        // Buscar al usuario por token en lugar de email
        const user = await Player.findOne({ token: req.session.userID });

        if (!user) {
            console.log('User not found for token:', req.session.userID); // Imprime un mensaje si el usuario no se encuentra
            return res.redirect('/login');
        }

        // Buscar la información global de los usuarios
        const users = await Player.find({});
        
        console.log('Usuarios de la BD:', users);

        // Renderizar el tablero de control
        res.render('dashboard', {
            users: users,
            username: req.session.username,
            level: user.level,
            totalPuzzlesDone: user.totalPuzzlesDone,
            puzzle10x: user.puzzle10x,
            accountConfirmed: req.session.accountConfirmed,
        });
    } catch (error) {
        console.log(error);
    }
};

/*
    CERRAR SESIÓN
*/

const logoutUser = (req, res) => {
    req.session.destroy();
    res.redirect('/');
}



module.exports = {
    registerUser,
    loginUser,
    getDashboard,
    logoutUser,
    confirmAccount
}
