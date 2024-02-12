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
/*=============================auth.js (middleware)==============================*/