document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('verify-totp').addEventListener('click', async () => {
        
        // Get the input token value
        const token = document.getElementById('totp-code').value;
        
        // Request MFA Enable
        Backend.Auth.enableMFA(token).then(response => {
            if (response.status === 200) { // Assuming backend uses 200 for success
                alert("Success: " + response.message);
                window.location.href = "/login";
            } else {
                alert("Error " + response.status + ": " + response.error);
            }
        }).catch(error => {
            console.error("An error occurred:", error);
            alert("An error occurred: " + error.message);
        });
    });
});
