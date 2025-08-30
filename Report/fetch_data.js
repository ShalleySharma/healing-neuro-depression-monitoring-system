window.onload = function () {
  const username = localStorage.getItem("Username");
  console.log("User:", username)

  const { type, index } = getQueryParams();

  if (!username || !type || !index) {
    console.warn("Missing info for report");
    return;
  }

  console.log(`Fetching ${type} report for index: ${index}`);

  const endpoint =
    type === "weekly"
      ? `/weekly_report_data?username=${username}&week=${index}`
      : `/daily_report_data?username=${username}&day=${index}`;

  if (username) {
    fetch(`http://localhost:5501${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }})
    .then(response => response.json())
    .then(data => {
      if (data) {
        console.log(data);
        
        document.querySelector(".patient-details").innerHTML = `
          <strong>${data.name}</strong><br>
          Age - ${data.age}<br>
          Gender - ${data.gender}<br>
          PID - ${data.pid}<br>
          Date - ${data.session_Date}`;

        const score = data.depression_score.toFixed(1);
        const user_response = data.input;
  
        document.querySelector(".progress-fill").style.width = `${score}%`;
        document.querySelector(".score-numbers").innerHTML = `
          <span style="color: red;">Average - ${score}</span>
          <span style="float: right;">100</span>`;
  
        document.querySelector("#predicted_lable").innerHTML = `${data.label}`

        // // Optional: set QR code dynamically
        // document.querySelector(".qr-box img").src = `https://api.qrserver.com/v1/create-qr-code/?data=${data.pid}&size=100x100`;
  
        // Optional: auto-check depression stage
        if (score > 40 && score <= 50) {
          document.querySelectorAll('input[name="stage"]')[0].checked = true;
        } else if (score > 50 && score <= 70) {
          document.querySelectorAll('input[name="stage"]')[1].checked = true;
        } else if (score > 70 && score <= 100){
          document.querySelectorAll('input[name="stage"]')[2].checked = true;
        } else {
          document.querySelectorAll('input[name="stage"]')[0].checked = false;
          document.querySelectorAll('input[name="stage"]')[1].checked = false;
          document.querySelectorAll('input[name="stage"]')[2].checked = false;
        }

        generateWordCloud(user_response);
      }
    })
    .catch(error => {
      console.error("Error fetching user data:", error);
    });
  };
};

function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    type: params.get("type"),
    index: params.get("index"),
  };
}


const colors = ['#3a3a98', '#f9d56e', '#f9a76e', '#a98be8', '#e86d54'];

function generateWordCloud(text){

  console.log("Generating word cloud with text:", text);

  const stopwords = [
    "i", "me", "my", "myself", "we", "our", "ours", "ourselves",
    "you", "your", "yours", "yourself", "yourselves",
    "he", "him", "his", "himself", "she", "her", "hers", "herself",
    "it", "its", "itself", "they", "them", "their", "theirs", "themselves",
    "what", "which", "who", "whom", "this", "that", "these", "those",
    "am", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "having", "do", "does", "did", "doing",
    "a", "an", "the", "and", "but", "if", "or", "because", "as",
    "until", "while", "of", "at", "by", "for", "with", "about", "against",
    "between", "into", "through", "during", "before", "after", "above", "below",
    "to", "from", "up", "down", "in", "out", "on", "off", "over", "under",
    "again", "further", "then", "once", "here", "there", "when", "where",
    "why", "how", "all", "any", "both", "each", "few", "more", "most",
    "other", "some", "such", "no", "nor", "not", "only", "own", "same",
    "so", "than", "too", "very", "can", "will", "just", "don't", "should",
    "now"
  ];

  const wordCloudElement = document.getElementById('wordCloud');
  if (!wordCloudElement) {
    console.error("Word cloud element not found!");
    return;
  }

  if (!text.trim()) {
    console.warn("No text available for word cloud");
    return;
  }

  const sentences = text.split(/[,.!?]/);
  
  let words = [];
  sentences.forEach(sentence => {
    const cleanWords = sentence
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()@\+\?><\[\]\+]/g, '')
      .split(/\s+/);
    words = words.concat(cleanWords);
  });
  
  const filteredWords = words.filter(word => 
    word && word.trim() !== '' && !stopwords.includes(word)
  );
  
  const wordMap = {};
  filteredWords.forEach(word => {
    wordMap[word] = Math.floor(Math.random() * 16) + 20;
  });
  
  let wordList = [];
  
  if (Object.keys(wordMap).length > 0) {
    wordList = Object.entries(wordMap).sort((a, b) => b[1] - a[1]);
  } 
  else if (filteredWords.length > 0) {
    const uniqueWords = [...new Set(filteredWords)];
    
    wordList = uniqueWords.map(word => [
      word, 
      Math.floor(Math.random() * 16) + 20 
    ]);
  }

  wordList = wordList.slice(0, 25);
  
  console.log("Word list for cloud:", wordList);
  
  if (wordList.length > 0) {
    if (typeof WordCloud === 'undefined') {
      console.error("WordCloud library not loaded!");
      return;
    }
    
    wordCloudElement.innerHTML = '';
    
    WordCloud(wordCloudElement, {
      list: wordList,
      gridSize: 16,
      weightFactor: function(size) {
        return Math.min(size * 1.5, 50); 
      },
      fontFamily: 'Arial, sans-serif',
      color: function(word, weight) {
        if (weight >= 35) {
          return '#3a3a98'; 
        } else {
          const index = Math.floor(Math.random() * (colors.length - 1)) + 1;
          return colors[index];
        }
      },
      rotateRatio: 0.5,
      backgroundColor: 'white',
      shape: 'circle',
      minSize: 10
    });
  } else {
    console.warn("No words found to generate word cloud");
    wordCloudElement.innerHTML = '<p>No data available for word cloud</p>';
  }
};

function formatUnixDate(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000); 
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-GB', options);
}