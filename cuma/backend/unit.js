// pathname for consistency
const pathname = "/api/unit"
console.log(Backend.Unit)

// define namespace
Backend.Unit.getAllUnitsFromUniversity = async function (universityName) {
    /**
     * @param {string} universityName
     * 
     * @return {json} API response.
     */

    const unitInfo = {}
    const params = {"universityName": universityName}
    
    try {
        const url = new URL("http://3.25.70.20" + pathname + "/getAllFromUni");
        url.search = new URLSearchParams(params).toString();

        const response = await fetch(url)

        console.log({"universityName": universityName, unitInfo})
    
        const result = await response.json()
        return result
    } 
    catch (error) {
        console.error("Error:", error);
    }
}


Backend.Unit.getAllUnitsNotInUniversity = async function (universityName) {
    /**
     * @param {string} universityName
     * 
     * @return {json} API response.
     */

    const unitInfo = {}
    const params = { "universityName": universityName }

    try {
        const url = new URL("http://3.25.70.20" + pathname + "/getAllNotInUni");
        url.search = new URLSearchParams(params).toString();

        const response = await fetch(url)

        console.log({ "universityName": universityName, unitInfo })

        const result = await response.json();
        return result;
    }
    catch (error) {
        console.error("Error:", error);
    }
}


Backend.Unit.retrieveUnit = async function (universityName, unitCode) {
    /*
        universityName: str
        unitCode: str
    */

    const params = { universityName, unitCode };

    try {
        const url = new URL("http://3.25.70.20" + pathname + "/retrieveUnit");
        url.search = new URLSearchParams(params).toString();

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const unit = await response.json();
        console.log("Retrived Unit:", unit);
        return unit;
    }
    catch (error) {
        console.error("Error:", error);
    }

}


Backend.Unit.add = async function (universityName, unitInfo) {
    /**
     * @param {string} universityName
       @param {json} unitInfo = {
            name: str;
            desc: 
            type: int;
            creditPt: int;
            level: int;
            overview: str;
            link: str

        }

        @return {json} API reponse
     *  */

    // var name=  unitInfo.name;
    // var desc=  unitInfo.desc;
    // var type=  unitInfo.type;
    // var creditPt= unitInfo.creditPt;
    // var level= unitInfo.level;
    // var overview= unitInfo.overview;
    // var link= unitInfo.link;

    fieldMissing = []

    try {
        const response = await fetch("http://3.25.70.20" + pathname, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ "universityName": universityName, unitInfo }),
        });

        // Extract the response code
        const statusCode = response.status;

        const result = await response.json();
        console.log({ result: result, status: statusCode });
        return { result: result, status: statusCode };
    } catch (error) {
        console.log("Error:", error);
    }
}


Backend.Unit.modify = async function (universityName, unitCode, newUnitInfo) {
    /**
     * @param {string} universityName 
       @param {json} unitInfoChange  - the modification
       {
            name: str;
            desc: 
            type: int;
            creditPt: int;
            level: int;
            overview: str;
            link: str

        }
        
        @param {string} unitCode : The code of the unit to update

        @return {json} API reponse
     *  */

    try {
        const url = new URL("http://3.25.70.20" + pathname + "/" + encodeURIComponent(unitCode));

        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "universityName": universityName, newUnitInfo
            }),
        });

        // Extract the response code
        const statusCode = response.status;

        const result = await response.json();
        return { result: result, status: statusCode };
    } catch (error) {
        console.log("Error:", error);
    }
}

Backend.Unit.delete = async function (universityName, unitCode) {
    /** 
     * @param {string} universityName
     * @param {int} unitCode
    */

    try {
        const url = new URL("http://3.25.70.20" + pathname + "/" + encodeURIComponent(unitCode));

        const response = await fetch(url, {
            method: "Delete",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "universityName": universityName
            }),
        });

        // Extract the response code
        const statusCode = response.status;

        const result = await response.json();
        return { result: result, status: statusCode };
    } catch (error) {
        console.log("Error:", error);
    }
}
