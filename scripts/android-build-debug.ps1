param(
  [switch]$Deliver
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$androidStudioJbr = 'C:\Program Files\Android\Android Studio\jbr'
$androidSdk = Join-Path $env:LOCALAPPDATA 'Android\Sdk'

if (-not $env:JAVA_HOME -and (Test-Path -LiteralPath $androidStudioJbr)) {
  $env:JAVA_HOME = $androidStudioJbr
}

if (-not $env:ANDROID_HOME -and (Test-Path -LiteralPath $androidSdk)) {
  $env:ANDROID_HOME = $androidSdk
}

if (-not $env:ANDROID_SDK_ROOT -and $env:ANDROID_HOME) {
  $env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
}

if ($env:JAVA_HOME) {
  $javaBin = Join-Path $env:JAVA_HOME 'bin'
  $env:Path = "$javaBin;$env:Path"
}

if ($env:ANDROID_HOME) {
  $env:Path = "$(Join-Path $env:ANDROID_HOME 'platform-tools');$(Join-Path $env:ANDROID_HOME 'emulator');$env:Path"
}

Set-Location -LiteralPath $repoRoot
npm run build
npx cap sync android

Push-Location -LiteralPath (Join-Path $repoRoot 'android')
try {
  .\gradlew.bat assembleDebug --console=plain
}
finally {
  Pop-Location
}

if ($Deliver) {
  $deliveryDir = Join-Path $repoRoot 'dist-apk'
  New-Item -ItemType Directory -Force -Path $deliveryDir | Out-Null
  $sourceApk = Join-Path $repoRoot 'android\app\build\outputs\apk\debug\app-debug.apk'
  $targetApk = Join-Path $deliveryDir 'vivo-promotor-debug.apk'
  try {
    Copy-Item -LiteralPath $sourceApk -Destination $targetApk -Force
  }
  catch [System.IO.IOException] {
    $metadataPath = Join-Path $repoRoot 'android\app\build\outputs\apk\debug\output-metadata.json'
    $versionSuffix = Get-Date -Format 'yyyyMMdd-HHmmss'
    if (Test-Path -LiteralPath $metadataPath) {
      $metadata = Get-Content -LiteralPath $metadataPath -Raw | ConvertFrom-Json
      $version = $metadata.elements[0].versionName
      $versionCode = $metadata.elements[0].versionCode
      $versionSuffix = "v$version-$versionCode"
    }
    $fallbackApk = Join-Path $deliveryDir "vivo-promotor-debug-$versionSuffix.apk"
    Copy-Item -LiteralPath $sourceApk -Destination $fallbackApk -Force
    Write-Warning "No se pudo sobrescribir vivo-promotor-debug.apk porque Windows lo tiene abierto. Se genero $fallbackApk."
  }
}
