#!/bin/bash

# RestaurantHub Firebase Seeding Setup Script
# Installs dependencies and prepares the environment

set -e

echo "════════════════════════════════════════════════════════════"
echo "🏛️  RestaurantHub Firebase Seeding Setup"
echo "════════════════════════════════════════════════════════════"
echo ""

# Check if package.json exists
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Please run this script from the project root."
  exit 1
fi

# Check if seed.ts exists
if [ ! -f "seed.ts" ]; then
  echo "❌ Error: seed.ts not found. Please ensure seed.ts is in the project root."
  exit 1
fi

echo "📦 Installing Firebase Admin SDK and dependencies..."
npm install firebase-admin --save-dev

echo ""
echo "📦 Installing TypeScript runtime..."
npm install -D ts-node @types/node

echo ""
echo "✅ Dependencies installed successfully!"
echo ""

# Check if serviceAccountKey.json exists
if [ ! -f "serviceAccountKey.json" ]; then
  echo "⚠️  WARNING: serviceAccountKey.json not found"
  echo ""
  echo "To get your service account key:"
  echo "1. Go to Firebase Console: https://console.firebase.google.com"
  echo "2. Select your project (restaurant-e-comerce)"
  echo "3. Project Settings → Service Accounts"
  echo "4. Click 'Generate New Private Key'"
  echo "5. Save as 'serviceAccountKey.json' in this directory"
  echo ""
else
  echo "✅ serviceAccountKey.json found"
  echo ""
fi

# Add serviceAccountKey.json to .gitignore
if [ -f ".gitignore" ]; then
  if ! grep -q "serviceAccountKey.json" .gitignore; then
    echo "serviceAccountKey.json" >> .gitignore
    echo "✅ Added serviceAccountKey.json to .gitignore"
  fi
else
  echo "serviceAccountKey.json" > .gitignore
  echo "✅ Created .gitignore with serviceAccountKey.json"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "📋 Setup Complete!"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo "1. Download your Firebase service account key"
echo "2. Save it as 'serviceAccountKey.json' in the project root"
echo "3. Run: npx ts-node seed.ts"
echo ""
echo "For detailed instructions, see SEEDING_GUIDE.md"
echo ""
