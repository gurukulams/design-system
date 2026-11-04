
$ErrorActionPreference = "Stop"

$Repo = "gurukulams/design-system"
$ReleaseUrl = "https://github.com/$Repo/releases/download/latest/site-build.zip"
$ThemeDir = Join-Path (Get-Location) "themes/design-system"
$ZipFile = Join-Path $env:TEMP "site-build.zip"

try {
    Write-Host "Downloading latest Design System theme..." -ForegroundColor Cyan

    Invoke-WebRequest `
        -Uri $ReleaseUrl `
        -OutFile $ZipFile `
        -UseBasicParsing

    Write-Host "Preparing theme directory..." -ForegroundColor Cyan

    if (Test-Path $ThemeDir) {
        Remove-Item $ThemeDir -Recurse -Force
    }

    New-Item -ItemType Directory -Path $ThemeDir -Force | Out-Null

    Write-Host "Extracting theme..." -ForegroundColor Cyan

    Expand-Archive `
        -Path $ZipFile `
        -DestinationPath $ThemeDir `
        -Force

    Remove-Item $ZipFile -Force

    Write-Host "Design System theme updated successfully!" -ForegroundColor Green
    Write-Host "Location: $ThemeDir"

}
catch {
    Write-Host "Failed to download or extract theme." -ForegroundColor Red
    Write-Host $_.Exception.Message

    if (Test-Path $ZipFile) {
        Remove-Item $ZipFile -Force
    }

    exit 1
}
