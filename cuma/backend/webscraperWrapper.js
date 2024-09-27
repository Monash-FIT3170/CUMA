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
        })

        const reader = response.body.getReader(); // ReadableStream reader
        const decoder = new TextDecoder('utf-8');
        
        // Read and process chunks as they arrive
        const processText = async ({ done, value }) => {
            if (done) {
                console.log('Stream complete');
                return;
            }
            
            const progress = decoder.decode(value);
            console.log(progress)
    
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
        console.log("Error:", error);
    }
}