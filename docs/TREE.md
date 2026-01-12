# UI System - Visual File Tree

**Generated:** 2026-01-12  
**Version:** v2.2  
**Total Files:** 43

---

## 📂 Complete Directory Tree

```
UI/
│
├── 📄 index.html              ← Main entry point (open this!)
├── 📄 main.js                 ← Main orchestrator (204 lines)
├── 📄 README.md               ← Project documentation
├── 📄 build.ps1               ← Build script (Windows)
├── 📄 build.sh                ← Build script (Linux/Mac)
│
├── 📁 core/                   ← Central Architecture (776 lines)
│   ├── SimulationManager.js   ← Sim controller (360 lines)
│   ├── EventBus.js            ← Pub-sub events (192 lines)
│   ├── DataBridge.js          ← Data flow (224 lines)
│   └── index.js               ← Exports (~10 lines)
│
├── 📁 ui/                     ← UI Library Source (~1400 lines)
│   │
│   ├── BaseWindow.js          ← Main window class (~445 lines)
│   ├── WindowManager.js       ← Multi-window manager (~126 lines)
│   ├── Taskbar.js             ← Windows-style taskbar (~126 lines)
│   ├── EventRouter.js         ← Event routing (~144 lines)
│   ├── Styles.js              ← Style definitions (~49 lines)
│   │
│   ├── 📁 core/               ← Core Utilities
│   │   ├── constants.js       ← UI constants & measurements
│   │   ├── geometry.js        ← Hit testing, clamping
│   │   ├── layout.js          ← Layout engine (OPT-1)
│   │   └── text-cache.js      ← Text measurement cache (OPT-6)
│   │
│   └── 📁 components/         ← UI Components
│       ├── UIItem.js          ← Base item class
│       ├── ButtonItem.js      ← Button control
│       ├── SliderItem.js      ← Slider control
│       ├── ToggleItem.js      ← Toggle control
│       ├── SectionItem.js     ← Section divider
│       ├── TextItem.js        ← Text display
│       ├── header.js          ← Window header rendering
│       └── scrollbar.js       ← Scrollbar rendering
│
├── 📁 simulations/            ← Placeholder Simulations (527 lines)
│   ├── 📁 sim1/               ← 2D Particles
│   │   ├── Sim1.js            ← (114 lines)
│   │   └── README.md
│   │
│   ├── 📁 sim2/               ← 3D Cubes
│   │   ├── Sim2.js            ← (123 lines)
│   │   └── README.md
│   │
│   ├── 📁 sim3/               ← Physics Balls
│   │   ├── Sim3.js            ← (132 lines)
│   │   └── README.md
│   │
│   └── 📁 sim4/               ← Cellular Automata
│       ├── Sim4.js            ← (158 lines)
│       └── README.md
│
├── 📁 ui-config/              ← Configuration Layer (467 lines)
│   ├── windows.js             ← Window setup (146 lines)
│   ├── controls.js            ← Control callbacks (121 lines)
│   └── sync.js                ← Cross-sim sync (200 lines)
│
├── 📁 data/                   ← Import/Export (Future)
│   ├── README.md              ← Import/Export docs
│   ├── 📁 presets/            ← Ready configs (empty)
│   │   └── .gitkeep
│   └── 📁 exports/            ← User data (empty)
│       └── .gitkeep
│
├── 📁 docs/                   ← Documentation (777 lines)
│   ├── TODO.md                ← Roadmap (207 lines)
│   ├── ROADMAP.md             ← Optimization roadmap (236 lines)
│   ├── FILE_STRUCTURE.md      ← This document (544 lines)
│   ├── CACHE_FIX.md           ← Cache troubleshooting (49 lines)
│   ├── GITHUB_SETUP.md        ← GitHub setup (35 lines)
│   └── .gitkeep
│
├── 📁 themes/                 ← Custom Themes (Future, empty)
│   └── .gitkeep
│
├── 📁 dist/                   ← Built Bundle
│   └── ui.js                  ← Complete bundle (1972 lines, ~71 KB)
│
└── 📁 .git/                   ← Git Repository (108+ commits)
```

---

## 📊 Statistics by Folder

| Folder | Files | Lines | Purpose |
|--------|-------|-------|---------|
| **core/** | 4 | 776 | Central architecture |
| **ui/** | 5 | ~890 | Main UI modules |
| **ui/core/** | 4 | ~200 | Core utilities |
| **ui/components/** | 8 | ~350 | UI controls |
| **simulations/** | 8 | 527 | Example sims |
| **ui-config/** | 3 | 467 | Configuration |
| **docs/** | 6 | 777 | Documentation |
| **data/** | 3 | - | Future (empty) |
| **themes/** | 1 | - | Future (empty) |
| **dist/** | 1 | 1972 | Bundle |
| **Root** | 12+ | 204+ | Main files |
| **TOTAL** | **55+** | **~6000+** | Full project |

---

## 🎯 Key Paths

### To Run
```
📄 index.html
```

### To Build
```
📄 build.ps1   (Windows)
📄 build.sh    (Linux/Mac)
```

### Bundle Output
```
📁 dist/
└── ui.js      (1972 lines)
```

### Documentation
```
📁 docs/
├── TODO.md              ← What's next
├── ROADMAP.md           ← Optimization plan
├── FILE_STRUCTURE.md    ← This file
├── CACHE_FIX.md         ← Troubleshooting
└── GITHUB_SETUP.md      ← GitHub guide
```

---

## 🔍 Find Files By Type

### JavaScript Source
```
core/*.js              (4 files)
ui/*.js                (5 files)
ui/core/*.js           (4 files)
ui/components/*.js     (8 files)
simulations/*/*.js     (4 files)
ui-config/*.js         (3 files)
main.js                (1 file)
---
TOTAL: 29 .js files
```

### Documentation
```
docs/*.md              (5 files)
simulations/*/*.md     (4 files)
data/*.md              (1 file)
README.md              (1 file)
---
TOTAL: 11 .md files
```

### Build Scripts
```
build.ps1              (PowerShell)
build.sh               (Bash)
```

### HTML
```
index.html             (Entry point)
```

---

## 🌳 Tree Command Used

```powershell
tree /F /A > tree.txt
```

**Flags:**
- `/F` - Shows files (not just folders)
- `/A` - Uses ASCII characters (portable)

---

## 📦 What Goes Where?

### New Simulation?
```
📁 simulations/newsim/
├── NewSim.js          ← Your simulation code
└── README.md          ← Description
```

### New UI Component?
```
📁 ui/components/
└── NewItem.js         ← Your component (extends UIItem)
```

### New Documentation?
```
📁 docs/
└── YOUR_DOC.md        ← Your documentation
```

### New Preset?
```
📁 data/presets/
└── preset.json        ← Your configuration
```

### New Theme?
```
📁 themes/
└── theme.json         ← Your color scheme
```

---

## 🚫 What NOT to Edit

**Do NOT edit these files directly:**
```
❌ dist/ui.js           (Auto-generated by build script)
❌ .git/*               (Git internals)
❌ tree.txt             (Temporary file)
```

**Edit source files instead:**
```
✅ ui/*.js              (UI source)
✅ ui/core/*.js         (Core utilities)
✅ ui/components/*.js   (Components)
✅ main.js              (Orchestrator)
```

**Then rebuild:**
```powershell
.\build.ps1
```

---

## 📌 Quick Navigation

| Need | Go To |
|------|-------|
| **Start app** | `index.html` |
| **Main code** | `main.js` |
| **UI source** | `ui/*.js` |
| **Components** | `ui/components/*.js` |
| **Core architecture** | `core/*.js` |
| **Built bundle** | `dist/ui.js` |
| **Docs** | `docs/*.md` |
| **Examples** | `simulations/*/` |
| **Config** | `ui-config/*.js` |

---

## 🔄 Build Flow

```
Source Files               Build Script              Output
─────────────             ──────────────            ────────

ui/BaseWindow.js     ──┐
ui/WindowManager.js  ──┤
ui/Taskbar.js        ──┤
ui/EventRouter.js    ──├──→ build.ps1  ──→  dist/ui.js
ui/Styles.js         ──┤                     (1972 lines)
ui/core/*.js         ──┤
ui/components/*.js   ──┘
```

---

**Last Updated:** 2026-01-12  
**Generated By:** `tree /F /A` command  
**Version:** v2.2
