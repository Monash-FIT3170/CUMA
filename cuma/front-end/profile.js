function editProfile() {
    // Hide text
    document.getElementById("profile-name-text").style.display = "none";
    document.getElementById("profile-email-text").style.display = "none";
    document.getElementById("profile-role-text").style.display = "none";
    
    document.getElementById("profile-name-input").style.display = "inline-block";
    document.getElementById("profile-email-input").style.display = "inline-block";
    document.getElementById("profile-role-input").style.display = "inline-block";

    // Show Save button
    document.getElementById("edit-button").style.display = "none";
    document.getElementById("save-button").style.display = "inline-block";
}

function saveProfile() {
    // Get input values
    const name = document.getElementById("profile-name-input").value;
    const email = document.getElementById("profile-email-input").value;
    const role = document.getElementById("profile-role-input").value;

    // Update text content
    document.getElementById("profile-name-text").textContent = name;
    document.getElementById("profile-email-text").textContent = email;
    document.getElementById("profile-role-text").textContent = role;

    // Hide input fields
    document.getElementById("profile-name-text").style.display = "inline-block";
    document.getElementById("profile-email-text").style.display = "inline-block";
    document.getElementById("profile-role-text").style.display = "inline-block";
    
    document.getElementById("profile-name-input").style.display = "none";
    document.getElementById("profile-email-input").style.display = "none";
    document.getElementById("profile-role-input").style.display = "none";

    // Show Edit button
    document.getElementById("edit-button").style.display = "inline-block";
    document.getElementById("save-button").style.display = "none";
}
