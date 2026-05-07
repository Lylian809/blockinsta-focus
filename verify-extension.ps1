$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$requiredFiles = @(
  "manifest.json",
  "content.js",
  "popup.html",
  "popup.css",
  "popup.js"
)

function Assert-PathExists {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path,
    [Parameter(Mandatory = $true)]
    [string]$Label
  )

  if (-not (Test-Path -LiteralPath $Path)) {
    throw "$Label is missing: $Path"
  }
}

foreach ($relativePath in $requiredFiles) {
  Assert-PathExists -Path (Join-Path $projectRoot $relativePath) -Label "Required file"
}

$manifestPath = Join-Path $projectRoot "manifest.json"
$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json

if (-not $manifest.version) {
  throw "manifest.json must define a version."
}

if (-not $manifest.action.default_popup) {
  throw "manifest.json must define action.default_popup."
}

Assert-PathExists -Path (Join-Path $projectRoot $manifest.action.default_popup) -Label "Popup entry"

foreach ($contentScript in $manifest.content_scripts) {
  foreach ($scriptPath in $contentScript.js) {
    Assert-PathExists -Path (Join-Path $projectRoot $scriptPath) -Label "Content script"
  }
}

$nodeCommand = Get-Command node -ErrorAction SilentlyContinue

if (-not $nodeCommand) {
  throw "Node.js is required to run syntax checks."
}

$javascriptFiles = @(
  "popup.js",
  "content.js"
)

foreach ($relativePath in $javascriptFiles) {
  $absolutePath = Join-Path $projectRoot $relativePath
  & $nodeCommand.Source --check $absolutePath

  if ($LASTEXITCODE -ne 0) {
    throw "Syntax check failed for $relativePath"
  }
}

Write-Host "Manifest and source verification passed for Fokus $($manifest.version)."
