document.addEventListener('DOMContentLoaded', async () => {
    
    // Request MFA setup
    Backend.Auth.setupMFA().then(response => {
        console.log(response)
        if (response.status === 201) {
            // Extract the imageURL and set the QR Code
            const { imageUrl, secret } = response
            const qrCodeImage = document.getElementById('qrcode');

            if(imageUrl && qrCodeImage) {
                qrCodeImage.src = imageUrl;
            }
        } else {
            alert("Error " + response.status + ": " + response.error)
        }
    }).catch(error => {
        console.error("An error occurred:", error);
        // Handle the error, e.g., show an error message to the user
    });

    const continueMFA = document.getElementById('mfa-setup-continue');
    if (continueMFA) {
        continueMFA.addEventListener('click', () => {
            window.location.href = '/signup/mfa-verify-totp';
        });
    }
});