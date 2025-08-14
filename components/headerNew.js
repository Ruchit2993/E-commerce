document.addEventListener('DOMContentLoaded', function () {
    //profile event
    const profileLink = document.getElementById('profile-link');
    if (profileLink) {
        profileLink.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.href = '../components/account.html';
        });
    }

    //log out event
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', function (e) {
            e.preventDefault();
            localStorage.removeItem('loginResponse');
            localStorage.removeItem('cartTotal');
            localStorage.removeItem('cart');
            localStorage.removeItem('cartItems');
            window.location.href = '/E-commerce/index.html';
        });
    }
});