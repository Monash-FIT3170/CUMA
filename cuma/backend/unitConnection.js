async function addUnitConnection(unitConnectionInfo){
    /**
        E.g. req.body =
        {
            "universityNameA": "testUniversity",
            "unitCodeA": "TEST1830",
            "universityNameB": "Monash",
            "unitCodeB": "MAT1830"
        } 

        works with post request to http://127.0.0.1:3000/api/unitConnection
    */
    
    try {
        console.log(unitInfo)
        const response = await fetch("http://127.0.0.1:3000" + "/api/unitConnection", {
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

