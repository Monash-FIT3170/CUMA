// Global variable to store unit connections
let unitConnections = {};
let selectedUnitId = null; // Track the currently selected unit

// Toggle the "Add Unit" form visibility
function toggleAddUnitForm() {
  const addUnitForm = document.getElementById('add-unit-form');
  addUnitForm.style.display = addUnitForm.style.display === 'none' || addUnitForm.style.display === '' ? 'block' : 'none';
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

// Add a new unit to the "Course Units" section
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

  // Clear the input fields after adding
  clearUnitForm();

  // Hide the form again
  toggleAddUnitForm();
}

// Display the selected unit information in the details section
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
}

// Display mapped units for the given unit ID
function displayMappedUnits(unitId) {
  const unitConnectionList = document.getElementById('unit-connection-list');
  unitConnectionList.innerHTML = ''; // Clear existing connections

  const connections = unitConnections[unitId] || [];
  connections.forEach(connection => {
    const connectionDiv = document.createElement('div');
    connectionDiv.className = 'connection';
    connectionDiv.innerHTML = `
            <h4>${connection.name} - ${connection.institution}</h4>
            <p>Type: ${connection.type}, Credits: ${connection.credit}, Level: ${connection.level}</p>
            <p>${connection.overview}</p>
        `;
    unitConnectionList.appendChild(connectionDiv);
  });
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
