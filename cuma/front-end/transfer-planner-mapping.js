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

let transferPlanData = {};

document.addEventListener('DOMContentLoaded', (req, res) => {
    toggleNav();

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const name = urlParams.get('name');

    (async () => {
        try {
            tranferPlan = await getSpecificTransferPlan(name);
            configureTransferPlanner(tranferPlan);
        } catch (error) {
            console.error("An error occurred while retreiving plan data and configuring the planner:", error);
            alert('Error:' + error);
        }
    })();

});

// ---------- Transfer Planner Logic ---------- //

// Get Planner Element
const plannerContainer = document.getElementById("transfer-planner");
const plannerName = document.getElementById("planner-name");
const plannerCourse = document.getElementById("course-name");
const plannerStudyYearPeriod = document.getElementById("study-year-period");
const plannerHomeUniName = document.getElementById("home-university-name");
const plannerTargetUniName = document.getElementById("target-university-name");
const homeUnitSlotNameArray = ["home-unit-slot-1", "home-unit-slot-2", "home-unit-slot-3", "home-unit-slot-4"];
const targetUnitSlotNameArray = ["target-unit-slot-1", "target-unit-slot-2", "target-unit-slot-3", "target-unit-slot-4"];

// Configure the Transfer Planner with the data collected from the Transfer Plan Form
function configureTransferPlanner(plannerData) {
    // Set the plan header
    plannerName.textContent = plannerData.name;
    plannerCourse.textContent = plannerData.course;
    plannerStudyYearPeriod.textContent = plannerData.studyYear + " : " + plannerData.studyPeriod;

    // Set the university name
    plannerHomeUniName.textContent = plannerData.homeUniversity;
    plannerTargetUniName.textContent = plannerData.transferUniversity;

    // Congfigure Unit Slots
    configureHomeUnitSlot(plannerData.homeUniversity);
    // configureTargetUnitSlot(plannerData.transferUniversity); // TODO: Revert back to this when connection are populated
    configureTargetUnitSlot(plannerData.homeUniversity);

    // Populate the unit mappings
    (async () => {
        try {
            await populateUnitMappings(plannerData.unitMappings);
        } catch (error) {
            console.error("An error occurred while retrieving plan data and configuring the planner:", error);
            alert('Error:' + error);
        }
    })();
}

// Configure all the home unit slot with required data and click event
function configureHomeUnitSlot(homeUniversityName) {
    // Gather all the home unit slots element and add click event listener to open the modal
    for (const homeUnitSlotName of homeUnitSlotNameArray) {

        // Get unit slot
        const homeUnitSlotElement = document.getElementById(homeUnitSlotName);

        // store data
        homeUnitSlotElement.dataset.slotPair = getTargetUnitSlotNamePair(homeUnitSlotName);
        homeUnitSlotElement.dataset.university = homeUniversityName;

        // Add click event listener to setup and open modal
        const searchIcon = homeUnitSlotElement.querySelector('.search-icon-container');
        if (searchIcon) {
            searchIcon.addEventListener('click', (event) => {
                setupHomeUnitsModal(homeUniversityName, homeUnitSlotElement.id);
            });
        } else {
            console.error(`Element with ID ${homeUnitSlotName} not found`);
        }
    }
}

// Configure all the target unit slot with required data and click event
function configureTargetUnitSlot(targetUniversityName) {

    // Gather all the target unit slots elements and add click event listener to open the modal
    for (const targetUnitSlotName of targetUnitSlotNameArray) { 

        // get target slot
        const targetUnitSlotElement = document.getElementById(targetUnitSlotName);

        // store data
        targetUnitSlotElement.dataset.slotPair = getHomeUnitSlotNamePair(targetUnitSlotName);
        targetUnitSlotElement.dataset.university = targetUniversityName;
        
        // Add click event listener to setup and open modal
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
                setupTargetUnitsModal(plannerTargetUniName, targetUnitSlotElement.id); // TODO: need to change to 'targetUniversityName' to use correct data
            });
        } else {
            console.error(`Search icon not found in the element with ID ${targetUnitSlotName}`);
        }
    }
}

// Function to populate units into the slots from the database
async function populateUnitMappings(unitMappings) {
    for (const mapping of unitMappings) {
        // Populate home unit
        if (mapping.homeUnit && mapping.homeUnit.unitCode) {
            const homeUnitSlotID = mapping.homeUnit.slotId;
            const homeUniversityName = mapping.homeUnit.universityName;
            const homeUnitCode = mapping.homeUnit.unitCode;

            try {
                const homeUnit = await Backend.Unit.retrieveUnit(homeUniversityName, homeUnitCode);
                if (homeUnit) {
                    addUnitToSlotFromDB(homeUnitSlotID, homeUnit);
                } else {
                    console.error(`Home unit ${homeUnitCode} not found`);
                }
            } catch (error) {
                console.error(`Error retrieving home unit ${homeUnitCode}:`, error);
            }
        }

        // Populate target unit, if it exists
        if (mapping.targetUnit && mapping.targetUnit.unitCode) {
            const targetUnitSlotID = mapping.targetUnit.slotId;
            const targetUniversityName = mapping.targetUnit.universityName;
            const targetUnitCode = mapping.targetUnit.unitCode;

            try {
                const targetUnit = await Backend.Unit.retrieveUnit(targetUniversityName, targetUnitCode);
                if (targetUnit) {
                    addUnitToSlotFromDB(targetUnitSlotID, targetUnit);
                } else {
                    console.error(`Target unit ${targetUnitCode} not found`);
                }
            } catch (error) {
                console.error(`Error retrieving target unit ${targetUnitCode}:`, error);
            }
        }
    }
}


// use to add unit to the slot
function addUnitToSlotFromDB(unitSlotID, unit) {

    // Get the slot and set the unit data
    const unitSlot = document.getElementById(unitSlotID);
    unitSlot.dataset.unitCode = unit.unitCode;
    unitSlot.dataset.unitName = unit.unitName;

    // Remove all child element - aka search container
    while (unitSlot.firstChild) {
        unitSlot.removeChild(unitSlot.firstChild);
    }

    // Create a new unit card element
    const unitCardDiv = createUnitCard(unitSlotID, unit, 'remove');

    unitSlot.appendChild(unitCardDiv);
}

// Utils - Get the Home Slot's name that belong with the Target Slot
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

// Utils - Get the Target Slot's name that belong with the Home Slot
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

// Get units 
function getUnitMappings() {
    const unitMappings = [];

    for (let i = 0; i < homeUnitSlotNameArray.length; i++) {
        const homeSlotId = homeUnitSlotNameArray[i];
        const targetSlotId = targetUnitSlotNameArray[i];

        const homeSlotElement = document.getElementById(homeSlotId);
        const targetSlotElement = document.getElementById(targetSlotId);

        if (!homeSlotElement || !targetSlotElement) {
            console.error(`Slot elements not found for indices ${i}`);
            continue;
        }

        const homeUnitCode = homeSlotElement.dataset.unitCode;
        const homeUniversityName = homeSlotElement.dataset.university;
        const homeUnitName = homeSlotElement.dataset.unitName;

        const targetUnitCode = targetSlotElement.dataset.unitCode;
        const targetUniversityName = targetSlotElement.dataset.university;
        const targetUnitName = targetSlotElement.dataset.unitName;

        if (homeUnitCode) {
            unitMappings.push({
                homeUnit: {
                    slotId: homeSlotId,
                    unitCode: homeUnitCode,
                    universityName: homeUniversityName,
                    unitName: homeUnitName
                },
                targetUnit: targetUnitCode ? {
                    slotId: targetSlotId,
                    unitCode: targetUnitCode,
                    universityName: targetUniversityName,
                    unitName: targetUnitName
                } : null
            });
        }
    }
    return unitMappings;
}

// Open user default main app in preparation for sending Transfer for approval
function sendTransferForApproval() {
    const unitMappings = getUnitMappings();
    // TODO: Setup Email again
    // userSendConnections(getConnections());
}

// Open user default main app in preparation for sending Transfer for approval
async function saveUnitConnections() {
    const unitMappings = getUnitMappings();
    updateTransferPlan(plannerName.textContent, unitMappings);
}

// ---------- Add Unit Modal Logic ---------- //

// Get Add Unit Modal Elements
const addUnitModal = document.getElementById("add-unit-modal");
const closeAddUnitModal = document.getElementById('close-add-unit-modal');
const modalCardGrid = document.getElementById('home-university-card-grid');
const searchInput = document.querySelector('.search-bar input');
const levelSelect = document.getElementById('unit-course-level');
const studyPeriodSelect = document.getElementById('unit-study-period');

let allUnits = [];  // Store all units for search/filter functionality

// Close modal event
closeAddUnitModal.addEventListener('click', () => {
    addUnitModal.style.display = 'none';
});

// Attach event listeners for search input and filter dropdowns
searchInput.addEventListener('input', filterUnits);
levelSelect.addEventListener('change', filterUnits);
studyPeriodSelect.addEventListener('change', filterUnits);

// Function to filter units based on search text, level, and study period
function filterUnits() {
    const searchText = searchInput.value.toLowerCase();
    const selectedLevel = levelSelect.value;
    const selectedStudyPeriod = studyPeriodSelect.value;

    const filteredUnits = allUnits.filter(unit => {
        // Check if the unit name matches the search text
        const matchesSearch = unit.unitName.toLowerCase().includes(searchText);

        // TODO: Check if the unit level matches the selected level
        const matchesLevel = selectedLevel === '' || unit.unitLevel === selectedLevel;

        // TODO: Check if the study period matches the selected one
        const matchesStudyPeriod = selectedStudyPeriod === '' || selectedStudyPeriod === 'semester-1' || selectedStudyPeriod === 'semester-2';

        // Return true if the unit matches all filters
        return matchesSearch && matchesLevel && matchesStudyPeriod;
    });

    // Re-render units based on the filtered results
    renderUnitsInModal(addUnitModal.dataset.id, filteredUnits);
}

// Function to setup Home unit modal and fetch units based on the university name
async function setupHomeUnitsModal(universityName, unitSlotID) {
    // Set the unitSlotID to the modal grid dataset
    addUnitModal.dataset.id = unitSlotID;

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

    // open the modal
    addUnitModal.style.display = 'block';
}

// Function to setup Target unit modal and fetch units based on the university name 
async function setupTargetUnitsModal(universityName, unitSlotID) {
    console.log("called")
    // Set the unitSlotID to the modal grid dataset
    addUnitModal.dataset.id = unitSlotID;

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

    // open the modal
    addUnitModal.style.display = 'block';
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

// Add the unit to the unitSlot
function addUnitToSlot(unitSlotID, unit) {

    // Check if homeUnitSlot already contain the unit
    if (homeUnitIsAlreadySelected(unit)) {
        alert(unit.unitName + ' already is selected!');
        return;
    }

    // Get the slot and set the unit data
    const unitSlot = document.getElementById(unitSlotID);
    unitSlot.dataset.unitCode = unit.unitCode;
    unitSlot.dataset.unitName = unit.unitName;

    // Remove all child element - aka search container
    while (unitSlot.firstChild) {
        unitSlot.removeChild(unitSlot.firstChild);
    }

    // Create a new unit card element
    const unitCardDiv = createUnitCard(unitSlotID, unit, 'remove');

    unitSlot.appendChild(unitCardDiv);
}

// Remove unit from the unitSlot
function removeUnitFromSlot(unitSlotID) {
    // Get unitSlot and remove unit data
    const unitSlot = document.getElementById(unitSlotID);
    replaceSearchContainer(unitSlot);

    // If the unit is a homeUnitSlot then need to remove target slot too.
    if (homeUnitSlotNameArray.includes(unitSlotID)) {
        const unitSlotPair = document.getElementById(unitSlot.dataset.slotPair);
        replaceSearchContainer(unitSlotPair);
    }
}

// Remove all children element in unitSlot and replace with search container
function replaceSearchContainer(unitSlot) {
    
    // Remove the unit data
    delete unitSlot.dataset.unitCode;
    delete unitSlot.dataset.unitName;

    // Remove all child elements - aka unitCard
    while (unitSlot.firstChild) {
        unitSlot.removeChild(unitSlot.firstChild);
    }

    // Create a new search icon container
    const searchIconContainer = document.createElement('div');
    searchIconContainer.className = 'search-icon-container';
    searchIconContainer.innerHTML = `
        <span class="search-icon">🔍</span>
        <span class="add-text">ADD A UNIT</span>
    `;

    // Add click event listener to the search container
    searchIconContainer.addEventListener('click', (event) => {
        // Determine if it's a home or target unit slot
        const isHomeSlot = homeUnitSlotNameArray.includes(unitSlot.id);
        const isTargetSlot = targetUnitSlotNameArray.includes(unitSlot.id);

        if (isHomeSlot) {
            // Handle home unit slot click event
            setupHomeUnitsModal(unitSlot.dataset.university, unitSlot.id);
        } else if (isTargetSlot) {
            // Handle target unit slot click event
            const homeSlotElement = document.getElementById(unitSlot.dataset.slotPair);
            if (!homeSlotElement.dataset.unitCode) {
                alert("Please select a unit from Home University first!");
                return;
            }
            setupTargetUnitsModal('Monash', unitSlot.id); // TODO: change 'Monash' to 'unitSlot.dataset.university' to use correct data
        } else {
            console.error(`Unit slot with ID ${unitSlot.id} not found in home or target arrays.`);
        }

        addUnitModal.style.display = 'block';
    });

    // Add the container to the slot
    unitSlot.appendChild(searchIconContainer);
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
            addUnitToSlot(addUnitModal.dataset.id, unit);
            addUnitModal.style.display = 'none';
        });
    } else {
        actionButton.addEventListener('click', () => {
            removeUnitFromSlot(unitSlotID);
        });
    }
        
    return unitCardDiv
}

// Utils - Check all the home slot if it has been selected
function homeUnitIsAlreadySelected(unit) {
    for (const homeUnitSlotName of homeUnitSlotNameArray) {
        const homeUnitSlotElement = document.getElementById(homeUnitSlotName);
        if (homeUnitSlotElement && homeUnitSlotElement.dataset.unitCode && homeUnitSlotElement.dataset.unitCode === unit.unitCode) {
            return true;
        }
    }
    return false;
}

// Utils - Check all the target slot if it has been selected
function targetUnitIsAlreadySelected(unit) {
    for (const targetUnitSlotName of targetUnitSlotNameArray) {
        const targetUnitSlotElement = document.getElementById(targetUnitSlotName);
        if (targetUnitSlotElement && targetUnitSlotElement.dataset.unitCode && targetUnitSlotElement.dataset.unitCode === unit.unitCode) {
            return true;
        }
    }
    return false;
}

// Utils - Check if the Home Unit Slot is empty
function isHomeUnitSlotEmpty(unitSlot) {
    const unitSlotPair = document.getElementById(unitSlot.dataset.slotPair);
    if (unitSlotPair.dataset.unitCode) return false;
    return true;
}


// ---------- Unit Info Floating Modal Logic ---------- //

// Get Unit Info Modal Elements
const unitInfoModal = document.getElementById('unit-info-modal');
const closeUnitInfoModal = document.getElementById('close-unit-info-modal');
const unitInfoDetails = document.getElementById('units-details');
const unitInfoUnitName = document.getElementById('units-name');
const unitInfoSemesterTagContainer = document.querySelector('.semester-tags-container');
const unitCourseContainer = document.querySelector('.unit-course-container');
const unitInfoSelectedTag = document.getElementById('selected-tag');
const unitInfoDescription = document.getElementById('unit-descriptions');
const unitInfoHandbookLink = document.getElementById('handbook-link');
const unitInfoUnitCourseNames = document.getElementById('unit-course-name');

const overlay = document.getElementById('modal-overlay');

// Open unit information modal
function openUnitInfoModal(unit) {

    unitInfoModal.style.display = "block";
    overlay.style.display = "block";

    // Add Unit general single unit data
    unitInfoUnitName.textContent = unit.unitName;
    unitInfoDetails.textContent = `${unit.unitCode} | Level ${unit.unitLevel} | ${unit.creditPoints} Credits`;
    unitInfoDescription.textContent = unit.unitDescription;
    unitInfoHandbookLink.href = unit.handBookURL;

    // Add Unit Semester - TODO: Dynamically add these later
    unitInfoSemesterTagContainer.innerHTML = '';
    const sampleSemester = ['Semester 1', 'Semester 2'];
    sampleSemester.forEach (semester => {
        const semesterTagDiv = document.createElement('div');
        semesterTagDiv.classList.add('semester-tag');
        semesterTagDiv.textContent = semester;
        unitInfoSemesterTagContainer.appendChild(semesterTagDiv);
    });

    // Loop through the course list and create and add element
    unitCourseContainer.innerHTML = "";
    if (unit.course) {
        unit.course.forEach(course => {
            const courseItemDiv = document.createElement('div');
            courseItemDiv.classList.add('course-item');
            courseItemDiv.textContent = `${course.courseCode} - ${course.courseName}`;
            unitCourseContainer.appendChild(courseItemDiv);
        });
    } else {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('course-item');
        itemDiv.textContent = 'Unspecified. Please refer to the unit handbook.';
        unitCourseContainer.appendChild(itemDiv);
    }

    // Check if the unit is selected
    if (homeUnitIsAlreadySelected(unit) || targetUnitIsAlreadySelected(unit)) {
        unitInfoSelectedTag.style.display = "block";
    } else {
        unitInfoSelectedTag.style.display = "none";
    }
}

// Close the unit info modal
closeUnitInfoModal.addEventListener('click', () => {
    unitInfoModal.style.display = "none";
    overlay.style.display = "none";
});

overlay.addEventListener('click', () => {
    unitInfoModal.style.display = "none";
    overlay.style.display = "none";
})
