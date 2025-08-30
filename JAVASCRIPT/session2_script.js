import {showNotification} from './notification.js'

let responses = [];
let currentStep = 0; 
const questions = document.querySelectorAll('.question-slide'); 

document.addEventListener('DOMContentLoaded', function () {
    questions.forEach((question, index) => {
        const saveButton = question.querySelector('.save-button');
        const clearButton = question.querySelector('.clear-button');
        //const textarea = question.querySelector('#text-answer');

        saveButton.addEventListener('click', () => saveResponse(index));
        clearButton.addEventListener('click', () => clearResponse(index));

        loadSavedSelection(index);
    });
    rebuildResponsesString()

    updateProgressBar(); 
});

window.rebuildResponsesString = function rebuildResponsesString() {
    responsesString_2 = ""; 
    responses = []; 

    questions.forEach((_, index) => {
        const savedResponse = localStorage.getItem(`responseQuestion_2${index}`);
        if (savedResponse && savedResponse.trim() !== "") {
            responses[index] = savedResponse; // Sync the responses array
            if (responsesString_2) {
                responsesString_2 += `, "${savedResponse}"`;
            } else {
                responsesString_2 = `"${savedResponse}"`;
            }
        }
    });
};

let responsesString_2 = "";

window.saveResponse = function saveResponse(questionIndex) {
    const question = questions[questionIndex];
    const answer = question.querySelector('#text-answer').value;

    if (answer.trim() !== "") {
        question.querySelector('.tick-mark').style.display = 'inline';
        showNotification('Your Response has been saved.', 'success');
        question.querySelector('#text-answer').disabled = true;
        question.querySelector('.save-button').disabled = true;
        question.querySelector('.input-container').classList.add('saved');

        responses[questionIndex] = answer;
        localStorage.setItem(`responseQuestion_2${questionIndex}`, answer);

        if (responsesString_2) {
            responsesString_2 += `, "${answer}"`;
        } else {
            responsesString_2 = `"${answer}"`;
        }

    } else {
        showNotification('Please enter a response before saving.', 'warning');
    }

    console.log("All Responses:", responsesString_2);
};

window.clearResponse = function clearResponse(questionIndex) {
    const question = questions[questionIndex];
    const textarea = question.querySelector('#text-answer');

    textarea.value = "";
    question.querySelector('.tick-mark').style.display = 'none';
    textarea.disabled = false;
    question.querySelector('.save-button').disabled = false;
    question.querySelector('.input-container').classList.remove('saved');

    const responseToRemove = responses[questionIndex];
    console.log("Response to Remove:", responseToRemove);
    console.log("Responses before Clear:", responses);

    responses[questionIndex] = "";
    localStorage.removeItem(`responseQuestion_2${questionIndex}`);

    responsesString_2 = responsesString_2.replace(responseToRemove,  "");

    console.log("All Responses after Clear:", responsesString_2);
};

window.updateStepText = function updateStepText() {
    const stepText = document.getElementById('step-text');
    stepText.textContent = `STEP ${currentStep + 1} OF ${questions.length}`;
};

window.goToNextQuestion = function goToNextQuestion() {
    if (currentStep < questions.length - 1) {
        currentStep++;
        scrollQuestionContainer('next');
        updateProgressBar();
        updateStepText();
    } else {
        showNotification('Click on the "Submit" button to save your response.', 'error');
    }
};

window.goToPreviousQuestion = function goToPreviousQuestion() {
    if (currentStep > 0) {
        currentStep--;
        scrollQuestionContainer('prev');
        updateProgressBar();
        updateStepText();
    }
};

// Disable manual scrolling
document.querySelector(".question-container").addEventListener("wheel", function (e) {    // wheel - scrolling with a mouse.
    e.preventDefault();
}, { passive: false });

document.querySelector(".question-container").addEventListener("touchmove", function (e) { // touchmove - swiping gestures on touchscreens
    e.preventDefault();
}, { passive: false });

document.addEventListener("keydown", function (e) {    //  keydown - pressing a key
    if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "ArrowDown") {  
        e.preventDefault();
    }
}, { passive: false });


window.updateProgressBar = function updateProgressBar() {
    const progressFill = document.querySelector('.progress-fill');
    const n = questions.length - 1;
    const progressPercentage = ((currentStep) / n) * 100;
    progressFill.style.width = `${progressPercentage}%`;
};

window.scrollQuestionContainer = function scrollQuestionContainer(direction) {
    const questionContainer = document.querySelector(".question-container");
    const questionSlides = document.querySelectorAll(".question-slide");
    let currentScrollLeft = questionContainer.scrollLeft;

    const slideWidth = questionSlides[0].offsetWidth;

    if (direction === "next") {
        questionContainer.scrollTo({
            left: currentScrollLeft + slideWidth,
            behavior: "smooth",
        });
    } else if (direction === "prev") {
        questionContainer.scrollTo({
            left: currentScrollLeft - slideWidth,
            behavior: "smooth",
        });
    }
};

window.addEventListener("resize", () => {
    document.querySelector(".question-container").scrollTo({
        left: 0,
        behavior: "smooth",
    });
});

window.loadSavedSelection = function loadSavedSelection(questionIndex) {
    const savedResponse = localStorage.getItem(`responseQuestion_2${questionIndex}`);
    
    const question = questions[questionIndex];
    const textarea = question.querySelector('#text-answer');
    const tickMark = question.querySelector('.tick-mark');
    const saveButton = question.querySelector('.save-button');
    
    if (savedResponse && savedResponse !== "undefined" && savedResponse !== "0") {
        textarea.value = savedResponse;
        tickMark.style.display = 'inline';
        textarea.disabled = true;
        saveButton.disabled = true;
        question.querySelector('.input-container').classList.add('saved');
    } else {
        textarea.value = "";
    }
};

window.validateResponses = function validateResponses() {
    let allSaved = true;

    questions.forEach((question, index) => {
        const savedResponse = localStorage.getItem(`responseQuestion_2${index}`);
        const textarea = question.querySelector('#text-answer');

        if (!savedResponse || savedResponse.trim() === "" || textarea.value.trim() === "") {
            allSaved = false;
        }
    });

    if (allSaved) {
        return true;
    } else {
        showNotification('Please complete and save all the responses before submitting.', 'info');
    }
};

window.closePopup = function closePopup() {
    const popup = document.getElementById("popup");
    const overlay = document.getElementById("overlay");
    popup.classList.remove("visible");
    overlay.classList.remove("visible");
};

window.showPopup = function showPopup() {
    if (validateResponses()) {
        const popup = document.getElementById("popup");
        const overlay = document.getElementById("overlay");
        popup.classList.add("visible");
        overlay.classList.add("visible");
    } else {
        showNotification('Please complete and save all the responses before submitting.', 'info');
    }
};

window.showNextContent = function showNextContent() {
    const confirmation = document.getElementById("conformation");
    const finalSubmission = document.getElementById("final_submission");

    confirmation.classList.remove("visible");
    confirmation.classList.add("hidden");

    finalSubmission.classList.remove("hidden");
    finalSubmission.classList.add("visible");

    submitResponsesSession2();
    saveResponsesToFile();
};

window.submitResponsesSession2 = function submitResponsesSession2() {
    const final_responses = [];

    questions.forEach((question, index) => {
        const savedResponse = localStorage.getItem(`responseQuestion_2${index}`);
        if (savedResponse) {
            final_responses.push(`${savedResponse}`);
        }
    });

    responsesString_2 = final_responses.length > 0 ? final_responses.join(',') : null;  // Set to null if empty

    console.log("Session 3 responses going to be send to Flask:", responsesString_2);

    // Dispatch an event only if responsesString_3 is not null
    if (responsesString_2 !== null) {
        window.dispatchEvent(new CustomEvent("session2ResponsesReady", { detail: responsesString_2 }));
    } else {
        console.warn("Session 3 responses are empty. Not dispatching event.");
    }
};

window.saveResponsesToFile = function saveResponsesToFile() {
    if (!responsesString_2 || responsesString_2.trim() === "") {
        console.error("No responses to save!");
        showNotification("No responses to save!", "error");
        return;
    }
    const blob = new Blob([responsesString_2], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'responses.txt';  
    link.click();
};
