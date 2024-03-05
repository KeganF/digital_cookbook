/*===============================================================================*/
/* FILE : route.js (./auth/route.js)                                             */
/* DESC : This file defines an Express route handler for authorization-related   */ 
/*        routes.                                                                */
/*===============================================================================*/

/*===================================route.js====================================*/
// Include external modules
const express = require('express');

// Include internal modules
const { register, login, update } = require('./auth');
const { adminAuth } = require('../middleware/auth');

// Create Express Router instance
const router = express.Router();

router.use((req, res, next) => {
    console.log(`\x1b[32m[${req.method} '${req.path}'] ->\x1b[0m Route Requested`);
    next();
});

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/update').put(update);
//router.route('/deleteUser').put(adminAuth, deleteUser);
module.exports = router;
/*===================================route.js====================================*/