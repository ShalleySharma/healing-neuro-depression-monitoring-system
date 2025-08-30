window.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem("Username");

    // Dashboard Page 
    const datePicker = document.getElementById('date-picker');
    if (datePicker) {
        datePicker.addEventListener('change', async (event) => {
            const selectedDate = event.target.value;
            console.log(selectedDate, username);
 
            try {
                const response = await fetch(`http://localhost:5501/dashboard_home?username=${username}&date=${selectedDate}`);
                const data = await response.json();
                console.log(response);
                console.log(data);

                if (response.ok) {
                    updateDepressionScore(data[0].score);
                    // dashboardWordCloud(data[0].input)
                } else {
                    updateDepressionScore(null);
                    console.warn(data.message);
                }
            } catch (err) {
                console.error("Fetch error:", err);
            }
        }); 
    }

    function updateDepressionScore(score) {
        const scoreText = document.getElementById('depression-score-text');
        const scoreCircle = document.getElementById('depression-score-circle');

        if (scoreText && scoreCircle) {
            if (score !== null && !isNaN(score)) {
                const percentage = Math.min(Math.max(score, 0), 100);
                scoreText.textContent = `${percentage}%`;

                const dashArray = 100;
                const dashOffset = dashArray - (percentage / 100) * dashArray;

                scoreCircle.setAttribute('stroke-dasharray', dashArray);
                scoreCircle.setAttribute('stroke-dashoffset', dashOffset);
            } else {
                scoreText.textContent = '--%';
                scoreCircle.setAttribute('stroke-dashoffset', 100);
            }
        }
    }

    const dashboardReportImg = document.getElementById('dashboard-report');

    if (dashboardReportImg) {
        dashboardReportImg.addEventListener('click', async () => {
            const selectedDateInput = document.getElementById('date-picker')?.value;
            console.log(selectedDateInput);
            
            const username = localStorage.getItem("Username");

            const formattedDate = formatDateForDB(selectedDateInput);

            if (!selectedDateInput || !username) {
                alert("Please select a date first.");
                return;
            }

            try {
                const response = await fetch(`http://localhost:5501/get_day_index?username=${username}&date=${formattedDate}`);
                const data = await response.json();

                if (response.ok && data.day) {
                    const reportUrl = `../Report/rreport.html?type=daily&index=${data.day}`;
                    window.location.href = reportUrl;
                } else {
                    console.log(response);
                    console.log(data);
                    console.warn(data.message);
                }
            } catch (error) {
                console.error("Failed to get day index:", error);
            }
        });
    }

    function formatDateForDB(dateStr) {
        const date = new Date(dateStr);
        return date.toDateString(); 
    }

    function dashboardWordCloud(input){

    }

    // Depression Score Page 
    const weeklyContainer = document.getElementById('weekly-cards');
    const dailyContainer = document.getElementById('daily-cards');

    if (weeklyContainer && dailyContainer) {
        loadScores();
    }

    async function loadScores() {
        const weekly = await fetch(`http://localhost:5501/weekly_score/${username}`).then(res => res.json());
        const daily = await fetch(`http://localhost:5501/daily_score/${username}`).then(res => res.json());
        console.log(weekly);
        console.log(daily);

        weeklyContainer.innerHTML = '';
        dailyContainer.innerHTML = '';

        weekly.forEach((score, i) => {
            weeklyContainer.innerHTML += generateCard(`Week ${score.week}`, score.score, i, 'week');
        });

        daily.forEach((score, i) => {
            dailyContainer.innerHTML += generateCard(`Day ${score.day}`, score.score, i, 'day');
        });
    }

    function generateCard(title, progress, index, type = 'week') {
        const colorClasses = ['indigo', 'red', 'green', 'yellow', 'blue'];
        const color = colorClasses[index % colorClasses.length];
        const strokeOffset = 251.2 - (progress / 100) * 251.2;
        const formattedProgress = progress.toFixed(1);
    
        const weekIcon = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-${color}-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        `;
    
        const dayIcon = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-${color}-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
        `;
    
        const selectedIcon = type === 'week' ? weekIcon : dayIcon;
    
        return `
            <div class="bg-white rounded-lg shadow-sm p-6 mx-2 w-64 flex flex-col items-center">
                <div class="flex items-center mb-4 self-start">
                    <div class="bg-${color}-100 p-2 rounded-full mr-3">
                        ${selectedIcon}
                    </div>
                    <h3 class="font-semibold text-lg">${title}</h3>
                </div>
                <div class="progress-circle">
                    <svg height="80" width="80" viewBox="0 0 100 100">
                        <circle class="progress-background" cx="50" cy="50" r="40" />
                        <circle class="progress-value stroke-${color}-500" cx="50" cy="50" r="40" stroke-dasharray="251.2" stroke-dashoffset="${strokeOffset}" />
                    </svg>
                    <div class="progress-text">${formattedProgress}%</div>
                </div>
            </div>
        `;
    }

    async function fetchReports(type) {
        const res = await fetch(`http://localhost:5501/${type}_report/${username}`);
        console.log(res);
        return res.json();
    }
    
    function createReportCard(date, type, index) {

        let report_type;

        if(type == 'weekly'){
            report_type = 'Week';
        }else{
            report_type = 'Day'
        }

        return `
            <a href="../Report/rreport.html?type=${type}&index=${index}" target="_blank" class="block">
                <div class="bg-white rounded-lg shadow-2xl p-4 w-64">
                    <img src="./images/report.jpg" alt="Report" class="w-full mb-4 hover:scale-105 transition" />
                    <p class="text-center text-base font-medium py-1">${report_type}: ${index}</p>
                    <p class="text-center text-base font-medium py-1">${date}</p>
                </div>
            </a>
        `;
    }
    
    async function renderReportCards() {
        const weeklyData = await fetchReports('weekly');
        const dailyData = await fetchReports('daily');
    
        const weeklyContainer = document.querySelector('#weekly-report-container');
        const dailyContainer = document.querySelector('#daily-report-container');
    
        weeklyContainer.innerHTML = weeklyData.map((r, i) => createReportCard(r.date, 'weekly', i+1)).join('');
        dailyContainer.innerHTML = dailyData.map((r, i) => createReportCard(r.date, 'daily', i+1)).join('');
    }
    
    renderReportCards();

});
