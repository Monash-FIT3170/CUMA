const homeUniversity = "Monash University"
const currentCourse =                     {
    "courseCode": "SFTWRENG01",
    "courseName": "Software engineering"
}



function openModal(){
    overlay.style.display = "block";
    const addCustomUnitModal = document.getElementById("add-custom-unit-modal");
    addCustomUnitModal.style.display = "block";
    // overlay.style.display = "block";


}


function addCustomUnit(){
        // Collect input values
        const unitName = document.getElementById('form-unit-name').value.trim();
        const unitCode = document.getElementById('form-unit-code').value.trim();
        const unitType = document.getElementById('form-unit-type').value.trim();
        const unitCredit = document.getElementById('form-unit-credit').value.trim();
        const unitLevel = document.getElementById('form-unit-level').value.trim();
        const unitOverview = document.getElementById('form-unit-overview').value.trim();
        const unitLearningOutcome = document.getElementById('form-learning-outcome').value.trim();
    
        // Ensure fields are filled out
        // if (!unitName || !unitCode || !unitType || !unitCredit || !unitLevel || !unitOverview || !unitLearningOutcome) {
        //     alert("Please fill out all fields.");
        //     return;
        // }

        const customUnit = 
            {
                "universityName": homeUniversity,
                "unitCode": unitCode,
                "unitName": unitName,
                "unitDescription": unitOverview,
                "unitType": unitType,
                "unitLevel": unitLevel,
                "creditPoints": unitCredit,
                "course": [
                    currentCourse
                ],
                "offering": ["semester 1", "semester 2"],
                "handBookURL": null,
                "connections": [],
                "isCustomUnit": true
            }

        // add to unitList
        allUnits.push(customUnit)
        
        // re-render all the units
        renderUnitsInModal(slotIdForModal, allUnits)

        closeCustomUnitModal()
}

function closeCustomUnitModal() {
    const addCustomUnitModal = document.getElementById("add-custom-unit-modal");
    
    if (addCustomUnitModal.style.display != "none"){
        // confirm the user if they want to close the modal
        const confirmPrompt = confirm("Changes in this modal won't be saved. Are you sure you want to close this modal?")
        if (confirmPrompt)
        {
            overlay.style.display = "none";
            addCustomUnitModal.style.display = "none";
        }else{
            overlay.style.display = "block"
        }

    }
}

overlay.addEventListener('click', () => {
    closeCustomUnitModal();
})