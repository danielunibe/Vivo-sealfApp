$ErrorActionPreference = 'Continue'
Write-Host '== Flutter environment check =='
flutter --version
Write-Host "`n== Dart version =="
dart --version
Write-Host "`n== Flutter doctor =="
flutter doctor
Write-Host "`n== Connected devices =="
flutter devices
