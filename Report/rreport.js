// Example word count data
const wordCategories = {
    Neutral: 15,
    Happy: 10,
    Sad: 5
  };
  
  // Create the chart
  const ctx = document.getElementById('wordCountChart').getContext('2d');
  
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Neutral', 'Happy', 'Sad'],
      datasets: [{
        label: 'Word Count',
        data: [
          wordCategories.Neutral,
          wordCategories.Happy,
          wordCategories.Sad
        ],
        backgroundColor: [
          '#2d8bba ', 
          '#6ce5e8', 
          '#41b8d5'  
        ],
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
});

document.querySelector('.download').addEventListener('click', () => {
  const element = document.getElementById('reportContent');

  const opt = {
    margin:       [0.2, 0.2, 0.2, 0.2], 
    filename:     'healingneuro_report.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
});