async function addUnitConnection(unitConnectionInfo){
    /**
        unitConnectionInfo structure: {
            universityFrom: str;
            unitcodeFrom: str;
            universityTo: str;
            unitcodeTo: str;
        }

        E.g. req.body =
        {
            "universityFrom": "testUniversity",
            "unitcodeFrom": "TEST1830",
            "universityTo": "Monash",
            "unitcodeTo": "MAT1830"
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

