const authBackendPath = "/api/transferPlanner"

// Create new planner using the form data
Backend.TransferPlanner.create = async function (createPlannerForm) {
    try {
      const url = new URL(serverPath + authBackendPath + "/create");

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ createPlannerForm }),
      });
  
      const result = await response.json();

      console.log({ result: result, status: response.status });

      return { result: result, status: response.status };

    } catch (error) {

      console.log("Error:", error);

    }
};

// Get all the existing planner from the database
Backend.TransferPlanner.getAll = async function () {
    try {
      const url = new URL(serverPath + authBackendPath + "/getAll");

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      const result = await response.json();

      console.log({ result: result, status: response.status });

      return { result: result, status: response.status };

    } catch (error) {

      console.log("Error:", error);

    }
};

// Get one specific planner
Backend.TransferPlanner.getSpecific = async function (plannerName) {
    try {
      const url = new URL(serverPath + authBackendPath + "/getOnePlanner");

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plannerName }),
      });
  
      const result = await response.json();

      console.log({ result: result, status: response.status });

      return { result: result, status: response.status };

    } catch (error) {

      console.log("Error:", error);

    }
};

// Update the specific planner
Backend.TransferPlanner.update = async function (plannerName, updatedPlanner) {
    try {
      const url = new URL(serverPath + authBackendPath + "/updatePlanner");

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plannerName, updatedPlanner }),
      });
  
      const result = await response.json();

      console.log({ result: result, status: response.status });

      return { result: result, status: response.status };

    } catch (error) {

      console.log("Error:", error);

    }
};

// Deleting one specific planner
Backend.TransferPlanner.delete = async function (plannerName) {
    try {
      const url = new URL(serverPath + authBackendPath + "/deleteOnePlanner");

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plannerName }),
      });
  
      const result = await response.json();

      console.log({ result: result, status: response.status });

      return { result: result, status: response.status };

    } catch (error) {

      console.log("Error:", error);

    }
};