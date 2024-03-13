/*===============================================================================*/
/* FILE : register.js (./public/js/register.js)                                  */
/* DESC : This file contains the javascript code to handle registering new users.*/
/*===============================================================================*/

/*=================================register.js===================================*/
const form = document.querySelector('form');
const email = document.querySelector('#email');
const username = document.querySelector('#username');
const password = document.querySelector('#password');
const display  = document.querySelector('.error');

form.addEventListener('submit', async(e) => {
    e.preventDefault();
    display.textContent = '';
    try {
        const res = await fetch('/api/auth/register', {
            method  : 'POST',
            body    : JSON.stringify({ username : username.value, password : password.value }),
            headers : { 'Content-Type' : 'application/json' }
        });
        const data = await res.json();
        if (res.status === 400 || res.status === 401) {
            return display.textContent = `${data.message}. ${data.error ? data.error : ''}`;
        }
        data.role === 'admin' ? location.assign('/') : location.assign('/');
    }
    catch (error) {
        console.log(error.message);
    }
});
/*=================================register.js===================================*/