## Quick Copy Data Manager

A polished Chrome extension to store, search, and quickly copy your frequently used text and images. Optimized for speed, simplicity, and a clean monochrome aesthetic.

### Highlights

- **Text + Image snippets**: Save plain text or images (via drag-and-drop, file picker, or URL)
- **Instant copy**: Click an item or use the 📋 button to copy
- **Keyboard shortcut**: Launch the popup with Alt+X (customizable)
- **Fast search**: Filter by title, text content, or image URL
- **Robust UI**: Validation, sticky save bar, and consistent monochrome theme
- **Local-first storage**: Uses Chrome local storage for larger data (with migration from sync)

## Installation

1. Download or clone this repository to your computer
2. Open Google Chrome and navigate to `chrome://extensions/`
3. Enable “Developer mode” (top-right toggle)
4. Click “Load unpacked” and select the folder containing this project (the one with `manifest.json`)
5. The extension icon will appear in your toolbar

### Optional: Pin the extension
- Click the puzzle icon in Chrome’s toolbar → pin “Quick Copy Data Manager” for one-click access

## Usage

### Open the popup
- Click the toolbar icon, or press Alt+X (see Keyboard Shortcuts below)

### Add a new item
1. Click “+ Add New”
2. Choose a **Type**:
   - **Text**: Enter a Title and Content
   - **Image**: Enter a Title, then either:
     - Drag-and-drop an image onto the drop zone
     - Click the drop zone to select a file
     - OR paste an Image URL (e.g., `https://...`)
3. Click Save

Validation rules:
- **Text**: Title and Content are required
- **Image**: Title and either an uploaded image (file/drag-drop) or a valid URL are required
- If anything is missing, you’ll see inline warnings and Save will be blocked

### Copy, edit, delete
- **Copy**: Click the item card or the 📋 button
  - For images, the extension tries to write the image to the clipboard (OS/browser support required). If not supported, it copies the image URL/data URL as text
- **Edit**: ✏️ opens the modal with the item prefilled
- **Delete**: 🗑️ asks for confirmation before removal

### Search
- Use the search box to filter by title, text content, or image URL

## Keyboard Shortcuts

The extension defines a suggested shortcut to open the popup:

```json
{
  "commands": {
    "_execute_action": {
      "suggested_key": {
        "default": "Alt+X",
        "mac": "Alt+X"
      },
      "description": "Open Quick Copy popup"
    }
  }
}
```

Notes:
- Chrome may not always accept a suggested binding. Set or change the shortcut at `chrome://extensions/shortcuts`
- Some bindings can conflict with system or other app shortcuts

## Data & Storage

- Uses `chrome.storage.local` for larger capacity (ideal for images stored as data URLs)
- On first run after upgrading, data migrates from `chrome.storage.sync` → `local` automatically
- Your data is stored locally on your machine and is not sent anywhere by this extension

### Limits and tips
- `storage.local` offers significantly more room than `storage.sync`, but very large images will still consume space
- Prefer moderate-resolution images if you plan to store many
- When using URLs, the image is not stored, just the link

## UI/UX Details

- **Monochrome theme** with subtle gradients
- **Sticky modal footer**: Save/Cancel remain visible even with large content
- **Inline validation** with red outlines and messages
- **Consistent roundness** for inputs and the Type selector
- **Footer branding**: “Developed by Rahul Prasad” with a link to his GitHub

## Project Structure

```
Autofill/
├─ background.js     # Service worker: commands, default data, open popup
├─ content.js        # Page helpers (selection, fallback clipboard path)
├─ manifest.json     # MV3 manifest + commands
├─ popup.html        # Popup UI (monochrome design, modal)
├─ popup.js          # Popup logic (CRUD, copy, validation, image support)
└─ README.md         # This file
```

### Key files at a glance

- `popup.html`: Layout, styles, and the add/edit modal
- `popup.js`:
  - Uses `chrome.storage.local` with migration from sync
  - Supports Text and Image types
  - Drag-and-drop, file picker, and URL inputs for images
  - Clipboard support for text and images (with graceful fallback)
  - Inline validation, sticky footer, and search
- `background.js`: Handles install events, keyboard commands, and message routing
- `content.js`: Provides optional helpers (e.g., selected text, clipboard fallback path)

## Development

### Prerequisites
- Google Chrome 88+ (MV3)
- No build step required; plain HTML/CSS/JS

### Run locally
1. Open `chrome://extensions/`
2. Enable “Developer mode”
3. “Load unpacked” → select the project folder
4. After making changes, click the “Reload” button on the extension card

### Linting and formatting
- Keep HTML/CSS/JS consistent with the existing style
- Prefer meaningful names, early returns, and readable control flow

## Troubleshooting

- **Shortcut doesn’t open the popup**:
  - Set or change the shortcut in `chrome://extensions/shortcuts`
  - Ensure it doesn’t conflict with system/global shortcuts

- **Copy image to clipboard doesn’t work**:
  - Clipboard image support varies by OS/Chrome version
  - The extension falls back to copying the image URL/data URL as text

- **Local file paths for images**:
  - Chrome cannot read arbitrary `file://` paths in the popup for security reasons
  - Use drag-and-drop or the file picker to embed the image as a data URL

- **Storage appears full**:
  - Large images can consume significant space. Prefer image URLs or smaller images

## Privacy & Permissions

- **Permissions used**: `storage`, `activeTab`
- **Content script**: Runs on all pages to enable convenience features (e.g., selected text, clipboard fallback)
- **Data privacy**: Your snippets stay in Chrome storage on your machine; the extension does not send your data elsewhere

## Attribution

- Developed by Rahul Prasad — GitHub: `https://github.com/Rahwik`

## License

MIT License