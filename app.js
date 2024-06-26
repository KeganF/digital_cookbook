/*===============================================================================*/
/* PROJECT : Digital Cookbook                                                    */
/* AUTHOR  : Kegan Ferdiand                                                      */
/* DATES   : 2024-01-29 - 2024-04-18                                             */
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

/*====================================app.js=====================================*/
/*=====------------------------v EXPRESS APP SETUP v------------------------=====*/
// Include external modules
const express       = require('express');
const handlebars    = require('express-handlebars');
const path          = require('path');
const axios         = require('axios');
const bodyparser    = require('body-parser');
const cookieParser  = require('cookie-parser');

// Include internal modules
const mongooseCon = require('./db');
const { 
    adminAuth, 
    userAuth,
    checkUser
} = require ('./middleware/auth');
const user = require('./models/user');

// Get access to .env file variables
require('dotenv').config();

// Create `app` and set the port for the server
const app   = express();
const port  = 8080;

// Bind middleware to `app` object
app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyparser.urlencoded({extended : true}));
app.use(express.json());
app.use('/api/auth', require('./auth/route'));
app.use(cookieParser());

// Configure handlebars templating engine
app.engine('handlebars', handlebars.engine({
    extname         : 'handlebars',
    defaultLayout   : 'main',
    layoutsDir      : __dirname + '/views/layouts',
    partialsDir     : __dirname + '/views/partials',
    helpers         : {
        includes : function(needle, haystack) { return haystack.indexOf(needle) > -1; },
        round    : function(precision_value) { return Math.round(precision_value); },
        divide   : function(n1, n2) { return Math.round(n1/n2); }
    }
}));
app.set('view engine', 'handlebars');
app.set('views', './views');

// Connect to MongoDB (db.js) 
mongooseCon.connectDB();
/*=====------------------------^ EXPRESS APP SETUP ^------------------------=====*/

/*=====----------------------------v API SETUP v----------------------------=====*/
// This project uses the Edamam Recipe Search and Nutrition Analysis API.
// API Documentation: https://developer.edamam.com/edamam-docs-recipe-api 
const baseURL       = 'https://api.edamam.com/api';
const credentials   = {
    appId  : `${process.env.EDAMAM_API_APP_ID}`, 
    appKey : `${process.env.EDAMAM_API_APP_KEY}`
};
// Creates a reusable instance of Axios with pre-defined values.
// Requests to the API will not have to re-supply these values :-)
const instance = axios.create({
    baseURL : baseURL,
    timeout : 5000,
    headers : {
        'Content-Type' : 'application/json'
    },
    params  : {
        type    : 'public',
        app_id  : credentials.appId,
        app_key : credentials.appKey
    }
});
/*=====----------------------------^ API SETUP ^----------------------------=====*/

/*=====--------------------------v API FUNCTIONS v--------------------------=====*/
/*********************************************************************************/
/* FUNC   : GetRecipes                                                           */
/* DESC   : Sends a request to the Edamam Recipe Search API.                     */
/* PARAMS : params (Object) -> an object containing the parameters for the API   */
/*              request. This typically contains truthy values from the 'search' */
/*              route's query string.                                            */
/* RETURN : The data portion of the JSON response returned from the API, OR the  */
/*          the Axios error object in the event of a failed request.             */
/*********************************************************************************/
async function GetRecipes(params) {
    return instance.get('/recipes/v2', { params : params })
        .then(response => {
            return response.data;
        })
        .catch(error => {
            return { error : error };
        });
}

/*********************************************************************************/
/* FUNC   : GetRecipeByID                                                        */
/* DESC   : Sends a request to the Edamam Recipe Search API for the provided ID. */
/* PARAMS : id (string) -> a string representing a specific recipe ID. The ID is */
/*              a recognized identifier provided by the API service, which can   */
/*              be used to identify a specific recipe.                           */                                                                 
/* RETURN : The data portion of the JSON response returned from the API, or the  */
/*          the Axios error object in the event of a failed request.             */
/*********************************************************************************/
async function GetRecipeByID(id) {
    const endpoint = '/recipes/v2/' + id;
    return instance.get(endpoint)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            return { error : error };
        });
}

/*********************************************************************************/
/* FUNC   : ApiTest                                                              */
/* DESC   : Sends an empty request to the Edamam Recipe Search API to confirm    */
/*          the application can successfully communicate with the API.           */
/* PARAMS : N/A.                                                                 */
/* RETURN : The response code received from the API.                             */
/*********************************************************************************/
async function ApiTest() {    
    return instance.get('/recipes/v2')
        .then(response => {
            return response.status;
        })
        .catch(error => {
            return { error : error };
        });
}
/*=====--------------------------^ API FUNCTIONS ^--------------------------=====*/

/*=====---------------------------v APP ROUTES v----------------------------=====*/
// app.get('/admin', adminAuth, (req, res) => res.send('Admin Route'));
// app.get('/basic', userAuth,  (req, res) => res.send('User Route'));


/*********************************************************************************/
/* ROUTE : GET '*'                                                               */
/* DESC  : '*' denotes ALL GET REQUESTS. Every route in the app requested using  */
/*         the GET method will first be directed here, where the checkUser       */
/*         middleware will be used to determine the current logged in user.      */
/*********************************************************************************/
app.get('*', checkUser);

/*********************************************************************************/
/* ROUTE : GET '/'                                                               */
/* DESC  : Renders the main index page.                                          */
/*********************************************************************************/
app.get('/', async(req, res) => {
    console.log(`${logHead(req)} Route has been requested.`);

    var _user = null;
    if (res.locals.currentUser)
        _user = await user.findById(res.locals.currentUser.id);

    // Build recommended recipe 'sections' based on user preferences
    var sections = [];    
    if (_user) {
        for (var i = 0; i < _user.homePreferences.length; i++) {
            const title = `${_user.homePreferences[i]} recipes`;
            const data  = await GetRecipes({ diet : _user.homePreferences[i] });
            
            var resultRecipes;
            if (data.error) {
                console.log(`${logHeadErr(req)} API request failed: ${data.error}`);
            }
            else {
                console.log(`${logHead(req)} Data received from API!`);
                
                resultRecipes = data.hits;
                // Loop through each returned element for processing:
                resultRecipes.forEach(item => {
                    // Trim "tags" array to have only 3 elements max:
                    if (item.recipe.tags)
                        item.recipe.tags.length = 3;
    
                    // Add a recipeID key to the recipe object:
                    item.recipe.recipeID = item.recipe.uri.split('#')[1];
                });
            }
            
            sections.push({ title : title, recipes : resultRecipes });
        }
    }
    // If the user is not logged in, display 'balanced' recipes by default
    else {
        const title = 'Balanced recipes';
        const data  = await GetRecipes({ diet : 'balanced' });

        var resultRecipes;
        if (data.error) {
            console.log(`${logHeadErr(req)} API request failed: ${data.error}`);
        }
        else {
            console.log(`${logHead(req)} Data received from API!`);
                
            resultRecipes = data.hits;
            resultRecipes.forEach(item => {
                if (item.recipe.tags)
                    item.recipe.tags.length = 3;

                item.recipe.recipeID = item.recipe.uri.split('#')[1];
            });
        }

        sections.push({ title : title, recipes : resultRecipes });
    }

    // Render the 'main' (home) page to the browser:
    res.render('main', {
        layout   : 'index',
        active   : { home : true },
        sections : sections
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

    var resultRecipes;

    if (params.q) {
        // Send the parameters to the API as part of a request:
        const data = await GetRecipes(params);
        
        // Check for errors in the response:
        if (data.error) {
            console.log(`${logHeadErr(req)} API request failed: ${data.error}`);
        }
        else {
            console.log(`${logHead(req)} Data received from API!`);
            
            resultRecipes = data.hits;
            // Loop through each returned element for processing:
            resultRecipes.forEach(item => {
                // Trim "tags" array to have only 3 elements max:
                if (item.recipe.tags)
                    item.recipe.tags.length = 3;

                // Add a recipeID key to the recipe object:
                item.recipe.recipeID = item.recipe.uri.split('#')[1];
            });
        }
    }

    // Render the 'search' page to the browser:
    res.render('search', {
        layout  : 'index',
        results : resultRecipes,
        search  : params.q,
        active  : { search : true }
    });
});

/*********************************************************************************/
/* ROUTE : GET '/recipe'                                                         */
/* DESC  : Renders the recipe page.                                              */
/*********************************************************************************/
app.get('/recipe', async (req, res) => {
    const recipeID = req.query.Id;
    const recipe   = await GetRecipeByID(recipeID);

    console.log(recipe);
    console.log(recipe.recipe.totalNutrients);

    res.render('recipe', {
        layout : 'index',
        recipe : recipe.recipe,
        active  : { search : true }
    });
});

/*********************************************************************************/
/* ROUTE : GET '/register'                                                       */
/* DESC  : Renders the register page.                                            */
/*********************************************************************************/
app.get('/register', async(req, res) => {
    res.render('register', {
        layout : 'index'
    });
});

/*********************************************************************************/
/* ROUTE : GET '/login'                                                          */
/* DESC  : Renders the login page.                                               */
/*********************************************************************************/
app.get('/login', async(req, res) => {
    res.render('login', {
        layout : 'index',
        active : { login : true }
    });
});

/*********************************************************************************/
/* ROUTE : GET '/logout'                                                         */
/* DESC  : Logs the user out and returns them to the '/' route.                  */
/*********************************************************************************/
app.get('/logout', async(req, res) => {
    res.cookie('jwt', '', { maxAge : '1' });
    res.redirect('/');
});

/*********************************************************************************/
/* ROUTE : GET '/account'                                                        */
/* DESC  : Renders the account page.                                             */
/*********************************************************************************/
app.get('/account', async(req, res) => {
    const id = res.locals.currentUser.id;
    const _user = await user.findById(id);

    res.render('account', {
        layout    : 'index',
        homePrefs : _user.homePreferences.toString(),
        active    : { account : true }
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
/* DESC  : Checks the connection status of `mongoose` object in ./db.js          */
/*********************************************************************************/
app.get('/dbtest', async(req, res) => {
    console.log(`${logHead(req)} Route has been requested.`);
    console.log(`${logHead(req)} This route is for testing the
        MongoDB connection.`);
       
    mongooseCon.checkConnection();

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
const server = app.listen(port, () => {
    console.log(`App is listening on port ${port}.`);
});

process.on('unhandledRejection', err => {
    console.log(`An error occurred: ${err.message}`);
    server.close(() => process.exit(1));
});
/*=====---------------------------^ APP STARTUP ^---------------------------=====*/
/*====================================app.js=====================================*/