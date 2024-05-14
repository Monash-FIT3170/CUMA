const backendPath = "/api/unitConnection";

/*
    E.g. req.body =
    {
        "universityNameA": "testUniversity",
        "unitCodeA": "TEST1830",
        "universityNameB": "Monash",
        "unitCodeB": "MAT1830"
    } 

    works with post request to http://127.0.0.1:3000/api/unitConnection
*/
async function addUnitConnection(unitConnectionInfo){
    updateUnitConnection(unitConnectionInfo, "add");
}

async function deleteUnitConnection(unitConnectionInfo){
    updateUnitConnection(unitConnectionInfo, "delete");
}

async function updateUnitConnection(unitConnectionInfo, subpath){
    try {
        console.log(unitInfo)
        const response = await fetch("http://127.0.0.1:3000" + "/api/unitConnection/" + subpath, {
            method: "POST", 
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify(unitConnectionInfo),
        });
    
        const result = await response.json();
        console.log("Success:", result);
        } catch (error) {
        console.error("Error:", error);
    }
}

/**
 * Fetches all unit connections from the source university.
 * @param {string} sourceUni - The source university name.
 * @param {string} unitCode - The unit code.
 * @returns {Promise<object>} The unit connection result.
 */
async function getAllUnitConnections(sourceUni, unitCode) {
    return await getUniConnection(sourceUni, unitCode);
}

/**
 * Fetches a specific unit connection between source and target universities.
 * @param {string} sourceUni - The source university name.
 * @param {string} unitCode - The unit code.
 * @param {string} targetUni - The target university name.
 * @returns {Promise<object>} The unit connection result.
 */
async function getSpecificUnitConnection(sourceUni, unitCode, targetUni) {
    return await getUniConnection(sourceUni, unitCode, targetUni);
}

/**
 * Fetches unit connections from the source university. 
 * If target university is specified, fetches the specific connection between source and target universities.
 * @param {string} sourceUni - The source university name.
 * @param {string} unitCode - The unit code.
 * @param {string|null} [targetUni=null] - The target university name (optional).
 * @returns {Promise<object>} The unit connection result.
 */
async function getUniConnection(sourceUni, unitCode, targetUni = null) {
    // Validate parameters
    if (sourceUni == null || unitCode == null) {
        console.error("Error: sourceUni and unitCode cannot be null");
        return;
    }

    // Build parameters object
    const params = { sourceUni, unitCode };
    if (targetUni !== null) {
        params.targetUni = targetUni;
    }

    // Endpoint paths
    const serverPath = "http://127.0.0.1:3000";
    const backendPath = "/api/unitConnection";
    const subpath = targetUni == null ? "/getAll" : "/getSpecific";

    try {
        console.log(params);

        // Construct the URL with query parameters
        const url = new URL(serverPath + backendPath + subpath);
        url.search = new URLSearchParams(params).toString();

        // Fetch the response
        const response = await fetch(url);
        
        // Check for HTTP errors
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse and log the result
        const result = await response.json();
        console.log(
            targetUni == null ? "All Connections:" : "Specific Connection:",
            result
        );
        return result;
    } catch (error) {
        console.error("Error:", error);
    }
}