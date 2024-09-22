const authBackendPath = "/api/transferPlan";

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

// Get all the existing planners from the database
Backend.TransferPlanner.getAll = async function () {
  try {
    const url = new URL(serverPath + authBackendPath + "/all");

    const response = await fetch(url, {
      method: "GET",
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
    const url = new URL(serverPath + authBackendPath + `/plan/${plannerName}`);

    const response = await fetch(url, {
      method: "GET",
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

// Update an existing transfer plan using form data
Backend.TransferPlanner.update = async function (planName, updatePlannerForm) {
  try {
    const url = new URL(serverPath + authBackendPath + `/plan/${planName}`);

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ updatePlannerForm }),
    });

    const result = await response.json();

    console.log({ result: result, status: response.status });

    return { result: result, status: response.status };

  } catch (error) {
    console.log("Error:", error);
  }
};

// Delete a transfer plan
Backend.TransferPlanner.delete = async function (planName) {
  try {
    const url = new URL(serverPath + authBackendPath + `/plan/${planName}`);

    const response = await fetch(url, {
      method: "DELETE",
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
