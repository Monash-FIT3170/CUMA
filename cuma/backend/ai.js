const aiPath = "/api/ai";

Backend.AI.AIMatch = async function (unitSRC, unitsToCompare) {
  /**
   * @param {JSON} unitSRC
   * @param {JSON} unitsToCompare
   *
   * Makes a post request to server side gemini api code
   */

  try {
    const url = new URL(serverPath + aiPath + "/compareUnits");
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
