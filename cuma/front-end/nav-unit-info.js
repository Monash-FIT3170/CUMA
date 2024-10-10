
function addButtonFunc(){
    let button = document.getElementById("searchButton");


    button.addEventListener("click", async () => {

        let defaultHTML = `
            <h2>Selected Unit Information</h2>
            <p id="display-unit-description">Search for a unit to see the details</p>
        `;

        if (document.getElementById("errorText").style.display === "inline"){
            toggleErrorSpan();
        }

        let uniForm = document.getElementById("search-institution");
        let unitForm = document.getElementById("search-unit");
        

        let result = await Backend.Unit.retrieveUnit(uniForm.value, unitForm.value)

        if (result == undefined){
            toggleErrorSpan()
            document.getElementById("displayUnitSection").innerHTML = defaultHTML;
        } else {
            let unitName = result.unitName;
            let unitCode = result.unitCode;
            let unitType = result.unitType;
            let creditPoints = result.creditPoints;
            let unitLevel = result.unitLevel;
            let unitDescription = result.unitDescription;
            let handBookURL = result.handBookURL;


            let newHTML = `
                <h2>Selected Unit Information</h2>
                <h3 id="display-unit-title">${unitName}</h3>
                <p><strong>Code:</strong> <span id="display-unit-id">${unitCode}</span></p>
                <p><strong>Type:</strong> <span id="display-unit-type">${unitType}</span></p>
                <p><strong>Credits:</strong> <span id="display-unit-credits">${creditPoints}</span></p>
                <p><strong>Level:</strong> <span id="display-unit-level">${unitLevel}</span></p>
                <p id="display-unit-description">${unitDescription}</p>
                <p><strong>Handbook URL:</strong> <a href="${handBookURL}">Handbook Page</a></p>
            `;


            
            document.getElementById("displayUnitSection").innerHTML = newHTML;
        }

        console.log(result)
    });
}

function toggleErrorSpan(){
    let span = document.getElementById("errorText");

    if (span.style.display === "none"){
        span.style.display = "inline";
    } else if (span.style.display === "inline"){
        span.style.display = "none";
    }
}

addButtonFunc()