$ErrorActionPreference = "Stop"
$dest = "themes\design-system"

if (Test-Path "$dest\VERSION") {
  Write-Host "design-system $(Get-Content "$dest\VERSION") already installed (delete $dest to re-download)"
  exit 0
}

$url = "https://github.com/gurukulams/design-system/releases/latest/download/design-system.tar.gz"
$tmp = Join-Path $env:TEMP "design-system.tar.gz"

curl.exe -fsSL $url -o $tmp
if ($LASTEXITCODE -ne 0) { throw "Download failed" }

New-Item -ItemType Directory -Force $dest | Out-Null
tar -xzf $tmp -C $dest
Remove-Item $tmp

Write-Host "Installed design-system $(Get-Content "$dest\VERSION")"