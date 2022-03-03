// REQUIRES
const puppeteer = require('puppeteer');
// VARIABLES
const url = 'https://sysacad.frm.utn.edu.ar/login.php';
// FUNCTIONS
async function get_cookie(DNI, password){
    const browser = await puppeteer.launch({ // lauch the browser
        headless: true,
        args: ["--no-sandbox"]
    });
    const page = await browser.newPage(); // open a new tab in the browser
    await page.goto(url);   // go to the log in url
    // LogIn
    await page.type('[name=username]', DNI);    // type the user
    await page.type('[name=password]', password);   // type the password
    await page.click('[name=submit]');  // click in the submit button 
    // wait until "usuarioLegajo" exist
    await page.waitForSelector('[name=usuarioLegajo]');
    // https://sysacad.frm.utn.edu.ar/process.php
    let legajo_element = await page.$('[name=usuarioLegajo]'); // serch for the legajo input
    const legajo = await (await legajo_element.getProperty('value')).jsonValue(); // get the value of the input
    await page.click('.habilitado');    // click the "legajo: " button
    // http://autogestion4.frm.utn.edu.ar/academico3/
    var cookies = await page.cookies(); // get all the cookies
    while (cookies == undefined) {  // if the cookies don't exist, waith until exist
        await page.waitForTimeout(1000);    
        cookies = await page.cookies();
    };
    // close the browser
    await browser.close();
    // serch for the session cookie
    for (let i = 0; i < cookies.length; i++) {
        if (cookies[i].name.includes('ASPSESSION')) {
            var cookie = {name: cookies[i].name, value: cookies[i].value};  // separe the cookie in a dic
        };
    };
    return {cookie: cookie, legajo:legajo}; // return the cookie dic and the legajo
};

module.exports.get_cookie = get_cookie;

