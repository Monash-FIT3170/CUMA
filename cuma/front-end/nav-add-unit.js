const form = document.getElementById('scan-url-form');

const scanButton = document.getElementById('scan-url-button');



// Add event listener to the button
scanButton.addEventListener('click', function(event) {
    // Prevent the default form submission behavior
    event.preventDefault();

    // Get the value of the URL input
    const urlInput = document.getElementById('url').value;
    mainPage = document.getElementById("main");

    // Check if the input is not empty
    if (urlInput.trim() !== "") {

        // waiting screen
        mainPage.innerHtml += waitingScreen

        // call web scraper
        Backend.Misc.scrapeDomestic(urlInput)
    } else {
        alert("Input is empty.")
    }


    const waitingScreen = `        <div class="waiting-screen">
    <div class="spinner"></div>
    <p>Loading, please wait...</p>
    </div>`

    // remove waiting screen
    main.querySelector('.waiting-screen').remove();

    



})