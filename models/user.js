/*====================================user.js====================================*/
const mongoose   = require('mongoose');
const userSchema = new mongoose.Schema({
    username : {
        type     : String,
        unique   : true,
        required : true
    },
    email : {
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
    }
});

const user     = mongoose.model('user', userSchema);
module.exports = user;
/*====================================user.js====================================*/