cd C:\Users\micha\source\repos\UI

Write-Host "=== GIT ADD ===" -ForegroundColor Cyan
git add .

Write-Host ""
Write-Host "=== GIT STATUS ===" -ForegroundColor Yellow
git status --short

Write-Host ""
Write-Host "=== GIT COMMIT ===" -ForegroundColor Green
git commit -m "refactor: Split items.js into separate class files

BREAKING CHANGE: Item architecture refactored from single file to modular classes

Changes:
- Split ui/items.js (288 lines) into 6 separate class files
- Created UIItem.js (53 lines) - base class for all items
- Created ButtonItem.js (55 lines) - clickable button with callback
- Created ToggleItem.js (60 lines) - checkbox with getValue/setValue
- Created SliderItem.js (96 lines) - draggable slider with min/max/step
- Created SectionItem.js (62 lines) - visual divider with title
- Created TextItem.js (37 lines) - static text display

- Refactored BaseWindow.js (959 -> 441 lines, -54%)
  - Removed switch/case item rendering
  - Now uses polymorphic item.draw() and item.update()
  - Updated imports to use separate class files

- Updated build.ps1 to include new item class files
- Updated WindowManager.js to call window.update() for mouse events

- Removed zombie files:
  - ui/items.js (temporary monolithic file)
  - ui/components/button.js (old functional code)
  - ui/components/toggle.js (old functional code)
  - ui/components/slider.js (old functional code)
  - ui/components/text.js (old functional code)
  - ui/components/section.js (old functional code)

Architecture: OOP classes in separate files (Option C from refactor plan)
Net result: -352 lines, improved modularity, maintained functionality

Tested: All UI controls working (checkboxes, sliders, buttons, scroll, drag)"

Write-Host ""
Write-Host "=== GIT LOG ===" -ForegroundColor Magenta
git log --oneline -3

Write-Host ""
Write-Host "Ready to push? Review above and confirm." -ForegroundColor Yellow
