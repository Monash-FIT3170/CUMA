document.addEventListener('DOMContentLoaded', async () => {
    const returnLogin = document.getElementById('return-login');
    if (returnLogin) {
        returnLogin.addEventListener('click', () => {
            window.location.href = '/login';
        });
    }
});
