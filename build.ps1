# ═══════════════════════════════════════════════════════════════
#   BUILD SCRIPT - Create dist/ui.js bundle (MODULAR VERSION)
# ═══════════════════════════════════════════════════════════════
# PowerShell version for Windows
# Concatenates all modules (core + components + main) into single file

# CRITICAL: Set working directory to script location (fixes path issues!)
$scriptPath = Split-Path -Parent $PSCommandPath
Set-Location $scriptPath
Write-Host "Working directory: $scriptPath" -ForegroundColor DarkGray

Write-Host "Building UI Library bundle (modular)..." -ForegroundColor Green

# Output file
$OUTPUT = "dist/ui.js"

# Create dist directory if it doesn't exist
if (-not (Test-Path "dist")) {
    New-Item -ItemType Directory -Path "dist" | Out-Null
}

# ═══════════════════════════════════════════════════════════════
#   HEADER
# ═══════════════════════════════════════════════════════════════

$header = @"
// ═══════════════════════════════════════════════════════════════
//   UI LIBRARY - COMPLETE BUNDLE (MODULAR)
// ═══════════════════════════════════════════════════════════════
// Single-file bundle of entire UI system
// Extracted from Petrie Dish v5.1-C2
// 
// Version: 2.0.0 (Modular Architecture)
// Date: $(Get-Date -Format "yyyy-MM-dd")
// Source: https://github.com/michalstankiewicz4-cell/UI
//
// Architecture:
// - ui/core/* (geometry, text-cache, constants, layout)
// - ui/components/* (header, button, toggle, slider, text, section, scrollbar)
// - ui/BaseWindow.js (refactored to use modules)
// - ui/WindowManager.js, Taskbar.js, EventRouter.js, Styles.js
//
// Total: ~1500+ lines of clean modular code
//
// Usage:
//   <script src="dist/ui.js"></script>
//   <script>
//     const manager = new UI.WindowManager();
//     const window = new UI.BaseWindow(100, 100, 'Hello!');
//     window.addButton('Click', () => console.log('Clicked!'));
//     manager.add(window);
//   </script>
// ═══════════════════════════════════════════════════════════════

(function(global) {
    'use strict';

"@

Set-Content -Path $OUTPUT -Value $header -Encoding UTF8

# ═══════════════════════════════════════════════════════════════
#   STRIP ES6 IMPORTS/EXPORTS (FIXED FOR MULTI-LINE!)
# ═══════════════════════════════════════════════════════════════

function Strip-ES6 {
    param([string]$content)
    
    # Remove multi-line import statements
    # Matches: import { ... } from '...'  (across multiple lines!)
    $content = $content -replace "(?s)import\s*\{[^}]*\}\s*from\s*['\x22][^'\x22]*['\x22]\s*;?", ""
    
    # Remove single-line imports: import X from '...'
    $content = $content -replace "(?m)^import\s+\w+\s+from\s+['\x22][^'\x22]*['\x22]\s*;?", ""
    
    # Remove wildcard imports: import * as X from '...'
    $content = $content -replace "(?m)^import\s+\*\s+as\s+\w+\s+from\s+['\x22][^'\x22]*['\x22]\s*;?", ""
    
    # Remove export default statements
    $content = $content -replace "(?m)^export\s+default\s+\w+\s*;?", ""
    
    # Remove export { ... } blocks
    $content = $content -replace "(?m)^export\s+\{[^}]+\}\s*;?", ""
    
    # Remove export keyword from declarations (export function, export const, etc)
    $content = $content -replace "(?m)^export\s+", ""
    
    # Clean up empty lines (more than 2 consecutive)
    $content = $content -replace "(?m)^\s*`n\s*`n\s*`n+", "`n`n"
    
    return $content
}

# ═══════════════════════════════════════════════════════════════
#   ADD FILES IN ORDER
# ═══════════════════════════════════════════════════════════════

# Core modules first (no dependencies)
Write-Host "Adding ui/core/geometry.js..." -ForegroundColor Cyan
$content = Get-Content "ui/core/geometry.js" -Raw -Encoding UTF8
$content = Strip-ES6 $content
Add-Content -Path $OUTPUT -Value "`n// ═══ ui/core/geometry.js ═══`n" -Encoding UTF8
Add-Content -Path $OUTPUT -Value $content -Encoding UTF8

Write-Host "Adding ui/core/text-cache.js..." -ForegroundColor Cyan
$content = Get-Content "ui/core/text-cache.js" -Raw -Encoding UTF8
$content = Strip-ES6 $content
Add-Content -Path $OUTPUT -Value "`n// ═══ ui/core/text-cache.js ═══`n" -Encoding UTF8
Add-Content -Path $OUTPUT -Value $content -Encoding UTF8

Write-Host "Adding ui/core/constants.js..." -ForegroundColor Cyan
$content = Get-Content "ui/core/constants.js" -Raw -Encoding UTF8
$content = Strip-ES6 $content
Add-Content -Path $OUTPUT -Value "`n// ═══ ui/core/constants.js ═══`n" -Encoding UTF8
Add-Content -Path $OUTPUT -Value $content -Encoding UTF8

Write-Host "Adding ui/core/layout.js..." -ForegroundColor Cyan
$content = Get-Content "ui/core/layout.js" -Raw -Encoding UTF8
$content = Strip-ES6 $content
Add-Content -Path $OUTPUT -Value "`n// ═══ ui/core/layout.js ═══`n" -Encoding UTF8
Add-Content -Path $OUTPUT -Value $content -Encoding UTF8

# Components (depend on core)
Write-Host "Adding ui/components/header.js..." -ForegroundColor Cyan
$content = Get-Content "ui/components/header.js" -Raw -Encoding UTF8
$content = Strip-ES6 $content
Add-Content -Path $OUTPUT -Value "`n// ═══ ui/components/header.js ═══`n" -Encoding UTF8
Add-Content -Path $OUTPUT -Value $content -Encoding UTF8

Write-Host "Adding ui/components/scrollbar.js..." -ForegroundColor Cyan
$content = Get-Content "ui/components/scrollbar.js" -Raw -Encoding UTF8
$content = Strip-ES6 $content
Add-Content -Path $OUTPUT -Value "`n// ═══ ui/components/scrollbar.js ═══`n" -Encoding UTF8
Add-Content -Path $OUTPUT -Value $content -Encoding UTF8

# Item classes (interactive UI elements - separate files)
Write-Host "Adding ui/components/UIItem.js..." -ForegroundColor Cyan
$content = Get-Content "ui/components/UIItem.js" -Raw -Encoding UTF8
$content = Strip-ES6 $content
Add-Content -Path $OUTPUT -Value "`n// ═══ ui/components/UIItem.js ═══`n" -Encoding UTF8
Add-Content -Path $OUTPUT -Value $content -Encoding UTF8

Write-Host "Adding ui/components/ToggleItem.js..." -ForegroundColor Cyan
$content = Get-Content "ui/components/ToggleItem.js" -Raw -Encoding UTF8
$content = Strip-ES6 $content
Add-Content -Path $OUTPUT -Value "`n// ═══ ui/components/ToggleItem.js ═══`n" -Encoding UTF8
Add-Content -Path $OUTPUT -Value $content -Encoding UTF8

Write-Host "Adding ui/components/ButtonItem.js..." -ForegroundColor Cyan
$content = Get-Content "ui/components/ButtonItem.js" -Raw -Encoding UTF8
$content = Strip-ES6 $content
Add-Content -Path $OUTPUT -Value "`n// ═══ ui/components/ButtonItem.js ═══`n" -Encoding UTF8
Add-Content -Path $OUTPUT -Value $content -Encoding UTF8

Write-Host "Adding ui/components/SliderItem.js..." -ForegroundColor Cyan
$content = Get-Content "ui/components/SliderItem.js" -Raw -Encoding UTF8
$content = Strip-ES6 $content
Add-Content -Path $OUTPUT -Value "`n// ═══ ui/components/SliderItem.js ═══`n" -Encoding UTF8
Add-Content -Path $OUTPUT -Value $content -Encoding UTF8

Write-Host "Adding ui/components/SectionItem.js..." -ForegroundColor Cyan
$content = Get-Content "ui/components/SectionItem.js" -Raw -Encoding UTF8
$content = Strip-ES6 $content
Add-Content -Path $OUTPUT -Value "`n// ═══ ui/components/SectionItem.js ═══`n" -Encoding UTF8
Add-Content -Path $OUTPUT -Value $content -Encoding UTF8

Write-Host "Adding ui/components/TextItem.js..." -ForegroundColor Cyan
$content = Get-Content "ui/components/TextItem.js" -Raw -Encoding UTF8
$content = Strip-ES6 $content
Add-Content -Path $OUTPUT -Value "`n// ═══ ui/components/TextItem.js ═══`n" -Encoding UTF8
Add-Content -Path $OUTPUT -Value $content -Encoding UTF8

# Main UI classes (depend on core + components)
Write-Host "Adding ui/Styles.js..." -ForegroundColor Cyan
$content = Get-Content "ui/Styles.js" -Raw -Encoding UTF8
$content = Strip-ES6 $content
Add-Content -Path $OUTPUT -Value "`n// ═══ ui/Styles.js ═══`n" -Encoding UTF8
Add-Content -Path $OUTPUT -Value $content -Encoding UTF8

Write-Host "Adding ui/WindowManager.js..." -ForegroundColor Cyan
$content = Get-Content "ui/WindowManager.js" -Raw -Encoding UTF8
$content = Strip-ES6 $content
Add-Content -Path $OUTPUT -Value "`n// ═══ ui/WindowManager.js ═══`n" -Encoding UTF8
Add-Content -Path $OUTPUT -Value $content -Encoding UTF8

Write-Host "Adding ui/Taskbar.js..." -ForegroundColor Cyan
$content = Get-Content "ui/Taskbar.js" -Raw -Encoding UTF8
$content = Strip-ES6 $content
Add-Content -Path $OUTPUT -Value "`n// ═══ ui/Taskbar.js ═══`n" -Encoding UTF8
Add-Content -Path $OUTPUT -Value $content -Encoding UTF8

Write-Host "Adding ui/EventRouter.js..." -ForegroundColor Cyan
$content = Get-Content "ui/EventRouter.js" -Raw -Encoding UTF8
$content = Strip-ES6 $content
Add-Content -Path $OUTPUT -Value "`n// ═══ ui/EventRouter.js ═══`n" -Encoding UTF8
Add-Content -Path $OUTPUT -Value $content -Encoding UTF8

Write-Host "Adding ui/BaseWindow.js..." -ForegroundColor Cyan
$content = Get-Content "ui/BaseWindow.js" -Raw -Encoding UTF8
$content = Strip-ES6 $content
Add-Content -Path $OUTPUT -Value "`n// ═══ ui/BaseWindow.js ═══`n" -Encoding UTF8
Add-Content -Path $OUTPUT -Value $content -Encoding UTF8

# ═══════════════════════════════════════════════════════════════
#   FOOTER (GLOBAL EXPORTS)
# ═══════════════════════════════════════════════════════════════

$footer = @"

    // ═══════════════════════════════════════════════════════════════
    //   EXPORT TO GLOBAL
    // ═══════════════════════════════════════════════════════════════
    
    global.UI = {
        // Core
        CONST: typeof CONST !== 'undefined' ? CONST : {},
        rectHit: typeof rectHit !== 'undefined' ? rectHit : null,
        circleHit: typeof circleHit !== 'undefined' ? circleHit : null,
        clamp: typeof clamp !== 'undefined' ? clamp : null,
        measureTextCached: typeof measureTextCached !== 'undefined' ? measureTextCached : null,
        clearTextCache: typeof clearTextCache !== 'undefined' ? clearTextCache : null,
        
        // Main classes
        STYLES: typeof STYLES !== 'undefined' ? STYLES : {},
        BaseWindow: typeof BaseWindow !== 'undefined' ? BaseWindow : null,
        WindowManager: typeof WindowManager !== 'undefined' ? WindowManager : null,
        Taskbar: typeof Taskbar !== 'undefined' ? Taskbar : null,
        EventRouter: typeof EventRouter !== 'undefined' ? EventRouter : null
    };
    
    console.log('✅ UI Library v2.0.0 loaded (modular)!');
    console.log('📦 Modules: core (4) + components (7) + main (5)');
    console.log('🎯 Ready: new UI.BaseWindow(x, y, title)');

})(typeof window !== 'undefined' ? window : global);
"@

Add-Content -Path $OUTPUT -Value $footer -Encoding UTF8

# ═══════════════════════════════════════════════════════════════
#   REPORT
# ═══════════════════════════════════════════════════════════════

$lines = (Get-Content $OUTPUT -Encoding UTF8).Count
$size = [math]::Round((Get-Item $OUTPUT).Length / 1KB, 2)

Write-Host ""
Write-Host "✅ Build complete!" -ForegroundColor Green
Write-Host "📦 Output: $OUTPUT" -ForegroundColor Yellow
Write-Host "📏 Lines: $lines" -ForegroundColor Yellow
Write-Host "💾 Size: $size KB" -ForegroundColor Yellow
Write-Host ""
Write-Host "Modules included:" -ForegroundColor Cyan
Write-Host "  Core: geometry, text-cache, constants, layout" -ForegroundColor White
Write-Host "  Components: header, button, toggle, slider, text, section, scrollbar" -ForegroundColor White
Write-Host "  Main: Styles, BaseWindow, WindowManager, Taskbar, EventRouter" -ForegroundColor White
Write-Host ""
Write-Host "Usage:" -ForegroundColor Cyan
Write-Host "  <script src='dist/ui.js'></script>" -ForegroundColor White
Write-Host "  <script>" -ForegroundColor White
Write-Host "    const manager = new UI.WindowManager();" -ForegroundColor White
Write-Host "    const window = new UI.BaseWindow(100, 100, 'Test');" -ForegroundColor White
Write-Host "    window.addButton('Click', () => alert('Hi!'));" -ForegroundColor White
Write-Host "  </script>" -ForegroundColor White
