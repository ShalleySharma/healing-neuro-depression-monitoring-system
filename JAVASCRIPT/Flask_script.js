import { showNotification } from "./notification.js";

let session1Responses = localStorage.getItem("session1Responses") 
    ? JSON.parse(localStorage.getItem("session1Responses")) 
    : null;
let session2Responses = localStorage.getItem("session2Responses") 
    ? localStorage.getItem("session2Responses") 
    : null;
let session3Responses = localStorage.getItem("session3Responses") 
    ? localStorage.getItem("session3Responses") 
    : null;

// Event listeners to capture responses from each session
window.addEventListener("session1ResponsesReady", function (event) {
    session1Responses = event.detail;
    localStorage.setItem("session1Responses", JSON.stringify(session1Responses));   
    console.log("Session 1 responses received in flask_script:", session1Responses);
    checkAndSubmit();
});

window.addEventListener("session2ResponsesReady", function (event) {
    session2Responses = event.detail;
    localStorage.setItem("session2Responses", session2Responses);  
    console.log("Session 2 responses received in flask_script:", session2Responses);
    checkAndSubmit();
});

window.addEventListener("session3ResponsesReady", function (event) {
    session3Responses = event.detail;
    localStorage.setItem("session3Responses", session3Responses);  
    console.log("Session 3 responses received in flask_script:", session3Responses);
    checkAndSubmit();
});

// Function to check if all responses are received before submitting
function checkAndSubmit() {
    session1Responses = localStorage.getItem("session1Responses") 
        ? JSON.parse(localStorage.getItem("session1Responses")) 
        : null;
    session2Responses = localStorage.getItem("session2Responses") 
        ? localStorage.getItem("session2Responses") 
        : null;
    session3Responses = localStorage.getItem("session3Responses") 
        ? localStorage.getItem("session3Responses") 
        : null;

    if (
        session1Responses !== null && session1Responses !== "" &&
        session2Responses !== null && session2Responses !== "" &&
        session3Responses !== null && session3Responses !== ""
    ) {
        console.log("Following are Submitted to backend:", {  
            session1Responses,
            session2Responses,
            session3Responses 
        });

        fetch('http://127.0.0.1:5000/process-responses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                week: 1,
                sessions: [
                    { session_id: 1, responses: session1Responses },
                    { session_id: 2, responses: session2Responses },
                    { session_id: 3, responses: session3Responses }
                ]
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Response from server:', data);
            showNotification(data.message, 'success');
            clearLocalStorageAndRedirect();
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification("Error submitting responses. Try again!", 'error');
        });

    } else {
        console.log("Waiting for all session responses before submitting...");
        console.log("Current session responses:", {
            session1Responses,
            session2Responses,
            session3Responses
        });  
    }
}

window.clearLocalStorageAndRedirect = function clearLocalStorageAndRedirect() {
    console.log("Clearing local storage...");
    localStorage.clear(); 
    console.log("Local storage cleared.");
    viewReportAndRedirect();
};

window.viewReportAndRedirect = function viewReportAndRedirect() {
    window.open('../Demo_Report.pdf', '_blank');

    showNotification('Redirecting to Home Page', 'success')
    window.location.href = 'index.html';  
}; 
