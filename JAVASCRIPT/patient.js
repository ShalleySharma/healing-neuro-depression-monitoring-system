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

//inta effect
function toggleTab(tabId, element) {
    // Hide all lists
    document.querySelectorAll('.patient-list').forEach(el => el.style.display = 'none');
    // Remove active class from all tabs
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    // Show selected tab list
    document.getElementById(tabId).style.display = 'block';
    // Add active class to clicked tab
    element.classList.add('active');
  }

  // Initialize first tab on load
  window.onload = () => {
    toggleTab('all-list', document.querySelector('.tab.active'));
    updateCounts();
  }; 

  function updateCounts() {
    const all = document.querySelectorAll('#all-list .patient-card').length;
    const completed = document.querySelectorAll('#already-list .patient-card').length;
    const current = document.querySelectorAll('#currently-list .patient-card').length;
  
    document.getElementById('all-count').innerText = all;
    document.getElementById('already-count').innerText = completed;
    document.getElementById('current-count').innerText = current;
  
    // Optional: hide badge when 0
    ['all', 'already', 'current'].forEach(type => {
      const badge = document.getElementById(`${type}-count`);
      badge.style.display = badge.innerText === "0" ? "none" : "inline-block";
    });

    const profileButtons = document.querySelectorAll(".patient-card .session");

    profileButtons.forEach(button => {
      button.addEventListener("click", (e) => {
        e.preventDefault(); 

        // const card = button.closest(".patient-card");
        // const username = card.querySelector("h3")?.id;
        const username = "NainaS25";

      if (username) {
        localStorage.setItem("Username", username);
        // alert(username);
        window.location.href = "../Dashboard/dashboard_index.html";
      } else {
        console.error("Username not found");
      }
      });
    });
  }
  