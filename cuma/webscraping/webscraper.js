"use strict";
const puppeteer = require('puppeteer');
const fs = require('fs');
const { NONAME } = require('dns');


/*
* Asynchronous function that provided a course hand book page
* will identify and return all links to units offered in that course
* 
* @param {puppeteer.Page} page: passed in browser page
* @param {string} url: handbook url for course of interest
*/
async function getUnits(page,url){

    // const browser = await puppeteer.launch({ headless: false });
    // const page = await browser.newPage();

    //go to our page
    await page.goto(url);



    //get our data
    let [unitLinks,courseCode,courseTitle] = await page.evaluate(() => {
        //find every unit
        const units = document.querySelectorAll("div[class*='Links--LinkGroupWrapper e1t6s54p1'] > a");

        //js doesnt like it when we just return just the html obj, so do some processing here    
        let unitsProcessed = Array.from(units).map(unit => unit.href)

        let title = document.querySelectorAll("h2")[0].innerText.split("-");

        let courseCode = title[0].trim();
        let courseTitle = title[1].trim();

    
        return [unitsProcessed,courseCode,courseTitle];
    });


    //await new Promise(r => setTimeout(r, 1000));

    return [unitLinks,courseCode,courseTitle];

}

/*
* Asynchronous function that given a monash hand book unit page
* will find unit info and return as formatted obj
* 
* @param {puppeteer.Page} page: passed in browser page
* @param {string} url: handbook url for unit of interest
*/
async function getUnitInfo(page, url){
    await page.goto(url);

    //check page is not 404
    let state = await page.evaluate(() => {
        pageType = document.querySelector("div[class='css-ksrl4z-Text--Text-Text-Breadcrumbs--BreadcrumbLabel eh2gia11']").innerText
        return pageType === "404 Page" ? true : false
    })

    if (state){
        return null
    }

    // find out unit info
    let result = await page.evaluate(() => {

        //page main title
        let header = document.querySelectorAll("h2")[0].innerText.split("-")

        let unitCode = header[0].trim()
        let unitName = header[1].trim()

        //get unit info
        let unitDescription = document.querySelector("div[class*='e1ydu1r41'] > div > p").innerText.trim();

        //right column on page containing unit info
        let rightCol = Array.from(document.querySelectorAll("div[class='css-1sscrr8-Box--Box-Box-Attribute--AttrContainer ene3w3n2']"));
        let faculty = rightCol[0].querySelector("div").innerText.trim()
        let creditPoints = rightCol[5].querySelector("div").innerText.trim()

        //get offerings
        let offeringElement = document.querySelector("div[data-menu-id='Offerings']");

        let offeringsArr = [];
        //handling in case offerings section is not availble:
        if (offeringElement !== null){
            offeringsArr = Array.from(offeringElement.querySelectorAll("strong")).map(x => x.innerText.trim());
        } 

        // get learning ourcomes
        let outcomes = Array.from(document.querySelectorAll("div[class='css-fzyh5b-AccordionList--ListContentContainer eytijak0'] > div[class='clamp'] > p")).map(x => x.innerText.trim());
        
        //get unit level
        let unitLevel = unitCode[3];

        //organise into obj
        let formattedData = {
            "unitCode": unitCode,
            "unitName": unitName,
            "unitLevel": unitLevel,
            "unitType": null,
            "faculty": faculty,
            "courses": [],
            "creditPoints": creditPoints,
            "offerings": offeringsArr,
            "unitDescription": unitDescription,
            "learningOutcomes": outcomes,
            "handbookURL": document.URL
        }

        return formattedData;
    })

    return result
}


// getUnits("https://handbook.monash.edu/2024/aos/SFTWRENG01?year=2024").then((data) => {
//     console.log(data);
// });



// getUnitInfo("https://handbook.monash.edu/2024/units/FIT5225").then((data) => {
//     console.log(data);
// });

/*
* Asynchronous function that give a monash course url
* will find all units associated with said course, collect info from each unit
* and then format and write to a json file
* Utilises methods getUnits() and getUnitInfo()
* 
* @param {puppeteer.Page} page: passed in browser page
* @param {string} url: handbook url for course of interest
*/
async function run(course){
    //create our browser
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    //get all the units for our course
    let [courseUnits,courseCode,courseTitle] = await getUnits(page,course);

    await new Promise(r => setTimeout(r, 500));

    let data = {
        "University": "Monash",
        "courseCode": courseCode,
        "CourseTitle": courseTitle,
        units:[]
    }

    // loop over each unit and fetch its info
    for(let i = 0; i < courseUnits.length; i++){

        let unitURL = courseUnits[i];
        console.log(`Scraping unit: ${unitURL.split("/")[5]}`)
        
        //get unit info
        let unitData = await getUnitInfo(page,unitURL);


        //check if page 404d, if not add to our json obj
        if (unitData !== null){
            unitData.courses.push(courseTitle)
            data.units.push(unitData);
            //update user
            console.log(`Scraped unit: ${unitURL.split("/")[5]}, ${i+1} out of ${courseUnits.length} units \n`)
        } else {
            console.log(`Unit at ${unitURL} 404d :(\n`)
        }


        
        //pause so as not to overwhelm monash servers
        await new Promise(r => setTimeout(r, 500));
    }

    browser.close();

    //write to file
    fs.writeFile('./unitData.json', JSON.stringify(data), (err) => {
        if (err) {
            throw err;
        }
        console.log("JSON data is saved.");
    });

    
}

run("https://handbook.monash.edu/2024/aos/SFTWRENG01?year=2024");