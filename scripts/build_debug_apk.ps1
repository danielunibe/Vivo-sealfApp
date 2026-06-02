param(
  [string]$ProjectPath = "C:\Desarrollos DEV daniel\app vivo"
)

$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $ProjectPath

Write-Host '== flutter pub get =='
flutter pub get

Write-Host "`n== build_runner =="
dart run build_runner build --delete-conflicting-outputs

Write-Host "`n== flutter analyze =="
flutter analyze

Write-Host "`n== build apk debug =="
flutter build apk --debug

$apk = Join-Path $ProjectPath 'build/app/outputs/flutter-apk/app-debug.apk'
if (Test-Path $apk) {
  Write-Host "APK generado: $apk"
} else {
  Write-Warning "No se encontró APK en: $apk"
}
