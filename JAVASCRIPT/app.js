import {showNotification} from './notification.js';

// For Scrolling
const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");

// Check the saved state in localStorage
document.addEventListener("DOMContentLoaded", () => {
    
    if (localStorage.getItem("skip-restore")) {
        localStorage.removeItem("skip-restore");
        return;
    }

    const mode = localStorage.getItem("auth-mode"); 

    if (mode === "sign-up-mode") {
        container.classList.add("sign-up-mode");
    } else {
        container.classList.remove("sign-up-mode");
    }
}); 

// Add event listeners to update the state in localStorage
sign_up_btn.addEventListener("click", () => {
    container.classList.add("sign-up-mode");
    localStorage.setItem("auth-mode", "sign-up-mode");
    document.title = "SignUp - HealingNeuro";
});

sign_in_btn.addEventListener("click", () => {
    container.classList.remove("sign-up-mode");
    localStorage.setItem("auth-mode", "sign-in-mode");
    document.title = "Login - HealingNeuro";
});

// Function for Signup
document.getElementById('sign-up-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    console.log("Attempting Signup...");

    try {
        const response = await fetch('http://localhost:5501/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, name, email, password })
        });

        const responseText = await response.text();
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            throw new Error('Received non-JSON response');
        }

        if (!response.ok) {
            throw new Error(result.error || 'Signup failed!');
        }

        showNotification(result.message, 'success');

        if (result.token) {
            localStorage.setItem('token', result.token);
        }

        localStorage.setItem('Username', username);
        localStorage.setItem('isLoggedIn', 'true');

        // localStorage.clear();
        window.location.href = '../HTML/index.html';
        showNotification('Redirecting to the Home page.......', 'info');
    } catch (error) {
        console.error(error);
        showNotification('An error occurred! Please try again', 'error');
    }
});

document.getElementById('sign-in-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    console.log("Login button clicked!"); 

    const login_username = document.getElementById('login_username').value;
    const login_password = document.getElementById('login_password').value;

    console.log("Username:", login_username);  
    console.log("Password:", login_password);

    try {
        const response = await fetch('http://localhost:5501/login', {
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
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("token", result.token); 
        localStorage.setItem("Username", login_username);

        showNotification("Login successful !", "success")

        console.log("Username from localStorage:", localStorage.getItem("Username"));
        console.log("isLoggedIn from localStorage:", localStorage.getItem("isLoggedIn"));
        
        window.location.href = '../HTML/index.html';

    } catch (error) {
        console.error(error);
        showNotification("An error occurred! Please try again", 'error');
    }
});
