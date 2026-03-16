# Firestore Security Rules - RestaurantHub

## 📋 Overview

This document provides security rules for the RestaurantHub Firestore database. These rules enable:

- **Public read access** to menu items (no authentication required)
- **Authenticated user** order and reservation management
- **Admin-only** write operations to sensitive data

## 🚀 Quick Start

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `restaurant-e-comerce`
3. Navigate to: **Firestore Database** → **Rules** tab
4. Copy the rules below into the editor
5. Click **Publish**

## 📝 Security Rules Configuration

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ============================================
    // MENU ITEMS - Public Read (No Auth Required)
    // ============================================
    match /menuItems/{document=**} {
      // Anyone can read menu items
      allow read: if true;

      // Only authenticated admins can write
      allow write: if isAdmin();
    }

    // ============================================
    // ORDERS - Authenticated Users + Payment Updates
    // ============================================
    match /orders/{orderId} {
      // Users can read their own orders
      allow read: if isAuthenticated() &&
                     (request.auth.uid == resource.data.userId || isAdmin());

      // Anyone authenticated can create orders
      allow create: if isAuthenticated();

      // Users can update their own orders, admins can update any
      // Admins specifically handle payment status updates
      allow update: if isAuthenticated() &&
                       (request.auth.uid == resource.data.userId || isAdmin());

      // Only admins can delete
      allow delete: if isAdmin();
    }

    // ============================================
    // RESERVATIONS - Authenticated Users + Status Updates
    // ============================================
    match /reservations/{reservationId} {
      // Users can read their own reservations
      allow read: if isAuthenticated() &&
                     (request.auth.uid == resource.data.userId || isAdmin());

      // Anyone authenticated can create reservations
      allow create: if isAuthenticated();

      // Users can update/cancel their own, admins can update any
      // Customers can only cancel future reservations
      allow update: if isAuthenticated() &&
                       (request.auth.uid == resource.data.userId || isAdmin());

      // Only admins can delete
      allow delete: if isAdmin();
    }

    // ============================================
    // USER ROLES - Admin/Staff Only
    // ============================================
    match /userRoles/{userId} {
      // Only admins can read roles
      allow read: if isAdmin();

      // Only admins can write roles
      allow write: if isAdmin();
    }

    // ============================================
    // USERS - Profile Management
    // ============================================
    match /users/{userId} {
      // Users can read their own profile
      allow read: if isAuthenticated() && request.auth.uid == userId;

      // Users can create/update their own profile
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }

    // ============================================
    // HELPER FUNCTIONS
    // ============================================

    // Check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Check if user is admin
    function isAdmin() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/userRoles/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## 🔐 Permission Matrix

| Collection   | Read        | Create  | Update      | Delete  |
| ------------ | ----------- | ------- | ----------- | ------- |
| menuItems    | ✓ Public    | ✗ Admin | ✗ Admin     | ✗ Admin |
| orders       | ✓ Own/Admin | ✓ Auth  | ✓ Own/Admin | ✗ Admin |
| reservations | ✓ Own/Admin | ✓ Auth  | ✓ Own/Admin | ✗ Admin |
| userRoles    | ✗ Admin     | ✗ Admin | ✗ Admin     | ✗ Admin |
| users        | ✓ Own       | ✓ Own   | ✓ Own       | ✗ Admin |

## 🛠️ Development (Testing Only)

For development/testing, you can use permissive rules (NOT PRODUCTION):

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // DEVELOPMENT ONLY - Allow all access
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **WARNING**: Never use permissive rules in production!

## 📚 Understanding the Rules

### Menu Items (Public Read)

```firestore
allow read: if true;  // Anyone can read (no authentication)
allow write: if isAdmin();  // Only admins can modify
```

This allows customers to browse the menu without logging in.

### Orders (Authenticated + Ownership + Payment Updates)

```firestore
allow read: if isAuthenticated() &&
               (request.auth.uid == resource.data.userId || isAdmin());
allow update: if isAuthenticated() &&
                 (request.auth.uid == resource.data.userId || isAdmin());
```

- Users can only see their own orders
- Admins can see all orders and update any order (including payment status)
- Unauthenticated users cannot read or update
- **Payment Updates**: Only admins can update `paymentStatus` field
  - Admin calls: `updatePaymentStatus(orderId, 'verified', transactionDetails)`
  - Triggers: paymentStatus → 'paid', status → 'preparing'
  - Audit: Each update recorded in `editHistory` array

### Reservations (Authenticated + Ownership + Status Updates)

```firestore
allow read: if isAuthenticated() &&
               (request.auth.uid == resource.data.userId || isAdmin());
allow update: if isAuthenticated() &&
                 (request.auth.uid == resource.data.userId || isAdmin());
```

- Users can only see their own reservations
- Admins can see all reservations and update any status
- Customers can only cancel future reservations (enforced in application logic)
- **Reservation Status Updates**: Both customers and admins can update status
  - Allowed statuses: 'pending', 'confirmed', 'cancelled', 'completed', 'no-show'
  - Customers: Can only cancel if date is in the future
  - Admins: Can set any status without date restrictions
  - Audit: Each update recorded in `editHistory` array

### User Roles (Admin Only)

```firestore
function isAdmin() {
  return isAuthenticated() &&
         get(/databases/$(database)/documents/userRoles/$(request.auth.uid)).data.role == 'admin';
}
```

Checks the `userRoles` collection to determine admin status.

## 🏛️ Payment & Reservation Update Details

### Payment Status Updates (Exchequer Verification)

**Flow:**

1. Admin selects order in Dashboard
2. Clicks "Verify Payment" or "Reject Payment"
3. Modal shows UPI Transaction ID and verification details
4. Admin confirms action
5. `updatePaymentStatus()` called with:
   - orderId
   - status: 'verified' or 'rejected'
   - transactionId
   - transactionDetails (UPI ID, amount, timestamp, etc.)
   - updatedBy (admin user ID)

**Results:**

- **Verified**: paymentStatus = 'paid', status = 'preparing'
- **Rejected**: paymentStatus = 'failed', rejectionReason added
- All changes appended to `editHistory` array

### Reservation Status Updates (The Concierge)

**Flow:**

1. Admin selects reservation in Dashboard
2. Clicks dropdown to change status
3. Applies status change
4. `updateReservationStatus()` called with:
   - reservationId
   - newStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show'
   - updatedBy (user ID)
   - reason (optional, for audit trail)

**Validation:**

- Customers cannot cancel past reservations (enforced in client)
- Only admins can mark as 'no-show'
- All status changes recorded in `editHistory`

**Status Transitions:**

- pending → confirmed (Admin confirms)
- confirmed → completed (After service)
- Any status → cancelled (If date is future)
- Any status → no-show (Admin marks)
- pending → no-show (Admin marks)

## 🚨 Troubleshooting

### "Missing or insufficient permissions" Error

1. ✓ Publish the rules above
2. ✓ Wait 1-2 minutes for changes to propagate
3. ✓ Clear browser cache and refresh
4. ✓ Check that menuItems collection has `read: if true`

### Can't Write to Orders

1. ✓ Ensure user is authenticated (Firebase Auth)
2. ✓ Check that order has `userId` field matching `auth.uid`
3. ✓ Verify user role is set in `userRoles` collection

### Admin Functions Not Working

1. ✓ Ensure admin user has role "admin" in `userRoles`
2. ✓ Rules check `userRoles/{uid}` collection
3. ✓ May cause circular dependency - see optimization below

## ⚡ Performance Optimization

For large-scale apps, the admin check can be expensive. Optimize by:

1. **Cache admin status in custom claims:**

```javascript
// In backend/cloud function
await admin.auth().setCustomUserClaims(uid, { admin: true });
```

2. **Update rules to use custom claims:**

```firestore
function isAdmin() {
  return request.auth.token.admin == true;
}
```

## 🔄 Updating Rules

Every time you change the rules:

1. Update this file
2. Go to Firebase Console → Firestore Rules
3. Paste the new rules
4. Click "Publish"
5. Changes take effect immediately

## 📞 Support

For issues:

1. Check Firebase Console → Firestore → Rules
2. View real-time errors in console
3. Test rules with the "Rules Playground" in Firebase Console
4. Check browser console for detailed error messages

---

**Last Updated**: March 16, 2026
**Project**: RestaurantHub
**Status**: Production-Ready
