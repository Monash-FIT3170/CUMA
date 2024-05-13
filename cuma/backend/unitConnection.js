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
