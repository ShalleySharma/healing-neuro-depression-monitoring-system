// Enable/Disable Extension on Current Application
document.getElementById('toggle').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = new URL(tabs[0].url);
        const domain = url.hostname;

        // Check if monitoring is enabled for this domain
        chrome.storage.local.get(['disabledDomains'], (result) => {
            const disabledDomains = result.disabledDomains || [];
            if (disabledDomains.includes(domain)) {
                // Enable monitoring
                const updatedDomains = disabledDomains.filter(d => d !== domain);
                chrome.storage.local.set({ disabledDomains: updatedDomains });
                alert(`Monitoring enabled for ${domain}`);

            } else {
                // Disable monitoring
                disabledDomains.push(domain);
                chrome.storage.local.set({ disabledDomains });
                alert(`Monitoring disabled for ${domain}`);
            }
        });
    });
});

// Open Dashboard
document.getElementById('dashboard').addEventListener('click', () => {
    chrome.tabs.create({ url: './Dashboard/index.html' });
});

// Open Healing Neuro Website
document.getElementById('website').addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:5500/HTML/index.html' });      // python -m http.server 5500 - In DMS terminal
});

