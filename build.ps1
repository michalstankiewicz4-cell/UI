# â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
#   BUILD SCRIPT - Create dist/ui.js bundle
# â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
# PowerShell version for Windows
# Concatenates all modules into single file

Write-Host "Building UI Library bundle..." -ForegroundColor Green

# Output file
$OUTPUT = "dist/ui.js"

# Create header
$header = @"
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//   UI LIBRARY - COMPLETE BUNDLE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Single-file bundle of entire UI system
// Extracted from Petrie Dish v5.1-C2
// 
// Version: 1.0.0
// Date: 2025-01-08
// Source: https://github.com/michalstankiewicz4-cell/UI
//
// Includes:
// - Styles.js (styling system)
// - TextCache.js (performance optimization)
// - BaseWindow.js (draggable windows)
// - WindowManager.js (multi-window management)
// - Taskbar.js (Windows-style taskbar)
// - EventRouter.js (centralized events)
//
// Total: ~1000+ lines of modular UI code
//
// Usage:
//   <script src="dist/ui.js"></script>
//   <script>
//     const manager = new UI.WindowManager();
//     const window = new UI.BaseWindow(100, 100, 'Hello!');
//     window.addButton('Click', () => console.log('Clicked!'));
//     manager.add(window);
//   </script>
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

(function(global) {
    'use strict';

"@

Set-Content -Path $OUTPUT -Value $header

# Function to remove module exports from file
function Remove-Exports {
    param($content)
    
    # Remove lines with module.exports
    $lines = $content -split "`n"
    $filtered = $lines | Where-Object { 
        $_ -notmatch "^if \(typeof module" -and 
        $_ -notmatch "module\.exports" -and
        $_ -notmatch "^}$" -or ($_ -match "^}$" -and $lines.IndexOf($_) -lt ($lines.Length - 3))
    }
    
    return $filtered -join "`n"
}

# Add each module
Write-Host "Adding Styles.js..." -ForegroundColor Cyan
$content = Get-Content "ui/Styles.js" -Raw
$content = $content -replace "(?ms)// Export for use in modules.*$", ""
Add-Content -Path $OUTPUT -Value $content

Write-Host "Adding TextCache.js..." -ForegroundColor Cyan
$content = Get-Content "utils/TextCache.js" -Raw
$content = $content -replace "(?ms)// Export for use in modules.*$", ""
Add-Content -Path $OUTPUT -Value $content

Write-Host "Adding BaseWindow.js..." -ForegroundColor Cyan
$content = Get-Content "ui/BaseWindow.js" -Raw
$content = $content -replace "(?ms)// Export for use in modules.*$", ""
Add-Content -Path $OUTPUT -Value $content

Write-Host "Adding WindowManager.js..." -ForegroundColor Cyan
$content = Get-Content "ui/WindowManager.js" -Raw
$content = $content -replace "(?ms)// Export for use in modules.*$", ""
Add-Content -Path $OUTPUT -Value $content

Write-Host "Adding Taskbar.js..." -ForegroundColor Cyan
$content = Get-Content "ui/Taskbar.js" -Raw
$content = $content -replace "(?ms)// Export for use in modules.*$", ""
Add-Content -Path $OUTPUT -Value $content

Write-Host "Adding EventRouter.js..." -ForegroundColor Cyan
$content = Get-Content "ui/EventRouter.js" -Raw
$content = $content -replace "(?ms)// Export for use in modules.*$", ""
Add-Content -Path $OUTPUT -Value $content

# Add footer (exports to global)
$footer = @"

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
    
    console.log('âś… UI Library v1.0.0 loaded!');
    console.log('đź“¦ Modules: Styles, TextCache, BaseWindow, WindowManager, Taskbar, EventRouter');
    console.log('đźŽŻ Ready to use: new UI.BaseWindow(x, y, title)');

})(typeof window !== 'undefined' ? window : global);
"@

Add-Content -Path $OUTPUT -Value $footer

# Count lines
$lines = (Get-Content $OUTPUT).Count
Write-Host ""
Write-Host "âś… Build complete!" -ForegroundColor Green
Write-Host "đź“¦ Output: $OUTPUT" -ForegroundColor Yellow
Write-Host "đź“Ź Lines: $lines" -ForegroundColor Yellow
Write-Host ""
Write-Host "Usage:" -ForegroundColor Cyan
Write-Host "  <script src='dist/ui.js'></script>" -ForegroundColor White
Write-Host "  <script>" -ForegroundColor White
Write-Host "    const manager = new UI.WindowManager();" -ForegroundColor White
Write-Host "    const window = new UI.BaseWindow(100, 100, 'Hello!');" -ForegroundColor White
Write-Host "  </script>" -ForegroundColor White
