import {showNotification} from './notification.js';

let responses = [];
let currentStep = 0; 
const questions = document.querySelectorAll(".question-slide"); 

document.addEventListener("DOMContentLoaded", function () {
    for (let i = 1; i <= questions.length; i++) {
        loadSavedSelection(i);
    }
    updateStepText();
    updateProgressBar();
});

window.updateStepText = function updateStepText() {
    const stepText = document.getElementById("step-text");
    stepText.textContent = `STEP ${currentStep + 1} OF ${questions.length}`;
};

window.goToNextQuestion =  function goToNextQuestion() {
    if (currentStep < questions.length - 1) {
        currentStep++;
        scrollQuestionContainer("next");
        updateProgressBar();
        updateStepText();
    } else {
        showNotification('Click on the "Submit" button to save your response.', 'error');
    }
};


window.goToPreviousQuestion = function goToPreviousQuestion() {
    if (currentStep > 0) {
        currentStep--;
        scrollQuestionContainer("prev");
        updateProgressBar();
        updateStepText();
    }else{
        showNotification('You are on the first question.', 'error');
    }
};

// Disable manual scrolling
document.querySelector(".question-container").addEventListener("wheel", function (e) {    // wheel event - scrolling with a mouse.
    e.preventDefault();
}, { passive: false });

document.querySelector(".question-container").addEventListener("touchmove", function (e) { // touchmove - swiping gestures on touchscreens
    e.preventDefault();
}, { passive: false });

document.addEventListener("keydown", function (e) {    //  keydown events - pressing a key
    if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "ArrowDown") {  
        e.preventDefault();
    }
}, { passive: false });


window.updateProgressBar = function updateProgressBar() {
    const progressFill = document.querySelector(".progress-fill");
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
    currentStep = 0
    updateProgressBar()
    updateStepText()
});

window.selectOption = function selectOption(questionIndex, answer) {
    const optionsContainer = document.querySelector(`#question-${questionIndex} .options`);
    const options = optionsContainer.querySelectorAll(".option");

    options.forEach(option => option.classList.remove("selected"));

    const selectedOption = Array.from(options).find(option => option.textContent.includes(answer));
    if (selectedOption) {
        selectedOption.classList.add("selected");

        responses[questionIndex - 1] = answer;
        localStorage.setItem(`responseQuestion${questionIndex}`, answer);
    }
};


window.loadSavedSelection = function loadSavedSelection(questionIndex) {
    const savedSelection = localStorage.getItem(`responseQuestion${questionIndex}`);
    if (savedSelection) {
        const optionsContainer = document.querySelector(`#question-${questionIndex} .options`);
        const options = optionsContainer.querySelectorAll(".option");

        const selectedOption = Array.from(options).find(option => option.textContent.includes(savedSelection));
        if (selectedOption) {
            selectedOption.classList.add("selected");
        }

        responses[questionIndex - 1] = savedSelection;
    }
};


window.validateResponses = function validateResponses() {
    const questions = document.querySelectorAll(".question-slide");
    for (let question of questions) {
        const options = question.querySelectorAll(".option");
        let isSelected = false;
        for (let option of options) {
            if (option.classList.contains("selected")) { 
                isSelected = true;
                break;
            }
        }
        if (!isSelected) {
            return false;
        }
    }
    return true;
};

window.showPopup = function showPopup() {
    if (validateResponses()) {
        document.getElementById("popup").classList.add("visible");
        document.getElementById("overlay").classList.add("visible");
    } else {
        showNotification('Please complete all questions before submitting.', 'info');
 
    }
};

window.showNextContent = function showNextContent() {
    document.getElementById('conformation').classList.remove('visible');
    document.getElementById('conformation').classList.add('hidden');
    document.getElementById('final_submission').classList.remove('hidden');
    document.getElementById('final_submission').classList.add('visible');

    submitResponsesSession1();
    saveResponsesToFile();
};

window.closePopup = function closePopup() {
    document.getElementById("popup").classList.remove("visible");
    document.getElementById("overlay").classList.remove("visible");
};

window.submitResponsesSession1 = function submitResponsesSession1() {
    const savedResponses = [];
    for (let questionIndex = 1; questionIndex <= 10; questionIndex++) { 
        const savedResponse = localStorage.getItem(`responseQuestion${questionIndex}`);
        if (savedResponse) {
            savedResponses.push(savedResponse);
        } else {
            showNotification(`Please answer question ${questionIndex} before submitting!`, 'info');
            return; 
        }
    }

    responses = savedResponses;
    console.log("Session 1 responses going to be send to Flask:", responses);
    
    window.dispatchEvent(new CustomEvent("session1ResponsesReady", { detail: responses }));

};


window.saveResponsesToFile = function saveResponsesToFile() {
    if (!responses.length) {
        console.error("No responses to save!");
        showNotification("No responses to save!", "error");
        return;
    }
    const responseText = responses.join('\n');

    const blob = new Blob([responseText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'responses-session1.txt';  
    link.click();
};
