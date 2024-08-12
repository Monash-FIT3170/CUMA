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
    
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const email = params.get('email');

    Backend.Auth.validateResetPasswordLink(token, email).then( response => {
        if (response.status === 200) {
            document.getElementById('new-pw-form').style.display = 'block';
            document.getElementById('new-pw-error-form').style.display = 'none';
        } else {
            document.getElementById('new-pw-form').style.display = 'none';
            document.getElementById('new-pw-error-form').style.display = 'block';
            document.getElementById('new-pw-error-message').textContent = response.error;

        }
    }).catch(error => {
        console.error("An error occurred:", error);
        alert("An error occurred: " + error.message);
    });

    const resetPWAgain = document.getElementById('reset-pw-again');
    if (resetPWAgain) {
        resetPWAgain.addEventListener('click', () => {
            window.location.href = '/login/request-password-reset';
        });
    }

    const submitNewPassword = document.getElementById('new-pw-submit-btn');
    if (submitNewPassword) {
        submitNewPassword.addEventListener('click', () => {
            const newPassword = document.getElementById('reset-password').value;
            Backend.Auth.updateNewPassword(token, email, newPassword).then(response => {
                if(response.status === 200) {
                    window.location.href = '/reset-password-success';
                } else {
                    alert("Error " + response.status + ": " + response.error)
                }
            }).catch(error => {
                console.error("An error occurred:", error);
                alert("An error occurred: " + error.message);
            });
        });
    }
});
