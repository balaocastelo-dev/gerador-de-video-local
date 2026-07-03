param(
  [int]$Port = 3000,
  [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"

function Get-AvailablePort {
  param(
    [int]$StartPort
  )

  $port = $StartPort

  while ($true) {
    try {
      $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $port)
      $listener.Start()
      $listener.Stop()
      return $port
    } catch {
      $port++
    }
  }
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir

& (Join-Path $scriptDir "ensure-node.ps1")

$nodeExe = Join-Path $projectRoot ".tools\node\node.exe"
$nextCli = Join-Path $projectRoot "node_modules\next\dist\bin\next"
$nodeModulesDir = Join-Path $projectRoot "node_modules"
$sandboxDataRoot = Join-Path $projectRoot ".sandbox-data"
$sandboxRoaming = Join-Path $sandboxDataRoot "Roaming"
$sandboxLocal = Join-Path $sandboxDataRoot "Local"
$resolvedPort = Get-AvailablePort -StartPort $Port

New-Item -ItemType Directory -Force -Path $sandboxRoaming | Out-Null
New-Item -ItemType Directory -Force -Path $sandboxLocal | Out-Null

$env:APPDATA = $sandboxRoaming
$env:LOCALAPPDATA = $sandboxLocal

if (-not $SkipInstall -or -not (Test-Path $nodeModulesDir)) {
  Write-Host "Instalando dependencias do projeto..."
  & (Join-Path $scriptDir "npm.ps1") install
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
}

if (-not (Test-Path $nextCli)) {
  throw "Next CLI nao encontrado. Rode novamente .\scripts\dev.ps1 para reinstalar as dependencias."
}

Write-Host "Subindo servidor local em http://localhost:$resolvedPort"
& $nodeExe $nextCli dev --hostname 0.0.0.0 --port $resolvedPort
exit $LASTEXITCODE
