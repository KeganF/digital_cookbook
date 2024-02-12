/*===============================================================================*/
/* FILE : auth.js (./middleware/auth.js)                                         */
/* DESC : This file contains middleware to verify the tokens created by JWT to   */
/*        protect access to private or restricted routes. The middleware checks  */
/*        the client's token (which is stored in a cookie) to determine if the   */
/*        the user is authorized to access the requested route.                  */
/*===============================================================================*/

/*=============================auth.js (middleware)==============================*/
// Include external modules
const jwt = require('jsonwebtoken');

/*********************************************************************************/
/* FUNC   : adminAuth                                                            */
/* DESC   : Requests a token from the client and verifies the received token.    */
/*          Checks the user's credentials for the 'admin' role via the decoded   */
/*          token.                                                               */
/* PARAMS : N/A.                                                                 */
/* RETURN : A JSON response if the user is unauthorized. If the user is          */
/*          authorized, the middleware will pass control to the requested route. */
/*********************************************************************************/
exports.adminAuth = (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token)
        return res.status(401).json({
            message : 'Not authorized, token not available'
        });

    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
        if (err)
            return res.status(401).json({ message : 'Not authorized' });
        
        if (decodedToken.role !== 'admin')
            return res.status(401).json({ message : 'Not authorized' });
        
        next();
    });
};

/*********************************************************************************/
/* FUNC   : userAuth                                                             */
/* DESC   : Requests a token from the client and verifies the received token.    */
/*          Checks the user's credentials for the 'basic' role via the decoded   */
/*          token.                                                               */
/* PARAMS : N/A.                                                                 */
/* RETURN : A JSON response if the user is unauthorized. If the user is          */
/*          authorized, the middleware will pass control to the requested route. */
/*********************************************************************************/
exports.userAuth = (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token)
        return res.status(401).json({
            message : 'Not authorized, token not available'
        });

    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
        if (err)
            return res.status(401).json({ message : 'Not authorized' });

        if (decodedToken.role !== 'basic')
            return res.status(401).json({ message : 'Not authorized' });
        
        next();
    });
};

/*********************************************************************************/
/* FUNC   : checkUser                                                            */
/* DESC   : Requests a token from the client and verifies the received token.    */
/*          The token will be used to track the current logged in user by        */
/*          storing the username (from the decoded token) in a res.locals value. */
/*          The new res.locals value can then be used to display the name of the */
/*          current user in the navbar, for example.                             */
/* PARAMS : N/A.                                                                 */
/* RETURN : N/A.                                                                 */
/*********************************************************************************/
exports.checkUser = (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) {
        res.locals.currentUser = null;
        return next();
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
        if (err)
            res.locals.currentUser = null;
        else
            res.locals.currentUser = decodedToken.username;

        next();
    });
};
/*=============================auth.js (middleware)==============================*/