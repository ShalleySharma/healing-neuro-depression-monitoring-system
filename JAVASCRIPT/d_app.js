import {showNotification} from './notification.js';

document.getElementById('sign-in-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    console.log("Login button clicked!"); 

    const login_username = document.getElementById('login_username').value;
    const login_password = document.getElementById('login_password').value;

    console.log("Doctor_Username:", login_username);  
    console.log("Password:", login_password);
 
    try {
        const response = await fetch('http://localhost:5501/doctor_login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: login_username, password: login_password })
        });

        console.log("Response received:", response); 

        const result = await response.json();
        console.log("Parsed JSON:", result);

        if (!response.ok) {
            throw new Error(result.message || "Login failed!");
        }

        localStorage.setItem("skip-restore", "true");
        localStorage.setItem("Doctor_isLoggedIn", "true");
        localStorage.setItem("token", result.token); 
        localStorage.setItem("Doctor_Username", login_username);

        showNotification("Login successful !", "success")

        console.log("Username from localStorage:", localStorage.getItem("Doctor_Username"));
        console.log("isLoggedIn from localStorage:", localStorage.getItem("Doctor_isLoggedIn"));
        
        window.location.href = '../HTML/d_index.html';

    } catch (error) {
        console.error(error);
        showNotification("An error occurred! Please try again", 'error');
    }
});
