#!/bin/bash
set -e

# Remove old Flutter SDK if exists
if [ -d "flutter" ]; then
  rm -rf flutter
fi

# Install Flutter SDK
git clone https://github.com/flutter/flutter.git -b stable

# Add Flutter to PATH for this script
export PATH="$PATH:`pwd`/flutter/bin"

# Verify installation
flutter doctor -v
