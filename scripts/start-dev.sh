#!/bin/bash

# Try to start Expo with different connection methods
# This script tries tunnel first, then falls back to LAN mode

echo "Starting Expo development server..."
echo "Attempting tunnel mode first..."

# Try tunnel mode with a timeout
timeout 30 npx expo start --tunnel || {
  echo ""
  echo "⚠️  Tunnel mode failed or timed out."
  echo "Switching to LAN mode..."
  echo ""
  echo "📱 To connect your device:"
  echo "1. Make sure your device is on the same network"
  echo "2. Or use Replit's port forwarding feature"
  echo "3. Scan the QR code that appears below"
  echo ""
  npx expo start --host lan
}
