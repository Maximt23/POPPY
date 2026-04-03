#!/bin/bash

# POPPY Installation Script
# Works on macOS and Linux

set -e

echo "=============================================="
echo "  Installing POPPY - Universal AI Project Manager"
echo "=============================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check Node version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ required. Current: $(node --version)"
    exit 1
fi

echo "✓ Node.js $(node --version) found"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed!"
    exit 1
fi

echo "✓ npm $(npm --version) found"
echo ""

# Install globally
echo "Installing POPPY globally..."
npm install -g poppy-admin

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ POPPY installed successfully!"
    echo ""
    echo "To get started:"
    echo "  1. Run: poppy --setup"
    echo "  2. Run: poppy"
    echo ""
    echo "For help: poppy --help"
else
    echo "❌ Installation failed"
    exit 1
fi
