//load more or less counsellors
document.addEventListener("DOMContentLoaded", () => {
    const productsContainer2 = document.querySelector(".products-container2");
    const loadMoreBtn = document.querySelector(".more_counselor");
    const showLessBtn = document.querySelector(".less_counselor");

    productsContainer2.classList.remove("show");  
    showLessBtn.classList.add("hidden");          

    // Show more counselors
    loadMoreBtn.addEventListener("click", () => {
        productsContainer2.classList.add("show");  
        loadMoreBtn.classList.add("hidden");       
        showLessBtn.classList.remove("hidden");    
    });

    // Show less counselors
    showLessBtn.addEventListener("click", () => {
        productsContainer2.classList.remove("show"); 
        showLessBtn.classList.add("hidden");         
        loadMoreBtn.classList.remove("hidden");      
    });
});

// Filter javacript
const datepicker = document.querySelector(".datepicker");
const dateInput = document.querySelector(".date-input");
const yearInput = datepicker.querySelector(".year-input");
const monthInput = datepicker.querySelector(".month-input");
const cancelBtn = document.querySelector(".cancel");
const applyBtn = document.querySelector('.apply');
const nextBtn = datepicker.querySelector(".next");
const prevBtn = datepicker.querySelector(".prev");
const dates = document.querySelector(".dates");

let selectedDate=new Date();
let year = selectedDate.getFullYear();
let month = selectedDate.getMonth();

//show datepicker
dateInput.addEventListener("click", () =>{
    datepicker.style.display = "block";
});

//hide datepicker
cancelBtn.addEventListener("click", () => {
    datepicker.style.display = "none"; // Hide the datepicker
});

//handle apply btn click event
applyBtn.addEventListener("click", () =>{
    // set the selected date to date input
    dateInput.value = selectedDate.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit",});
    // hide datepicker
    datepicker.hidden = true;
});

//handle next month nav
nextBtn.addEventListener("click", () => {
    if(month === 11) year++;
    month = (month + 1) % 12;
    displayDates();
});

//handle prev month nav
prevBtn.addEventListener("click", () => {
    if(month === 0) year--;
    month = (month -1 + 12) % 12;
    displayDates();
});

// handle month input change event
monthInput.addEventListener("change", () => {
    month = monthInput.selectedIndex;
    displayDates();
});
  
// handle year input change event
yearInput.addEventListener("change", () => {
    year = yearInput.value;
    displayDates();
});
  
const updateYearMonth = () => {
    monthInput.selectedIndex = month;
    yearInput.value = year;
};
const handleDateClick = (e) => {
    const button = e.target;

    //remove the selected class fron other buttons
    const selected = dates.querySelector(".selected");
    selected && selected.classList.remove("selected");

    //add the selected class to current button
    button.classList.add("selected");

    //set the selected date
    selectedDate = new Date(year, month, parseInt(button, textContent));
};

//render the dates in the calendar interface
const displayDates = () => {
    // update year & month whenever the dates are updated
    updateYearMonth();

    //clear the dates
    dates.innerHTML ="";

    //display the last week of previous month

    //get the last date of previous month
    const lastOfPrevMonth = new Date(year, month, 0);

    for(let i=0; i<=lastOfPrevMonth.getDay(); i++){
        const text = lastOfPrevMonth.getDate() - lastOfPrevMonth.getDay() + i;
        const button = createButton(text, true, -1);
        dates.appendChild(button);
    }

    //display the current month

    // get the last date of the month
    const lastOfMOnth = new Date(year, month + 1, 0);

    for (let i = 1; i <= lastOfMOnth.getDate(); i++) {
       const button = createButton(i, false);
       button.addEventListener("click", handleDateClick);
       dates.appendChild(button);
    }

    //display the first week of next month
    const firstOfNextMonth = new Date(year, month+1, 1);
    for(let i=firstOfNextMonth.getDay(); i<7; i++){
        const text = firstOfNextMonth.getDate()- firstOfNextMonth.getDay() + i;
        
        const button = createButton(text, true, 1);
        dates.appendChild(button);
    }
}; 

const createButton = (text, isDisabled = false, type = 0) => {
    const currentDate = new Date();
  
    // determine the date to compare based on the button type
    let comparisonDate = new Date(year, month + type, text);
  
    // check if the current button is the date today
    const isToday =
      currentDate.getDate() === text &&
      currentDate.getFullYear() === year &&
      currentDate.getMonth() === month;
  
    // check if the current button is selected
    const selected = selectedDate.getTime() === comparisonDate.getTime();
  
    const button = document.createElement("button");
    button.textContent = text;
    button.disabled = isDisabled;
    button.classList.toggle("today", isToday && !isDisabled);
    button.classList.toggle("selected", selected);
    return button;
};

displayDates();

const specialization = document.querySelector(".specialization");
const selectOption = document.querySelector(".select-option");
const soValue = document.querySelector("#soValue");
const optionSearch = document.querySelector("#optionSearch");
const options = document.querySelector(".options");
const optionsList = document.querySelectorAll(".options li");
const content = document.querySelector(".dp_content");

// Toggle dropdown visibility
selectOption.addEventListener("click", function () {
    content.classList.toggle("active");
    content.style.display = content.classList.contains("active") ? "block" : "none";
});

// Handle option selection
optionsList.forEach(function (optionsListSingle) {
    optionsListSingle.addEventListener("click", function () {
        let text = this.textContent;
        soValue.value = text;
        content.classList.remove("active");
        content.style.display = "none"; 
    });
});

// Handle search functionality
optionSearch.addEventListener("keyup", function () {
    let filter = optionSearch.value.toUpperCase();
    let li = options.getElementsByTagName("li");

    for (let i = 0; i < li.length; i++) {
        let textValue = li[i].textContent || li[i].innerText;
        li[i].style.display = textValue.toUpperCase().includes(filter) ? "block" : "none";
    }
});

// Close dropdown when clicking outside
document.addEventListener("click", function (event) {
    if (!specialization.contains(event.target)) {
        content.classList.remove("active");
        content.style.display = "none";
    }
});