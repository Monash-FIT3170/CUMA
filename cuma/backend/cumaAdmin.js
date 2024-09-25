const authBackendPath = "/api/cuma-admin/"

Backend.Admin.getAllUsers = async function () {
    try {
        const url = new URL(serverPath + authBackendPath + "users");

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

Backend.Admin.getUser = async function (userId) {
    try {
        const url = new URL(serverPath + authBackendPath + "users/" + userId);

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

}

Backend.Admin.verifyUserRole = async function (userId, role) {
    try {
        const url = new URL(serverPath + authBackendPath + "verify-user/" + userId);

        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ role: role }),
        });
        const result = await response.json();
        console.log({ result: result, status: response.status });
        return { result: result, status: response.status };
    } catch (error) {
        console.log("Error:", error);
    }
}