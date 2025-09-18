#!/bin/bash
set -e

# Peezy CLI Installation Script
# Usage: curl -fsSL https://raw.githubusercontent.com/Sehnya/peezy-cli/main/install.sh | bash

REPO="Sehnya/peezy-cli"
VERSION="1.0.0-alpha.1"
INSTALL_DIR="/usr/local/bin"

# Detect OS and architecture
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

case $OS in
  linux)
    OS="linux"
    ;;
  darwin)
    OS="macos"
    ;;
  *)
    echo "❌ Unsupported operating system: $OS"
    exit 1
    ;;
esac

case $ARCH in
  x86_64)
    ARCH="x64"
    ;;
  arm64|aarch64)
    ARCH="arm64"
    ;;
  *)
    echo "❌ Unsupported architecture: $ARCH"
    exit 1
    ;;
esac

BINARY_NAME="peezy-$OS-$ARCH"
DOWNLOAD_URL="https://github.com/$REPO/releases/download/v$VERSION/$BINARY_NAME.tar.gz"

echo "🚀 Installing Peezy CLI v$VERSION for $OS-$ARCH..."

# Create temporary directory
TMP_DIR=$(mktemp -d)
cd "$TMP_DIR"

# Download and extract
echo "📥 Downloading from $DOWNLOAD_URL..."
curl -fsSL "$DOWNLOAD_URL" | tar -xz

# Install binary
echo "📦 Installing to $INSTALL_DIR..."
sudo mv "$BINARY_NAME" "$INSTALL_DIR/peezy"
sudo chmod +x "$INSTALL_DIR/peezy"

# Cleanup
cd /
rm -rf "$TMP_DIR"

echo "✅ Peezy CLI installed successfully!"
echo "🎉 Run 'peezy --help' to get started"

# Verify installation
if command -v peezy >/dev/null 2>&1; then
  echo "📋 Version: $(peezy --version)"
else
  echo "⚠️  Warning: peezy command not found in PATH"
  echo "   Make sure $INSTALL_DIR is in your PATH"
fi
