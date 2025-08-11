// Content script for Quick Copy Data Manager
// Provides additional functionality like auto-detecting selected text

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSelectedText') {
    const selectedText = window.getSelection().toString().trim();
    sendResponse({ selectedText });
  }
  
  if (request.action === 'copyToClipboard') {
    // Fallback copy functionality if popup clipboard API fails
    try {
      navigator.clipboard.writeText(request.content).then(() => {
        sendResponse({ success: true });
      }).catch(() => {
        // Fallback method
        const textArea = document.createElement('textarea');
        textArea.value = request.content;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        sendResponse({ success: successful });
      });
    } catch (err) {
      sendResponse({ success: false, error: err.message });
    }
    return true; // Keep message channel open for async response
  }
});

// Add a subtle visual indicator when text is selected (optional feature)
let selectionTimeout;
document.addEventListener('mouseup', () => {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  
  if (selectedText.length > 10) { // Only for longer selections
    clearTimeout(selectionTimeout);
    selectionTimeout = setTimeout(() => {
      // You could show a small tooltip here suggesting to save the text
      // For now, we'll just log it for debugging
      console.log('Text selected that could be saved:', selectedText.substring(0, 50) + '...');
    }, 1000);
  }
});

// Listen for keyboard shortcuts (Ctrl+Shift+C) to open the extension
document.addEventListener('keydown', (e) => {
  // Check for Ctrl+Shift+C (or Cmd+Shift+C on Mac)
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
    e.preventDefault();
    // Send message to background script to open popup
    chrome.runtime.sendMessage({ action: 'openPopup' });
  }
});
