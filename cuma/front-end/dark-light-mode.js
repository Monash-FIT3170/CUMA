function toggleDarkMode() {
    const body = document.body;
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    // Toggle the dark mode class on the body
    body.classList.toggle('dark-mode');

    // Save the current mode in localStorage
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        if (darkModeToggle) darkModeToggle.checked = true; // If in settings, ensure the checkbox is checked
    } else {
        localStorage.setItem('theme', 'light');
        if (darkModeToggle) darkModeToggle.checked = false; // Uncheck the checkbox in settings
    }
}

// On page load, check localStorage for the theme and apply it
window.onload = function() {
    const savedTheme = localStorage.getItem('theme');
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (darkModeToggle) darkModeToggle.checked = true; // Check the checkbox if it's dark mode
    } else {
        document.body.classList.remove('dark-mode');
        if (darkModeToggle) darkModeToggle.checked = false; // Uncheck the checkbox if it's not dark mode
    }
};
