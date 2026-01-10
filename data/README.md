# Data Directory

This folder contains user data, presets, and exports.

## Structure

### `/presets/`
Ready-to-use UI configurations and simulations:
- Pre-configured window layouts
- Sample simulation states
- Theme presets
- Control configurations

**Usage:**
```javascript
// Load preset
const preset = await loadPreset('default-layout');
applyPreset(preset);
```

### `/exports/`
User-exported data:
- Custom UI configurations
- Saved simulation states
- User-created presets

**Usage:**
```javascript
// Export current state
const state = exportCurrentState();
saveToFile(state, 'data/exports/my-config.json');
```

## Future Features

- Import/Export UI layouts
- Share simulation configurations
- Save/Load custom themes
- Preset marketplace

## File Formats

All data files use JSON format:
```json
{
  "version": "1.0",
  "type": "ui-preset",
  "windows": [...],
  "theme": {...}
}
```
