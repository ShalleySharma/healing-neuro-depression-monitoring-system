const modal = document.getElementById("activityModal");
const suggestionsDiv = document.getElementById("suggestions");
const customInput = document.getElementById("customActivity");
const submitBtn = document.getElementById("submitActivity");
const cancelBtn = document.getElementById("cancelBtn");

let selectedSuggestion = "";

const fetchSuggestions = async () => {
    suggestionsDiv.innerHTML = `<p class="text-gray-500 text-sm">Loading suggestions...</p>`;
    selectedSuggestion = "";
  
    try {
      const response = await fetch('http://localhost:5501/get-activity-suggestions', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
      });
      
      const data = await response.json();
      console.log(response);
      console.log(data);
  
      const suggestions = data.suggestions;
  
      suggestionsDiv.innerHTML = suggestions.map(suggestion => `
        <button class="suggestion-item w-full text-left px-4 py-2 bg-gray-100 hover:bg-[#75d0df] hover:text-white rounded-md" data-suggestion="${suggestion}">
          ${suggestion}
        </button>
      `).join("");
  
      document.querySelectorAll(".suggestion-item").forEach(btn => {
        btn.addEventListener("click", () => {
          selectedSuggestion = btn.dataset.suggestion;
          customInput.value = selectedSuggestion;
        });
      });
  
    } catch (error) {
      console.error("Suggestion error:", error);
      suggestionsDiv.innerHTML = `<p class="text-red-500 text-sm">Failed to load suggestions.</p>`;
    }
};  

document.getElementById("add-activity-btn").addEventListener("click", () => {
  modal.classList.remove("hidden");
  fetchSuggestions();
});

submitBtn.addEventListener("click", () => {
  const finalActivity = customInput.value.trim() || selectedSuggestion;

  if (!finalActivity) return alert("Please write or choose an activity.");

  const activityHTML = `
    <div class="flex items-center justify-between bg-gray-100 border-2 border-[#75d0df] rounded-2xl p-5 shadow-md mx-auto w-full max-w-4xl px-5">
      <div class="font-medium">${finalActivity}</div>
      <div class="checkbox unchecked w-6 h-6 rounded-full bg-white flex items-center justify-center cursor-pointer shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    </div>
  `;
  document.querySelector(".space-y-4").insertAdjacentHTML("beforeend", activityHTML);

  modal.classList.add("hidden");
  customInput.value = "";
});

cancelBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
  customInput.value = "";
});

document.addEventListener("click", function (e) {
  if (e.target.closest(".checkbox")) {
    const checkbox = e.target.closest(".checkbox");
    const isChecked = checkbox.classList.contains("checked");

    checkbox.classList.toggle("checked", !isChecked);
    checkbox.classList.toggle("unchecked", isChecked);
    checkbox.classList.toggle("bg-green-500", !isChecked);
    checkbox.classList.toggle("bg-white", isChecked);
    checkbox.innerHTML = isChecked
      ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>`;
  }
});
