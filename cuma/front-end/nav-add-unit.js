const form = document.getElementById('scan-url-form');

const scanButton = document.getElementById('scan-url-button');

// Add event listener to the button
scanButton.addEventListener('click', function(event) {
    // Prevent the default form submission behavior
    event.preventDefault();

    // Get the value of the URL input
    const urlInput = document.getElementById('url').value;

    // Check if the input is not empty
    if (urlInput.trim() !== "") {
        Backend.Misc.scrapeDomestic(urlInput)
    }
})