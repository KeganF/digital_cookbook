/*===============================================================================*/
/* FILE : update.js (./public/js/update.js)                                      */
/* DESC : This file contains the javasript code to handle updating user account  */
/*        values.                                                                */
/*===============================================================================*/

/*==================================update.js====================================*/
const form = document.querySelector('form');
const homePref = document.querySelectorAll('input[type="checkbox"]');
const display = document.querySelector('.error');

form.addEventListener('submit', async(e) => {
    e.preventDefault();
    display.textContent = '';
    
    // Build array of homepage preferences
    var homePrefValues = [];
    homePref.forEach(item => {
        if (item.checked)
            homePrefValues.push(item.value);
    });
    
    // Get the user's ID from the query parameters
    var urlParams = new URLSearchParams(window.location.search);
    var id = urlParams.get('id');

    try {
        const res = await fetch('/api/auth/update', {
            method  : 'PUT',
            body    : JSON.stringify({ id : id,  homePreferences : homePrefValues }),
            headers : { 'Content-Type' : 'application/json' }
        });
        const data = await res.json();
        if (res.status === 400 || res.status === 401) {
            return display.textContent = `${data.message}. ${data.error ? data.error : ''}`;
        }
        data.role === 'admin' ? location.assign('/account?id=' + id) : location.assign('/account?id=' + id);
    }
    catch (error) {
        console.log(error.message);
    }
});
/*==================================update.js====================================*/