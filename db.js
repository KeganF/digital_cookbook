/*===============================================================================*/
/* FILE : db.js (./db.js)                                                        */
/* DESC : This file defines an instance of `mongoose` for managing a MongoDB     */
/*        connection that can be used throughout the application.                */
/*===============================================================================*/

/*=====================================db.js=====================================*/
// Include external modules
const mongoose  = require('mongoose');

// Set local MongoDB connection string
const localDB   = `mongodb://127.0.0.1:27017/digital_cookbook`;

const connectDB = async () => {
    await mongoose.connect(localDB);
    await checkConnection();
}

const checkConnection = async () => {
    const connectionStatus = mongoose.connection.readyState;
    
    if (connectionStatus == 0) {
        console.log('\x1b[31m[db.js] ->\x1b[0m Not connected to MongoDB.');
    }
    else if (connectionStatus == 1) {
        console.log('\x1b[32m[db.js] ->\x1b[0m Connected to MongoDB.');
    }
    else if (connectionStatus == 2) {
        console.log('\x1b[33m[db.js] ->\x1b[0m Connecting to MongoDB...');
    }
    else if (connectionStatus == 3) {
        console.log('\x1b[33m[db.js] ->\x1b[0m Disconnecting from MongoDB.');
    }
}

// module.exports = connectDB;
module.exports = {
    connectDB,
    checkConnection
};

/*********************************************************************************/
/*            _ __ ___   ___  _ __   __ _  ___   ___  ___  ___                   */
/*           | '_ ` _ \ / _ \| '_ \ / _` |/ _ \ / _ \/ __|/ _ \                  */
/*           | | | | | | (_) | | | | (_| | (_) | (_) \__ \  __/                  */
/*           |_| |_| |_|\___/|_| |_|\__, |\___/ \___/|___/\___|                  */ 
/*                                   __/ |                                       */
/*                                  |___/                                        */
/*                                                                               */
/*********************************************************************************/
/*=====================================db.js=====================================*/ 