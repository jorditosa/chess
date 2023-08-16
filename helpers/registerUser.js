const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const Player = require('../models/Player.js')
const bcrypt = require('bcrypt');
const { generarToken} = require('../helpers/generateToken.js');
const { hashPass } = require('../helpers/hashPass.js');
const { emailRegister } = require('../helpers/emailRegister.js');

/*
    REGISTRAR USUARIO
*/
const registerUser = async (req, res) => {

    const { email, username, password, password2 } = req.body;
    
    // Validaciones
    await check('username').notEmpty().withMessage('El nombre de usuario es obligatorio').run(req);
    await check('email').isEmail().withMessage('El email no es válido').run(req);
    await check('password').isLength({ min: 8 }).withMessage('La contraseña es obligatoria y deber tener mínimo 8 caracteres').run(req);
    await check('password2').equals(password).withMessage('La contraseñas no coinciden').run(req);

    const errorsResult = validationResult(req);
    if(!errorsResult.isEmpty()) {
        res.render('register', {
            errors: errorsResult.array()
        })
        return;
    }
    
    // Validacion si el usuario ya existe
    const playerExists = await Player.findOne({$or: [{ username }, { email }] });
    if(playerExists) {
        res.render('register', {
            errors: [{msg: "El nombre de Usuario o Email ya están siendo utilizados"}],
        })
        return;
    }

    try {
        // Hashear la contraseña antes de guardarla
        const hashedPassword = await hashPass(password);
        
        // Creamos el objeto jugador con la contraseña hasheada
        const player = new Player({
            ...req.body, 
            password: hashedPassword,
            time: 0,
            score: 0,
            token: generarToken(),
            accountConfirmed: false
        });

        await player.save();

        // Agrega estas dos líneas después de guardar el nuevo usuario
        req.session.userID = player.token;
        req.session.username = player.username;

        // Mandar un email para confirmar registro
        await emailRegister(player);

        // Mensaje de registro exitoso
        const successResult = {msg: "Registro exitoso, te hemos mandado un email para confirmar tu cuenta"};

        res.render('register', {
            success: successResult,
            user: req.session,
        })

    } catch (error) {
        res.render('register', {
            errors: [{msg: "Error al registrar el usuario"}],
            user: req.session,
        })
    }
}

module.exports = { registerUser };