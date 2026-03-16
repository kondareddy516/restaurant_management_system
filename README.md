# RestaurantHub - High-End Restaurant Management System

A modern, Firebase-powered restaurant management system with premium UPI payment integration, real-time order tracking, and reservation management.

## 🏛️ Features

- **Firebase Backend**: Secure, scalable cloud database with real-time updates
- **UPI Payment Gateway**: Premium payment processing with QR code and deep linking support
- **Real-time Order Management**: Track orders from placement to delivery
- **Reservation System**: Manage table bookings with guest count and special requests
- **Authentication**: Firebase Auth with role-based access control
- **Admin Dashboard**: Comprehensive management interface for staff
- **Production Ready**: Render-compatible deployment with data seeding

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Firebase project with Firestore database
- Firebase service account key (for seeding only)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The application will start on `http://localhost:5175`

## 📋 Data Seeding

### Quick Setup (5 minutes)

```bash
# 1. Install seeding dependencies
npm install --save-dev firebase-admin ts-node

# 2. Place serviceAccountKey.json in project root
# Get this from Firebase Console > Project Settings > Service Accounts

# 3. Run seeding script
npx ts-node seed.ts

# 4. Verify data in Firestore
npx ts-node verify-seeding.ts
```

**Seeded Data:**

- 59 menu items (4 categories with royal naming)
- 15 orders with various statuses
- 10 reservations with guest information

See [SEEDING_QUICKSTART.md](./SEEDING_QUICKSTART.md) for detailed customization.

## 🛠️ Architecture

### Directory Structure

```
src/
├── pages/              # Main application pages
│   ├── Menu.tsx       # Menu browsing and filtering
│   ├── Cart.tsx       # Shopping cart with payment
│   ├── Orders.tsx     # Order tracking
│   └── ...
├── components/        # Reusable UI components
│   └── UPIPayment.tsx # Premium payment component
├── services/          # Firebase service layer
│   ├── firestoreService.ts
│   ├── storageService.ts
│   └── upiPaymentService.ts
├── config/           # Firebase configuration
└── context/          # React context (Auth)
```

### Technology Stack

- **Frontend**: React 19, Vite, TailwindCSS
- **Backend**: Firebase Firestore, Firebase Storage, Firebase Auth
- **Payments**: UPI with QR Code (qrcode.react)
- **Animations**: Framer Motion
- **Notifications**: Sonner
- **Deployment**: Render (Node.js)

## 🔐 Security

- ✓ Firebase security rules (configured in Firestore)
- ✓ Service account key excluded from git (.gitignore)
- ✓ Environment variables for sensitive data (.env.local)
- ✓ Role-based access control (admin, user)
- ✓ Server-side validation for all operations

## 📱 Payment Integration

The UPI Payment component supports:

- **QR Code Option**: Scan with UPI app for seamless payment
- **Manual Entry**: Enter transaction ID manually
- **Transaction Validation**: 12-digit transaction ID format
- **Order Linking**: Automatic order status updates after payment

## 🌐 Deployment

### Deploy to Render

```bash
# Build the application
npm run build

# Connect GitHub repository to Render
# Set environment variables in Render dashboard:
# - Firebase config credentials
# - Any other API keys

# Render uses the start script:
npm start
# which runs: vite preview --host 0.0.0.0 --port $PORT
```

## 📚 Documentation

- [FIREBASE_SUMMARY.md](./FIREBASE_SUMMARY.md) - Firebase migration overview
- [SEEDING_QUICKSTART.md](./SEEDING_QUICKSTART.md) - Data seeding quick start
- [SEEDING_GUIDE.md](./SEEDING_GUIDE.md) - Advanced seeding customization
- [SEED_README.md](./SEED_README.md) - Seeding API reference

## 🧪 Development

### Running Tests

```bash
# Build application
npm run build

# Run E2E checks
npx ts-node test-e2e-checklist.ts

# Check UPI integration
npx ts-node test-upi.ts
```

### Linting

```bash
npm run lint
```

## 📊 Database Schema

### Collections

- `menuItems` - Menu items with prices and images
- `orders` - Customer orders with items and payment status
- `reservations` - Table bookings with guest details
- `users` - User profiles and roles
- `userRoles` - Role definitions (admin, user, staff)

See [SEED_README.md](./SEED_README.md) for detailed field documentation.

## 🔄 Firebase Services

### MenuService

```typescript
// Get all menu items
const items = await menuService.getMenuItems();

// Get items by category
const starters = await menuService.getMenuByCategory("starters");

// Add menu item (admin only)
await menuService.addMenuItem(menuItem);
```

### OrderService

```typescript
// Create order
const order = await orderService.createOrder(orderData);

// Get user's orders
const orders = await orderService.getOrdersByUser(userId);

// Update order status
await orderService.updateOrderStatus(orderId, "completed");
```

### ReservationService

```typescript
// Create reservation
const reservation = await reservationService.createReservation(data);

// Get reservations
const reservations = await reservationService.getReservations();

// Update reservation
await reservationService.updateReservation(id, updates);
```

## 🎨 Design System

- **Color Scheme**: Royal amber/orange gradients (Royal Heritage theme)
- **Typography**: Clean, modern sans-serif
- **Components**: Tailwind CSS with custom variants
- **Animations**: Smooth transitions with Framer Motion

## ❓ FAQ

**Q: How do I change menu prices?**
A: Edit the pricing ranges in `seed.ts` (lines 131-139) and re-run seeding.

**Q: How do I add more menu items?**
A: Add images to `public/images/menu/{category}/` and map names in `seed.ts` then run seeding.

**Q: How do I customize the layout?**
A: All pages use Tailwind CSS. Edit className values in page components.

**Q: How do I add more payment methods?**
A: Currently supports UPI. To add more, modify `src/components/UPIPayment.tsx`.

## 🐛 Troubleshooting

**Build fails with "module not found"**

- Run `npm install` to ensure all dependencies are installed

**Firebase connection errors**

- Verify Firebase config in `src/config/firebase.ts`
- Check that Firestore database is enabled in Firebase Console

**Seeding script fails**

- Ensure `serviceAccountKey.json` is in project root
- Verify Firebase Admin SDK is installed: `npm list firebase-admin`
- Check that service account has Firestore write permissions

See [SEEDING_GUIDE.md](./SEEDING_GUIDE.md) for more troubleshooting.

## 📄 License

© 2024 RestaurantHub. All rights reserved.

## 🤝 Contributing

This is a production system. For changes:

1. Create a feature branch
2. Make your changes
3. Test thoroughly with E2E tests
4. Submit for review

---

Built with ❤️ for high-end restaurant management
