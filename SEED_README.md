# 🏛️ RestaurantHub Firebase Data Seeding System

## Quick Start

### 1. Install Dependencies

```bash
# Run setup script (or install manually)
bash setup-seeding.sh

# OR manually install:
npm install firebase-admin --save-dev
npm install -D ts-node @types/node
```

### 2. Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select "restaurant-e-comerce" project
3. Project Settings → Service Accounts tab
4. Click "Generate New Private Key"
5. Save as `serviceAccountKey.json` in project root

### 3. Run Seeding Script

```bash
npx ts-node seed.ts
```

That's it! Your database will be populated with production-ready data.

---

## What's Included

### 📊 Menu Items (60+ items)

Automatically scanned from image directories with:

- ✨ **Royal names**: "Heritage Spiced Poultry Skewers" instead of "Chicken Tikka"
- 💰 **Fine-dining prices**: $10-$85 realistic pricing
- ⏱️ **Prep times**: 8-45 minutes by category
- 🖼️ **Image URLs**: Auto-linked to local images
- 📝 **Professional descriptions**: Culinary-focused text

**Categories**:

- Starters (12-20 min prep, $12-$24)
- Vegetarian (20-35 min prep, $16-$28)
- Non-Vegetarian (25-45 min prep, $24-$52)
- Desserts (8-15 min prep, $10-$18)

### 📋 Orders (15 mock orders)

Complete with:

- Mixed statuses: completed, preparing, pending, cancelled
- Payment methods: UPI, card, cash
- Timestamps: Spread across last 30 days
- Realistic pricing: $50-$200+ per order
- Special instructions: 10% have dietary notes

### 🍽️ Reservations (10 mock reservations)

With:

- Guest counts: 2-8 people
- Time slots: 18:00 to 22:00
- Dates: 1-14 days in future
- Statuses: confirmed, completed, pending, cancelled
- Special requests: 40% have special requirements

---

## File Structure

```
project-root/
├── seed.ts                    ← Main seeding script
├── SEEDING_GUIDE.md          ← Detailed documentation
├── setup-seeding.sh          ← Automated setup
├── serviceAccountKey.json    ← Firebase credentials (gitignored)
└── public/images/menu/
    ├── starters/             ← Scanner reads these
    ├── vegetarian/
    ├── non-veg/
    └── desserts/
```

---

## How It Works

### Dynamic Menu Seeding

```
1. Scans public/images/menu/{category}/ directories
2. For each image file found:
   - Extracts filename as base name
   - Maps to royal name (if exists in mapping)
   - Generates realistic price for category
   - Gets preparation time for category
   - Creates MenuItem document in Firestore
3. Commits all items in single batch (efficient!)
```

### Mock Data Generation

```
1. Uses predefined mock customers (5 profiles)
2. Generates 15 random orders:
   - 2-5 items per order
   - Random timestamps (last 30 days)
   - Mixed statuses & payment methods
   - 10% special instructions
3. Generates 10 random reservations:
   - 2-8 guests per reservation
   - 9 time slots (18:00-22:00)
   - Future dates (1-14 days ahead)
   - 40% special requests
4. Uses batch writes for efficiency
```

### Idempotent Clearing

```
1. Before seeding, clears existing data:
   - menuItems collection
   - orders collection
   - reservations collection
2. Safe to run multiple times
3. Prevents duplicate entries
```

---

## Menu Item Mapping

The script includes 60+ royal name mappings. Examples:

| Original             | Royal Name                                 |
| -------------------- | ------------------------------------------ |
| Chicken Tikka        | Heritage Spiced Poultry Skewers            |
| Paneer Butter Masala | Creamed Cottage Cheese in Tomato Reduction |
| Mutton Biryani       | Royal Lamb Biryani with Saffron Essence    |
| Gulab Jamun          | Rosewood-Infused Milk Solids               |
| Fish Curry           | Coastal Spiced Aquatic Delight             |

All mappings are in the `royalNameMapping` object for easy customization.

---

## Customization

### Change Prices

Edit `getPriceForCategory()`:

```typescript
const priceRanges: Record<string, [number, number]> = {
  starters: [12, 24], // [min, max]
  vegetarian: [16, 28],
  "non-veg": [24, 52],
  desserts: [10, 18],
};
```

### Change Prep Times

Edit `getPreparationTime()`:

```typescript
const timeRanges: Record<string, [number, number]> = {
  starters: [12, 20], // [min, max] in minutes
  vegetarian: [20, 35],
  "non-veg": [25, 45],
  desserts: [8, 15],
};
```

### Add Royal Names

Extend `royalNameMapping`:

```typescript
"Your Dish": "Your Royal Name"
```

### Change Availability Rate

In `seedMenuItems()`:

```typescript
available: Math.random() > 0.1; // 90% available (change 0.1 to desired rate)
```

### More Orders/Reservations

Change loop counts:

```typescript
// In seedOrders()
for (let i = 0; i < 15; i++) { ... }  // Change 15

// In seedReservations()
for (let i = 0; i < 10; i++) { ... }  // Change 10
```

---

## API & Data Structures

### MenuItem

```typescript
{
  id: string; // Firestore doc ID
  name: string; // Royal name
  description: string; // Culinary description
  price: number; // Fine-dining price
  category: "starters" | "veg" | "non-veg" | "desserts";
  imageUrl: string; // Relative path
  available: boolean; // Stock status
  preparationTime: number; // Minutes
  createdAt: Timestamp; // Firestore timestamp
  updatedAt: Timestamp;
}
```

### Order

```typescript
{
  id: string
  userId?: string
  customerName: string
  customerEmail: string
  customerPhone: string
  items: Array<{
    menuItemId: string
    name: string
    quantity: number
    price: number
  }>
  totalAmount: number
  status: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled"
  paymentMethod?: "upi" | "card" | "cash"
  paymentStatus?: "pending" | "completed" | "failed"
  specialInstructions?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### Reservation

```typescript
{
  id: string
  userId?: string
  customerName: string
  customerEmail?: string
  customerPhone: string
  date: string                                  // YYYY-MM-DD
  time: string                                  // HH:MM
  numberOfGuests: number
  status: "pending" | "confirmed" | "cancelled" | "completed"
  specialRequests?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

---

## Troubleshooting

### "serviceAccountKey.json not found"

```bash
# Download from Firebase Console:
# Project Settings → Service Accounts → Generate New Private Key
# Then place file in project root as: serviceAccountKey.json
```

### "Directory not found: public/images/menu/..."

```bash
# Create directory structure
mkdir -p public/images/menu/{starters,vegetarian,non-veg,desserts}
```

### "No images found in..."

```bash
# Add images to category folders or script will skip with warning
# Supported formats: jpg, jpeg, png, webp, avif, gif
```

### Firebase authentication failed

```bash
# Verify service account key has proper permissions
# In Google Cloud Console:
# - Check project is correct
# - Verify service account has Firestore Editor role
```

### Script timeout with large dataset

```bash
NODE_OPTIONS="--max-old-space-size=4096" npx ts-node seed.ts
```

### Already seeded data appearing twice

```bash
# Script clears collections before seeding
# If you want to skip clearing:
# Edit clearCollections() function call in main()
```

---

## Security Best Practices

⚠️ **CRITICAL**:

- ✅ `serviceAccountKey.json` is in `.gitignore`
- ✅ Never commit credentials to version control
- ✅ Use different keys for dev/staging/production
- ✅ Rotate keys regularly
- ✅ Restrict Firebase security rules

### Example .gitignore entry:

```
serviceAccountKey.json
```

---

## Firestore Collections

The script creates/updates three collections:

### menuItems

- **Documents**: 60+ (one per image)
- **Indexed by**: category, available, price
- **Use case**: Menu display, filtering, searching

### orders

- **Documents**: 15 (mock)
- **Indexed by**: userId, status, createdAt
- **Use case**: Order history, admin dashboard, analytics

### reservations

- **Documents**: 10 (mock)
- **Indexed by**: userId, date, status
- **Use case**: Reservation management, booking calendar

---

## Expected Output

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
  ... [56 more items]

✅ Seeded 60 Menu Items

📋 Starting Orders Seeding...
  ✓ Order for Raj Patel - ₹127.50 (completed)
  ✓ Order for Priya Sharma - ₹89.99 (preparing)
  ... [13 more orders]

✅ Seeded 15 Orders

📋 Starting Reservations Seeding...
  ✓ Reservation for Raj Patel - 2024-03-25 at 19:30 (4 guests)
  ✓ Reservation for Priya Sharma - 2024-03-26 at 20:00 (2 guests)
  ... [8 more reservations]

✅ Seeded 10 Reservations

════════════════════════════════════════════════════════════
✅ Seeded 60 Menu Items
✅ Seeded 15 Orders
✅ Seeded 10 Reservations
════════════════════════════════════════════════════════════
🎉 Database seeding completed successfully!
```

---

## Next Steps

1. ✅ Run seeding: `npx ts-node seed.ts`
2. ✅ Verify in Firebase Console
3. ✅ Test application with seeded data
4. ✅ Customize as needed
5. ✅ Deploy to production

---

## Technical Details

### Batch Operations

- Uses Firestore `writeBatch` for atomic operations
- Efficient: Multiple writes in single request
- Safe: All-or-nothing semantics

### File Scanning

- Recursively scans category directories
- Supports multiple image formats
- Handles missing directories gracefully
- Logs warnings for empty folders

### Timestamps

- Uses Firestore `Timestamp.now()` for current time
- Spreads order timestamps across last 30 days
- Future-dates reservations 1-14 days ahead

### Error Handling

- Validates service account key exists
- Checks directory structure
- Gracefully handles missing images
- Clear error messages with solutions

---

## Support & Documentation

For more information:

- [Firebase Admin SDK Docs](https://firebase.google.com/docs/database/admin/start)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [TypeScript + Node.js Guide](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
- See `SEEDING_GUIDE.md` for detailed guide

---

**Status**: ✅ Production-ready  
**Last Updated**: March 16, 2026  
**Compatible with**: Firebase Admin SDK 11.x+, Firestore, Node.js 16+
