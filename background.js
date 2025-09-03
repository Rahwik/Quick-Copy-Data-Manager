
chrome.runtime.onInstalled.addListener(() => {
  console.log('Quick Copy Data Manager installed');
  

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


chrome.commands.onCommand.addListener((command) => {
  if (command === "_execute_action") {
    console.log('Quick Copy shortcut activated');
    

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.action.openPopup();
      }
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getData') {
    chrome.storage.sync.get(['quickCopyData'], (result) => {
      sendResponse({ data: result.quickCopyData || [] });
    });
    return true; 
  }
  
  if (request.action === 'copyToClipboard') {

    console.log('Copy request received:', request.content);
    sendResponse({ success: true });
  }
  
  if (request.action === 'openPopup') {

    chrome.action.openPopup();
    sendResponse({ success: true });
  }
});


chrome.action.onClicked.addListener((tab) => {

  console.log('Extension icon clicked');
});
