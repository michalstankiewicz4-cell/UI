#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#   BUILD SCRIPT - Create dist/ui.js bundle
# ═══════════════════════════════════════════════════════════════
# Concatenates all modules into single file

echo "Building UI Library bundle..."

# Output file
OUTPUT="dist/ui.js"

# Create header
cat > "$OUTPUT" << 'EOF'
// ═══════════════════════════════════════════════════════════════
//   UI LIBRARY - COMPLETE BUNDLE
// ═══════════════════════════════════════════════════════════════
// Single-file bundle of entire UI system
// Extracted from Petrie Dish v5.1-C2
// 
// Version: 1.0.0
// Date: 2025-01-08
// Source: https://github.com/michalstankiewicz4-cell/UI
//
// Total: ~1000+ lines of modular UI code
// ═══════════════════════════════════════════════════════════════

(function(global) {
    'use strict';

EOF

# Add each module (remove exports)
echo "Adding Styles.js..."
sed '/^if (typeof module/,/^}$/d' src/ui/Styles.js >> "$OUTPUT"

echo "Adding TextCache.js..."
sed '/^if (typeof module/,/^}$/d' src/utils/TextCache.js >> "$OUTPUT"

echo "Adding BaseWindow.js..."
sed '/^if (typeof module/,/^}$/d' src/ui/BaseWindow.js >> "$OUTPUT"

echo "Adding WindowManager.js..."
sed '/^if (typeof module/,/^}$/d' src/ui/WindowManager.js >> "$OUTPUT"

echo "Adding Taskbar.js..."
sed '/^if (typeof module/,/^}$/d' src/ui/Taskbar.js >> "$OUTPUT"

echo "Adding EventRouter.js..."
sed '/^if (typeof module/,/^}$/d' src/ui/EventRouter.js >> "$OUTPUT"

# Add footer (exports to global)
cat >> "$OUTPUT" << 'EOF'

    // Export to global
    global.UI = {
        STYLES: STYLES,
        BaseWindow: BaseWindow,
        WindowManager: WindowManager,
        Taskbar: Taskbar,
        EventRouter: EventRouter,
        measureTextCached: measureTextCached,
        clearTextCache: clearTextCache,
        getTextCacheStats: getTextCacheStats
    };
    
    console.log('✅ UI Library v1.0.0 loaded!');

})(typeof window !== 'undefined' ? window : global);
EOF

# Count lines
LINES=$(wc -l < "$OUTPUT")
echo ""
echo "✅ Build complete!"
echo "📦 Output: $OUTPUT"
echo "📏 Lines: $LINES"
echo ""
echo "Usage:"
echo "  <script src=\"dist/ui.js\"></script>"
echo "  <script>"
echo "    const manager = new UI.WindowManager();"
echo "    const window = new UI.BaseWindow(100, 100, 'Hello!');"
echo "  </script>"
