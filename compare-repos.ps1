cd C:\Users\micha\source\repos\UI

Write-Host "=== GITHUB REPO (commit 83b6a67) ===" -ForegroundColor Green
$ghFiles = git ls-tree -r --name-only 83b6a67 ui/ | Where-Object { $_ -match '\.js$' }
foreach($f in $ghFiles) {
    $lines = (git show "83b6a67:$f" | Measure-Object -Line).Lines
    Write-Host "$lines`t$f"
}

Write-Host ""
Write-Host "=== LOCAL REPO (working directory) ===" -ForegroundColor Yellow
$localFiles = Get-ChildItem -Path ui -Recurse -Filter *.js | Select-Object -ExpandProperty FullName
foreach($f in $localFiles) {
    $relPath = $f -replace [regex]::Escape("C:\Users\micha\source\repos\UI\"), ""
    $relPath = $relPath -replace '\\', '/'
    $lines = (Get-Content $f | Measure-Object -Line).Lines
    Write-Host "$lines`t$relPath"
}
