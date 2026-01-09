# Weather Forecast App - Development Server Launcher (PowerShell)
# One-command startup with automatic browser opening

# UTF-8 encoding configuration (to avoid garbled text)
$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "  Weather Forecast App Starting..." -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Get script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Navigate to src directory
Set-Location (Join-Path $scriptDir "src")

Write-Host "Starting server..." -ForegroundColor Cyan
Write-Host "Browser will automatically open: http://localhost:8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Open browser (asynchronous)
Start-Process "http://localhost:8080"

# Wait 1 second before starting http-server
Start-Sleep -Seconds 1

# Start http-server (via npm)
try {
    npx http-server -p 8080
} catch {
    Write-Host "Error: Failed to start http-server" -ForegroundColor Red
    Write-Host "Make sure npm is installed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Installation: npm install -g http-server" -ForegroundColor Yellow
    pause
}
