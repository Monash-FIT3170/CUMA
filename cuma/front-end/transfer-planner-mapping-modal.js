function openModal(){
    console.log("hello")
    const addCustomUnitModal = document.getElementById("add-custom-unit-modal");
    addCustomUnitModal.style.display = "block";
    // overlay.style.display = "block";

        // Collect input values
        const unitName = document.getElementById('form-unit-name').value.trim();
        const unitCode = document.getElementById('form-unit-code').value.trim();
        const unitType = document.getElementById('form-unit-type').value.trim();
        const unitCredit = document.getElementById('form-unit-credit').value.trim();
        const unitLevel = document.getElementById('form-unit-level').value.trim();
        const unitOverview = document.getElementById('form-unit-overview').value.trim();
        const unitLearningOutcome = document.getElementById('form-unit-learning-outcome').value.trim();
    
        // Ensure fields are filled out
        if (!unitName || !unitCode || !unitType || !unitCredit || !unitLevel || !unitOverview || !unitLearningOutcome) {
            alert("Please fill out all fields.");
            return;
        }



}

function closeCustomUnitModal() {

}