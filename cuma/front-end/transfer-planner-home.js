// Set home university
DEFAULT_HOME_UNIVERSITY = "Monash"

// Navigation bar tracker
let navOpen = false;

//handle nav stuff
function closeNav() {
    sidebar = document.querySelector("sidenav-component");
    sidebar.setAttribute("isopen", "false")
    document.getElementById("main").style.marginLeft= "0";
}

//handle nav stuff
function openNav() {
    const sidebar = document.querySelector("sidenav-component");
    sidebar.setAttribute("isopen", "true");

    document.getElementById("main").style.marginLeft= "200px";
}

// open and close navigation bar
function toggleNav() {
    if (navOpen) {
        closeNav();
        navOpen = false;
    } else {
        openNav();
        navOpen = true;
    }
    
}

document.addEventListener('DOMContentLoaded', () => {
    toggleNav();
})


// ---------- Transfer Planner Home ---------- //
const maxPlanners = 5;
const transferPlannerHome = document.getElementById("transfer-planner-home");
const plannerList = document.getElementById('planner-list');
const emptyMessage = document.getElementById('empty-message');
const createButton = document.getElementById('create-planner');
const createNewPlanModal = document.getElementById('create-new-plan');
const closeCreateNewPlanModal = document.getElementById('close-create-new-plan-modal');

// Display today's date
const dateElement = document.getElementById('date');
const today = new Date();
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
dateElement.textContent = today.toLocaleDateString(undefined, options);

// // Load existing planners from local storage or create sample data
let planners = null;
fetchAndPopulateTransferPlan();

function fetchAndPopulateTransferPlan() {
    (async () => {
        try {
            planners = await getAllTransferPlans();
            console.log(planners);
            renderPlanners();
        } catch (error) {
            console.error("An error occurred while fetching planners:", error);
        }
    })();
}
// Render the list of Planners
function renderPlanners() {
    plannerList.innerHTML = '';

    if (planners.length === 0) {
        emptyMessage.classList.remove('hidden');
        plannerList.classList.add('hidden');
    } else {
        emptyMessage.classList.add('hidden');
        plannerList.classList.remove('hidden');

        planners.forEach((planner, index) => {
            const plannerItem = document.createElement('div');
            plannerItem.className = 'planner-item';
            plannerItem.innerHTML = `
                <span>${planner.name}</span>
                <button onclick="deletePlanner(${index})">🗑️</button>
            `;
            plannerList.appendChild(plannerItem);
        });
    }
}

// delete planner ui and from db
function deletePlanner(index) {
    const plannerName = planners[index].name;

    const deleteButton = document.querySelectorAll('.planner-item button')[index];
    deleteButton.disabled = true; // Disable button to prevent multiple clicks

    // deletes from db
    (async () => {
        try {
            await deleteTransferPlan(plannerName);
            
            // delete from list and re-render
            planners.splice(index, 1);
            renderPlanners();
        } catch (error) {
            console.error("An error occurred while deleting the transfer plan:", error);
            deleteButton.disabled = false; // Re-enable the button if the deletion fails
        }
    })();
}

// Create new planner button logic
createButton.addEventListener('click', () => {
    // Populate university transfer options
    setUpTransferUniOptions();
    createNewPlanModal.classList.remove('hidden');
});

// Set up Universities to choose from
async function setUpTransferUniOptions() {
    const selectElement = document.getElementById("transfer-university");

    Backend.Unit.getAllOtherUni(DEFAULT_HOME_UNIVERSITY)
        .then(otherUniversities => {

            otherUniversities.forEach(universityObj => {
                const { universityName } = universityObj;
                const option = document.createElement("option");
                option.value = universityName; // Set the value attribute
                option.textContent = universityName; // Set the displayed text

                selectElement.appendChild(option);
            });
        })
        .catch(error => {
            // Log and handle the error (e.g., showing an error message to the user)
            console.error("Error fetching other universities:", error);
            alert("Failed to load universities. Please try again later.");
        });
}

// ---------- Create New Planner Logic ---------- //
const createNewPlanContainer = document.getElementById("create-new-plan");

// close modal logic
closeCreateNewPlanModal.addEventListener('click', () => {
    createNewPlanModal.classList.add('hidden');
});

// On Create new Transfer plan form submit update database and configure then show the planner
document.querySelector('.transfer-plan-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the form from submitting

    const courseLevel = document.getElementById('course-level').value;
    const course = document.getElementById('course').value;
    const studyYear = document.getElementById('study-year').value;
    const studyPeriod = document.getElementById('study-period').value;
    const transferUniversity = document.getElementById('transfer-university').value;
    const planName = document.getElementById('plan-name').value;

    // Create an object to store the data
    const formData = {
        courseLevel: courseLevel,
        course: course,
        studyYear: studyYear,
        studyPeriod: studyPeriod,
        transferUniversity: transferUniversity,
        planName: planName
    };

    // Create new entry in database
    (async () => {
        try {
            let newTransferPlan = null;
            newTransferPlan = await createTransferPlan(formData);
            window.location.href = `/transfer-plan/plan?name=${newTransferPlan.name}`;
        } catch (error) {
            console.error("An error occurred while creating the transfer plan:", error);
        }
    })();
});