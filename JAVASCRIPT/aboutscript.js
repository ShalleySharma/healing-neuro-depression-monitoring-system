document.addEventListener("DOMContentLoaded", () => {
    // Get the button and the test section
    const knowmoreButton = document.querySelector(".know-more-btn");
    const testsSection = document.querySelector(".tests-section");
    const button = document.querySelector(".button");

    // Add click event listener to the button
    knowmoreButton.addEventListener("click", () => {
        // Make the tests section visible
        testsSection.style.display = "block";
        button.style.display = "block";

        // Smoothly scroll to the tests section
        testsSection.scrollIntoView({ behavior: "smooth" });
        button.scrollIntoView({ behavior: "smooth" });
    });
});

function openPopup() {
    // Display the popup overlay
    document.getElementById("popup-overlay").style.display = "flex";

    // Add blur effect to the main content or specific sections
    const contentToBlur = document.querySelectorAll("body > *:not(#popup-overlay)");
    contentToBlur.forEach((element) => {
        element.classList.add("blur-background");
    });
}

function closePopup() {
    // Hide the popup overlay
    document.getElementById("popup-overlay").style.display = "none";

    // Remove blur effect from the main content
    const contentToBlur = document.querySelectorAll("body > *:not(#popup-overlay)");
    contentToBlur.forEach((element) => {
        element.classList.remove("blur-background");
    });
}

async function get_status(){
    try {
        const username = sessionStorage.getItem("Username")
        const response = await fetch(`http://localhost:5501/disclaimer?username=${username}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                }
        });
    
        const result = await response.json();
        console.log(result);
        
        if(response.ok){
            showNextContent();
            alert(result.message);
        }else{
            alert(result.message);
            closePopup();
        }
        
    } catch (error) {
        console.error(error);
        alert("An error occured! Please try again")
    }
}

function showNextContent() {
    // Hide the first content
    document.getElementById("content1").classList.remove("visible");
    document.getElementById("content1").classList.add("hidden");

    // Show the second content
    document.getElementById("content2").classList.remove("hidden");
    document.getElementById("content2").classList.add("visible");
}

function redirectToSession() {
    // Redirect to session1.html
    window.location.href = "session1.html";
}

