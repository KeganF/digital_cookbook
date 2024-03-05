/*===============================================================================*/
/* FILE : user.js (./models/auth.js)                                             */
/* DESC : This file contains the 'user' model to represent the 'user' documents  */
/*        in the MongoDB collection.                                             */
/*===============================================================================*/

/*====================================user.js====================================*/
// Include external modules
const mongoose = require('mongoose');

// Define schema
const userSchema = new mongoose.Schema({
    username : {
        type     : String,
        unique   : true,
        required : true
    },
    password : {
        type      : String,
        minlength : 6,
        required  : true
    },
    role : {
        type     : String,
        default  : 'basic',
        required : true
    },
    homePreferences : [{
        type : String
    }]
});

// Create and export model
const user     = mongoose.model('user', userSchema);
module.exports = user;
/*====================================user.js====================================*/