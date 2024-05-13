// Fetch dummy data from JSON file
const jsonUrl = 'https://raw.githubusercontent.com/Monash-FIT3170/CUMA/feature/auto-complete-with-main/cuma/dummyunits.json';
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
            const autocompleteResults = document.getElementById('unit-list');
            autocompleteResults.innerHTML = '';

            if (prefix.length > 0) {
                const filteredUnits = autocomplete(prefix);
                filteredUnits.forEach(unit => {
                    const unitDiv = document.createElement('div');
                    unitDiv.textContent = `
                                        <h4>${unit.code} - ${unit.name}</h4>
                                        <p>Type: ${unit.type}, Credits: ${unit.credit}, Level: ${unit.level}</p>
                                        `;
                    autocompleteResults.appendChild(unitDiv);
                });
            }
        });
    })
    .catch(error => console.error('Error fetching data:', error));
