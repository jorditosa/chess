const express = require('express');
const path = require('path');
const router = express.Router();
const { filterPuzzles } = require('../helpers/helpers.js');
const Player = require('../models/Player.js')
const { getDashboard, confirmAccount, logoutUser,} = require('../controllers/userController.js');
const { registerUser } = require ('../helpers/registerUser.js');
const { loginUser } = require ('../helpers/loginUser.js');

router.get('/', (req, res) => {
    if (req.session.userID) {
        // Si el usuario ha iniciado sesión, redirígelo al dashboard
        res.redirect('/dashboard');
    } else {
        // Si el usuario no ha iniciado sesión, mostrarle la página de inicio
        res.render('index', { user: req.session });
    }
});

// Rutas para manejar las solicitudes GET
router.get('/login', (req, res) => {
    if (req.session.userID) {
        // Si el usuario está logueado, redirígelos a la página de dashboard
        res.redirect('/dashboard');
    } else {
        // Si el usuario no está logueado, muéstrales la página de inicio de sesión
        res.render('login', { user: req.session });
    }
})

router.get('/register', (req, res) => {
    console.log("session", req.session.userID)
    if (req.session.userID) {
        // Si el usuario está logueado, redirígelos a la página de dashboard
        res.redirect('/dashboard');
    } else {
        // Si el usuario no está logueado, muéstrales la página de login
        res.render('register', { user: req.session });
    }
})
router.get('/logout', logoutUser);
router.get('/confirmAccount/:token', confirmAccount);

router.get('/puzzles10X', (req, res) => {
    // Verificar si el usuario está logueado
    const isUserLoggedIn = !!req.session.userID;

    res.render('puzzles10X', { 
        username: isUserLoggedIn ? req.session.username : null,
        isUserLoggedIn,
        accountConfirmed: req.session.accountConfirmed, 
        activeTab: 'puzzles10X' 
    });
});


router.get('/dashboard', getDashboard)

// Rutas para manejar las solicitudes POST a "/login" y "/register"
router.post('/login', loginUser);
router.post('/register', registerUser);

router.get('/puzzles/:num', (req, res) => {
    const { num } = req.params;
    let filteredPuzzles = filterPuzzles(num);
    res.json(filteredPuzzles);
})

router.get('/leaderboard/:time', async (req, res) => {
    const { time } = req.params;
    const players = await Player.find({time: time}).sort({score: "descending"});
    return res.json(players)
})



module.exports = router
