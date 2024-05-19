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

    if (!emailPattern.test(email)) {
        alert('Invalid email format');
        return false;
    }

    if (!passwordPattern.test(password)) {
        alert('Password must be at least 8 characters long, contain at least one letter, one number, and one special character');
        return false;
    }

    if (email.length === 0) {
        alert('Email cannot be empty.');
        return false;
    }

    if (password.length === 0) {
        alert('Password cannot be empty.');
        return false;
    }

    return true;
}

// Function to handle login form submission
function handleLoginFormSubmission(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (validateCredentials(email, password)) {
        alert('Login successful!');
        window.location.href = 'index.html'; 
    } else {
        alert('Invalid email or password.');
    }
}

// Function to handle signup form submission
function handleSignupFormSubmission(event) {
    event.preventDefault();

    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (validateEmailAndPassword(email, password)) {
        if (confirmPassword.length === 0) {
            alert('Confirm password cannot be empty.');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        } 

        storeCredentials(email, password);
        alert('Signup successful!');
        window.location.href = 'login.html'; 
    }
}

// Event listeners for form submissions
document.getElementById('login-form').addEventListener('submit', handleLoginFormSubmission);
document.getElementById('signup-form').addEventListener('submit', handleSignupFormSubmission);
