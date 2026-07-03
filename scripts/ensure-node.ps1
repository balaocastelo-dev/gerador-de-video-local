param(
  [string]$Version = "v24.18.0"
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$toolsRoot = Join-Path $projectRoot ".tools"
$nodeRoot = Join-Path $toolsRoot "node"
$nodeExe = Join-Path $nodeRoot "node.exe"

if (Test-Path $nodeExe) {
  Write-Host "Node portatil ja esta disponivel em $nodeRoot"
  return
}

New-Item -ItemType Directory -Force -Path $toolsRoot | Out-Null

$zipPath = Join-Path $toolsRoot "node.zip"
$extractRoot = Join-Path $toolsRoot "node-$Version-win-x64"
$downloadUrl = "https://nodejs.org/dist/$Version/node-$Version-win-x64.zip"

Write-Host "Baixando Node.js portatil: $downloadUrl"
Invoke-WebRequest -Uri $downloadUrl -OutFile $zipPath

if (Test-Path $extractRoot) {
  Remove-Item -Recurse -Force $extractRoot
}

if (Test-Path $nodeRoot) {
  Remove-Item -Recurse -Force $nodeRoot
}

Expand-Archive -Path $zipPath -DestinationPath $toolsRoot -Force
Rename-Item -Path $extractRoot -NewName "node"

Write-Host "Node portatil configurado em $nodeRoot"
