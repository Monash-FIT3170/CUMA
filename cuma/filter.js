document.addEventListener('DOMContentLoaded', function () {
  // Function to filter units by regex match on all terms
  function filterUnitsByRegex(regex) {
      const units = document.getElementsByClassName('unit'); // Get all units in the unit list

      for (const unit of units) {
          const unitInfo = `${unit.dataset.id} ${unit.dataset.name} ${unit.dataset.type} ${unit.dataset.credit} ${unit.dataset.level} ${unit.dataset.overview}`.toLowerCase(); // Get unit information and convert to lowercase
          if (regex.test(unitInfo)) {
              unit.style.display = 'block'; // Show the unit if it matches the regex
          } else {
              unit.style.display = 'none'; // Hide the unit if it doesn't match
          }
      }
  }

  const searchInput = document.getElementById('unit-search'); // Get the search input element

  // Add event listener for input changes to perform filtering
  searchInput.addEventListener('input', function () {
      const searchValue = searchInput.value.trim(); // Get the input value and trim whitespace
      const regex = new RegExp(searchValue, 'i'); // Create case-insensitive regex pattern
      filterUnitsByRegex(regex); // Filter units based on the regex
  });
});
