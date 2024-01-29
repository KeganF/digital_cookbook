/*===============================================================================*/
/* PROJECT : Digital Cookbook                                                    */
/* AUTHOR  : Kegan Ferdiand                                                      */
/* DATES   : 2024-01-29 - []                                                     */
/* DESC    : This project was created as part of CIS320 and CIS354, where I was  */
/*           tasked with first designing and then implementing a project of my   */ 
/*           choice.                                                             */
/*===============================================================================*/

/*=====-----------------------v EXPRESS APP SETUP v-------------------------=====*/
const express       = require('express');
const handlebars    = require('express-handlebars');
const path          = require('path');
const axios         = require('axios');
const bodyparser    = require('body-parser');

const app   = express();
const port  = 8080;

app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyparser.urlencoded({extended : true}));

app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
/*=====-----------------------^ EXPRESS APP SETUP ^-------------------------=====*/

/*=====---------------------------v APP ROUTES v----------------------------=====*/
/*********************************************************************************/
/* ROUTE : GET '/'                                                               */
/* DESC  : Renders the main index page.                                          */
/*********************************************************************************/
app.get('/', async(req, res) => {
    console.log(`[${req.method} '${req.url}'] -> Route has been requested.`);
    
    res.render('main', {
        layout : 'index'
    });
});
/*=====---------------------------^ APP ROUTES ^----------------------------=====*/

/*=====--------------------------v APP STARTUP v----------------------------=====*/
app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});
/*=====--------------------------^ APP STARTUP ^----------------------------=====*/

/*=====---------------------------------------------------------------------=====*/