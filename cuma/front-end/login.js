// Function to store email and password from signup
function storeCredentials(email, password) {
    let credentials = JSON.parse(localStorage.getItem('credentials')) || [];
    credentials.push({ email, password });
    localStorage.setItem('credentials', JSON.stringify(credentials));
}

// Function to validate email and password on login
function validateCredentials(email, password) {
    let credentials = JSON.parse(localStorage.getItem('credentials')) || [];
    return credentials.some(cred => cred.email === email && cred.password === password);
}

// Function to validate email and password format
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

// Function to handle login form submission
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
                window.location.href = '/';
            } else {
                alert("Error ", response.status, ": ", response.result.error)
            }
        })
        .catch(error => {
            console.error("An error occurred:", error);
            // Handle the error, e.g., show an error message to the user
        });
    }
    console.log("Login Successful")
}

// Function to handle signup form submission
function handleSignupFormSubmission(e) {
    e.preventDefault();
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
        Backend.Auth.signup("", "", email, password).then(response => {
            // Check if the login was successful
            if (response.status === 201) {
                // Redirect to the homepage
                window.location.href = '/login';
            } else {
                alert("Error ", response.status, ": ", response.result.error)
            }
        })
        .catch(error => {
            console.error("An error occurred:", error);
            // Handle the error, e.g., show an error message to the user
        });
        console.log("Signup Successful")
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.querySelector('.login-button');
    if (loginButton) {
        loginButton.addEventListener('click', handleLoginFormSubmission);
    }

    const signupForm = document.querySelector('.signup-button');
    if (signupForm) {
        signupForm.addEventListener('click', handleSignupFormSubmission);
    }
});