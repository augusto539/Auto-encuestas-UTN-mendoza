const puppeteer = require('puppeteer');

const url = 'https://sysacad.frm.utn.edu.ar/login.php';

async function get_info(DNI = process.env.DNI, password = process.env.PASS){

    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox"]
    })
    
    const page = await browser.newPage();
    await page.goto(url);
  
    // LogIn
    await page.type(process.env.LT_DNI, DNI);    // type the user
    await page.type(process.env.LT_PASS, password);   // type the password
    await page.click(process.env.LT_SUBMIT);  // click in the submit button 

    let legajo_scope = await page.$(process.env.LT_LEGAJO); // serch for the legajo input

    const legajo = await (await legajo_scope.getProperty('value')).jsonValue() // get the value of the input

    await page.click('.habilitado');

    let cookies = await page.cookies()
  
    await browser.close();

    return {cookies: cookies, legajo:legajo}
};

module.exports.get_info = get_info;