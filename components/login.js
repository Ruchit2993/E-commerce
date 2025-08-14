//Header fetch
document.addEventListener("DOMContentLoaded", function () {
    fetch('../E-commerce/components/header.html')
        .then(response => {
            if (!response.ok) throw new Error(`Failed to fetch header.html: ${response.statusText}`);
            return response.text();
        })
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;
        })
        .catch(error => console.error('Error fetching header:', error.message));
});

//Login fetch abd saving login details in localStorage
document.addEventListener("DOMContentLoaded", function () {
    fetch('../E-commerce/components/login.html')
        .then(response => {
            if (!response.ok) throw new Error(`Failed to fetch login.html: ${response.statusText}`);
            return response.text();
        })
        .then(data => {
            document.getElementById('login-placeholder').innerHTML = data;
            const myForm = document.querySelector('#login-placeholder form');
            if (myForm) {
                myForm.addEventListener('submit', function (e) {
                    e.preventDefault();

                    const username = document.getElementById('username').value.trim();
                    const password = document.getElementById('password').value.trim();

                    if (!username || !password) {
                        alert('Please enter both username and password.');
                        return;
                    }

                    console.log('Sending login request with:', { username, password });

                    const loginXhr = new XMLHttpRequest();
                    loginXhr.open('POST', 'https://dummyjson.com/auth/login', true);
                    loginXhr.setRequestHeader('Content-Type', 'application/json');

                    loginXhr.onreadystatechange = function () {
                        if (loginXhr.readyState === XMLHttpRequest.DONE) {
                            console.log('Login response status:', loginXhr.status);
                            console.log('Login response text:', loginXhr.responseText);
                            try {
                                const data = JSON.parse(loginXhr.responseText);
                                if (loginXhr.status === 200 && data.accessToken) {
                                    // Step 2: Fetch user profile using XMLHttpRequest
                                    const profileXhr = new XMLHttpRequest();
                                    profileXhr.open('GET', 'https://dummyjson.com/auth/me', true);
                                    profileXhr.setRequestHeader('Authorization', `Bearer ${data.accessToken}`);

                                    profileXhr.onreadystatechange = function () {
                                        if (profileXhr.readyState === XMLHttpRequest.DONE) {
                                            console.log('Profile response status:', profileXhr.status);
                                            console.log('Profile response text:', profileXhr.responseText);
                                            try {
                                                const profileData = JSON.parse(profileXhr.responseText);
                                                if (profileXhr.status === 200) {
                                                    console.log('User Profile:', profileData);
                                                    // Combine login and profile data
                                                    const fullResponse = {
                                                        login: data,
                                                        profile: profileData,
                                                        timestamp: new Date().getTime() // Store timestamp for 24-hour expiration
                                                    };

                                                    // Save full response to localStorage
                                                    localStorage.setItem('loginResponse', JSON.stringify(fullResponse));

                                                    // Alert and redirect after data is saved
                                                    alert('Login successful! Redirecting...');
                                                    window.location.href = '../E-commerce/components/dashboard.html';
                                                } else {
                                                    throw new Error(profileData.message || 'Failed to fetch profile');
                                                }
                                            } catch (error) {
                                                console.error('Profile fetch error:', error.message);
                                                alert(`An error occurred: ${error.message}`);
                                                console.log('Try alternative credentials: username: michaelw, password: michaelwpass');
                                            }
                                        }
                                    };

                                    profileXhr.send();
                                } else {
                                    throw new Error(data.message || 'Invalid response from server');
                                }
                            } catch (error) {
                                console.error('Login error:', error.message);
                                alert(`An error occurred: ${error.message}`);
                                console.log('Try alternative credentials: username: michaelw, password: michaelwpass');
                            }
                        }
                    };

                    loginXhr.send(JSON.stringify({
                        username: username,
                        password: password,
                        expiresInMins: 30
                    }));
                });
            } else {
                console.error('Form not found in login.html');
            }
        })
        .catch(error => console.error('Error fetching login:', error.message));
});

//Footer fetch
document.addEventListener("DOMContentLoaded", function () {
    fetch('../E-commerce/components/footer.html')
        .then(response => {
            if (!response.ok) throw new Error(`Failed to fetch footer.html: ${response.statusText}`);
            return response.text();
        })
        .then(data => {
            document.getElementById('footer-placeholder').innerHTML = data;
        })
        .catch(error => console.error('Error fetching footer:', error.message));
});