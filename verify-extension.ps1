$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$requiredFiles = @(
  "manifest.json",
  "content.js",
  "HOT.md",
  "popup.html",
  "popup.css",
  "popup.js",
  "README.md"
)
$expectedHotSections = @(
  "## Product Direction",
  "## Recent Improvements",
  "## Next Best Opportunities",
  "## Risks / Known Issues"
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
$disallowedTrackedArtifactPatterns = @(
  "logs/",
  ".recurring-lock/",
  "*.zip",
  "*.log",
  "*.tmp"
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

function Assert-ManifestPathsExist {
  param(
    [Parameter(Mandatory = $true)]
    [object]$Value,
    [Parameter(Mandatory = $true)]
    [string]$Label
  )

  if ($null -eq $Value) {
    return
  }

  if ($Value -is [string]) {
    Assert-PathExists -Path (Join-Path $projectRoot $Value) -Label $Label
    return
  }

  if ($Value -is [System.Collections.IDictionary] -or $Value.PSObject.Properties.Count -gt 0) {
    foreach ($property in $Value.PSObject.Properties) {
      if ($property.Value -is [string] -and -not [string]::IsNullOrWhiteSpace($property.Value)) {
        Assert-PathExists -Path (Join-Path $projectRoot $property.Value) -Label $Label
      }
    }
  }
}

function Assert-StringSetsMatch {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$ExpectedValues,
    [Parameter(Mandatory = $true)]
    [string[]]$ActualValues,
    [Parameter(Mandatory = $true)]
    [string]$ExpectedLabel,
    [Parameter(Mandatory = $true)]
    [string]$ActualLabel
  )

  $expectedUnique = $ExpectedValues | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -Unique
  $actualUnique = $ActualValues | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -Unique

  foreach ($missingValue in ($expectedUnique | Where-Object { $_ -notin $actualUnique })) {
    throw "$ActualLabel is missing '$missingValue' from $ExpectedLabel."
  }

  foreach ($unexpectedValue in ($actualUnique | Where-Object { $_ -notin $expectedUnique })) {
    throw "$ActualLabel contains unexpected value '$unexpectedValue' that is not present in $ExpectedLabel."
  }
}

function Assert-ContainsText {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Content,
    [Parameter(Mandatory = $true)]
    [string]$ExpectedText,
    [Parameter(Mandatory = $true)]
    [string]$Label
  )

  if ($Content -notmatch [regex]::Escape($ExpectedText)) {
    throw "$Label is missing expected text: $ExpectedText"
  }
}

function Assert-NoTrackedArtifactMatches {
  param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectRoot,
    [Parameter(Mandatory = $true)]
    [string[]]$Patterns
  )

  $gitCommand = Get-Command git -ErrorAction SilentlyContinue

  if (-not $gitCommand) {
    return
  }

  $trackedFiles = & $gitCommand.Source -C $ProjectRoot ls-files

  if ($LASTEXITCODE -ne 0) {
    throw "Unable to inspect tracked files with git ls-files."
  }

  foreach ($trackedFile in $trackedFiles) {
    foreach ($pattern in $Patterns) {
      if ($trackedFile -like $pattern) {
        throw "Tracked local artifact '$trackedFile' matches blocked pattern '$pattern'."
      }
    }
  }
}

foreach ($relativePath in $requiredFiles) {
  Assert-PathExists -Path (Join-Path $projectRoot $relativePath) -Label "Required file"
}

Assert-NoTrackedArtifactMatches -ProjectRoot $projectRoot -Patterns $disallowedTrackedArtifactPatterns

$popupHtmlPath = Join-Path $projectRoot "popup.html"
$popupHtml = Get-Content -LiteralPath $popupHtmlPath -Raw
$hotPath = Join-Path $projectRoot "HOT.md"
$hotContent = Get-Content -LiteralPath $hotPath -Raw

Assert-MatchesPresent -Content $popupHtml -ExpectedValues $expectedPopupIds -Pattern 'id="([^"]+)"' -Label "popup.html"
Assert-MatchesPresent -Content $popupHtml -ExpectedValues $expectedSettingFieldNames -Pattern 'name="([^"]+)"' -Label "popup.html"
Assert-MatchesPresent -Content $popupHtml -ExpectedValues $expectedShortcutSites -Pattern 'data-site-shortcut="([^"]+)"' -Label "popup.html"

foreach ($sectionHeading in $expectedHotSections) {
  Assert-ContainsText -Content $hotContent -ExpectedText $sectionHeading -Label "HOT.md"
}

$manifestPath = Join-Path $projectRoot "manifest.json"
$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json

if (-not $manifest.version) {
  throw "manifest.json must define a version."
}

if (-not $manifest.action.default_popup) {
  throw "manifest.json must define action.default_popup."
}

$readmePath = Join-Path $projectRoot "README.md"
$readmeContent = Get-Content -LiteralPath $readmePath -Raw
$readmeVersionMatch = [regex]::Match($readmeContent, 'Current release version:\s*`([^`]+)`')

if (-not $readmeVersionMatch.Success) {
  throw "README.md must contain a 'Current release version' line."
}

$readmeVersion = $readmeVersionMatch.Groups[1].Value.Trim()

if ($readmeVersion -ne $manifest.version) {
  throw "README.md release version '$readmeVersion' does not match manifest.json version '$($manifest.version)'."
}

Assert-PathExists -Path (Join-Path $projectRoot $manifest.action.default_popup) -Label "Popup entry"
Assert-ManifestPathsExist -Value $manifest.icons -Label "Manifest icon"
Assert-ManifestPathsExist -Value $manifest.action.default_icon -Label "Action icon"

$hostPermissions = @($manifest.host_permissions)
$contentScriptMatches = @(
  foreach ($contentScript in $manifest.content_scripts) {
    foreach ($matchPattern in $contentScript.matches) {
      $matchPattern
    }
  }
)

Assert-StringSetsMatch `
  -ExpectedValues $hostPermissions `
  -ActualValues $contentScriptMatches `
  -ExpectedLabel "manifest host_permissions" `
  -ActualLabel "content_scripts matches"

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
