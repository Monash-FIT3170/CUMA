function validateEmailAndPassword(email, password) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!email || !password) {
        alert('Email and password cannot be empty.');
        return false;
    }

    if (!emailPattern.test(email)) {
        alert('Invalid email format');
        return false;
    }

    if (!passwordPattern.test(password)) {
        alert('Password must be at least 8 characters long, contain at least one letter, one number, and one special character');
        return false;
    }

    return true;
}

function handleLoginFormSubmission(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    if (validateEmailAndPassword(email, password)) {

        // request api to authenticate and login
        Backend.Auth.login(email, password).then(response => {
            // Check if the login was successful
            if (response.status === 201) {
                // Redirect to the homepage
                alert("Success: " + response.result.message)
                window.location.href = '/index';
            // Login require MFA
            } else if (response.status === 206) {
                // Redirect to the homepage
                alert("Success: " + response.result.message)
                window.location.href = '/login/verify-totp'; 
            } else {
                alert("Error " + response.status + ": " + response.result.error)
            }
        })
        .catch(error => {
            console.error("An error occurred:", error);
            // Handle the error, e.g., show an error message to the user
        });
    }
    console.log("Login Successful")
}

function handleSignupFormSubmission(e) {
    e.preventDefault();
    const firstName = document.getElementById('signup-firstname').value.trim();
    const lastName = document.getElementById('signup-lastname').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Validate the email and password pattern
    if (validateEmailAndPassword(email, password)) {

        // Validate both password entry is the same
        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        // request api to authenticate and signup
        Backend.Auth.signup(firstName, lastName, email, password).then(response => {
            // Check if the login was successful
            if (response.status === 201) {
                // Redirect to the homepage
                alert("Success: " + response.result.message)
                window.location.href = '/signup/mfa-init';
            } else {
                alert("Error " + response.status + ": " + response.result.error)
            }
        })
        .catch(error => {
            console.error("An error occurred:", error);
            // Handle the error, e.g., show an error message to the user
        });
        console.log("Signup Successful")
    }
}

function verifyLoginTOTPToken() {
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
}

document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-btn');
    if (loginButton) {
        loginButton.addEventListener('click', handleLoginFormSubmission);
    }

    const signupForm = document.getElementById('signup-btn');
    if (signupForm) {
        signupForm.addEventListener('click', handleSignupFormSubmission);
    }

    const verifyLoginTOTP = document.getElementById('login-verify-totp');
    if (verifyLoginTOTP) {
        verifyLoginTOTP.addEventListener('click', verifyLoginTOTPToken)
    }
});