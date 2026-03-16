# 🏛️ RestaurantHub Firebase Data Seeding Guide

## Overview
The `seed.ts` script automatically populates your Firebase Firestore database with production-ready data for RestaurantHub, including menu items, orders, and reservations.

## Prerequisites

### 1. Firebase Service Account Key
You need a Firebase Admin SDK service account key:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (restaurant-e-comerce)
3. Navigate to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Save as `serviceAccountKey.json` in the project root directory

⚠️ **IMPORTANT**: Add `serviceAccountKey.json` to `.gitignore` to prevent exposing credentials

```bash
echo "serviceAccountKey.json" >> .gitignore
```

### 2. Install Firebase Admin SDK

```bash
npm install firebase-admin --save-dev
npm install -D ts-node @types/node
```

### 3. Image Directory Structure
The script scans these directories for menu images:

```
public/images/menu/
├── starters/
├── vegetarian/
├── non-veg/
└── desserts/
```

All images are automatically detected and used to seed the menu.

## Features

### ✨ Dynamic Menu Seeding
- **Scans image directories** automatically
- **Generates royal names** (e.g., "Heritage Spiced Poultry Skewers" instead of "Chicken Tikka")
- **Sets realistic fine-dining prices**:
  - Starters: $12-$24
  - Vegetarian: $16-$28
  - Non-Veg: $24-$52
  - Desserts: $10-$18
- **Includes prep times** based on dish category
- **Creates professional descriptions**

### 📋 Mock Orders
- **15 diverse orders** with:
  - Mixed statuses: completed, preparing, pending, cancelled
  - Various payment methods: UPI, card, cash
  - Timestamps spread across last 30 days
  - Realistic item combinations
  - Special instructions (10% chance)

### 🍽️ Mock Reservations
- **10 realistic reservations** with:
  - Guest counts: 2-8 people
  - Time slots: 18:00 to 22:00
  - Various statuses: confirmed, completed, cancelled, pending
  - Optional special requests (40% chance)
  - Future dates: 1-14 days ahead

### 🧹 Idempotent Clearing
- Clears existing data before seeding
- Prevents duplicate entries
- Safe to run multiple times

## Usage

### Run the Seeding Script

```bash
npx ts-node seed.ts
```

### Expected Output

```
════════════════════════════════════════════════════════════
🏛️  RestaurantHub Firebase Data Seeding Script
════════════════════════════════════════════════════════════

🧹 Clearing existing data...
  ✓ menuItems is empty
  ✓ orders is empty
  ✓ reservations is empty

📋 Starting Menu Items Seeding...
  ✓ Heritage Spiced Poultry Skewers (starters) - ₹18.50
  ✓ Pan-Seared Oceanic Delights (starters) - ₹22.00
  ... [more items]
✅ Seeded 60 Menu Items

📋 Starting Orders Seeding...
  ✓ Order for Raj Patel - ₹127.50 (completed)
  ✓ Order for Priya Sharma - ₹89.99 (preparing)
  ... [more orders]
✅ Seeded 15 Orders

📋 Starting Reservations Seeding...
  ✓ Reservation for Raj Patel - 2024-03-25 at 19:30 (4 guests)
  ✓ Reservation for Priya Sharma - 2024-03-26 at 20:00 (2 guests)
  ... [more reservations]
✅ Seeded 10 Reservations

════════════════════════════════════════════════════════════
✅ Seeded 60 Menu Items
✅ Seeded 15 Orders
✅ Seeded 10 Reservations
════════════════════════════════════════════════════════════
🎉 Database seeding completed successfully!
```

## What Gets Seeded

### Menu Items (From Images)
- **Category**: starters, vegetarian, non-veg, desserts
- **Name**: Royal-themed names (mapped from image filenames)
- **Price**: Realistic fine-dining prices
- **Description**: Professional culinary descriptions
- **Image URL**: Relative path to image file
- **Availability**: 90% available, 10% unavailable
- **Prep Time**: Category-appropriate preparation times

### Orders
```javascript
{
  customerName: "Raj Patel",
  customerEmail: "raj.patel@example.com",
  customerPhone: "+1-555-0101",
  items: [
    { menuItemId: "...", name: "...", quantity: 2, price: 25.50 }
  ],
  totalAmount: 127.50,
  status: "completed",        // completed, preparing, pending, cancelled
  paymentMethod: "upi",       // upi, card, cash
  paymentStatus: "completed", // completed, failed, pending
  specialInstructions: "No onions, extra spice",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Reservations
```javascript
{
  customerName: "Raj Patel",
  customerEmail: "raj.patel@example.com",
  customerPhone: "+1-555-0101",
  date: "2024-03-25",
  time: "19:30",
  numberOfGuests: 4,
  status: "confirmed",        // confirmed, completed, pending, cancelled
  specialRequests: "Window table preferred, birthday celebration",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Customization

### Change Menu Prices
Edit the `getPriceForCategory()` function:

```typescript
const priceRanges: Record<string, [number, number]> = {
  starters: [12, 24],        // Min, Max
  vegetarian: [16, 28],
  "non-veg": [24, 52],
  desserts: [10, 18],
};
```

### Customize Preparation Times
Edit the `getPreparationTime()` function:

```typescript
const timeRanges: Record<string, [number, number]> = {
  starters: [12, 20],        // minutes
  vegetarian: [20, 35],
  "non-veg": [25, 45],
  desserts: [8, 15],
};
```

### Modify Royal Names
The `royalNameMapping` object contains image-to-display-name mappings. Add or modify entries:

```typescript
const royalNameMapping: Record<string, string> = {
  "Chicken Tikka": "Heritage Spiced Poultry Skewers",
  // Add your custom mappings here
};
```

### Add More Mock Customers
Extend the `mockCustomers` array:

```typescript
const mockCustomers = [
  { name: "Raj Patel", email: "...", phone: "..." },
  // Add more customers
];
```

### Change Number of Orders/Reservations
Modify the loop counts:

```typescript
// In seedOrders():
for (let i = 0; i < 15; i++) { // Change 15 to desired count

// In seedReservations():
for (let i = 0; i < 10; i++) { // Change 10 to desired count
```

## Troubleshooting

### Error: "serviceAccountKey.json not found"
**Solution**: Place your Firebase service account key file in the project root directory and name it exactly `serviceAccountKey.json`

### Error: "Directory not found: public/images/menu/..."
**Solution**: Ensure the image directory structure exists:
```bash
mkdir -p public/images/menu/{starters,vegetarian,non-veg,desserts}
```

### Error: "No images found"
**Solution**: Add menu images to the respective category folders. Supported formats: jpg, jpeg, png, webp, avif, gif

### Error: Firebase authentication failed
**Solution**: Verify your service account key has proper Firebase permissions in Google Cloud Console

### Script times out
**Solution**: If seeding large datasets, increase Node.js timeout:
```bash
NODE_OPTIONS="--max-old-space-size=4096" npx ts-node seed.ts
```

## Best Practices

1. **Back up before seeding**: If you have important data, back it up first
2. **Test in development**: Always test in a development Firebase project first
3. **Keep credentials secure**: Never commit `serviceAccountKey.json` to version control
4. **Run once per environment**: Run the seeding script once per environment (dev, staging, production)
5. **Verify data**: Check Firebase Console to verify seeding was successful

## Security Considerations

⚠️ **IMPORTANT**: 
- Add `serviceAccountKey.json` to `.gitignore`
- Never expose your service account key publicly
- Use environment variables for sensitive data in production
- Restrict Firebase security rules to prevent unauthorized access

## Next Steps

1. Run the seeding script: `npx ts-node seed.ts`
2. Verify data in Firebase Console
3. Test the application with the seeded data
4. Deploy to production when ready

---

For more information, see:
- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/database/admin/start)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
