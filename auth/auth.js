/*===============================================================================*/
/* FILE : auth.js (./auth/auth.js)                                               */
/* DESC : This file contains functions for performing CRUD operations on users.  */
/*===============================================================================*/

/*====================================auth.js====================================*/
// Include external modules
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');

// Include internal modules
const user      = require('../models/user');

/*********************************************************************************/
/* FUNC   : register                                                             */
/* DESC   : Attempts to register a new user in the database using the values     */
/*          received in the body of the request.                                 */
/* PARAMS : N/A.                                                                 */
/* RETURN : A JSON response with status 201 if the user was successfully created,*/
/*          or status 400 if the user creation failed.                           */
/*********************************************************************************/
exports.register = async (req, res, next) => {
    const { username, password } = req.body;
    
    if (password.length < 6)
        return res.status(400).json({ 
            message : 'Password must be at least 6 characters.' 
        });
    
    // Encrypt password so it's not stored as plain text in the DB
    bcrypt.hash(password, 10).then(async (hash) => {
        await user.create({
            username,
            password : hash
        }).then((_user) => {
            // Create a JWT Token to verify the user
            const maxAge = 3 * 60 * 60;
            const token  = jwt.sign({
                id   : _user._id,
                username,
                role : _user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn : maxAge // 3 hrs in sec
            });
            // Create a cookie for the JWT Token
            res.cookie('jwt', token, {
                httpOnly : true,
                maxAge   : maxAge * 1000 // 3 hrs in ms
            });
            res.status(201).json({
                message : 'User successfully created',
                user    : _user._id
            });
        }).catch((error) =>
            res.status(400).json({
                message : 'User not successfully created',
                error   : error.message 
            })
        );
    });
};

/*********************************************************************************/
/* FUNC   : login                                                                */
/* DESC   : Attempts to match the username and password received in the body of  */
/*          the request to an existing document in the database.                 */
/* PARAMS : N/A.                                                                 */
/* RETURN : A JSON response with status 201 if the user was successfully logged  */
/*          in, or status 400 if the login attempt failed.                       */
/*********************************************************************************/
exports.login = async (req, res, next) => {
    const { username, password } = req.body;
    // Check if username and password are provided:
    if (!username || !password) 
        return res.status(400).json({
            message : 'Username or Password not supplied'
        });

    // Find user that matches the supplied username and password:
    try {
        const _user = await user.findOne({ username });
        if (!_user) {
            res.status(400).json({
                message : 'Login not successful',
                error   : 'User not found'
            });
        }
        else {
            // Compare supplied password with hashed password
            bcrypt.compare(password, _user.password).then(function (result) {
                if (result) {
                    const maxAge = 3 * 60 * 60;
                    const token  = jwt.sign({
                        id   : _user._id,
                        username,
                        role : _user.role
                    },
                    process.env.JWT_SECRET,
                    {
                        expiresIn : maxAge
                    });
                    res.cookie('jwt', token, {
                        httpOnly : true,
                        maxAge   : maxAge * 1000
                    });
                    res.status(201).json({
                        message : 'User successfully logged in',
                        user    : _user._id
                    });
                }
                else {
                    res.status(400).json({
                        message : 'Login not successful'
                    });
                }
            });
        }
    }
    catch (error) {
        res.status(400).json({
            message : 'An error occurred',
            error   : error.message
        });
    }
};

exports.update = async (req, res, next) => {};
exports.deleteUser = async (req, res, next) => {};
/*====================================auth.js====================================*/