const backendPath = "/api/webscraperEndpoint"


Backend.Misc.scrapeDomestic = async function (courseURL) {
    /**
     * 
     * @param {String} courseURL, monash handbook course url
     * 
     * Makes a post request to server side webscraper using monash handbook url
     * 
     * Example input: "https://handbook.monash.edu/2024/aos/SFTWRENG01?year=2024"
     */


    try {
        const url = new URL(serverPath + backendPath + "/scrapeDomesticUnits");

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "url":courseURL
            }),
        });

        // Extract the response code
        const statusCode = response.status;

        const result = await response.json();
        return { result: result, status: statusCode };
    } catch (error) {
        console.log("Error:", error);
    }
}