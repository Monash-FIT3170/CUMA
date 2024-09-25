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