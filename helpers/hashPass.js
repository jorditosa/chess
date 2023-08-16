const bcrypt = require('bcrypt');

function hashPass(password) {
     // Hashear la contraseña antes de guardarla
     const saltRounds = 10;
     const hashedPassword = bcrypt.hash(password, saltRounds);

     return hashedPassword;
}

module.exports = {
     hashPass
}