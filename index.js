const { MongoClient } = require("mongodb");

// Replace the uri string with your connection string.
require('dotenv').config();

const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const clusterUrl = process.env.CLUSTER_URL;

const uri = `mongodb+srv://${username}:${password}@${clusterUrl}/?retryWrites=true&writeConcern=majority`;
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const database = client.db('sample_mflix');
    const movies = database.collection('movies');
    // Query for a movie that has the title 'Back to the Future'
    const query = { title: 'Back to the Future' };
    const movie = await movies.findOne(query);
    console.log(movie);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

run().catch(console.dir);



// Toggle the "Add Unit" form visibility
function toggleAddUnitForm() {
  const addUnitForm = document.getElementById('add-unit-form');
  addUnitForm.style.display = addUnitForm.style.display === 'none' || addUnitForm.style.display === '' ? 'block' : 'none';
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
  unitDiv.addEventListener('click', function() {
    selectUnit(unitDiv);
  });

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
}



