document.addEventListener('DOMContentLoaded', () => {
    const enableMFA = document.getElementById('signup-mfa-enable');
    if (enableMFA) {
        enableMFA.addEventListener('click', () => {
            window.location.href = '/signup/mfa-setup-qr';
        });
    }

    const skipMFA = document.getElementById('signup-mfa-skip');
    if (skipMFA) {
        skipMFA.addEventListener('click', () => {
            window.location.href = '/login';
        });
    }
});
