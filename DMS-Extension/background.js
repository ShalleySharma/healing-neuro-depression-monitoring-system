console.log("DMS Extension: Background script is active!");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Start");

    if (message.type === "textCapture") {
        console.log("Background received:", message.data);
        sendResponse({ status: "Received" });

        chrome.storage.local.get(['dailyText'], (result) => {
            let storedText = result.dailyText || "";

            let newText = message.data.trim();
            let storedWords = storedText.split(/\s+/);  
            let newWords = newText.split(/\s+/); 

            let storedSnippet = storedWords.slice(-newWords.length).join(" ");
            if (storedSnippet === newText) {
                console.log("Duplicate detected, not adding:", newText);
                return; 
            }

            storedWords = storedWords.concat(newWords.filter(word => !storedWords.includes(word)));

            let cleanedText = storedWords.join(" ").trim(); 

            chrome.storage.local.set({ dailyText: cleanedText }, () => {
                chrome.storage.local.get(['dailyText'], (updatedResult) => {
                    try {
                        let text = updatedResult.dailyText || "";
                        console.log("Raw dailyText before cleaning:", text);

                        if (typeof text !== "string") {
                            console.error("Invalid dailyText detected, resetting...");
                            text = ""; 
                        }

                        const processedText = preprocessText(text);
                        chrome.storage.local.set({ cleanedText: processedText });

                        console.log("Cleaned Text: ", processedText);
                    } catch (error) {
                        console.error("Error during text cleaning:", error);
                    }
                });
            });
        });
    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.active) {
        console.log("Successfully injected script")
        chrome.scripting.executeScript({
            target: { tabId: tabId, allFrames: true },
            files: ["content.js"]
        }).catch(error => console.error("Error injecting script:", error));
    }
});

function preprocessText(text) {
    const stopWords = ['is', 'and', 'the', 'to', 'a', 'in', 'of', 'for', 'on', 'at', 'with']; 
    console.log("The Preprocessing phase");
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, '') 
        .split(' ')
        .filter(word => !stopWords.includes(word) && word.trim() !== '')
        .join(' ');
}

// Schedule analysis to trigger at midnight
const now = new Date();
const nextMidnight = new Date(now);
nextMidnight.setHours(0, 0, 0, 0);  
if (now.getTime() > nextMidnight.getTime()) {
    nextMidnight.setDate(nextMidnight.getDate() + 1); 
}
// chrome.alarms.create('dailyAnalysis', { when: nextMidnight.getTime(), periodInMinutes: 1440 });    // 1440 = 24 hrs
// console.log("Scheduled daily analysis at midnight:", nextMidnight);

chrome.alarms.getAll((alarms) => {
    console.log("Current Alarms:", alarms);
});

chrome.alarms.create('dailyAnalysis', { periodInMinutes: 1 });   

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'dailyAnalysis') {
        console.log("Triggered daily analysis");
        performDailyAnalysis();
    }
});

async function performDailyAnalysis() {
    chrome.storage.local.get(['cleanedText'], async (result) => {
        console.log("PDA - Cleaned Text:", result.cleanedText);

        if (!result.cleanedText || result.cleanedText.trim() === "") {
            console.warn("No text captured today. Skipping analysis.");
            return;
        }

        try {
            const analysis = await sendToMLModel(result.cleanedText, "NainaS25");
            saveAnalysis(analysis);
            resetDailyStorage();
        } catch (error) {
            console.error("Error in performDailyAnalysis:", error);
        }
    });
}


function resetDailyStorage() {
    console.log("Resetting daily storage...");
    chrome.storage.local.remove(['dailyText', 'cleanedText'], () => {
        console.log("Storage reset complete.");
    });
}


function saveAnalysis(analysis) {
    chrome.storage.local.get(['dailyReports'], (result) => {
        const reports = result.dailyReports || [];
        const today = new Date().toDateString();
        
        reports.push({ date: today, analysis });
        chrome.storage.local.set({ dailyReports: reports }, () => {
            console.log("Analysis saved for:", today);
        });
    });
} 

async function sendToMLModel(text, username) {

    console.log(username);

    if (!username || !text) {
        console.error("Username or text is missing.");
        return { error: "Missing username or text" };
    }
    
    try {
        console.log("Sending text to ML Model:", text);

        const response = await fetch('http://127.0.0.1:5000/analyze', {   
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, username })
        });

        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const responseData = await response.json(); 
        console.log("API Response:", responseData);
        return responseData;

    } catch (error) {
        console.error("ML Model API Error:", error);
        return { error: "Analysis failed" };
    }
}
