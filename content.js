
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSelectedText') {
    const selectedText = window.getSelection().toString().trim();
    sendResponse({ selectedText });
  }
  
  if (request.action === 'copyToClipboard') {

    try {
      navigator.clipboard.writeText(request.content).then(() => {
        sendResponse({ success: true });
      }).catch(() => {

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
    return true; 
  }
});

let selectionTimeout;
document.addEventListener('mouseup', () => {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  
  if (selectedText.length > 10) { 
    clearTimeout(selectionTimeout);
    selectionTimeout = setTimeout(() => {

      console.log('Text selected that could be saved:', selectedText.substring(0, 50) + '...');
    }, 1000);
  }
});


document.addEventListener('keydown', (e) => {

  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
    e.preventDefault();

    chrome.runtime.sendMessage({ action: 'openPopup' });
  }
});
