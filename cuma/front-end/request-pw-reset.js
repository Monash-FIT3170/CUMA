// Function to validate email
function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
        alert('Email cannot be empty.');
        return false;
    }

    if (!emailPattern.test(email)) {
        alert('Invalid email format');
        return false;
    }

    return true;
}

document.addEventListener('DOMContentLoaded', async () => {
    
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            // Get the input token value
            const email = document.getElementById('email-input').value;
            if (validateEmail(email)) {
                // Request MFA Enables
                Backend.Auth.requestPasswordReset(email).then(response => {
                    if (response.status === 404) {
                        alert("Error " + response.status + ": " + response.error)
                    } else if (response.status === 200) {
                        // redirect to request password success page
                        //window.location.href = "/login/request-password-reset-success";
                    } else {
                        alert("Error : " + response.error)
                    }
                }).catch(error => {
                    console.error("An error occurred:", error);
                    alert("An error occurred: " + error.message);
                });
            } 
        });
    }

    const returnLogin = document.getElementById('req-pw-return-to-login');
    if (returnLogin) {
        returnLogin.addEventListener('click', () => {
            window.location.href = '/login';
        });
    }
});
