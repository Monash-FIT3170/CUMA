// Send connections with optional input of connections to send
async function userSendConnections(connections) {
    // TODO: Perhaps change email to be dynamic, or to admin CUMA email
    const email = "change@me.com";
    emailBody = "Hi! \n\nHere are the connection(s) I am seeking approval for: \n";

    if (connections == null) {
        await Backend.UnitConnection.getAllUserConnections().then(req => {
            if (!req.connections || req.connections.length === 0 || req.error) {
                alert("Ensure you are logged in and have added connections to send.");
                return;
            }
            connections = req.connections;
        });
    }

    connections.map(connection => {
        const { universityNameA, unitCodeA, universityNameB, unitCodeB } = connection;
        if (universityNameA && unitCodeA && universityNameB && unitCodeB) {
            emailBody += "\n" + universityNameA + " - " + unitCodeA + " to " + universityNameB + " - " + unitCodeB;
        }
    });
    window.location.href = "mailto:" + email + "?body=" + encodeURIComponent(emailBody);
}

function userLogout() {
    Backend.Auth.logout().then(() => {
            console.log("Logout successful");
        }).catch(error => {
            console.error("An error occurred during logout:", error);
            alert("An error occurred during logout. Please try again.");
    });
}