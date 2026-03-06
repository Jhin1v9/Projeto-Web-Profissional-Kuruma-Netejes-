param(
  [Parameter(Mandatory = $true)]
  [string]$RepoPath
)

$ErrorActionPreference = "Stop"

if (!(Test-Path $RepoPath)) {
  throw "Repo path not found: $RepoPath"
}

$repoFull = (Resolve-Path $RepoPath).Path
$gitPath = Join-Path $repoFull ".git"
if (!(Test-Path $gitPath)) {
  throw "Target is not a git repository: $repoFull"
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Resolve-Path (Join-Path $scriptDir "..")
$templatesDir = Join-Path $projectRoot "templates"

$agentsTemplate = Join-Path $templatesDir "AGENTS.template.md"
$ciTemplate = Join-Path $templatesDir "ci.template.yml"

if (!(Test-Path $agentsTemplate)) {
  throw "Missing template: $agentsTemplate"
}
if (!(Test-Path $ciTemplate)) {
  throw "Missing template: $ciTemplate"
}

$agentsTarget = Join-Path $repoFull "AGENTS.md"
$workflowDir = Join-Path $repoFull ".github\workflows"
$ciTarget = Join-Path $workflowDir "ci.yml"

if (!(Test-Path $workflowDir)) {
  New-Item -Path $workflowDir -ItemType Directory -Force | Out-Null
}

Copy-Item -Path $agentsTemplate -Destination $agentsTarget -Force
Copy-Item -Path $ciTemplate -Destination $ciTarget -Force

Write-Output "Codex bootstrap done."
Write-Output "Created/updated:"
Write-Output " - $agentsTarget"
Write-Output " - $ciTarget"
Write-Output ""
Write-Output "Next:"
Write-Output "  1) git add AGENTS.md .github/workflows/ci.yml"
Write-Output "  2) git commit -m 'chore: setup codex + ci'"
Write-Output "  3) git push"
