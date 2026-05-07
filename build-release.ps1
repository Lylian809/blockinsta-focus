$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$manifestPath = Join-Path $projectRoot "manifest.json"
$verifyScriptPath = Join-Path $projectRoot "verify-extension.ps1"

& $verifyScriptPath

if ($LASTEXITCODE -ne 0) {
  throw "Extension verification failed; release ZIP was not created."
}

$manifest = Get-Content $manifestPath | ConvertFrom-Json
$version = $manifest.version

$distDir = Join-Path $projectRoot "dist"
New-Item -ItemType Directory -Force -Path $distDir | Out-Null

$zipName = "Fokus-v$version-store.zip"
$zipPath = Join-Path $distDir $zipName

if (Test-Path $zipPath) {
  Remove-Item -LiteralPath $zipPath
}

$releaseItems = @(
  "manifest.json",
  "content.js",
  "popup.html",
  "popup.css",
  "popup.js",
  "icons"
)

$resolvedItems = $releaseItems | ForEach-Object {
  Join-Path $projectRoot $_
}

Compress-Archive -Path $resolvedItems -DestinationPath $zipPath

Write-Host "Created release ZIP:" $zipPath
