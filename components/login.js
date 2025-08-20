//Write Ajax to fetch the dummy.json to validate the login in the file index.html
fetch('https://dummyjson.com/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({

        username: 'emilys',
        password: 'emilyspass',
        expiresInMins: 30, // optional, defaults to 60
    }),
    credentials: 'include' // Include cookies (e.g., accessToken) in the request
})
    .then(res => res.json())
    .then(console.log);

//header header
document.addEventListener("DOMContentLoaded", function () {
    fetch('header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;
        })
        .catch(error => console.error('Error fetching header:', error));
});
//login fetch
document.addEventListener("DOMContentLoaded", function () {
    fetch('login.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('login-placeholder').innerHTML = data;
        })
        .catch(error => console.error('Error fetching login:', error));
});
//footer fetch
document.addEventListener("DOMContentLoaded", function () {
    fetch('footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-placeholder').innerHTML = data;
        })
        .catch(error => console.error('Error fetching footer:', error));
});