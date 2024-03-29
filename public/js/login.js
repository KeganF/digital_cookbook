/*===============================================================================*/
/* FILE : login.js (./public/js/login.js)                                        */
/* DESC : This file contains the javascript code to handle logging in existing   */
/*        users.                                                                 */
/*===============================================================================*/

/*==================================login.js=====================================*/
const form = document.querySelector('form');
const username = document.querySelector('#username');
const password = document.querySelector('#password');
const display  = document.querySelector('.error');

form.addEventListener('submit', async(e) => {
    e.preventDefault();
    display.textContent = '';
    try {
        const res = await fetch('/api/auth/login', {
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
/*==================================login.js=====================================*/