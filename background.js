// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Quick Copy Data Manager installed');
  
  // Set up default data if needed
  chrome.storage.sync.get(['quickCopyData'], (result) => {
    if (!result.quickCopyData) {
      chrome.storage.sync.set({
        quickCopyData: [
          {
            id: 'welcome',
            title: 'Welcome to Quick Copy!',
            content: 'This is your first data snippet. Click the copy button to copy this text to your clipboard.',
            createdAt: new Date().toISOString()
          }
        ]
      });
    }
  });
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === "_execute_action") {
    console.log('Quick Copy shortcut activated');
    
    // Get the current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        // Open the popup by clicking the extension icon
        chrome.action.openPopup();
      }
    });
  }
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getData') {
    chrome.storage.sync.get(['quickCopyData'], (result) => {
      sendResponse({ data: result.quickCopyData || [] });
    });
    return true; // Keep the message channel open for async response
  }
  
  if (request.action === 'copyToClipboard') {
    // This will be handled by the popup, but we can add logging
    console.log('Copy request received:', request.content);
    sendResponse({ success: true });
  }
  
  if (request.action === 'openPopup') {
    // Open the popup when requested from content script
    chrome.action.openPopup();
    sendResponse({ success: true });
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // This will automatically open the popup due to manifest configuration
  console.log('Extension icon clicked');
});
