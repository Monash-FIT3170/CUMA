document.addEventListener('DOMContentLoaded', function () {
    // Function to filter units by prefix
    function filterUnitsByPrefix(prefix) {
      const units = document.getElementsByClassName('unit'); // Get all units in the unit list
  
      for (const unit of units) {
        const unitId = unit.dataset.id.toLowerCase(); // Get the unit ID and convert to lowercase
        if (unitId.startsWith(prefix.toLowerCase())) {
          unit.style.display = 'block'; // Show the unit if its ID starts with the prefix
        } else {
          unit.style.display = 'none'; // Hide other units
        }
      }
    }
  
    const searchInput = document.getElementById('unit-search'); // Get the search input element
  
    // Add event listener for input changes to perform filtering
    searchInput.addEventListener('input', function () {
      const prefix = searchInput.value.trim(); // Get the input value and trim whitespace
      filterUnitsByPrefix(prefix); // Filter units based on the prefix
    });
  });
  