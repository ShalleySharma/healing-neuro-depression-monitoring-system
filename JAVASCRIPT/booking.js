function getPsychologistIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || 1;  
}

document.addEventListener('DOMContentLoaded', () => {
    const psychologistId = parseInt(getPsychologistIdFromURL()); 

    fetch('../Data/psychologistData.json')
        .then(response => response.json())
        .then(data => {
            const psychologist = data.find(p => p.id === psychologistId);

            if (psychologist) {

                document.getElementById('profile-pic').src = psychologist.image;
                document.getElementById('profile-pic').alt = psychologist.name;
                
                document.getElementById('name').innerText = psychologist.name;
                document.getElementById('qualification').innerText = psychologist.qualification;

                document.getElementById('qualification2').innerText = psychologist.qualification2;

                document.getElementById('language').innerText= psychologist.language;

                document.getElementById('specialization').innerText = 
                    psychologist.specialization.join(', ');

                document.getElementById('expertise').innerText = 
                    psychologist.expertise.join(', ');
                
                document.getElementById('available_time').innerText= psychologist.available_time;

                document.getElementById('about').innerText = psychologist.about;

            } else {
                document.querySelector('.profile-container').innerHTML =
                `<h2 style="color: red;">Psychologist not found!</h2>`;
            }
        })
        .catch(error => console.error('Error fetching psychologist data:', error));
});

// Get modal elements
const modal = document.getElementById("sessionModal");
const bookSessionBtn = document.querySelector(".book-session-btn");
const closeBtn = document.querySelector(".close");
const confirmBooking = document.getElementById("confirmBooking");
const sessionTime = document.getElementById("sessionTime");

bookSessionBtn.onclick = function() {
    modal.style.display = "flex";
    populateTimeSlots();
};

closeBtn.onclick = function() {
    modal.style.display = "none";

    let sessionDate = document.getElementById("sessionDate");
    sessionDate.value = "";

    let sessionTime = document.getElementById("sessionTime");
    sessionTime.selectedIndex = 0;
};

window.onclick = function(e) {
    if (e.target === modal) {
        modal.style.display = "none";
    }
};

function populateTimeSlots() {
    sessionTime.innerHTML = ""; 

    let defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "-- Select --";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    sessionTime.appendChild(defaultOption);

    for (let hour = 10; hour <= 19; hour++) {
        let timeValue = `${hour.toString().padStart(2, '0')}:00`;
        let option = document.createElement("option");
        option.value = timeValue;
        option.textContent = `${hour % 12 || 12}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
        sessionTime.appendChild(option);
    }
}

// ChatBot
const chatBtn = document.getElementById("chatBtn");
const chatDialog = document.getElementById("chatDialog");
const chatMessages = document.getElementById("chatMessages");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const typingIndicator = document.getElementById("typingIndicator");

let step = 0;

chatBtn.onclick = () => {
chatDialog.style.display = "block";
chatMessages.innerHTML = "";
step = 0;
showTypingIndicator();
setTimeout(() => {
    hideTypingIndicator();
    addBotMessage("Request is sent");
    showTypingIndicator();
    setTimeout(() => {
    hideTypingIndicator();
    addBotMessage("What is your name?");
    }, 1000);
}, 1000);
};

function showTypingIndicator() {
typingIndicator.style.display = "block";
document.getElementById("messages-container").scrollTop = document.getElementById("messages-container").scrollHeight;
}

function hideTypingIndicator() {
typingIndicator.style.display = "none";
}

userInput.addEventListener("keypress", function (e) {
if (e.key === "Enter") {
    sendMessage();
}
});

sendBtn.addEventListener("click", function() {
sendMessage();
});

function sendMessage() {
const input = userInput.value.trim();
if (input) {
    addUserMessage(input);
    handleUserResponse(input.toLowerCase());
    userInput.value = "";
}
}

function handleUserResponse(msg) {
showTypingIndicator();

switch (step) {
    case 0:
    setTimeout(() => {
        hideTypingIndicator();
        addBotMessage("Hello, how can we help you today?");
        step = 1;
    }, 1000);
    break;
    case 1:
    if (msg.includes("doctor")) {
        setTimeout(() => {
        hideTypingIndicator();
        addBotMessage("He/She will be contacting you soon.");
        showTypingIndicator();
        setTimeout(() => {
            hideTypingIndicator();
            addBotMessage("Any other queries?");
            step = 2;
        }, 1000);
        }, 1000);
    } else {
        setTimeout(() => {
        hideTypingIndicator();
        addBotMessage("Can you please clarify your concern?");
        }, 1000);
    }
    break;
    case 2:
    if (msg.includes("no") || msg.includes("okay")) {
        setTimeout(() => {
        hideTypingIndicator();
        addBotMessage("Thank you! Have a great day 😊");
        }, 1000);
    } else {
        setTimeout(() => {
        hideTypingIndicator();
        addBotMessage("We'll get back to you regarding that. Anything else?");
        }, 1000);
    }
    break;
    default:
    setTimeout(() => {
        hideTypingIndicator();
        addBotMessage("I'm here to help with anything else.");
    }, 1000);
}
}

function addBotMessage(text) {
const msgDiv = document.createElement("div");
msgDiv.className = "msg bot";
msgDiv.textContent = text;
chatMessages.appendChild(msgDiv);
document.getElementById("messages-container").scrollTop = document.getElementById("messages-container").scrollHeight;
}

function addUserMessage(text) {
const msgDiv = document.createElement("div");
msgDiv.className = "msg user";
msgDiv.textContent = text;
chatMessages.appendChild(msgDiv);
document.getElementById("messages-container").scrollTop = document.getElementById("messages-container").scrollHeight;
}

document.addEventListener("click", function(event) {
    const isClickInsideChat = chatDialog.contains(event.target) || chatBtn.contains(event.target);
    if (!isClickInsideChat) {
        chatDialog.style.display = "none";
    }
});



// Confirm Booking
const user = localStorage.getItem("Username");
const confirm_btn = document.getElementById("confirmBooking");

// Get Email ID of user
async function getUserEmail() {

    try {
        const response = await fetch(`http://localhost:5501/emailID?username=${user}`);
        const result = await response.json();

        console.log("Result from /emailID:", result);
        
        if (response.ok) {
            console.log("Email:", result.email);
            return result.email;
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error(error);
        alert("Something went wrong!");
    }
};

confirm_btn.addEventListener("click", async function(e) {
    e.preventDefault();

    const id = parseInt(getPsychologistIdFromURL());
    const date = document.getElementById("sessionDate").value;
    const timeslot = sessionTime.value;

    if (user) {
        console.log(`User logged In : ${user}`);
    } else {
        console.log("No user logged In");
    }

    if (!user) {
        alert("Please log in to book a session")
        return;
    }

    try {
        const response = await fetch(`http://localhost:5501/bookingSession`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: user, 
                psychologist_id: id,
                date_selected: date, 
                time_selected: timeslot })
        });
    
        const result = await response.json();
        console.log(result);

        if(response.ok){
            alert("Booking Confirmed!");
            // let email = await getUserEmail()
            // const roomLink = `https://meet.jit.si/session-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            // sendBookingEmail(user, email, roomLink)
            // alert("email...")
        }else{
            alert("Booking Failed, "+ result.message);
        }

    } catch (error) {
        console.error(error);
        alert("An error occurred. Please try again later.")
    }
}) 

// emailjs.init("RSQUC8ZwGycecXwz8");

//   function sendBookingEmail(name, email, roomLink) {
//     const templateParams = {
//       to_name: name,
//       to_email: email,
//       meet_link: roomLink,
//       doctor_name: "Dr. Smith"
//     };

//     emailjs.send("service_98wy25i", "template_3631z6e", templateParams)
//       .then(() => {
//         alert("Booking email sent!");
//       }, (error) => {
//         console.error("EmailJS Error:", error); 
//         alert("Error sending email: " + error.text);
//       });
// }
