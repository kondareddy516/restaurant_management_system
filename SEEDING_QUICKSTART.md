# 🏛️ RestaurantHub Firebase Seeding - Quick Start Checklist

## ⚡ 5-Minute Setup

- [ ] **Step 1**: Run setup script

  ```bash
  bash setup-seeding.sh
  ```

- [ ] **Step 2**: Download Firebase service account key

  - Go to: https://console.firebase.google.com
  - Project: restaurant-e-comerce
  - Settings → Service Accounts → Generate Private Key
  - Save as `serviceAccountKey.json` in project root

- [ ] **Step 3**: Run seeding script

  ```bash
  npx ts-node seed.ts
  ```

- [ ] **Step 4**: Verify in Firebase Console
  - Open Firestore Database
  - Confirm menuItems (60+), orders (15), reservations (10)

✅ **Done!** Your database is seeded and ready.

---

## 📚 Documentation Files

| File                                | Purpose                 | Size   |
| ----------------------------------- | ----------------------- | ------ |
| `seed.ts`                           | Main seeding script     | 17 KB  |
| `SEED_README.md`                    | Quick reference guide   | 11 KB  |
| `SEEDING_GUIDE.md`                  | Detailed setup guide    | 8.3 KB |
| `SEEDING_IMPLEMENTATION_SUMMARY.md` | Implementation overview | 8.6 KB |
| `setup-seeding.sh`                  | Automated setup         | 2.7 KB |

**Total**: 47.6 KB of code & documentation

---

## 🎯 What Gets Seeded

### Menu Items (60+)

```
✅ 60+ dish entries from image directories
✅ Auto-detected categories (starters, veg, non-veg, desserts)
✅ Royal names ("Heritage Spiced Poultry Skewers" etc.)
✅ Fine-dining prices ($10-$85)
✅ Preparation times (8-45 minutes)
✅ Professional descriptions
✅ Image URLs linked to local files
✅ Availability status (90% available)
```

### Orders (15)

```
✅ 15 complete order documents
✅ Mixed statuses (completed, preparing, pending, cancelled)
✅ Various payment methods (UPI, card, cash)
✅ Timestamps across last 30 days
✅ 2-5 items per order
✅ Realistic pricing ($50-$200+)
✅ 10% include special instructions
✅ 5 mock customers
```

### Reservations (10)

```
✅ 10 table booking documents
✅ Guest counts 2-8 people
✅ Various time slots (18:00-22:00)
✅ Future dates (1-14 days ahead)
✅ Mixed statuses (confirmed, pending, completed, cancelled)
✅ 40% include special requests
✅ Same customer profiles
```

---

## 🔑 Key Features

✨ **Dynamic**: Auto-scans image directories (no manual config)
💰 **Realistic**: Fine-dining pricing & professional descriptions
🏛️ **Premium**: Royal naming convention for upscale feel
⚡ **Efficient**: Batch operations (single database write)
🔒 **Secure**: Service account authentication, auto .gitignore
🛠️ **Customizable**: All prices, names, counts easily modified
📊 **Complete**: Full relationships (orders → menu items)
✅ **Safe**: Idempotent clearing (run multiple times)

---

## 📋 Menu Image Categories

The script scans these directories:

```
public/images/menu/
├── starters/          (12 items) - 12-20 min prep, $12-24
├── vegetarian/        (12 items) - 20-35 min prep, $16-28
├── non-veg/           (11 items) - 25-45 min prep, $24-52
└── desserts/          (16 items) - 8-15 min prep, $10-18

Total: 60+ items automatically detected & seeded
```

---

## 💻 System Requirements

- ✅ Node.js 16+
- ✅ npm or yarn
- ✅ Firebase project (restaurant-e-comerce)
- ✅ Service account credentials
- ✅ Image files in public/images/menu/

---

## 🚀 Commands Cheat Sheet

```bash
# Setup (one-time)
bash setup-seeding.sh

# Run seeding
npx ts-node seed.ts

# With custom Node memory
NODE_OPTIONS="--max-old-space-size=4096" npx ts-node seed.ts

# Verify (in another terminal, while app runs)
npm run dev
```

---

## ⚙️ Customization Quick Tips

### Change Prices

Edit `seed.ts`, find `getPriceForCategory()`:

```typescript
const priceRanges = {
  starters: [12, 24], // Change these numbers
  vegetarian: [16, 28],
  "non-veg": [24, 52],
  desserts: [10, 18],
};
```

### Change Prep Times

Edit `seed.ts`, find `getPreparationTime()`:

```typescript
const timeRanges = {
  starters: [12, 20], // Minutes: [min, max]
  vegetarian: [20, 35],
  "non-veg": [25, 45],
  desserts: [8, 15],
};
```

### Add Royal Names

Edit `seed.ts`, find `royalNameMapping`:

```typescript
const royalNameMapping = {
  "Your Dish": "Your Royal Name",
  // Add more mappings...
};
```

### Change Counts

Edit `seed.ts`:

- `seedOrders()`: Change `for (let i = 0; i < 15; i++)` to desired count
- `seedReservations()`: Change `for (let i = 0; i < 10; i++)` to desired count

---

## 🔐 Security Checklist

- ✅ `serviceAccountKey.json` added to `.gitignore`
- ✅ Never commit credentials to git
- ✅ Use different keys for dev/staging/prod
- ✅ Rotate keys periodically
- ✅ Verify Firebase rules restrict unauthorized access

---

## 🐛 Troubleshooting

| Problem                            | Solution                                                                     |
| ---------------------------------- | ---------------------------------------------------------------------------- |
| `serviceAccountKey.json not found` | Download from Firebase Console → Project Settings → Service Accounts         |
| `Directory not found`              | Create: `mkdir -p public/images/menu/{starters,vegetarian,non-veg,desserts}` |
| `No images found`                  | Add image files to category folders (jpg, png, webp, avif)                   |
| Firebase auth fails                | Verify service account has Firestore Editor role in Google Cloud             |
| Script timeout                     | Run with: `NODE_OPTIONS="--max-old-space-size=4096" npx ts-node seed.ts`     |

See `SEEDING_GUIDE.md` for more solutions.

---

## 📊 Expected Output

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
  [... 58 more items ...]
✅ Seeded 60 Menu Items

📋 Starting Orders Seeding...
  ✓ Order for Raj Patel - ₹127.50 (completed)
  [... 14 more orders ...]
✅ Seeded 15 Orders

📋 Starting Reservations Seeding...
  ✓ Reservation for Raj Patel - 2024-03-25 at 19:30 (4 guests)
  [... 9 more reservations ...]
✅ Seeded 10 Reservations

════════════════════════════════════════════════════════════
✅ Seeded 60 Menu Items
✅ Seeded 15 Orders
✅ Seeded 10 Reservations
════════════════════════════════════════════════════════════
🎉 Database seeding completed successfully!
```

---

## ✅ Verification Steps

1. **Check Firebase Console**

   - Open: https://console.firebase.google.com
   - Project: restaurant-e-comerce
   - Firestore Database
   - Verify collections: menuItems, orders, reservations

2. **Test in Application**

   ```bash
   npm run dev
   ```

   - Browse Menu page → see 60+ items
   - Sign in & check Orders page → see 15 orders
   - Check Reservations → see 10 bookings

3. **Check Console Output**
   - Should show "✅ Seeded 60 Menu Items"
   - Should show "✅ Seeded 15 Orders"
   - Should show "✅ Seeded 10 Reservations"

---

## 📚 Documentation

- `SEED_README.md` - Quick reference (all features)
- `SEEDING_GUIDE.md` - Detailed guide (setup, troubleshooting)
- `SEEDING_IMPLEMENTATION_SUMMARY.md` - Technical overview
- This file - Quick start checklist

---

## 🎯 Next Steps

1. ✅ Complete 5-minute setup above
2. ✅ Verify data in Firebase Console
3. ✅ Test application with seeded data
4. ✅ Customize as needed (prices, names, etc.)
5. ✅ Run in dev/staging/production environments
6. ✅ Monitor error logs
7. ✅ Deploy application to Render

---

## 💡 Pro Tips

- Run seeding in development first
- Test with small dataset before production
- Keep backup before seeding production
- Use version control for customizations
- Document any custom changes made
- Rotate Firebase keys regularly

---

## 📞 Support

For detailed help:

- See `SEEDING_GUIDE.md` for complete guide
- See `SEED_README.md` for API documentation
- Check `seed.ts` for inline code comments
- Review Firebase docs: https://firebase.google.com/docs

---

**Status**: ✅ Ready to seed  
**Setup Time**: < 5 minutes  
**Seeding Time**: 30-60 seconds  
**Total Data**: 85+ documents

Let's go! 🚀
