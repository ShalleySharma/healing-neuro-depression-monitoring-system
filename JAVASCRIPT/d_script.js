import {showNotification} from './notification.js';
 
document.addEventListener("DOMContentLoaded", function() {
    // Fetch Navbar and then add event listeners
    fetch('../HTML/d_navbar.html')
        .then(response => response.text()) 
        .then(data => {
            document.getElementById('d_navbar').innerHTML = data;

            // Now, after the navbar is loaded, we can select elements and add event listeners
            const profileIconContainer = document.getElementById("profileIconContainer");
            const profileIcon = document.querySelector(".btn2");
            const profileDropdown = document.querySelector(".dropdown_menu1");
            const toggleButton = document.querySelector(".toggle_btn");
            const toggleDropdown = document.querySelector(".dropdown_menu");
            const loginLogoutLink = profileDropdown.querySelector('a[href="../HTML/doctor_login.html"]');

            let isLoggedIn = localStorage.getItem("Doctor_isLoggedIn") === "true";
            let username = localStorage.getItem("Doctor_Username");

            // Log elements to confirm they are being found
            console.log("Profile Icon:", profileIcon);
            console.log("Profile Dropdown:", profileDropdown);
            console.log("Toggle Button:", toggleButton);
            console.log("Toggle Dropdown:", toggleDropdown);

            // Handle profile dropdown
            if (profileIcon && profileDropdown) {
                profileIcon.addEventListener("click", function(e) {
                    e.stopPropagation();  
                    profileDropdown.classList.toggle("open");  
                });
            } else {
                console.error("Profile icon or dropdown not found");
            }

            // Handle toggle dropdown
            if (toggleButton && toggleDropdown) {
                toggleButton.addEventListener("click", function(e) {
                    e.stopPropagation();  
                    toggleDropdown.classList.toggle("open");  
                });
            } else {
                console.error("Toggle button or dropdown not found");
            }

            // Close dropdowns if click happens outside either of them
            document.addEventListener("click", function(e) {
                if (profileIcon && profileDropdown && !profileIcon.contains(e.target) && !profileDropdown.contains(e.target)) {
                    profileDropdown.classList.remove("open");
                }
                if (toggleButton && toggleDropdown && !toggleButton.contains(e.target) && !toggleDropdown.contains(e.target)) {
                    toggleDropdown.classList.remove("open");
                }
            });

 
            /****** LOGIN / LOGOUT ******/

            // Handle login/logout action 
            loginLogoutLink.addEventListener("click", async function (e) {
                e.preventDefault();
            
                if (isLoggedIn) {
                    const token = localStorage.getItem("token");
                    const username = localStorage.getItem("Doctor_Username"); 
            
                    if (!token || !username) {
                        console.error("No user is logged in.");
                        showNotification("You are not logged in!", "error");
                        return;
                    }
            
                    try {
                        const response = await fetch("http://localhost:5501/doctor_logout", {
                            method: "POST",
                            headers: { 
                                "Content-Type": "application/json",
                                "Authorization": token
                            },
                            body: JSON.stringify({ username }),
                        });
            
                        const result = await response.json();
            
                        if (!response.ok) {
                            throw new Error(result.error || "Logout failed!");
                        }
            
                        showNotification(result.message, "success");
                        
                        // localStorage.clear();
                        isLoggedIn = false; 
                        localStorage.removeItem("Doctor_isLoggedIn");
                        localStorage.removeItem("Doctor_Username");
            
                        updateLoginLogoutText(); 
            
                        window.location.href = "../HTML/doctor_login.html";
            
                    } catch (error) {
                        console.error(error);
                        showNotification("An error occurred while logging out. Please try again.", "error");
                    }
                } else {
                    window.location.href = "../HTML/doctor_login.html";
                }
            });

            // Toggle login/logout text
            function updateLoginLogoutText() {
                isLoggedIn = localStorage.getItem("Doctor_isLoggedIn") === "true";
                username = localStorage.getItem("Doctor_Username");
                console.log("Doctor Logged In:" ,username);

                if (isLoggedIn && username) {
                    loginLogoutLink.textContent = "Logout";
                    console.log("Present");
                    
                    // Replace profile icon with the first letter of the username
                    const firstLetter = username.charAt(0).toUpperCase();
                    console.log(firstLetter);
                    
                    profileIconContainer.innerHTML = `<div class="user-initial">${firstLetter}</div>`;
                    profileIconContainer.classList.add("logged-in");

                } else {
                    loginLogoutLink.textContent = "Login";
                    profileIconContainer.innerHTML = `<i class="fa-solid fa-circle-user"></i>`; 
                    profileIconContainer.classList.remove("logged-in");
                }
            }

            updateLoginLogoutText();
        })
        .catch(error => console.error("Failed to load navbar:", error));
});


// typing animation
document.addEventListener("DOMContentLoaded", () => {
    const subtitle = document.querySelector(".subtitle span");
    const text = subtitle.textContent;

    let index = 0;
    let typingSpeed = window.innerWidth <= 768 ? 75 : 100; 
    function type() {
        if (index < text.length) {
            subtitle.textContent = text.substring(0, index + 1);
            index++;
            setTimeout(type, typingSpeed); 
        } else {
            setTimeout(() => {
              index = 0;
              type();
            }, 2000); 
        }
    }

  window.addEventListener("resize", () => {
      typingSpeed = window.innerWidth <= 768 ? 75 : 100;
  });
  type();
});
