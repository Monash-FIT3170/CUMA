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
                console.log("done")
   
                return;
            }


            // check if response is done
            
            // update front end of the progress
            const responseChunk = decoder.decode(value);
            if (responseChunk.progress) // if this is the progress response, then display it this way
            {

                waitingScreenText.innerHTML = `<p>${responseChunk.progress}</p> <p>${responseChunk.log}</p>`
            }
            else if (responseChunk.unitsAdded != null || responseChunk.unitsModified  != null)
                // if this is the result response, then display it this way
            {
                waitingScreenText.innerHTML = `
                <div style="font-family: Arial, sans-serif; padding: 10px; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
                    <h3>Unit Status</h3>
                    <p><strong>Units Added:</strong> ${responseChunk.unitsAdded}</p>
                    <p><strong>Units Modified:</strong> ${responseChunk.unitsModified}</p>
                </div>
                `;
            }
    
            // Continue reading the stream
            return reader.read().then(processText);

        };

    
    
        // Start reading the stream
        reader.read().then(processText);



        // Extract the response code
        // const statusCode = response.status;

        // const result = await response.json();
        // return { result: result, status: statusCode };
    } catch (error) {
        console.log("66")
        console.log(error)

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