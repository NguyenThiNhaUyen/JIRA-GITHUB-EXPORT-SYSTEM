# Script to trim trailing whitespace and final blank lines from all source files
$exclude = @("node_modules", "bin", "obj", ".git", ".vs", "dist", ".gemini", ".brain")
$extensions = @("*.cs", "*.js", "*.jsx", "*.tsx", "*.ts", "*.json", "*.css", "*.html", "*.xml", "*.md", "*.sql")

# Get all files
$files = Get-ChildItem -Path . -Recurse -Include $extensions -File | Where-Object { 
    $path = $_.FullName
    $skip = $false
    foreach ($dir in $exclude) {
        if ($path -like "*\$dir\*") { $skip = $true; break }
    }
    -not $skip
}

foreach ($file in $files) {
    Write-Host "Processing: $($file.FullName)"
    $content = Get-Content $file.FullName -Raw
    if ($content) {
        # 1. Trim trailing whitespace on each line
        # 2. Trim trailing blank lines at end of file (keep exactly one final newline)
        $trimmed = $content.TrimEnd(" `t`r`n") + "`r`n"
        
        # Only write if changed
        if ($content -ne $trimmed) {
            Write-Host "  - Trimming..." -ForegroundColor Green
            [System.IO.File]::WriteAllText($file.FullName, $trimmed)
        }
    }
}
Write-Host "Done!" -ForegroundColor Cyan
