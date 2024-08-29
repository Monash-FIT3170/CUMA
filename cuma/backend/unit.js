const unitBackendPath = "/api/unit";

// define namespace
Backend.Unit.getAllUnitsFromUniversity = async function (universityName) {
  /**
   * @param {string} universityName
   *
   * @return {json} API response.
   */
  const params = { universityName: universityName };

  try {
    const url = new URL(serverPath + unitBackendPath + "/getAllFromUni");
    url.search = new URLSearchParams(params).toString();

    const response = await fetch(url);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error:", error);
  }
};

Backend.Unit.getAllUnitsNotInUniversity = async function (universityName) {
  /**
   * @param {string} universityName
   *
   * @return {json} API response.
   */

  const params = { universityName: universityName };

  try {
    const url = new URL(serverPath + unitBackendPath + "/getAllNotInUni");
    url.search = new URLSearchParams(params).toString();

    const response = await fetch(url);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error:", error);
  }
};

Backend.Unit.retrieveUnit = async function (universityName, unitCode) {
  /*
        universityName: str
        unitCode: str
    */

  const params = { universityName, unitCode };

  try {
    const url = new URL(serverPath + unitBackendPath + "/retrieveUnit");
    url.search = new URLSearchParams(params).toString();

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const unit = await response.json();
    return unit;
  } catch (error) {
    console.error("Error:", error);
  }
};

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

  fieldMissing = [];

  try {
    const response = await fetch(serverPath + unitBackendPath, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ universityName: universityName, unitInfo }),
    });

    // Extract the response code
    const statusCode = response.status;

    const result = await response.json();
    console.log({ result: result, status: statusCode });
    return { result: result, status: statusCode };
  } catch (error) {
    console.log("Error:", error);
  }
};

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
    const url = new URL(
      serverPath + unitBackendPath + "/" + encodeURIComponent(unitCode)
    );

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        universityName: universityName,
        newUnitInfo,
      }),
    });

    // Extract the response code
    const statusCode = response.status;

    const result = await response.json();
    return { result: result, status: statusCode };
  } catch (error) {
    console.log("Error:", error);
  }
};

Backend.Unit.delete = async function (universityName, unitCode) {
  /**
   * @param {string} universityName
   * @param {int} unitCode
   */

  try {
    const url = new URL(
      serverPath + unitBackendPath + "/" + encodeURIComponent(unitCode)
    );

    const response = await fetch(url, {
      method: "Delete",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        universityName: universityName,
      }),
    });

    // Extract the response code
    const statusCode = response.status;

    const result = await response.json();
    return { result: result, status: statusCode };
  } catch (error) {
    console.log("Error:", error);
  }
};

Backend.Unit.AIMatch = async function (unitSRC, unitsToCompare) {
  /**
   * @param {JSON} unitSRC
   * @param {JSON} unitsToCompare
   *
   * Makes a post request to server side gemini api code
   */

  try {
    const url = new URL(serverPath + unitBackendPath + "/geminiMatch");
    console.log(`URL: ${url}`);

    console.log("Getting response...");
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        unitSRC: unitSRC,
        unitsToCompare: unitsToCompare,
      }),
    });

    // Extract the response code
    const statusCode = response.status;
    const result = await response.json();
    return { result: result, status: statusCode };
  } catch (error) {
    console.log("Error:", error);
  }
};
