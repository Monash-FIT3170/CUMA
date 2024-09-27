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

    // Get UI elements screen
    const waitingScreenText = document.getElementById('waiting-screen-text');
    const doneButton = document.getElementById("waiting-screen-done-button");
    const spinningIcon = document.getElementById("spinner")

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
        })

        const reader = response.body.getReader(); // ReadableStream reader
        const decoder = new TextDecoder('utf-8');



        


        
        // Read and process chunks as they arrive
        const processText = async ({ done, value }) => {
            if (done) {
                doneButton.disabled = false;
                spinningIcon.remove();
                return;
            }
            
            // update front end of the progress
            const progress = decoder.decode(value);
            waitingScreenText.innerHTML = progress
    
            // Continue reading the stream
            return reader.read().then(processText);

        };

    
    
        // Start reading the stream
        reader.read().then(processText);

        // Extract the response code
        const statusCode = response.status;

        const result = await response.json();
        return { result: result, status: statusCode };
    } catch (error) {

        //handle UI element
        waitingScreenText.innerHTML = error.message;
        waitingScreenText.style.color = "red"; 
        waitingScreenText.style.fontWeight = "bold";
        waitingScreenText.style.padding = "10px"; 
        waitingScreenText.style.backgroundColor = "#ffe5e5";
        waitingScreenText.style.borderRadius = "5px";
        waitingScreenText.style.border = "1px solid red";

        doneButton.disabled = false;
        spinningIcon.remove();


    }
}