param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$Args
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir

& (Join-Path $scriptDir "ensure-node.ps1")

$nodeExe = Join-Path $projectRoot ".tools\node\node.exe"
$npmCli = Join-Path $projectRoot ".tools\node\node_modules\npm\bin\npm-cli.js"

if (-not (Test-Path $nodeExe)) {
  throw "Node portatil nao foi encontrado em $nodeExe"
}

if (-not (Test-Path $npmCli)) {
  throw "npm-cli.js nao foi encontrado em $npmCli"
}

& $nodeExe $npmCli @Args

if ($LASTEXITCODE -ne 0) {
  throw "Falha ao executar npm com codigo $LASTEXITCODE."
}
