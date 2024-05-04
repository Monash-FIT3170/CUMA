"use strict";
const puppeteer = require('puppeteer');


/*
* Asynchronous function that provided a course hand book page
* will identify and return all links to units offered in that course
*/
async function getUnits(url){
    //launch our browser
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    //go to our page
    await page.goto(url);


    //get our data
    let unitLinks = await page.evaluate(() => {
        //find every unit
        const units = document.querySelectorAll("div[class*='Links--LinkGroupWrapper e1t6s54p1'] > a");
        //js doesnt like it when we just return just the html obj, so do some processing here
        return Array.from(units).map(unit => unit.href);
    });


    //await new Promise(r => setTimeout(r, 1000));

    await browser.close();

    return unitLinks;

}



getUnits("https://handbook.monash.edu/2024/aos/SFTWRENG01?year=2024").then((data) => {
    console.log(data);
});


