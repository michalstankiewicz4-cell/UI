# UI System - File & Folder Structure

**Updated:** 2026-01-15  
**Version:** v2.3  
**Purpose:** Complete file and folder reference

---

## 📂 Root Directory

```
UI/
├── index.html              # Main entry point - open this file
├── main.js                 # Main orchestrator (204 lines)
├── README.md               # Project documentation
├── build.ps1               # Build script (Windows PowerShell)
├── build.sh                # Build script (Linux/Mac bash)
├── core/                   # Central architecture ↓
├── ui/                     # UI library source ↓
├── simulations/            # Placeholder simulations ↓
├── data/                   # Import/Export (future) ↓
├── docs/                   # Documentation ↓
├── themes/                 # Custom themes (future) ↓
└── dist/                   # Built bundle ↓
```

---

## 🎯 Core Files (Root)

### `index.html` - Entry Point
- **Purpose:** Main HTML file - open this to run the application
- **Dependencies:** Links all scripts (core/, ui/, dist/)
- **Usage:** Just open in browser (file:// works!)
- **Canvas elements:** 5 canvases (4 sim layers + 1 UI layer)

### `main.js` - Main Orchestrator
- **Purpose:** Creates windows, initializes system, render loop
- **Lines:** 204
- **Dependencies:** Requires dist/ui.js + core/*.js
- **Key features:**
  - Demo window creation (complete showcase)
  - WindowManager + Taskbar initialization
  - EventRouter setup
  - Main render loop

### `README.md` - Documentation
- **Purpose:** Project overview and quick start guide
- **Lines:** 293
- **Sections:**
  - Quick start
  - Architecture overview
  - Development guide
  - Current status

### Build Scripts

**`build.ps1` (Windows)**
- **Purpose:** Bundles all /ui/ modules into dist/ui.js
- **Usage:** `.\build.ps1`
- **Output:** dist/ui.js (1972 lines)

**`build.sh` (Linux/Mac)**
- **Purpose:** Same as build.ps1 for Unix systems
- **Usage:** `./build.sh`
- **Output:** dist/ui.js (1972 lines)

---

## 🏗️ /core/ - Central Architecture

**Location:** `C:\Users\micha\source\repos\UI\core\`

### `SimulationManager.js`
- **Purpose:** Central controller for all simulations
- **Lines:** 360
- **Features:**
  - Register simulations
  - Add/remove simulation instances
  - Global controls (pause, update, render all)
  - State management

### `EventBus.js`
- **Purpose:** Pub-sub event system
- **Lines:** 192
- **Features:**
  - Event emission
  - Event subscription
  - Loose coupling between components
  - Global event coordination

### `DataBridge.js`
- **Purpose:** Bidirectional data flow (UI ↔ Sim)
- **Lines:** 224
- **Features:**
  - Parameter binding (UI → Sim)
  - Stat binding (Sim → UI)
  - Data synchronization
  - Callback management

### `index.js`
- **Purpose:** Centralny punkt eksportów (entry point)
- **Lines:** ~10
- **Exports:** SimulationManager, EventBus, DataBridge

---

## 🎨 /ui/ - UI Library Source

**Location:** `C:\Users\micha\source\repos\UI\ui\`

### Main Modules

**`BaseWindow.js`**
- **Purpose:** Main window class with all features
- **Lines:** ~445
- **Features:**
  - Dragging
  - Header buttons (Close, Minimize, HUD)
  - Scrollbar
  - Controls (buttons, sliders, toggles, text, sections)
  - Layout cache (OPT-1)
  - Event handling

**`WindowManager.js`**
- **Purpose:** Multi-window management
- **Lines:** ~126
- **Features:**
  - Window registration
  - Z-index management
  - Focus handling
  - Batch rendering
  - Event routing to active window

**`Taskbar.js`**
- **Purpose:** Windows-style taskbar
- **Lines:** ~126
- **Features:**
  - Start menu
  - Window buttons (minimized windows)
  - Section organization
  - Dynamic width calculation
  - Resize-aware positioning (OPT-11)

**`EventRouter.js`**
- **Purpose:** Routes input events to correct targets
- **Lines:** ~144
- **Features:**
  - Mouse event handling
  - Keyboard support (prepared)
  - Wheel scrolling
  - Camera panning
  - Early exit optimization (OPT-7)

**`Styles.js`**
- **Purpose:** Centralized styling definitions
- **Lines:** ~49
- **Features:**
  - Color palette
  - Font definitions
  - Spacing constants
  - Panel styles

---

### /ui/core/ - Core Utilities

**Location:** `C:\Users\micha\source\repos\UI\ui\core\`

**`constants.js`**
- **Purpose:** UI constants and measurements
- **Exports:**
  - HEIGHT_* (button, slider, toggle, etc)
  - SPACING_* (padding, item spacing)
  - SIZE_* (button size)
  - WIDTH_* (scrollbar)
  - CONST object (bundle compatibility)

**`geometry.js`**
- **Purpose:** Geometric utilities
- **Functions:**
  - `rectHit(x, y, rx, ry, rw, rh)` - Rectangle hit testing
  - `clamp(value, min, max)` - Value clamping

**`layout.js`**
- **Purpose:** Layout calculation engine
- **Functions:**
  - `computeLayout(items, window)` - Calculate item positions
  - `getItemHeight(item, window)` - Get item height
- **Used by:** BaseWindow layout cache (OPT-1)

**`text-cache.js`**
- **Purpose:** Text measurement caching
- **Functions:**
  - `measureTextCached(ctx, text, font)` - Cached measurement
  - `clearTextCache()` - Clear cache
- **Cache:** LRU cache, 5000 entries (OPT-6)
- **Impact:** +5-10% cache hit rate

---

### /ui/components/ - UI Components

**Location:** `C:\Users\micha\source\repos\UI\ui\components\`

**`UIItem.js`**
- **Purpose:** Base class for all UI items
- **Lines:** ~30
- **Features:**
  - Hover state
  - getBounds() method
  - Base draw/update methods

**`ButtonItem.js`**
- **Purpose:** Clickable button control
- **Lines:** ~50
- **Features:**
  - Click callback
  - Visual feedback
  - Green border

**`SliderItem.js`**
- **Purpose:** Draggable value slider
- **Lines:** ~95
- **Features:**
  - Min/max/step
  - Dragging with thumb
  - Track click to jump
  - getValue/setValue callbacks
  - Independent drag state (bugfix)

**`ToggleItem.js`**
- **Purpose:** Checkbox-style toggle
- **Lines:** ~45
- **Features:**
  - Boolean state
  - Checkbox visual
  - getValue/setValue callbacks

**`SectionItem.js`**
- **Purpose:** Section header divider
- **Lines:** ~35
- **Features:**
  - Centered text
  - Horizontal lines
  - Visual separator

**`TextItem.js`**
- **Purpose:** Static or dynamic text display
- **Lines:** ~55
- **Features:**
  - Static text
  - Dynamic text (functions)
  - Color support (green/cyan)
  - Word wrap
  - Multi-line

**`header.js`**
- **Purpose:** Window header rendering
- **Functions:**
  - `drawHeader()` - Full header
  - `drawHeaderButtons()` - X, _, ○ buttons
  - `drawMinimizedHeader()` - Minimized state
  - `getHeaderButtonBounds()` - Button hit boxes

**`scrollbar.js`**
- **Purpose:** Scrollbar rendering and logic
- **Functions:**
  - `computeScrollbar()` - Calculate bounds
  - `drawScrollbar()` - Render scrollbar
  - `hitScrollbarThumb()` - Hit test thumb
  - `hitScrollbarTrack()` - Hit test track

---

## 🎮 /simulations/ - Placeholder Simulations

**Location:** `C:\Users\micha\source\repos\UI\simulations\`

### Structure
```
simulations/
├── sim1/
│   ├── Sim1.js          # 2D Particles (114 lines)
│   └── README.md        # Sim1 documentation (26 lines)
├── sim2/
│   ├── Sim2.js          # 3D Cubes (123 lines)
│   └── README.md        # Sim2 documentation (30 lines)
├── sim3/
│   ├── Sim3.js          # Physics Balls (132 lines)
│   └── README.md        # Sim3 documentation (30 lines)
└── sim4/
    ├── Sim4.js          # Cellular Automata (158 lines)
    └── README.md        # Sim4 documentation (30 lines)
```

**Purpose:** Example simulations showing how to integrate with the system

**Each simulation:**
- Exports a class with `init()`, `update()`, `render()`
- Can register with SimulationManager
- Can bind data to UI via DataBridge
- Independent canvas rendering
- Documentation in README.md with description, controls, stats, implementation notes

---

## 💾 /data/ - Import/Export (Future)

**Location:** `C:\Users\micha\source\repos\UI\data\`

### Structure
```
data/
├── README.md           # Import/Export documentation (52 lines)
├── presets/            # Ready-to-use configurations (empty)
└── exports/            # User-exported data (empty)
```

**Purpose:** Reserved for future preset system

**Planned features:**
- Window layout presets
- Simulation configurations
- User data export
- JSON-based storage

### `README.md`
- **Purpose:** Documentation for import/export system
- **Lines:** 52
- **Content:**
  - Description of /presets/ and /exports/ folders
  - Usage examples
  - Future features
  - JSON format specification

---

## 📚 /docs/ - Documentation

**Location:** `C:\Users\micha\source\repos\UI\docs\`

### `TODO.md`
- **Purpose:** Project roadmap and next steps
- **Lines:** 207
- **Sections:**
  - Completed features
  - TODO items (prioritized)
  - Progress timeline
  - Current stats

### `ROADMAP.md`
- **Purpose:** Complete optimization roadmap
- **Lines:** 236
- **Sections:**
  - Completed optimizations (6 commits)
  - Remaining optimizations (9 items, 3 packages)
  - Simulation Window Factory (new feature)
  - Performance predictions

### `CACHE_FIX.md`
- **Purpose:** Browser cache troubleshooting
- **Lines:** 49
- **Sections:**
  - Common cache issues
  - Hard refresh instructions
  - Build verification

### `FILE_STRUCTURE.md`
- **Purpose:** Complete file and folder reference (this document)
- **Lines:** 544
- **Sections:**
  - Detailed file descriptions
  - Usage examples
  - Quick reference tables

### `TREE.md`
- **Purpose:** Visual file tree representation
- **Lines:** 293
- **Sections:**
  - ASCII art directory tree
  - Statistics by folder
  - Navigation guide

### `.gitkeep`
- **Purpose:** Placeholder to keep empty /docs/ in git
- **Lines:** 0

---

## 🎨 /themes/ - Custom Themes (Future)

**Location:** `C:\Users\micha\source\repos\UI\themes\`

**Status:** Empty folder (reserved)

**Purpose:** Custom color schemes and styling

**Planned:**
- Theme JSON files
- Color palette overrides
- Font customization

### `.gitkeep`
- **Purpose:** Placeholder to keep empty /themes/ in git

---

## 📦 /dist/ - Built Bundle

**Location:** `C:\Users\micha\source\repos\UI\dist\`

### `ui.js`
- **Purpose:** Complete UI library in single file
- **Lines:** 1972
- **Size:** ~71 KB
- **Created by:** build.ps1 / build.sh
- **Contains:**
  - All /ui/ modules
  - All /ui/core/ utilities
  - All /ui/components/ items
  - Global UI namespace
  - Text cache (OPT-6: 5000 entries)
  - Layout cache (OPT-1)
  - Event optimizations (OPT-7)

**Usage:**
```html
<script src="dist/ui.js"></script>
<script>
  const manager = new UI.WindowManager();
  const window = new UI.BaseWindow(50, 50, 'Hello');
  window.addText('Hello World!');
  manager.add(window);
</script>
```

---

## 🔧 Hidden Files

### `.git/` - Git Repository
- **Purpose:** Version control
- **Commits:** 111+
- **Branches:** main
- **Remote:** https://github.com/michalstankiewicz4-cell/UI

---

## 📊 Size Summary

| Component | Files | Lines | Size |
|-----------|-------|-------|------|
| **Core** | 5 | 786 | ~31 KB |
| **UI Source** | 17 | ~1400 | ~55 KB |
| **Simulations** | 8 | 643 | ~25 KB |
| **Main** | 1 | 204 | ~8 KB |
| **Docs** | 6 | 1379 | ~55 KB |
| **Data** | 1 | 52 | ~2 KB |
| **Bundle** | 1 | 1972 | ~71 KB |
| **TOTAL** | 39+ | ~6400+ | ~245 KB |

---

## 🎯 Quick Reference

### To Run Application
```
Open: index.html
```

### To Build Bundle
```powershell
# Windows
.\build.ps1

# Linux/Mac
./build.sh
```

### To Add New Simulation
```
1. Create: simulations/mysim/MySim.js
2. Add: simulations/mysim/README.md
3. Edit: main.js (register simulation)
4. Done!
```

### To Add New Window
```javascript
const win = new UI.BaseWindow(x, y, 'Title');
win.addButton('Click', () => alert('Works!'));
windowManager.add(win);
taskbar.addWindowItem('Title', win, 'section');
```

### To Create Control
```javascript
// Button
window.addButton('Label', callback);

// Slider
window.addSlider('Label', getValue, setValue, min, max, step);

// Toggle
window.addToggle('Label', getValue, setValue);

// Section
window.addSection('title');

// Text
window.addText('Content', '#color');
```

---

## 🗂️ File Type Reference

| Extension | Purpose | Count |
|-----------|---------|-------|
| `.js` | JavaScript source | 28 |
| `.md` | Markdown documentation | 11 |
| `.html` | HTML entry point | 1 |
| `.ps1` | PowerShell build script | 1 |
| `.sh` | Bash build script | 1 |
| `.gitkeep` | Git placeholder | 3 |

---

**Last Updated:** 2026-01-15  
**Version:** v2.3
