class QuickCopyManager {
  constructor() {
    this.data = [];
    this.editingId = null;
    this.init();
  }
  
  async init() {
    await this.loadData();
    this.setupEventListeners();
    this.renderData();
  }
  
  async loadData() {
    // Use local storage to allow larger payloads (images as data URLs)
    const localResult = await chrome.storage.local.get(['quickCopyData']);
    let loaded = localResult.quickCopyData || [];
    // Migrate from sync if nothing in local
    if (loaded.length === 0) {
      const syncResult = await chrome.storage.sync.get(['quickCopyData']);
      loaded = syncResult.quickCopyData || [];
      if (loaded.length > 0) {
        await chrome.storage.local.set({ quickCopyData: loaded });
      }
    }
    // Ensure type defaults to text for legacy items
    this.data = loaded.map(item => ({ type: 'text', ...item }));
  }
  
  async saveData() {
    await chrome.storage.local.set({ quickCopyData: this.data });
  }
  
  setupEventListeners() {
    // Add button - ensure it exists before adding listener
    const addBtn = document.getElementById('addBtn');
    if (addBtn) {
      addBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.showModal();
      });
    }
    
    // Cancel button
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.hideModal();
      });
    }
    
    // Form submission
    const dataForm = document.getElementById('dataForm');
    if (dataForm) {
      dataForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveItem();
      });
    }
    
    // Save button click handler (backup)
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.saveItem();
      });
    }
    
    // Search functionality
    const searchBox = document.getElementById('searchBox');
    if (searchBox) {
      searchBox.addEventListener('input', (e) => {
        this.renderData(e.target.value);
      });
    }
    
    // Close modal when clicking outside
    const modal = document.getElementById('modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target.id === 'modal') {
          this.hideModal();
        }
      });
    }

    // Type select and image controls
    const typeSelect = document.getElementById('typeSelect');
    const textControls = document.getElementById('textControls');
    const imageControls = document.getElementById('imageControls');
    const titleInput = document.getElementById('titleInput');
    const contentInput = document.getElementById('contentInput');
    const imageUrlInput = document.getElementById('imageUrlInput');
    const titleError = document.getElementById('titleError');
    const contentError = document.getElementById('contentError');
    const imageError = document.getElementById('imageError');
    const dropZone = document.getElementById('dropZone');
    const imageFileInput = document.getElementById('imageFileInput');
    const imagePreview = document.getElementById('imagePreview');
    const imagePreviewWrapper = document.getElementById('imagePreviewWrapper');

    this.selectedImageDataUrl = null;

    if (typeSelect) {
      typeSelect.addEventListener('change', () => {
        const isImage = typeSelect.value === 'image';
        if (textControls) textControls.style.display = isImage ? 'none' : 'block';
        if (imageControls) imageControls.style.display = isImage ? 'block' : 'none';
        if (contentInput) contentInput.required = !isImage;
        // Clear validation states on switch
        [contentInput, imageUrlInput].forEach(el => el && el.classList.remove('invalid'));
        if (contentError) contentError.style.display = 'none';
        if (imageError) imageError.style.display = 'none';
      });
    }

    // Clear errors while typing
    if (titleInput) {
      titleInput.addEventListener('input', () => {
        titleInput.classList.remove('invalid');
        if (titleError) titleError.style.display = 'none';
      });
    }
    if (contentInput) {
      contentInput.addEventListener('input', () => {
        contentInput.classList.remove('invalid');
        if (contentError) contentError.style.display = 'none';
      });
    }
    if (imageUrlInput) {
      imageUrlInput.addEventListener('input', () => {
        imageUrlInput.classList.remove('invalid');
        if (imageError) imageError.style.display = 'none';
      });
    }

    const handleFile = async (file) => {
      if (!file || !file.type || !file.type.startsWith('image/')) return;
      const dataUrl = await this.readFileAsDataUrl(file);
      this.selectedImageDataUrl = dataUrl;
      if (imagePreview) imagePreview.src = dataUrl;
      if (imagePreviewWrapper) imagePreviewWrapper.style.display = 'block';
      if (imageUrlInput) imageUrlInput.classList.remove('invalid');
      if (imageError) imageError.style.display = 'none';
    };

    if (dropZone && imageFileInput) {
      dropZone.addEventListener('click', () => imageFileInput.click());
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
      });
      dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
      dropZone.addEventListener('drop', async (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        await handleFile(file);
      });
      imageFileInput.addEventListener('change', async () => {
        const file = imageFileInput.files && imageFileInput.files[0];
        await handleFile(file);
      });
    }
  }
  
  showModal(item = null) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const titleInput = document.getElementById('titleInput');
    const contentInput = document.getElementById('contentInput');
    const typeSelect = document.getElementById('typeSelect');
    const textControls = document.getElementById('textControls');
    const imageControls = document.getElementById('imageControls');
    const imageUrlInput = document.getElementById('imageUrlInput');
    const imagePreview = document.getElementById('imagePreview');
    const imagePreviewWrapper = document.getElementById('imagePreviewWrapper');
    
    if (!modal || !modalTitle || !titleInput || !contentInput) {
      console.error('Modal elements not found');
      return;
    }
    
    if (item) {
      modalTitle.textContent = 'Edit Data';
      titleInput.value = item.title || '';
      const isImage = item.type === 'image';
      if (typeSelect) typeSelect.value = isImage ? 'image' : 'text';
      if (textControls) textControls.style.display = isImage ? 'none' : 'block';
      if (imageControls) imageControls.style.display = isImage ? 'block' : 'none';
      if (isImage) {
        this.selectedImageDataUrl = item.imageKind === 'dataUrl' ? item.imageSrc : null;
        if (imageUrlInput) imageUrlInput.value = item.imageKind === 'url' ? (item.imageSrc || '') : '';
        if (imagePreview && imagePreviewWrapper) {
          if (item.imageKind === 'dataUrl') {
            imagePreview.src = item.imageSrc;
            imagePreviewWrapper.style.display = 'block';
          } else {
            imagePreviewWrapper.style.display = 'none';
          }
        }
      } else {
        contentInput.value = item.content || '';
      }
      this.editingId = item.id;
    } else {
      modalTitle.textContent = 'Add New Data';
      titleInput.value = '';
      contentInput.value = '';
      if (typeSelect) typeSelect.value = 'text';
      if (textControls) textControls.style.display = 'block';
      if (imageControls) imageControls.style.display = 'none';
      if (imageUrlInput) imageUrlInput.value = '';
      if (imagePreviewWrapper) imagePreviewWrapper.style.display = 'none';
      this.selectedImageDataUrl = null;
      this.editingId = null;
    }
    
    modal.style.display = 'block';
    titleInput.focus();
  }
  
  hideModal() {
    const modal = document.getElementById('modal');
    if (modal) {
      modal.style.display = 'none';
    }
    this.editingId = null;
  }
  
  async saveItem() {
    const titleInput = document.getElementById('titleInput');
    const contentInput = document.getElementById('contentInput');
    const typeSelect = document.getElementById('typeSelect');
    const imageUrlInput = document.getElementById('imageUrlInput');
    const titleError = document.getElementById('titleError');
    const contentError = document.getElementById('contentError');
    const imageError = document.getElementById('imageError');
    
    if (!titleInput) return;
    const title = titleInput.value.trim();
    const type = typeSelect ? typeSelect.value : 'text';

    // Reset validation states
    [titleInput, contentInput, imageUrlInput].forEach(el => el && el.classList.remove('invalid'));
    [titleError, contentError, imageError].forEach(el => el && (el.style.display = 'none'));

    // Validate required fields
    let hasError = false;
    if (!title) {
      titleInput.classList.add('invalid');
      if (titleError) titleError.style.display = 'block';
      hasError = true;
    }

    if (type === 'text') {
      if (!contentInput) return;
      const content = contentInput.value.trim();
      if (!content) {
        contentInput.classList.add('invalid');
        if (contentError) contentError.style.display = 'block';
        hasError = true;
      }
      if (hasError) return;
      if (this.editingId) {
        const index = this.data.findIndex(item => item.id === this.editingId);
        if (index !== -1) {
          this.data[index] = { ...this.data[index], type: 'text', title, content };
        }
      } else {
        const newItem = { id: Date.now().toString(), type: 'text', title, content, createdAt: new Date().toISOString() };
        this.data.unshift(newItem);
      }
    } else {
      // Image
      const imageSrc = this.selectedImageDataUrl || (imageUrlInput ? imageUrlInput.value.trim() : '');
      const imageKind = this.selectedImageDataUrl ? 'dataUrl' : (imageSrc ? 'url' : null);
      if (!imageSrc || !imageKind) {
        if (imageUrlInput) imageUrlInput.classList.add('invalid');
        if (imageError) imageError.style.display = 'block';
        return;
      }
      // If any previous validation errors (e.g., missing title), block save
      if (hasError) return;
      if (this.editingId) {
        const index = this.data.findIndex(item => item.id === this.editingId);
        if (index !== -1) {
          this.data[index] = { ...this.data[index], type: 'image', title, imageSrc, imageKind };
        }
      } else {
        const newItem = { id: Date.now().toString(), type: 'image', title, imageSrc, imageKind, createdAt: new Date().toISOString() };
        this.data.unshift(newItem);
      }
    }

    await this.saveData();
    this.renderData();
    this.hideModal();
  }
  
  async deleteItem(id) {
    if (confirm('Are you sure you want to delete this item?')) {
      this.data = this.data.filter(item => item.id !== id);
      await this.saveData();
      this.renderData();
    }
  }
  
  async copyToClipboard(content) {
    try {
      await navigator.clipboard.writeText(content);
      this.showCopiedNotification();
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showCopiedNotification();
    }
  }
  
  showCopiedNotification() {
    const notification = document.getElementById('copiedNotification');
    if (notification) {
      notification.classList.add('show');
      setTimeout(() => {
        notification.classList.remove('show');
      }, 2000);
    }
  }
  
  renderData(searchTerm = '') {
    const dataList = document.getElementById('dataList');
    const emptyState = document.getElementById('emptyState');
    
    if (!dataList || !emptyState) return;
    
    let filteredData = this.data;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredData = this.data.filter(item => {
        if ((item.title || '').toLowerCase().includes(term)) return true;
        if (item.type === 'text') return (item.content || '').toLowerCase().includes(term);
        if (item.type === 'image') return (item.imageSrc || '').toLowerCase().includes(term);
        return false;
      });
    }
    
    if (filteredData.length === 0) {
      dataList.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }
    
    emptyState.style.display = 'none';
    
    dataList.innerHTML = filteredData.map(item => {
      const isImage = item.type === 'image';
      const contentHtml = isImage
        ? `<img src="${item.imageSrc}" alt="${this.escapeHtml(item.title)}" style="max-width:100%;max-height:140px;border-radius:8px;border:1px solid #dee2e6;"/>`
        : this.escapeHtml(item.content || '');
      return `
      <div class="data-item" data-id="${item.id}" data-type="${item.type}">
        <div class="item-actions">
          <button class="action-btn copy-btn" data-action="copy" data-id="${item.id}" title="Copy">📋</button>
          <button class="action-btn edit-btn" data-action="edit" data-id="${item.id}" title="Edit">✏️</button>
          <button class="action-btn delete-btn" data-action="delete" data-id="${item.id}" title="Delete">🗑️</button>
        </div>
        <div class="item-title">${this.escapeHtml(item.title)}</div>
        <div class="item-content">${contentHtml}</div>
      </div>`;
    }).join('');
    
    // Add event listeners for action buttons
    dataList.querySelectorAll('.action-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const action = button.getAttribute('data-action');
        const id = button.getAttribute('data-id');
        const item = this.data.find(d => d.id === id);
        if (!item) return;
        switch (action) {
          case 'copy':
            if (item.type === 'image') this.copyImageToClipboard(item.imageSrc);
            else this.copyToClipboard(item.content || '');
            break;
          case 'edit':
            this.showModal(item);
            break;
          case 'delete':
            this.deleteItem(id);
            break;
        }
      });
    });
    
    // Add click to copy functionality for the entire item
    dataList.querySelectorAll('.data-item').forEach(item => {
      item.addEventListener('click', (e) => {
        // Don't trigger if clicking on action buttons
        if (e.target.classList.contains('action-btn')) return;
        
        const id = item.getAttribute('data-id');
        const dataItem = this.data.find(d => d.id === id);
        if (dataItem) {
          if (dataItem.type === 'image') this.copyImageToClipboard(dataItem.imageSrc);
          else this.copyToClipboard(dataItem.content || '');
        }
      });
    });
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async copyImageToClipboard(src) {
    try {
      if (!navigator.clipboard || !window.ClipboardItem) throw new Error('unsupported');
      const response = await fetch(src);
      const blob = await response.blob();
      const item = new ClipboardItem({ [blob.type]: blob });
      await navigator.clipboard.write([item]);
      this.showCopiedNotification();
    } catch (e) {
      // Fallback: copy URL/text
      await this.copyToClipboard(src);
    }
  }
}

// Initialize the manager when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  window.manager = new QuickCopyManager();
});
