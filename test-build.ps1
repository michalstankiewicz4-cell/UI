cd C:\Users\micha\source\repos\UI

Write-Host "Cleaning old build..." -ForegroundColor Yellow
Remove-Item dist\ui.js -Force -ErrorAction SilentlyContinue

Write-Host "Running build..." -ForegroundColor Cyan
.\build.ps1

Write-Host "Running const fix..." -ForegroundColor Cyan
python fix-const.py

Write-Host ""
Write-Host "Build statistics:" -ForegroundColor Green
$lines = (Get-Content dist\ui.js).Count
$size = (Get-Item dist\ui.js).Length / 1KB
Write-Host "Lines: $lines"
Write-Host "Size: $([math]::Round($size, 2)) KB"

Write-Host ""
Write-Host "Opening in browser..." -ForegroundColor Cyan
Start-Process index.html
