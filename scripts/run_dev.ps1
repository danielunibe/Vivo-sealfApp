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

Write-Host "`n== flutter run =="
flutter run
