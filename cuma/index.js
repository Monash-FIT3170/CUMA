let unitConnections = {};
let selectedUnitId = null;
let isEditMode = false; // Track whether we're in add or edit mode

// commented out while working without db
/* const { MongoClient } = require("mongodb");
require('dotenv').config();

const client = new MongoClient(process.env.MONGODB_URI);

async function run() {
  try {
    await client.connect();
    const database = client.db('sample_mflix');
    const movies = database.collection('movies');
    const query = { title: 'Back to the Future' };
    const movie = await movies.findOne(query);
    console.log(movie);
  } finally {
    await client.close();
  }
} 

run().catch(console.dir); */

document.addEventListener('DOMContentLoaded', function () {
    const jsonUrl = 'https://raw.githubusercontent.com/Monash-FIT3170/CUMA/feature/filtering/cuma/dummyunits.json';

    fetch(jsonUrl)
        .then(response => response.json())
        .then(data => {
            const units = data;
            const unitList = document.getElementById('unit-list');

            units.forEach(unit => {
                const unitDiv = document.createElement('div');
                unitDiv.className = 'unit';
                unitDiv.dataset.id = unit.id;
                unitDiv.dataset.name = unit.name;
                unitDiv.dataset.type = unit.type;
                unitDiv.dataset.credit = unit.credit;
                unitDiv.dataset.level = unit.level;
                unitDiv.dataset.overview = unit.overview;

                unitDiv.innerHTML = `
                  <h4>${unit.id} - ${unit.name}</h4>
                  <p>Type: ${unit.type}, Credits: ${unit.credit}, Level: ${unit.level}</p>
              `;

                // Add click event to show details when clicked
                unitDiv.addEventListener('click', function () {
                    selectUnit(unitDiv);
                });

                // Initialize the connections data structure for the unit
                unitConnections[unit.id] = [];

                unitList.appendChild(unitDiv);
            });
        })
        .catch(error => console.error('Error fetching data:', error));
});

// Toggle the "Add Unit" form visibility
function toggleAddUnitForm() {
    const addUnitForm = document.getElementById('add-unit-form');
    const displayStyle = addUnitForm.style.display;

    // Toggle visibility
    if (displayStyle === 'none' || displayStyle === '') {
        addUnitForm.style.display = 'block';
    } else {
        addUnitForm.style.display = 'none';
        isEditMode = false; // Reset to add mode when hiding the form
        clearUnitForm();
    }
}

// Toggle the "Add Connection" form visibility
function toggleAddConnectionForm() {
    const addConnectionForm = document.getElementById('add-connection-form');
    addConnectionForm.style.display = addConnectionForm.style.display === 'none' || addConnectionForm.style.display === '' ? 'block' : 'none';
}

// Reset input fields including select dropdowns
function clearUnitForm() {
    document.getElementById('form-unit-name').value = '';
    document.getElementById('form-unit-code').value = '';
    document.getElementById('form-unit-type').value = '';
    document.getElementById('form-unit-credit').value = '';
    document.getElementById('form-unit-level').value = '';
    document.getElementById('form-unit-overview').value = '';

    const unitType = document.getElementById('form-unit-type');
    unitType.selectedIndex = 0;
}

function clearConnectionForm() {
    document.getElementById('form-connection-name').value = '';
    document.getElementById('form-connection-institution').value = '';
    document.getElementById('form-connection-type').value = '';
    document.getElementById('form-connection-credit').value = '';
    document.getElementById('form-connection-level').value = '';
    document.getElementById('form-connection-overview').value = '';

    const connectionType = document.getElementById('form-connection-type');
    connectionType.selectedIndex = 0;
}

// Add or modify a unit
function addUnit() {
    const unitList = document.getElementById('unit-list');

    // Collect input values
    const unitName = document.getElementById('form-unit-name').value.trim();
    const unitCode = document.getElementById('form-unit-code').value.trim();
    const unitType = document.getElementById('form-unit-type').value.trim();
    const unitCredit = document.getElementById('form-unit-credit').value.trim();
    const unitLevel = document.getElementById('form-unit-level').value.trim();
    const unitOverview = document.getElementById('form-unit-overview').value.trim();

    // Ensure fields are filled out
    if (!unitName || !unitCode || !unitType || !unitCredit || !unitLevel || !unitOverview) {
        alert("Please fill out all fields.");
        return;
    }

    if (isEditMode) {
        // Modify existing unit
        const existingUnit = document.querySelector(`.unit[data-id='${selectedUnitId}']`);
        if (existingUnit) {
            existingUnit.dataset.name = unitName;
            existingUnit.dataset.type = unitType;
            existingUnit.dataset.credit = unitCredit;
            existingUnit.dataset.level = unitLevel;
            existingUnit.dataset.overview = unitOverview;

            existingUnit.innerHTML = `
        <h4>${unitCode} - ${unitName}</h4>
        <p>Type: ${unitType}, Credits: ${unitCredit}, Level: ${unitLevel}</p>
      `;
        }

        // Update the unitConnections if the unitCode was changed
        if (selectedUnitId !== unitCode) {
            unitConnections[unitCode] = unitConnections[selectedUnitId];
            delete unitConnections[selectedUnitId];
        }

        selectedUnitId = unitCode;
    } else {
        // Create a new unit element
        const unitDiv = document.createElement('div');
        unitDiv.className = 'unit';
        unitDiv.dataset.id = unitCode;
        unitDiv.dataset.name = unitName;
        unitDiv.dataset.type = unitType;
        unitDiv.dataset.credit = unitCredit;
        unitDiv.dataset.level = unitLevel;
        unitDiv.dataset.overview = unitOverview;

        // Populate unit content
        unitDiv.innerHTML = `
      <h4>${unitCode} - ${unitName}</h4>
      <p>Type: ${unitType}, Credits: ${unitCredit}, Level: ${unitLevel}</p>
    `;

        // Add click event to show details when clicked
        unitDiv.addEventListener('click', function () {
            selectUnit(unitDiv);
        });

        // Initialize the connections data structure for the unit
        unitConnections[unitCode] = [];

        // Add the new unit to the list
        unitList.appendChild(unitDiv);
    }

    // Clear the input fields after adding or modifying
    clearUnitForm();

    // Hide the form again
    toggleAddUnitForm();

    // Refresh the displayed mapped units
    displayMappedUnits(selectedUnitId);
}

// Set form to edit mode with the selected unit's information
function modifyUnit() {
    if (!selectedUnitId) {
        alert("No unit selected.");
        return;
    }

    const unitElement = document.querySelector(`.unit[data-id='${selectedUnitId}']`);
    if (!unitElement) {
        alert("Invalid unit selected.");
        return;
    }

    // Populate form with existing values
    document.getElementById('form-unit-name').value = unitElement.dataset.name;
    document.getElementById('form-unit-code').value = unitElement.dataset.id;
    document.getElementById('form-unit-type').value = unitElement.dataset.type;
    document.getElementById('form-unit-credit').value = unitElement.dataset.credit;
    document.getElementById('form-unit-level').value = unitElement.dataset.level;
    document.getElementById('form-unit-overview').value = unitElement.dataset.overview;

    // Toggle the form and set to edit mode
    toggleAddUnitForm();
    isEditMode = true;
}

function deleteUnit() {
    if (!selectedUnitId) {
        alert("No unit selected.");
        return;
    }

    // Confirm before deleting
    if (!confirm(`Are you sure you want to delete unit ${selectedUnitId}?`)) {
        return;
    }

    const unitElement = document.querySelector(`.unit[data-id='${selectedUnitId}']`);
    if (unitElement) {
        unitElement.remove();
    }

    delete unitConnections[selectedUnitId];

    // Clear selected unit info
    selectedUnitId = null;
    document.getElementById('display-unit-title').textContent = '';
    document.getElementById('display-unit-id').textContent = 'N/A';
    document.getElementById('display-unit-type').textContent = 'N/A';
    document.getElementById('display-unit-credits').textContent = 'N/A';
    document.getElementById('display-unit-level').textContent = 'N/A';
    document.getElementById('display-unit-description').textContent = 'Select a unit to see the details';
    document.getElementById('unit-connection-list').innerHTML = '<p>No mapped units available.</p>';

    // Hide the Modify and Delete buttons
    document.getElementById('modify-unit-button').style.display = 'none';
    document.getElementById('delete-unit-button').style.display = 'none';
}

function selectUnit(unitElement) {
    // Highlight the selected unit
    const units = document.querySelectorAll('.unit');
    units.forEach(unit => unit.classList.remove('selected'));
    unitElement.classList.add('selected');

    // Update the unit details section
    document.getElementById('display-unit-title').textContent = `${unitElement.dataset.id} - ${unitElement.dataset.name}`;
    document.getElementById('display-unit-id').textContent = unitElement.dataset.id;
    document.getElementById('display-unit-type').textContent = unitElement.dataset.type;
    document.getElementById('display-unit-credits').textContent = unitElement.dataset.credit;
    document.getElementById('display-unit-level').textContent = unitElement.dataset.level;
    document.getElementById('display-unit-description').textContent = unitElement.dataset.overview;

    // Set the current selected unit ID
    selectedUnitId = unitElement.dataset.id;

    // Display mapped units for this selected unit
    displayMappedUnits(selectedUnitId);

    // Show the Modify and Delete buttons
    document.getElementById('modify-unit-button').style.display = 'inline-block';
    document.getElementById('delete-unit-button').style.display = 'inline-block';
}

// Display mapped units for the given unit ID
function displayMappedUnits(unitId) {
    const unitConnectionList = document.getElementById('unit-connection-list');
    unitConnectionList.innerHTML = '';

    const mappedUnitsSection = document.querySelector('.mapped-units');
    mappedUnitsSection.style.display = 'block';

    const connections = unitConnections[unitId];
    if (connections && connections.length > 0) {
        connections.forEach((connection, index) => {
            const connectionDiv = document.createElement('div');
            connectionDiv.className = 'connection';
            connectionDiv.innerHTML = `
        <h5>${connection.name}</h5>
        <p>Institution: ${connection.institution}</p>
        <p>Type: ${connection.type}, Credits: ${connection.credit}, Level: ${connection.level}</p>
        <p>${connection.overview}</p>
      `;
            unitConnectionList.appendChild(connectionDiv);
        });
    } else {
        unitConnectionList.innerHTML = '<p>No mapped units available.</p>';
    }
}

// Add a new unit connection
function addUnitConnection() {
    if (!selectedUnitId) {
        alert("Please select a course unit to add the connection to.");
        return;
    }

    // Collect input values
    const connectionName = document.getElementById('form-connection-name').value.trim();
    const connectionInstitution = document.getElementById('form-connection-institution').value.trim();
    const connectionType = document.getElementById('form-connection-type').value.trim();
    const connectionCredit = document.getElementById('form-connection-credit').value.trim();
    const connectionLevel = document.getElementById('form-connection-level').value.trim();
    const connectionOverview = document.getElementById('form-connection-overview').value.trim();

    // Ensure fields are filled out
    if (!connectionName || !connectionInstitution || !connectionType || !connectionCredit || !connectionLevel || !connectionOverview) {
        alert("Please fill out all fields.");
        return;
    }

    // Create a new connection object
    const newConnection = {
        name: connectionName,
        institution: connectionInstitution,
        type: connectionType,
        credit: connectionCredit,
        level: connectionLevel,
        overview: connectionOverview
    };

    // Add the new connection to the appropriate unit
    if (unitConnections[selectedUnitId]) {
        unitConnections[selectedUnitId].push(newConnection);
    }

    // Clear the input fields after adding
    clearConnectionForm();

    // Hide the form again
    toggleAddConnectionForm();

    // Display the updated mapped units for the selected unit
    displayMappedUnits(selectedUnitId);
}

