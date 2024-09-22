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
let planners = getSavedTransferPlans();
renderPlanners();

function getSavedTransferPlans() {
    // Backend.TransferPlan.getSavedTransferPlans.then(response => { 
    //     if (response.status == 200) {
    //         return response.transferPlans;
    //     } else {
    //         alert("Error " + response.status + ": " + response.error);
    //     }
    // }).catch(error => {
    //     console.error("An error occurred:", error);
    // });

    // Mock Data
    const savedTransferPlan = [
        {name: 'Oxford Transfer 2025', courseLevel: 'Undergraduate', course: 'Bachelor of Engineering - Software', studyYear: '2026', studyPeriod: 'Semester 1', transferUniversity: 'oxford', connection: {unit1:{home:"MAT1830", target: ""}, unit2:{home:"", target: ""}, unit3:{home:"", target: ""}, unit4:{home:"", target: ""}}},
        {name: 'Yale Transfer 2025', courseLevel: 'Undergraduate', course: 'Bachelor of Engineering - Software', studyYear: '2024', studyPeriod: 'Semester 2', transferUniversity: 'yale', connection: {unit1:{home:"MAT1830", target: ""}, unit2:{home:"", target: ""}, unit3:{home:"", target: ""}, unit4:{home:"", target: ""}}},
        {name: 'MIT Winter Transfer 2025', courseLevel: 'Undergraduate', course: 'Bachelor of Engineering - Software', studyYear: '2022', studyPeriod: 'Semester 1', transferUniversity: 'mit', connection: {unit1:{home:"MAT1830", target: ""}, unit2:{home:"", target: ""}, unit3:{home:"", target: ""}, unit4:{home:"", target: ""}}},
        {name: 'Harvard Semester 2 2025', courseLevel: 'Undergraduate', course: 'Bachelor of Engineering - Software', studyYear: '2023', studyPeriod: 'Semester 2', transferUniversity: 'harvard', connection: {unit1:{home:"MAT1830", target: ""}, unit2:{home:"", target: ""}, unit3:{home:"", target: ""}, unit4:{home:"", target: ""}}}
    ];

    return savedTransferPlan;
}

function openTransferPlan() {

}

function deleteTransferPlan() {

}

function createNewTransferPlan() {

}

createButton.addEventListener('click', () => {
    createNewPlanModal.classList.remove('hidden');
});

closeCreateNewPlanModal.addEventListener('click', () => {
    createNewPlanModal.classList.add('hidden');
})

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
            plannerItem.addEventListener("click", () => {
                // TODO: Add Click event to 
                console.log(`${planner.name} is clicked`)
            })
            plannerList.appendChild(plannerItem);
        });
    }
}

window.deletePlanner = function(index) {
    planners.splice(index, 1);
    localStorage.setItem('planners', JSON.stringify(planners));
    renderPlanners();
}


// ---------- Create New Planner Logic ---------- //
const createNewPlanContainer = document.getElementById("create-new-plan");
const courseLevel = document.getElementById('course-level').value;
const course = document.getElementById('course').value;
const studyYear = document.getElementById('study-year').value;
const studyPeriod = document.getElementById('study-period').value;
const transferUniversity = document.getElementById('transfer-university').value;
const planName = document.getElementById('plan-name').value;

// On Create new Transfer plan form submit update database and configure then show the planner
document.querySelector('.transfer-plan-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the form from submitting

    // Create an object to store the data
    const formData = {
        courseLevel: courseLevel,
        course: course,
        studyYear: studyYear,
        studyPeriod: studyPeriod,
        transferUniversity: transferUniversity,
        planName: planName
    };

    // TODO: Create new entry in database
    
    // Setup the planner container
    console.log(formData);
});


