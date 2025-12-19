#!/bin/bash
set -e

# Peezy CLI Installation Script
# Usage: curl -fsSL https://raw.githubusercontent.com/Sehnya/peezy-cli/main/install.sh | bash

REPO="Sehnya/peezy-cli"
INSTALL_DIR="${PEEZY_INSTALL_DIR:-/usr/local/bin}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

info() { echo -e "${BLUE}$1${NC}"; }
success() { echo -e "${GREEN}$1${NC}"; }
warn() { echo -e "${YELLOW}$1${NC}"; }
error() { echo -e "${RED}$1${NC}"; }

# Get latest version from GitHub API if not specified
get_latest_version() {
  local latest
  latest=$(curl -fsSL "https://api.github.com/repos/$REPO/releases/latest" 2>/dev/null | grep '"tag_name"' | sed -E 's/.*"v([^"]+)".*/\1/')
  if [ -z "$latest" ]; then
    # Fallback to package.json version
    latest="1.0.3"
  fi
  echo "$latest"
}

VERSION="${PEEZY_VERSION:-$(get_latest_version)}"

# Detect OS and architecture
detect_platform() {
  local os arch

  os=$(uname -s | tr '[:upper:]' '[:lower:]')
  arch=$(uname -m)

  case $os in
    linux)
      os="linux"
      ;;
    darwin)
      os="macos"
      ;;
    mingw*|msys*|cygwin*)
      error "❌ Windows detected. Please use the Scoop installer instead:"
      echo "   scoop bucket add peezy https://github.com/Sehnya/peezy-scoop"
      echo "   scoop install peezy"
      exit 1
      ;;
    *)
      error "❌ Unsupported operating system: $os"
      exit 1
      ;;
  esac

  case $arch in
    x86_64|amd64)
      arch="x64"
      ;;
    arm64|aarch64)
      arch="arm64"
      ;;
    *)
      error "❌ Unsupported architecture: $arch"
      exit 1
      ;;
  esac

  echo "$os-$arch"
}

# Check for required commands
check_dependencies() {
  for cmd in curl tar; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
      error "❌ Required command not found: $cmd"
      exit 1
    fi
  done
}

# Main installation
main() {
  check_dependencies

  local platform
  platform=$(detect_platform)

  local binary_name="peezy-$platform"
  local download_url="https://github.com/$REPO/releases/download/v$VERSION/$binary_name.tar.gz"

  echo ""
  info "🚀 Installing Peezy CLI v$VERSION for $platform..."
  echo ""

  # Create temporary directory
  local tmp_dir
  tmp_dir=$(mktemp -d)
  trap "rm -rf '$tmp_dir'" EXIT

  cd "$tmp_dir"

  # Download and extract
  info "📥 Downloading from GitHub releases..."
  if ! curl -fsSL --progress-bar "$download_url" -o peezy.tar.gz; then
    error "❌ Failed to download Peezy CLI"
    error "   URL: $download_url"
    error ""
    error "   This could mean:"
    error "   - Version v$VERSION doesn't exist"
    error "   - No binary available for $platform"
    error ""
    error "   Try installing via npm instead:"
    echo "   npm install -g peezy-cli"
    exit 1
  fi

  info "📦 Extracting..."
  tar -xzf peezy.tar.gz

  # Check if we need sudo
  local use_sudo=""
  if [ ! -w "$INSTALL_DIR" ]; then
    if command -v sudo >/dev/null 2>&1; then
      use_sudo="sudo"
      info "📦 Installing to $INSTALL_DIR (requires sudo)..."
    else
      error "❌ Cannot write to $INSTALL_DIR and sudo is not available"
      error "   Try setting PEEZY_INSTALL_DIR to a writable directory:"
      echo "   PEEZY_INSTALL_DIR=~/.local/bin curl -fsSL ... | bash"
      exit 1
    fi
  else
    info "📦 Installing to $INSTALL_DIR..."
  fi

  # Create install directory if needed
  $use_sudo mkdir -p "$INSTALL_DIR"

  # Install binary
  $use_sudo mv "$binary_name" "$INSTALL_DIR/peezy"
  $use_sudo chmod +x "$INSTALL_DIR/peezy"

  echo ""
  success "✅ Peezy CLI installed successfully!"
  echo ""

  # Verify installation
  if command -v peezy >/dev/null 2>&1; then
    success "📋 Version: $(peezy --version)"
    echo ""
    info "🎉 Get started with:"
    echo "   peezy new nextjs-fullstack my-app"
    echo "   peezy --help"
  else
    warn "⚠️  'peezy' command not found in PATH"
    echo ""
    echo "   Add $INSTALL_DIR to your PATH:"
    echo ""
    echo "   # For bash (add to ~/.bashrc):"
    echo "   export PATH=\"$INSTALL_DIR:\$PATH\""
    echo ""
    echo "   # For zsh (add to ~/.zshrc):"
    echo "   export PATH=\"$INSTALL_DIR:\$PATH\""
    echo ""
    echo "   Then restart your terminal or run: source ~/.bashrc"
  fi
}

main "$@"
