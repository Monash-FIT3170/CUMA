
// Function to display user input as a recommendation
async function getMonashEquivalent(unitName, unitCode, unitDescription) {
    console.log("getMonashEquivalent called");
    const recommendationsContainer = document.getElementById('recommendations');

    if (!recommendationsContainer) {
        console.error("No recommendations container found!");
        return;
    }

    console.log("Clearing previous recommendations");
    recommendationsContainer.innerHTML = ''; // Clear previous recommendations
    
    console.log("Creating unitDiv element");
    const unitDiv = document.createElement('div');
    unitDiv.className = 'recommended-unit';

    unitDiv.innerHTML = `
        <h4>${unitCode} - ${unitName}</h4>
        <p>${unitDescription}</p>
    `;

    console.log("Appending unitDiv to recommendationsContainer");
    recommendationsContainer.appendChild(unitDiv);


    //fetch and display monash equivalent - TODO


}

// Event listener for form submission
document.getElementById('unit-form').addEventListener('submit', function(event) {
    event.preventDefault();
    console.log("Form submitted");

    const unitName = document.getElementById('foreign-unit-name').value.trim();
    const unitCode = document.getElementById('foreign-unit-code').value.trim();
    const unitDescription = document.getElementById('foreign-unit-description').value.trim();

    console.log("unitName:", unitName);
    console.log("unitCode:", unitCode);
    console.log("unitDescription:", unitDescription);

    if (unitName && unitCode && unitDescription) {
        getMonashEquivalent(unitName, unitCode, unitDescription);
    } else {
        console.error("All fields are required");
    }
});
