document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('login-verify-totp').addEventListener('click', async () => {
        
        // Get the input token value
        const token = document.getElementById('login-totp-code').value;
        
        // Request MFA Enable
        Backend.Auth.verifyMFA(token).then(response => {
            if (response.status === 201) { // Assuming backend uses 200 for success
                alert("Success: " + response.message);
                window.location.href = "/index";
            } else {
                alert("Error " + response.status + ": " + response.error);
            }
        }).catch(error => {
            console.error("An error occurred:", error);
            alert("An error occurred: " + error.message);
        });
    });
});
