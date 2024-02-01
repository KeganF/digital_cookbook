/*===============================================================================*/
/* PROJECT : Digital Cookbook                                                    */
/* AUTHOR  : Kegan Ferdiand                                                      */
/* DATES   : 2024-01-29 - []                                                     */
/* DESC    : This project was created as part of CIS320 and CIS354, where I was  */
/*           tasked with first designing and then implementing a project of my   */ 
/*           choice.                                                             */
/*                                                                               */
/*-------------------------------COMMENT STYLES----------------------------------*/
/* /*========== -> Special information, start and end of file markers            */
/* /*=====----- -> Code segment separators                                       */
/* /*********** -> Function and route documentation                              */
/* //           -> Inline code comments, explanations, contextual information    */  
/*===============================================================================*/

/*=====------------------------v EXPRESS APP SETUP v------------------------=====*/
const express       = require('express');
const handlebars    = require('express-handlebars');
const path          = require('path');
const axios         = require('axios');
const bodyparser    = require('body-parser');
const mysql         = require('mysql');

require('dotenv').config();

const app   = express();
const port  = 8080;

app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyparser.urlencoded({extended : true}));

app.engine('handlebars', handlebars.engine({
    extname         : 'handlebars',
    defaultLayout   : 'main',
    layoutsDir      : __dirname + '/views/layouts',
    partialsDir     : __dirname + '/views/partials'
}));
app.set('view engine', 'handlebars');
app.set('views', './views');
/*=====------------------------^ EXPRESS APP SETUP ^------------------------=====*/

/*=====---------------------------v MYSQL SETUP v---------------------------=====*/
// This project uses MariaDB as a drop-in for MySQL. MariaDB is running locally
// through a Docker container (localhost:3307).
const connection = mysql.createConnection({
    host     : '127.0.0.1',
    port     : 3307,
    user     : `${process.env.MARIADB_USER}`,
    password : `${process.env.MARIADB_PASS}`,
    database : 'digital_cookbook'
});
/*=====---------------------------^ MYSQL SETUP ^---------------------------=====*/

/*=====-------------------------v MYSQL FUNCTIONS v-------------------------=====*/
/*********************************************************************************/
/* FUNC   :                                                                      */
/* PARAMS :                                                                      */
/* RETURN :                                                                      */
/*********************************************************************************/
/*=====-------------------------^ MYSQL FUNCTIONS ^-------------------------=====*/

/*=====----------------------------v API SETUP v----------------------------=====*/
// This project uses the Edamam Recipe Search and Nutrition Analysis API.
// API Documentation: https://developer.edamam.com/edamam-docs-recipe-api 
const baseUrl       = 'https://api.edamam.com/api';
const credentials   = {
    appId  : `${process.env.EDAMAM_API_APP_ID}`, 
    appKey : `${process.env.EDAMAM_API_APP_KEY}`
};
/*=====----------------------------^ API SETUP ^----------------------------=====*/

/*=====--------------------------v API FUNCTIONS v--------------------------=====*/
/*********************************************************************************/
/* FUNC   : GetRecipes                                                           */
/* PARAMS : params (Object) -> an object containing the parameters for the API   */
/*              request. This typically contains truthy values from the 'search' */
/*              route's query string.                                            */
/* RETURN : The data portion of the JSON response returned from the API.         */
/*********************************************************************************/
async function GetRecipes(params) {
    // Add the required values to the parameters:
    params.type     = 'public';
    params.app_id   = credentials.appId;
    params.app_key  = credentials.appKey;

    try {
        // Execute request to API:
        const res = await axios({
            method : 'GET',
            url    : `${baseUrl}/recipes/v2`,
            params : params
        });
        return res.data;
    }
    catch (AxiosError) {
        return {error : AxiosError.code};
    }
}

/*********************************************************************************/
/* FUNC   : ApiTest                                                              */
/* PARAMS : showDebug (bool) -> if true, the stacktrace and error information    */
/*              will be output to the console.                                   */
/* RETURN : The response code from an empty request to the Edamam Recipe Search  */
/*          API. Used for testing purposes to verify connection to the service.  */
/*********************************************************************************/
async function ApiTest(showDebug) {    
    try {
        const res = await axios({
            method : 'GET',
            url    : `${baseUrl}/recipes/v2`,
            params : {
                type    : 'public',
                app_id  : credentials.appId,
                app_key : credentials.appKey
            }
        });

        return res.status;
    }
    catch (AxiosError) {
        if (showDebug) {
            console.log(AxiosError);
        }

        return AxiosError.code;
    }
}
/*=====--------------------------^ API FUNCTIONS ^--------------------------=====*/

/*=====---------------------------v APP ROUTES v----------------------------=====*/
/*********************************************************************************/
/* ROUTE : GET '/'                                                               */
/* DESC  : Renders the main index page.                                          */
/*********************************************************************************/
app.get('/', async(req, res) => {
    console.log(`${logHead(req)} Route has been requested.`);
    
    // Render the 'main' (home) page to the browser:
    res.render('main', {
        layout : 'index'
    });
});

/*********************************************************************************/
/* ROUTE : GET '/search'                                                         */
/* DESC  : Renders the recipe search page.                                       */
/*********************************************************************************/
app.get('/search', async(req, res) => {
    console.log(`${logHead(req)} Route has been requested.`);

    // Get a list of parameters from the query string,
    // but only where there is an assigned value:
    const params = 
        Object.fromEntries(Object.entries(req.query).filter(([k, v]) => v));
    console.log(`${logHead(req)} Truthy params: ${JSON.stringify(params)}`);

    var searchResults;

    if (params.q) {
        // Send the parameters to the API as part of a request:
        const data = await GetRecipes(params);
        
        // Check for errors in the response:
        if (data.error) {
            console.log(`${logHeadErr(req)} API request failed: ${data.error}`);
        }
        else {
            console.log(`${logHead(req)} Data received from API:`);
            console.log(data);

            searchResults = data.hits;
        }
    }

    // Render the 'search' page to the browser:
    res.render('search', {
        layout  : 'index',
        results : searchResults
    });
});
/*=====---------------------------^ APP ROUTES ^----------------------------=====*/

/*=====---------------------------v TEST ROUTES v---------------------------=====*/
/*********************************************************************************/
/* ROUTE : GET '/apitest'                                                        */
/* DESC  : Renders the response status of an Edamam Recipe Search API call to    */
/*         the page. Used to verify a successful connection to the service.      */
/*********************************************************************************/
app.get('/apitest', async(req, res) => {
    console.log(`${logHead(req)} Route has been requested.`);
    console.log(`${logHead(req)} This route is for testing the
        Edamam Recipe Search API. The browser should now be displaying the
        response status code received from the service. Response code 200 
        indicates a successful response.`);

    resStatus = await ApiTest(false);

    // Output for failed response:
    if (resStatus != 200) {
        console.log(`${logHeadErr(req)} There was an error
        receiving a response from the Edamam Recipe Search API (${resStatus}).`);
    }

    // Render the 'apitest' page to the browser:
    res.render('apitest', {
        layout   : 'index',
        response : resStatus
    });
});

/*********************************************************************************/
/* ROUTE : GET '/dbtest'                                                         */
/* DESC  : Attempts to connect to a local instance of MariaDB and writes the     */
/*         connection status to the console.                                     */
/*********************************************************************************/
app.get('/dbtest', async(req, res) => {
    console.log(`${logHead(req)} Route has been requested.`);
    console.log(`${logHead(req)} This route is for testing the
        MariaDB connection.`);
        
    connection.connect(function(err) {
        try {
            if (err) throw err;
            console.log(`${logHead(req)} Successfully connected to MariaDb.`);
        }
        catch (err) {
            console.log(`${logHeadErr(req)} Failed to connect to MariaDb.`);
        }
    });

    // Render the 'dbtest' page to the browser:
    res.render('dbtest', {
        layout  : 'index'
    });
});
/*=====---------------------------^ TEST ROUTES ^---------------------------=====*/

/*=====-------------------------v LOGGING UTILITY v-------------------------=====*/
const logHead    = (req) => `\x1b[32m[${req.method} '${req.path}'] ->\x1b[0m`;
const logHeadErr = (req) => `\x1b[31m[${req.method} '${req.path}'] ->\x1b[0m`;
/*=====-------------------------^ LOGGING UTILITY ^-------------------------=====*/

/*=====---------------------------v APP STARTUP v---------------------------=====*/
app.listen(port, () => {
    console.log(`App is listening on port ${port}.`);
});
/*=====---------------------------^ APP STARTUP ^---------------------------=====*/

/*=====---------------------------------------------------------------------=====*/