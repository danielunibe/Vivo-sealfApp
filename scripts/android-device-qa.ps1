param(
  [string]$ApkPath = "dist-apk/vivo-promotor-debug.apk",
  [string]$PackageName = "com.davidsanchez.vivopromotor",
  [string]$ActivityName = ".MainActivity",
  [string]$EvidenceDir = "docs/android-device-qa"
)

$ErrorActionPreference = "Stop"

function Write-Step {
  param([string]$Message)
  Write-Host ""
  Write-Host "==> $Message"
}

function Require-Command {
  param([string]$Name)
  $command = Get-Command $Name -ErrorAction SilentlyContinue
  if (-not $command) {
    throw "Required command '$Name' was not found in PATH."
  }
}

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $repoRoot

Require-Command "adb"

$resolvedApk = Resolve-Path -LiteralPath $ApkPath -ErrorAction SilentlyContinue
if (-not $resolvedApk) {
  throw "APK not found: $ApkPath. Run npm run android:prepare and Gradle assembleDebug first."
}

$devices = adb devices | Select-Object -Skip 1 | Where-Object { $_ -match "\tdevice$" }
if (-not $devices -or $devices.Count -lt 1) {
  Write-Host "No Android device or AVD is available through adb."
  Write-Host "Connect a phone with USB debugging enabled or start an AVD, then run this script again."
  exit 2
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$evidencePath = Join-Path $repoRoot (Join-Path $EvidenceDir $timestamp)
New-Item -ItemType Directory -Path $evidencePath -Force | Out-Null

Write-Step "Recording connected devices"
adb devices -l | Tee-Object -FilePath (Join-Path $evidencePath "adb-devices.txt")

Write-Step "Installing APK as an update without uninstalling existing app data"
adb install -r $resolvedApk.Path | Tee-Object -FilePath (Join-Path $evidencePath "install.txt")

Write-Step "Launching Vivo Promotor"
$component = "$PackageName/$ActivityName"
adb shell am start -n $component | Tee-Object -FilePath (Join-Path $evidencePath "launch.txt")

Start-Sleep -Seconds 5

Write-Step "Capturing screenshot"
$remoteScreenshot = "/sdcard/vivo-promotor-qa-$timestamp.png"
adb shell screencap -p $remoteScreenshot | Out-Null
adb pull $remoteScreenshot (Join-Path $evidencePath "launch-screenshot.png") | Tee-Object -FilePath (Join-Path $evidencePath "screenshot-pull.txt")
adb shell rm $remoteScreenshot | Out-Null

Write-Step "Capturing recent logcat lines for the app package"
adb logcat -d -v time | Select-String -Pattern $PackageName, "Capacitor", "chromium", "AndroidRuntime" | Select-Object -Last 300 | Out-File -Encoding utf8 (Join-Path $evidencePath "logcat-filtered.txt")

Write-Step "Writing manual checklist"
@"
# Android Device QA - Vivo Promotor

- Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
- APK: $($resolvedApk.Path)
- Package: $PackageName
- Install mode: adb install -r, preserves app data when signing identity is compatible

## Manual checks to complete on the device

- [ ] App opens without a blank screen.
- [ ] Dock is visible.
- [ ] Navigate: Calendario, Catalogo, Registrar venta, Puerquito, Ajustes.
- [ ] Register a sale with long-press.
- [ ] Close and reopen the app; sale data persists.
- [ ] Calendar reflects the sale.
- [ ] Puerquito reflects earnings.
- [ ] Catalog opens commercial sheets.
- [ ] Ajustes > Backup exports JSON.
- [ ] Install a newer APK over this one and confirm data still persists.

## Evidence files

- adb-devices.txt
- install.txt
- launch.txt
- launch-screenshot.png
- logcat-filtered.txt
"@ | Out-File -Encoding utf8 (Join-Path $evidencePath "CHECKLIST.md")

Write-Host ""
Write-Host "Android QA evidence written to: $evidencePath"
