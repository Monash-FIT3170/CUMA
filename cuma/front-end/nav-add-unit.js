const form = document.getElementById('scan-url-form');

const scanButton = document.getElementById('scan-url-button');

    const waitingScreen = `
            <div class="waiting-screen" id="waiting-screen">
            <div class="spinner" id="spinner"></div>
            <p id="waiting-screen-text">Loading, please wait...</p>
            <button disabled id="waiting-screen-done-button" onclick="closeWaitingScreen()">Done</button>
            </div>
    `

// Add event listener to the button
scanButton.addEventListener('click', function(event) {
    // Prevent the default form submission behavior
    event.preventDefault();

    // Get the value of the URL input
    const urlInput = document.getElementById('url').value;
    

    const mainPage = document.getElementById("main");
    mainPage.innerHTML += waitingScreen

    // Check if the input is not empty
    if (urlInput.trim() !== "") {

        // insert waiting screen


        // call web scraper
        Backend.Misc.scrapeDomestic(urlInput)
    } else {
        alert("Input is empty.")
    }
})

const addUnitButton = document.querySelector("form[id='add-unit-form'] > button");

//add functionality for add unit button
addUnitButton.addEventListener('click', async function(event){
    // Prevent the default form submission behavior
    event.preventDefault();
    console.log("hi")

    //get user inputs
    const institution = document.getElementById("institution").value;
    const unitCode = document.getElementById("unit-code").value;
    const unitTitle = document.getElementById("unit-title").value; 
    const unitType = document.getElementById("unit-type").value; 
    const creditPoints = document.getElementById("credit-points").value; 
    const unitLevel = document.getElementById("unit-level").value; 
    const faculty = document.getElementById("unit-faculty").value;
    let offering = document.getElementById("unit-offering").value;
    const description = document.getElementById("unit-description").value;
    const handbookURL = document.getElementById("handbookURL").value; 

    //check if multiple offerings where provided
    if (offering.includes(',')){
        offering = offering.split(",")
    } else {
        offering = [offering]
    }

    //format payload
    const payload = {
        "universityName": institution,
        "unitCode": unitCode,
        "unitName": unitTitle,
        "unitDescription": description,
        "unitType": unitType,
        "unitLevel": unitLevel,
        "creditPoints": creditPoints,
        "course": [],
        "faculty": faculty,
        "offering": offering,
        "handBookURL": handbookURL
    };

    //post to mongoDB
    result = await Backend.Unit.add(institution,payload)

    console.log(result)
});

function closeWaitingScreen() {
    // const screen = document.getElementById("waiting-screen")
    // screen.remove()

    window.location.reload()
}