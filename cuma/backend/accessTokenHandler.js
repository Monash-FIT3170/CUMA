import jwt_decode from 'jwt-decode';

document.addEventListener('DOMContentLoaded', () => {
    // schedule refresh token if access token exist
    const accessToken = getCookie('accessToken');
    if (accessToken) {
        scheduleTokenRefresh(accessToken);
    }
});

// Set the schedule for refreshing the access token
function scheduleTokenRefresh(token) {
    const decodedToken = jwt_decode(token);
    const expirationTime = decodedToken.exp; // Convert to milliseconds
    const currentTime = Date.now();
    const timeUntilRefresh = expirationTime - currentTime - (3 * 60 * 1000); // Refresh 3 minutes before expiration

    setTimeout(() => {
        refreshToken(); // Function to call the server and refresh the token
    }, timeUntilRefresh);
}

// Calls the Api to refresh the access token using the refreshToken in the cookies
function refreshToken() {
    fetch('/refresh-token', {
        method: 'POST',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.accessToken) {
            
            // Update the stored access token
            document.cookie = `accessToken=${data.accessToken}; Secure; HttpOnly; SameSite=Strict`;
            
            // Schedule the next refresh
            scheduleTokenRefresh(data.accessToken);

        } else {
            // Handle cases where the refresh token is invalid or expired
            console.log('Refresh token expired. Redirecting to login.');
            alert('Refresh token expired. Redirecting to login');
            
            // redirect to login page
            window.location.href = '/login';
        }
    })
    .catch(error => console.error('Error refreshing token:', error));
}

// Retrive a selected cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}
