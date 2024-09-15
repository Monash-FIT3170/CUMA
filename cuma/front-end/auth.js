// Utility functions for form data persistence
function saveSignupData() {
    localStorage.setItem('firstName', document.getElementById('signup-firstname').value);
    localStorage.setItem('lastName', document.getElementById('signup-lastname').value);
    localStorage.setItem('email', document.getElementById('signup-email').value);
}

function loadSignupData() {
    document.getElementById('signup-firstname').value = localStorage.getItem('firstName') || '';
    document.getElementById('signup-lastname').value = localStorage.getItem('lastName') || '';
    document.getElementById('signup-email').value = localStorage.getItem('email') || '';
}

function clearSignupData() {
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    localStorage.removeItem('email');
}

function returnToLogin() {
    clearSignupData();
    window.location.href = '/login';
}

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

                // Check for next step in the signup process
                if (response.result.nextStep){
                    window.location.href = response.result.nextStep;
                }
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


// function form to show the role selection
function showForm(userType) {
    document.getElementById('user-type-selection').style.display = 'none';
    if (userType === 'student') {
        document.getElementById('student-form').style.display = 'block';
        document.getElementById('course-director-form').style.display = 'none';
    } else {
        document.getElementById('student-form').style.display = 'none';
        document.getElementById('course-director-form').style.display = 'block';
    }
}

// function to handle the student additional info form submission
function handleStudentFormSubmission(e) {
    e.preventDefault();
    const dateOfBirth = document.getElementById('student-dob').value;
    const university = document.getElementById('student-university').value.trim();
    const major = document.getElementById('student-major').value.trim();
    const studentId = document.getElementById('student-id').value.trim();

    // TODO: Add validation for these fields and send to backend
    console.log('Student data:', { dateOfBirth, university, major, studentId });

    const additionalInfo = {
        askingRole: 'student',
        dateOfBirth: dateOfBirth,
        university: university,
        major: major,
        studentId: studentId
    };

    Backend.Auth.roleVerificationInfo(additionalInfo).then(response => {
        if (response.status === 200) {
            alert("Success: " + response.message);
            showSubmissionComplete(response.nextStep,response.userEmail);
        } else {
            alert("Error " + response.status + ": " + response.error);
        }
    });
}

// function to handle the course director additional info form submission
function handleDirectorFormSubmission(e) {
    e.preventDefault();
    const dateOfBirth = document.getElementById('director-dob').value;
    const university = document.getElementById('director-university').value.trim();
    const professionalTitle = document.getElementById('director-title').value.trim();
    const department = document.getElementById('director-department').value.trim();
    const faculty = document.getElementById('director-faculty').value.trim();
    const staffId = document.getElementById('director-staff-id').value.trim();

    // TODO: Add validation for these fields and send to backend
    const additionalInfo = {
        askingRole: 'course_director',
        dateOfBirth: dateOfBirth,
        university: university,
        professionalTitle: professionalTitle,
        faculty: faculty,
        department: department,
        staffId: staffId
    };

    Backend.Auth.roleVerificationInfo(additionalInfo).then(response => {
        if (response.status === 200) {
            alert("Success: " + response.message);
            showSubmissionComplete(response.nextStep,response.userEmail);
        } else {
            alert("Error " + response.status + ": " + response.error);
        }
    });
}
function goBack() {
    window.location.href = '/signup';
}

// Function to show the submission complete section
function showSubmissionComplete(nextStep, userEmail) {
    document.getElementById('user-type-selection').style.display = 'none';
    document.getElementById('student-form').style.display = 'none';
    document.getElementById('course-director-form').style.display = 'none';
    document.getElementById('submission-complete').style.display = 'block';
    document.getElementById('submission-complete').dataset.nextStep = nextStep;
    document.getElementById('user-email').textContent = userEmail;


    clearSignupData();
}

// Function to continue to the next step (MFA or otherwise)
function continueMFA() {
    const nextStep = document.getElementById('submission-complete').dataset.nextStep;
    if (nextStep) {
        window.location.href = nextStep;
    } else {
        console.error('Next step URL not found');
    }
}

// function to show the role selection and hide the forms
function showRoleSelection() {
    document.getElementById('user-type-selection').style.display = 'block';
    document.getElementById('student-form').style.display = 'none';
    document.getElementById('course-director-form').style.display = 'none';
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
    const studentForm = document.getElementById('student-form');
    if (studentForm) {
        studentForm.addEventListener('submit', handleStudentFormSubmission);
    }
    const directorForm = document.getElementById('course-director-form');
    if (directorForm) {
        directorForm.addEventListener('submit', handleDirectorFormSubmission);
    }
    const returnToLoginButton = document.getElementById('return-login-btn');
    if (returnToLoginButton) {
        returnToLoginButton.addEventListener('click', returnToLogin);
    }


    // Load saved signup data when the signup page loads
    if (window.location.pathname === '/signup') {
        loadSignupData();
    }

    // Add event listeners to save data when input fields change
    const signupInputs = document.querySelectorAll('#signup-firstname, #signup-lastname, #signup-email');
    signupInputs.forEach(input => {
        input.addEventListener('input', saveSignupData);
    });
});