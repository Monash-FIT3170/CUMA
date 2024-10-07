function userLogout() {
    Backend.Auth.logout().then(() => {
            console.log("Logout successful");
        }).catch(error => {
            console.error("An error occurred during logout:", error);
            alert("An error occurred during logout. Please try again.");
    });
}