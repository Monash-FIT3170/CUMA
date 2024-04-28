// Fetch dummy data from JSON file
const jsonUrl = 'https://raw.githubusercontent.com/Monash-FIT3170/CUMA/feature/autocomplete/dummyunits.json';
fetch(jsonUrl)
    .then(response => response.json())
    .then(data => {
        const units = data;

        // Autocomplete function
        function autocomplete(prefix) {
            return units.filter(unit =>
                unit.name.toLowerCase().startsWith(prefix.toLowerCase())
            );
        }

        document.getElementById('search-unit').addEventListener('input', (event) => {
            const prefix = event.target.value;
            const autocompleteResults = document.getElementById('autocomplete-results');
            autocompleteResults.innerHTML = '';

            if (prefix.length > 0) {
                const filteredUnits = autocomplete(prefix);
                filteredUnits.forEach(unit => {
                    const unitDiv = document.createElement('div');
                    unitDiv.textContent = `${unit.name} - ${unit.description}`;
                    autocompleteResults.appendChild(unitDiv);
                });
            }
        });
    })
    .catch(error => console.error('Error fetching data:', error));
