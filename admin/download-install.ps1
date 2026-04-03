# POPPY One-Line Installer for Windows
# Run: powershell -ExecutionPolicy Bypass -Command "iwr -useb https://raw.githubusercontent.com/Maximt23/code-puppy-POPPY/master/admin/download-install.ps1 | iex"

Write-Host "==============================================" -ForegroundColor Green
Write-Host "  Installing POPPY - AI Project Manager" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host ""

$installPath = "$env:USERPROFILE\poppy"

# Check if already installed
if (Test-Path $installPath) {
    Write-Host "POPPY is already installed at: $installPath" -ForegroundColor Yellow
    $response = Read-Host "Reinstall? (y/n)"
    if ($response -ne 'y') {
        Write-Host "Launching POPPY..."
        & "$installPath\admin\poppy.cmd"
        exit
    }
    Remove-Item -Recurse -Force $installPath
}

# Clone repository
Write-Host "[1/4] Downloading POPPY..." -ForegroundColor Cyan
git clone https://github.com/Maximt23/code-puppy-POPPY.git $installPath 2>$null

if (-not (Test-Path $installPath)) {
    # If git not available, download as zip
    Write-Host "Git not found, downloading as ZIP..." -ForegroundColor Yellow
    $zipUrl = "https://github.com/Maximt23/code-puppy-POPPY/archive/refs/heads/master.zip"
    $zipPath = "$env:TEMP\poppy.zip"
    Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath
    Expand-Archive -Path $zipPath -DestinationPath $installPath -Force
    Move-Item "$installPath\code-puppy-POPPY-master\*" $installPath
    Remove-Item "$installPath\code-puppy-POPPY-master" -Recurse
}

# Add to PATH
Write-Host "[2/4] Adding POPPY to PATH..." -ForegroundColor Cyan
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
if (-not $currentPath.Contains("$installPath\admin")) {
    [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$installPath\admin", "User")
}

# Create config directory
Write-Host "[3/4] Creating configuration..." -ForegroundColor Cyan
$configDir = "$env:USERPROFILE\.poppy"
New-Item -ItemType Directory -Force -Path $configDir | Out-Null

# Install dependencies if npm available
if (Get-Command npm -ErrorAction SilentlyContinue) {
    Write-Host "[4/4] Installing dependencies..." -ForegroundColor Cyan
    Set-Location "$installPath\admin"
    npm install 2>$null
}

Write-Host ""
Write-Host "==============================================" -ForegroundColor Green
Write-Host "  POPPY Installed Successfully!" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host ""
Write-Host "To use POPPY:"
Write-Host "  1. Close and reopen your terminal" -ForegroundColor Yellow
Write-Host "  2. Type: poppy" -ForegroundColor Cyan
Write-Host ""
Write-Host "First time? Run: poppy --setup" -ForegroundColor Cyan
Write-Host ""

# Launch POPPY
& "$installPath\admin\poppy.cmd"
