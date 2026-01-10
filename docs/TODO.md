# UI System - TODO & Roadmap

**Updated:** 2026-01-10  
**Version:** v2.1  
**Status:** FAZA C2 Complete ✅

---

## ✅ COMPLETED

### v2.1 Core Architecture
- ✅ SimulationManager (360 lines) - central controller
- ✅ EventBus (192 lines) - pub-sub events
- ✅ DataBridge (224 lines) - UI ↔ Sim data flow
- ✅ Event-driven communication
- ✅ Centralized management

### FAZA C1: Header Buttons
- ✅ Close (X) - removes window
- ✅ Minimize (_) - hides to taskbar
- ✅ Eye (○/●) - HUD mode (transparent overlay)
- ✅ Dragging in all modes
- ✅ Button click detection

### FAZA C2: Scrollbar
- ✅ Vertical scrollbar
- ✅ Thumb dragging
- ✅ Mouse wheel support
- ✅ Track click to jump
- ✅ Auto-hide when content fits

### Polish & Features
- ✅ Text colors (green default, cyan stats)
- ✅ Word wrap for long text
- ✅ Centered sections (━━━ title ━━━)
- ✅ Menu sections (symulacje/system)
- ✅ Full window titles in menu
- ✅ Simplified structure (no /src/)
- ✅ /data/ folder for import/export (prepared)

---

## 🔜 TODO

### FAZA C3: Interactive Controls (~2-3h)

**Sliders:**
```javascript
window.addSlider('Speed', 0.1, 5.0, 1.0, (value) => {
    simulation.setSpeed(value);
});
// Visual: Speed: [====|------] 2.5
```

**Toggles:**
```javascript
window.addToggle('Pause', false, (enabled) => {
    simulation.setPaused(enabled);
});
// Visual: Pause: [OFF] or [ON]
```

**Priority:** 🔥 HIGH  
**Files to modify:**
- `ui/BaseWindow.js` - add drawSlider(), drawToggle()
- `main.js` - replace text placeholders with real controls

---

### FAZA C4: Polish & Testing (~1-2h)

- [ ] Move patches to source files
- [ ] Rebuild clean bundle
- [ ] Test all features
- [ ] Update all docs
- [ ] Add CHANGELOG.md

**Priority:** 🔶 MEDIUM

---

### Future Features (Optional)

- [ ] Import/Export UI layouts (use /data/presets/)
- [ ] Custom themes system (use /themes/)
- [ ] Matrix control (for Petri Dish)
- [ ] Keyboard shortcuts
- [ ] Window snapping

**Priority:** 🔷 LOW

---

## 📈 Progress Timeline

| Date | Milestone | Status |
|------|-----------|--------|
| 2026-01-08 | Repo created | ✅ |
| 2026-01-08 | Modular system | ✅ |
| 2026-01-09 | v2.0 Multi-sim | ✅ |
| 2026-01-09 | v2.1 Core architecture | ✅ |
| 2026-01-09 | FAZA C1 Header buttons | ✅ |
| 2026-01-09 | FAZA C2 Scrollbar | ✅ |
| 2026-01-10 | Structure cleanup | ✅ |
| TBD | FAZA C3 Sliders/Toggles | 🔜 |
| TBD | FAZA C4 Polish | 🔜 |

---

## 📊 Current Stats

- **Bundle:** 1505 lines (dist/ui.js)
- **BaseWindow:** 737 lines (largest module)
- **Taskbar:** 342 lines
- **Core modules:** 776 lines total
- **Main orchestrator:** 185 lines
- **Total codebase:** ~7500 lines
- **Commits:** 90+

---

## 🎯 Next Session Goals

1. **FAZA C3:** Implement sliders + toggles
2. **Replace** text placeholders in Master/Stats windows
3. **Test** interactive controls
4. **Update** bundle

**Estimated time:** 2-3 hours
