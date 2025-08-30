if (window.__dmsInjected) {
    console.log("DMS Extension: Content script already injected, skipping...");
} else {
    window.__dmsInjected = true; 

    console.log("DMS Extension: Content script is active!");

    let trackingEnabled = true; 
    let debounceTimer; 
    const DEBOUNCE_DELAY = 2000;
    let lastCapturedText = "";

    const captureInput = (e) => {        
        if (!trackingEnabled) return; 
        
        if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT' || e.target.isContentEditable) {
        clearTimeout(debounceTimer);

            debounceTimer = setTimeout(() => {
                console.log("Capturing Starts");

                let text = e.target.isContentEditable ? e.target.innerText.trim() : e.target.value.trim();

                if (text && text !== lastCapturedText) {
                    lastCapturedText = text; // Update last captured text
                    console.log("Captured text:", text);
                    sendCapturedText(text);

                    try {
                        chrome.runtime.sendMessage({ type: "textCapture", data: text }, (response) => {
                            if (chrome.runtime.lastError) {
                                console.warn("Direct message failed, using postMessage...");
                                window.postMessage({ type: "textCaptureFallback", data: text }, "*");
                            }
                        });
                    } catch (error) {
                        console.error("Error in sending message:", error);
                    }
                }
            }, DEBOUNCE_DELAY);
        }
    };

    function sendCapturedText(text) {
        console.log("Sending captured text:", text);  
        try {
            chrome.runtime.sendMessage({ type: "textCapture", data: text }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error("Message send failed:", chrome.runtime.lastError.message);
                } else {
                    console.log("Message sent successfully, response:", response);
                }
            });
        } catch (e) {
            console.error("Unexpected error in sendCapturedText:", e);
        }
    }

    function attachInputListeners(node) {
    
        if (!node) {
            console.log("Not a valid node");
            return;
        }
    
        if (node.nodeType === 1) { // Process only element nodes
            if (node.tagName === "TEXTAREA" || node.tagName === "INPUT" || node.isContentEditable) {
                node.addEventListener('input', captureInput, true);
            }
    
            if (node.shadowRoot) {                
                node.shadowRoot.querySelectorAll('textarea, input, [contenteditable="true"], div[role="textbox"]').forEach(el => {
                    console.log("Shadow DOM Text Input:", el);
                    el.addEventListener('input', captureInput, true);
                });
    
                node.shadowRoot.childNodes.forEach(attachInputListeners);
            }
    
            if (node.getAttribute && node.getAttribute("role") === "textbox") {
                node.addEventListener('input', captureInput, true);
            }
        }
    
        if (node.tagName === 'IFRAME') {
            try {
                let iframeDoc = node.contentDocument || node.contentWindow.document;
                if (iframeDoc) {
                    iframeDoc.querySelectorAll('textarea, input, [contenteditable="true"], div[role="textbox"]').forEach(el => {
                        console.log("Capturing Inside Iframe:", el);
                        el.addEventListener('input', captureInput, true);
                    });
                }
            } catch (error) {
                console.warn("Cannot access iframe due to cross-origin restrictions:", error);
            }
        }
    }

    // Secondly this gets executed
    document.querySelectorAll('textarea, input, [contenteditable="true"]').forEach(el => {       
        attachInputListeners(el);
    });

    const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) { 
                    attachInputListeners(node);
                }
            });

            if (mutation.type === "childList" && mutation.target) {
                attachInputListeners(mutation.target);
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Enable/disable tracking based on storage value
    chrome.storage.local.get(['disabledDomains'], (result) => {
        const disabledDomains = result.disabledDomains || [];
        const url = window.location.hostname;

        if (disabledDomains.includes(url)) {
            trackingEnabled = false; 
            console.log("DMS Extension: Tracking is disabled on this site.");
        } else {
            trackingEnabled = true; 
            console.log("DMS Extension: Tracking is enabled on this site.");
        }
    });

    // Listen for messages to toggle tracking
    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === "toggleTracking") {
            trackingEnabled = message.enabled;
            console.log(`DMS Extension: Tracking is now ${trackingEnabled ? "enabled" : "disabled"}.`);
        }
    });
}

/** MENIFEST JSON
 * 
 * "host_permissions": ["<all_urls>"],
 * "exclude_matches": [
            "https://www.google.com/*",
            "https://chrome.google.com/*"
        ],
*/