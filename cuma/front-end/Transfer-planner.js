document.addEventListener('DOMContentLoaded', () => {
    toggleNav();
});

let allUnits = [];  // Store all units for search/filter functionality
let navOpen = false;    // Navigation bar tracker

// Get create new plan element
const createNewPlanContainer = document.getElementById("create-new-plan");

// Get Planner Element
const plannerContainer = document.getElementById("transfer-planner");
const plannerName = document.getElementById("planner-name");
const plannerCourse = document.getElementById("course-name");
const plannerStudyYearPeriod = document.getElementById("study-year-period");
const plannerHomeUniName = document.getElementById("home-university-name");
const plannerTargetUniName = document.getElementById("target-university-name");
const homeUnitSlotNameArray = ["home-unit-slot-1", "home-unit-slot-2", "home-unit-slot-3", "home-unit-slot-4"];
const targetUnitSlotNameArray = ["target-unit-slot-1", "target-unit-slot-2", "target-unit-slot-3", "target-unit-slot-4"];

// Get Modal Elements
const unitModal = document.getElementById("unitModal");
const closeModal = document.getElementById('closeModal');
const modalCardGrid = document.getElementById('home-university-card-grid');
const searchInput = document.querySelector('.search-bar input');
const levelSelect = document.getElementById('unit-course-level');
const studyPeriodSelect = document.getElementById('unit-study-period');

// Attach event listeners for search input and filter dropdowns
searchInput.addEventListener('input', filterUnits);
levelSelect.addEventListener('change', filterUnits);
studyPeriodSelect.addEventListener('change', filterUnits);

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

// Gather all the home unit slots element and add click event listener to open the modal
for (const homeUnitSlotName of homeUnitSlotNameArray) {
    const homeUnitSlotElement = document.getElementById(homeUnitSlotName);

    homeUnitSlotElement.dataset.slotPair = getTargetUnitSlotNamePair(homeUnitSlotName);
    homeUnitSlotElement.dataset.university = 'Monash';

    const searchIcon = homeUnitSlotElement.querySelector('.search-icon-container')
    if (searchIcon) {
        searchIcon.addEventListener('click', (event) => {
            setupHomeUnitsModal('Monash', homeUnitSlotElement.id); // Fetch data for 'Monash' when home slot is clicked
            unitModal.style.display = 'block'; // Show the modal
        });
    } else {
        console.error(`Element with ID ${homeUnitSlotName} not found`);
    }
}

// Gather all the target unit slots elements and add click event listener to open the modal
for (const targetUnitSlotName of targetUnitSlotNameArray) { 

    const targetUnitSlotElement = document.getElementById(targetUnitSlotName);

    // Set the dataset.slotPair using the getHomeUnitSlotNamePair function
    const homeUnitSlotNamePair = getHomeUnitSlotNamePair(targetUnitSlotName);
    targetUnitSlotElement.dataset.slotPair = homeUnitSlotNamePair;
    
    // Find the search icon within the target unit slot element
    const searchIcon = targetUnitSlotElement.querySelector('.search-icon-container');
    if (searchIcon) {
        searchIcon.addEventListener('click', (event) => {

            // Get the corresponding home slot element inside the event listener
            const homeSlotElement = document.getElementById(targetUnitSlotElement.dataset.slotPair);

            // Check if the home slot that it is paired to does not have a unit (by checking uniCode stored in dataset)
            if (!homeSlotElement.dataset.unitCode) {
                alert("Please select a unit from Home University first!");
                return;
            }

            // Open the modal with home university units (using 'Monash' as an example)
            setupHomeUnitsModal('Monash', targetUnitSlotElement.id);
            unitModal.style.display = 'block'; // Show the modal
        });
    } else {
        console.error(`Search icon not found in the element with ID ${targetUnitSlotName}`);
    }
}

// Get the Home Slot's name that belong with the Target Slot
function getHomeUnitSlotNamePair(targetUnitSlotName) {
    let homeUnitSlotNamePair = NaN;
    switch (targetUnitSlotName) {
        case "target-unit-slot-1":
            homeUnitSlotNamePair = "home-unit-slot-1";
            break;
        case "target-unit-slot-2":
            homeUnitSlotNamePair = "home-unit-slot-2";
            break;
        case "target-unit-slot-3":
            homeUnitSlotNamePair = "home-unit-slot-3";
            break;
        case "target-unit-slot-4":
            homeUnitSlotNamePair = "home-unit-slot-4";
            break;
        default:
            homeUnitSlotNamePair = NaN;
            break;
    }
    return homeUnitSlotNamePair;
}

// Get the Target Slot's name that belong with the Home Slot
function getTargetUnitSlotNamePair(homeUnitSlotName) {
    let targetUnitSlotNamePair = NaN;
    switch (homeUnitSlotName) {
        case "home-unit-slot-1":
            targetUnitSlotNamePair = "target-unit-slot-1";
            break;
        case "home-unit-slot-2":
            targetUnitSlotNamePair = "target-unit-slot-2";
            break;
        case "home-unit-slot-3":
            targetUnitSlotNamePair = "target-unit-slot-3";
            break;
        case "home-unit-slot-4":
            targetUnitSlotNamePair = "target-unit-slot-4";
            break;
        default:
            targetUnitSlotNamePair = NaN;
            break;
    }
    return targetUnitSlotNamePair;
}

//handle nav stuff
function closeNav() {
    document.getElementById("sidebar").style.width = "0";
    document.getElementById("sidebar-content").style.display = "none";
    document.getElementById("mapping-main").style.marginLeft= "0";
    document.getElementById("mapping-main").style.width= "calc(100% - 60px)";
}

//handle nav stuff
function openNav() {
    document.getElementById("sidebar").style.width = "200px";
    document.getElementById("sidebar-content").style.display = "block";
    document.getElementById("mapping-main").style.marginLeft= "200px";
    document.getElementById("mapping-main").style.width= "calc(100% - 260px)";
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

// Close modal event
closeModal.addEventListener('click', () => {
    unitModal.style.display = 'none';
});

// Function to filter units based on search text, level, and study period
function filterUnits() {
    const searchText = searchInput.value.toLowerCase();
    // const selectedLevel = levelSelect.value;
    // const selectedStudyPeriod = studyPeriodSelect.value;

    const filteredUnits = allUnits.filter(unit => {
        // Check if the unit name matches the search text
        const matchesSearch = unit.unitName.toLowerCase().includes(searchText);

        // TODO: Check if the unit level matches the selected level
        // const matchesLevel = selectedLevel === '' || unit.unitLevel === selectedLevel;

        // TODO: Check if the study period matches the selected one
        // const matchesStudyPeriod = selectedStudyPeriod === '' || selectedStudyPeriod === 'semester-1' || selectedStudyPeriod === 'semester-2';

        // Return true if the unit matches all filters
        return matchesSearch;
    });

    // Re-render units based on the filtered results
    renderUnitsInModal(unitModal.dataset.id, filteredUnits);
}

// Function to setup modal and fetch units based on the university name
async function setupHomeUnitsModal(universityName, unitSlotID) {
    // Set the unitSlotID to the modal grid dataset
    unitModal.dataset.id = unitSlotID;

    // Clear the modal grid and show a loading message
    modalCardGrid.innerHTML = `<p>Loading units...</p>`;

    // Fetch the units from the backend
    Backend.Unit.getAllUnitsFromUniversity(universityName)
    .then(UnitArray => {
        allUnits = UnitArray; // Store the units for filtering
        renderUnitsInModal(unitSlotID, allUnits);
    })
    .catch(error => {
        console.error('Error fetching units from university:', error);
        modalCardGrid.innerHTML = `<p>Error loading units. Please try again.</p>`;
    });
}

// Function to render units to the grid
function renderUnitsInModal(unitSlotID, units) {
    // Clear existing content
    modalCardGrid.innerHTML = ''; 

    // If no units are found, show a message
    if (units.length === 0) {
        modalCardGrid.innerHTML = `<p>No units available for this university.</p>`;
        return;
    }

    // Generate and add a card for each unit
    units.forEach(unit => {
        const unitCardDiv = createUnitCard(unitSlotID, unit, 'add');
        modalCardGrid.appendChild(unitCardDiv);
    });
}

// Open unit information modal
function openUnitInfoModal(unit) {
    // TODO: Create the page and render it
    alert(`More information about ${unit.unitName}`);
}

// Add the unit to the unitSlot
function addUnitToSlot(unitSlotID, unit) {
    if (homeUnitIsAlreadySelected(unit)) {
        alert(unit.unitName + ' already is selected!');
        return;
    }
    // Get the slot and set the unit data
    const unitSlot = document.getElementById(unitSlotID);
    unitSlot.dataset.unitCode = unit.unitCode;

    while (unitSlot.firstChild) {
        unitSlot.removeChild(unitSlot.firstChild);
    }

    // Create a new unit card element
    const unitCardDiv = createUnitCard(unitSlotID, unit, 'remove');

    unitSlot.appendChild(unitCardDiv);
}

// Check all the home slot if it has been selected
function homeUnitIsAlreadySelected(unit) {
    for (const homeUnitSlotName of homeUnitSlotNameArray) {
        const homeUnitSlotElement = document.getElementById(homeUnitSlotName);
        if (homeUnitSlotElement && homeUnitSlotElement.dataset.unitCode && homeUnitSlotElement.dataset.unitCode === unit.unitCode) {
            return true;
        }
    }
    return false;
}

// Remove unit from the unitSlot
function removeUnitFromSlot(unitSlotID) {
    // Get unitSlot and remove unit data
    const unitSlot = document.getElementById(unitSlotID);
    delete unitSlot.dataset.unitCode;

    // Remove all child element - aka unitCard
    while (unitSlot.firstChild) {
        unitSlot.removeChild(unitSlot.firstChild);
    };

    // Create and add the search container back
    const searchContainer = creatSearchContainer('Monash', unitSlotID);
    unitSlot.appendChild(searchContainer);

}

// Create a Unit Card to store in planner
function createUnitCard(unitSlotID, unit, type) {
    // Create a new unit card element
    const unitCardDiv = document.createElement('div');
    unitCardDiv.className = 'unit-card';

    // Extract course code and other data
    const courseCode = unit.course && unit.course[0].courseCode ? unit.course[0].courseCode : ' ';

    // Create action button based on type
    const actionBtnIcon = type === 'add' ? '+' : 'x'
    const actionBtnId = type === 'add' ? "btn-add-unit" : "btn-remove-unit"

    // Populate the unit card content
    unitCardDiv.innerHTML = `
        <div class="unit-top">
            <span class="courseCode">${courseCode}</span>
            <div class="unit-icons">
                    <button class="unit-icons-btn" id="info-icon">i</button>
                    <button class="unit-icons-btn" id=${actionBtnId}>${actionBtnIcon}</button>
            </div>
        </div>

        <h3 class="unit-name-text">${unit.unitName}</h3>

        <p class="unit-details-text">${unit.unitCode} | Level ${unit.unitLevel} | ${unit.creditPoints} Credits</p>

        <div class="unit-semesters-row">
            <div class="semester-badge">Semester 1</div>
            <div class="semester-badge">Semester 2</div>
        </div>
    `;

    // Add event listeners for the info button
    const infoButton = unitCardDiv.querySelector('#info-icon');
    infoButton.addEventListener('click', () => {
        openUnitInfoModal(unit);
    });

    // Add appropriate action button
    const actionButton = unitCardDiv.querySelector('#' + actionBtnId);
    if (type === 'add'){
        actionButton.addEventListener('click', () => {
            addUnitToSlot(unitModal.dataset.id, unit);
            unitModal.style.display = 'none';
        });
    } else {
        actionButton.addEventListener('click', () => {
            removeUnitFromSlot(unitSlotID);
        });
    }
        
    return unitCardDiv
}

// Create a search container to store in the UnitSlot when unitCard is removed
function creatSearchContainer(university, unitSlotID) {
    // Create a new unit card element
    const searchIconContainer = document.createElement('div');
    searchIconContainer.className = 'search-icon-container';
    searchIconContainer.innerHTML =`
        <span class="search-icon">🔍</span>
        <span class="add-text">ADD A UNIT</span>
    `;

    searchIconContainer.addEventListener('click', (event) => {
        setupHomeUnitsModal(university, unitSlotID); // Fetch data for university when home slot is clicked
        unitModal.style.display = 'block'; // Show the modal
    });

    return searchIconContainer;

}
