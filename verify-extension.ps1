$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$requiredFiles = @(
  "manifest.json",
  "content.js",
  "popup.html",
  "popup.css",
  "popup.js"
)
$expectedPopupIds = @(
  "status",
  "sr-status",
  "summary-title",
  "summary-body",
  "summary-storage-badge",
  "summary-storage-note",
  "summary-tab-note",
  "summary-preset-badge",
  "summary-preset-note",
  "instagram-mode",
  "instagram-mode-detail",
  "instagram-context-note",
  "youtube-mode",
  "youtube-mode-detail",
  "youtube-context-note",
  "tiktok-mode",
  "tiktok-mode-detail",
  "reset-defaults",
  "default-state-copy",
  "refresh-active-tab",
  "refresh-tab-context",
  "refresh-state-copy",
  "site-shortcuts",
  "site-shortcuts-label",
  "site-shortcuts-mode",
  "site-shortcuts-new-tab-mode",
  "site-shortcuts-note"
)
$expectedSettingFieldNames = @(
  "instagramBlockAll",
  "instagramMessagesOnly",
  "instagramRedirectHomeToInbox",
  "instagramBlockStories",
  "instagramBlockReels",
  "instagramBlockExplore",
  "instagramBlockFeed",
  "instagramBlockSearch",
  "youtubeBlockAll",
  "youtubeHideThumbnails",
  "youtubeBlockShorts",
  "youtubeSearchOnlyHome",
  "tiktokBlockAll"
)
$expectedShortcutSites = @(
  "instagram",
  "youtube",
  "tiktok"
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

function Assert-MatchesPresent {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Content,
    [Parameter(Mandatory = $true)]
    [string[]]$ExpectedValues,
    [Parameter(Mandatory = $true)]
    [string]$Pattern,
    [Parameter(Mandatory = $true)]
    [string]$Label
  )

  $actualValues = [regex]::Matches($Content, $Pattern) |
    ForEach-Object { $_.Groups[1].Value } |
    Select-Object -Unique

  foreach ($expectedValue in $ExpectedValues) {
    if ($expectedValue -notin $actualValues) {
      throw "$Label is missing expected value '$expectedValue'."
    }
  }
}

foreach ($relativePath in $requiredFiles) {
  Assert-PathExists -Path (Join-Path $projectRoot $relativePath) -Label "Required file"
}

$popupHtmlPath = Join-Path $projectRoot "popup.html"
$popupHtml = Get-Content -LiteralPath $popupHtmlPath -Raw

Assert-MatchesPresent -Content $popupHtml -ExpectedValues $expectedPopupIds -Pattern 'id="([^"]+)"' -Label "popup.html"
Assert-MatchesPresent -Content $popupHtml -ExpectedValues $expectedSettingFieldNames -Pattern 'name="([^"]+)"' -Label "popup.html"
Assert-MatchesPresent -Content $popupHtml -ExpectedValues $expectedShortcutSites -Pattern 'data-site-shortcut="([^"]+)"' -Label "popup.html"

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
