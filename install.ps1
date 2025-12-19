# Peezy CLI Installation Script for Windows
# Usage: irm https://raw.githubusercontent.com/Sehnya/peezy-cli/main/install.ps1 | iex

$ErrorActionPreference = "Stop"

$Repo = "Sehnya/peezy-cli"
$InstallDir = "$env:LOCALAPPDATA\peezy"

function Write-Info { param($Message) Write-Host $Message -ForegroundColor Cyan }
function Write-Success { param($Message) Write-Host $Message -ForegroundColor Green }
function Write-Warn { param($Message) Write-Host $Message -ForegroundColor Yellow }
function Write-Err { param($Message) Write-Host $Message -ForegroundColor Red }

# Get latest version from GitHub API
function Get-LatestVersion {
    try {
        $release = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/releases/latest" -ErrorAction SilentlyContinue
        return $release.tag_name -replace '^v', ''
    } catch {
        return "1.0.3"  # Fallback version
    }
}

$Version = if ($env:PEEZY_VERSION) { $env:PEEZY_VERSION } else { Get-LatestVersion }

Write-Host ""
Write-Info "🚀 Installing Peezy CLI v$Version for Windows..."
Write-Host ""

# Create install directory
if (-not (Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
}

# Download URL
$DownloadUrl = "https://github.com/$Repo/releases/download/v$Version/peezy-windows-x64.zip"
$ZipPath = "$env:TEMP\peezy-windows-x64.zip"
$ExtractPath = "$env:TEMP\peezy-extract"

try {
    # Download
    Write-Info "📥 Downloading from GitHub releases..."
    Invoke-WebRequest -Uri $DownloadUrl -OutFile $ZipPath -UseBasicParsing

    # Extract
    Write-Info "📦 Extracting..."
    if (Test-Path $ExtractPath) {
        Remove-Item -Recurse -Force $ExtractPath
    }
    Expand-Archive -Path $ZipPath -DestinationPath $ExtractPath -Force

    # Install
    Write-Info "📦 Installing to $InstallDir..."
    Copy-Item "$ExtractPath\peezy-windows-x64.exe" "$InstallDir\peezy.exe" -Force

    # Cleanup
    Remove-Item $ZipPath -Force -ErrorAction SilentlyContinue
    Remove-Item $ExtractPath -Recurse -Force -ErrorAction SilentlyContinue

} catch {
    Write-Err "❌ Failed to download Peezy CLI"
    Write-Err "   URL: $DownloadUrl"
    Write-Host ""
    Write-Err "   This could mean:"
    Write-Err "   - Version v$Version doesn't exist"
    Write-Err "   - Network issues"
    Write-Host ""
    Write-Err "   Try installing via npm instead:"
    Write-Host "   npm install -g peezy-cli"
    exit 1
}

# Add to PATH if not already there
$UserPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($UserPath -notlike "*$InstallDir*") {
    Write-Info "📝 Adding to PATH..."
    [Environment]::SetEnvironmentVariable("Path", "$UserPath;$InstallDir", "User")
    $env:Path = "$env:Path;$InstallDir"
}

Write-Host ""
Write-Success "✅ Peezy CLI installed successfully!"
Write-Host ""

# Verify installation
try {
    $version = & "$InstallDir\peezy.exe" --version 2>&1
    Write-Success "📋 Version: $version"
    Write-Host ""
    Write-Info "🎉 Get started with:"
    Write-Host "   peezy new nextjs-fullstack my-app"
    Write-Host "   peezy --help"
} catch {
    Write-Warn "⚠️  Installation complete, but you may need to restart your terminal"
    Write-Host ""
    Write-Host "   Then run: peezy --help"
}

Write-Host ""
Write-Info "💡 Tip: You can also install via Scoop:"
Write-Host "   scoop bucket add peezy https://github.com/Sehnya/peezy-scoop"
Write-Host "   scoop install peezy"
