document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    const requestedTab = document.getElementById('requestedTab');
    const scheduledTab = document.getElementById('scheduledTab');
    const requestedContent = document.getElementById('requested-content');
    const scheduledContent = document.getElementById('scheduled-content');

    if (requestedTab && scheduledTab && requestedContent && scheduledContent) {
        requestedTab.addEventListener('click', () => {
            requestedTab.classList.add('active');
            scheduledTab.classList.remove('active');
            requestedContent.classList.add('active');
            scheduledContent.classList.remove('active');
        });

        scheduledTab.addEventListener('click', () => {
            scheduledTab.classList.add('active');
            requestedTab.classList.remove('active');
            scheduledContent.classList.add('active');
            requestedContent.classList.remove('active');
        });
    }

    const dateSelector = document.getElementById('dateSelector');
    const currentDateDisplay = document.getElementById('currentDate');

    if (dateSelector && currentDateDisplay) {
        const today = new Date();
        const formattedToday = today.toISOString().split('T')[0];
        dateSelector.value = formattedToday;

        dateSelector.addEventListener('change', (e) => {
            const selectedDate = new Date(e.target.value);
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            currentDateDisplay.textContent = selectedDate.toLocaleDateString('en-US', options);
        });
    }

    const confirmButtons = document.querySelectorAll('.btn-confirm');
    const cancelButtons = document.querySelectorAll('.btn-cancel');

    confirmButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const meetingItem = e.target.closest('.meeting-item');
            alert('Meeting confirmed!');
            if (meetingItem.parentElement.closest('#requested-content')) {
                const scheduledContent = document.querySelector('#scheduled-content .meeting-cards');
                const clonedItem = meetingItem.cloneNode(true);

                const actions = clonedItem.querySelector('.meeting-actions');
                actions.innerHTML = `
                    <button class="btn btn-details">Details</button>
                    <button class="btn btn-cancel">Cancel</button>
                `;

                scheduledContent.appendChild(clonedItem);
                meetingItem.remove();

                const requestCount = document.getElementById('requestCount');
                requestCount.textContent = parseInt(requestCount.textContent) - 1;
            }
        });
    });

    cancelButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const meetingItem = e.target.closest('.meeting-item');
            if (meetingItem.parentElement.closest('#requested-content')) {
                const requestCount = document.getElementById('requestCount');
                requestCount.textContent = parseInt(requestCount.textContent) - 1;
            }
            meetingItem.remove();
            alert('Meeting cancelled!');
        });
    });
});

//date updates
document.addEventListener("DOMContentLoaded", function () {
    const requestedTab = document.getElementById("requestedTab");
    const scheduledTab = document.getElementById("scheduledTab");
    const requestedContent = document.getElementById("requested-content");
    const scheduledContent = document.getElementById("scheduled-content");
    const dateSelector = document.getElementById("dateSelector");
    const currentDateDisplay = document.getElementById("currentDate");

    // Toggle tab views
    requestedTab.addEventListener("click", () => {
        requestedTab.classList.add("active");
        scheduledTab.classList.remove("active");
        requestedContent.classList.add("active");
        scheduledContent.classList.remove("active");
    });

    scheduledTab.addEventListener("click", () => {
        scheduledTab.classList.add("active");
        requestedTab.classList.remove("active");
        scheduledContent.classList.add("active");
        requestedContent.classList.remove("active");
    });

    // Format date as "Apr 21"
    function formatDateToShortMonth(date) {
        const options = { month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    // Format date as "Today: April 20, 2025"
    function formatDisplayDate(date) {
        const options = { month: 'long', day: 'numeric', year: 'numeric' };
        return `Selected: ${date.toLocaleDateString('en-US', options)}`;
    }

    // Filter meetings based on selected date
    dateSelector.addEventListener("change", () => {
        const selectedDate = new Date(dateSelector.value);
        if (isNaN(selectedDate)) return;

        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        currentDateDisplay.textContent = formatDisplayDate(selectedDate);

        // Format for comparison
        const formattedSelected = formatDateToShortMonth(selectedDate);
        const formattedToday = formatDateToShortMonth(today);
        const formattedTomorrow = formatDateToShortMonth(tomorrow);

        const allMeetingItems = document.querySelectorAll(".meeting-item");

        allMeetingItems.forEach(item => {
            const meetingTime = item.querySelector(".meeting-time")?.textContent || "";
            let show = false;

            if (meetingTime.includes("Today") && formattedSelected === formattedToday) {
                show = true;
            } else if (meetingTime.includes("Tomorrow") && formattedSelected === formattedTomorrow) {
                show = true;
            } else if (meetingTime.includes(formattedSelected)) {
                show = true;
            }

            item.style.display = show ? "flex" : "none";
        });
    });
});
