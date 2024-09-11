document.addEventListener('DOMContentLoaded', () => {
    toggleNav();
});

let allUnits = [];  // Store all units for search/filter functionality
let navOpen = false;    // Navigation bar tracker

// Get create new plan element
const createNewPlanContainer = document.getElementById("create-new-plan");

// Get Planner Element
const plannerContainer = document.getElementById("transfer-planner");
const plannerName = document.getElementById("planner-name ");
const plannerCourse = document.getElementById("course-name");
const plannerStudyYearPeriod = document.getElementById("study-year-period");
const plannerHomeUniName = document.getElementById("home-university-name");
const plannerTargetUniName = document.getElementById("target-university-name");
const homeUnitSlotNameArray = ["home-unit-slot-1", "home-unit-slot-2", "home-unit-slot-3", "home-unit-slot-4"];
const targetUnitSlotNameArray = ["target-unit-slot-1", "target-unit-slot-2", "target-unit-slot-3", "target-unit-slot-4"];

// On Create new Transfer plan form submit update database and configure then show the planner
document.querySelector('.transfer-plan-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the form from submitting
    
    // Gather form data
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

    // TODO: Create new entry in database
    
    // Setup the planner container
    configureTransferPlanner(formData);
});

function configureTransferPlanner(formData) {
    // Set the plan header
    plannerName.textContent = formData.planName;
    plannerCourse.textContent = formData.course;
    plannerStudyYearPeriod.textContent = formData.studyYear + " : " + formData.studyPeriod;

    // Set the university name
    plannerHomeUniName.textContent = 'University of Monash';
    plannerTargetUniName.textContent = formData.transferUniversity;

    createNewPlanContainer.style.display = "none";
    plannerContainer.style.display = "block";


}
