/**
 * Firebase Firestore Data Seeding Script
 * Production-ready data for RestaurantHub High-end Restaurant
 *
 * Usage:
 *   npx ts-node seed.ts
 *
 * Requirements:
 *   - serviceAccountKey.json in current directory
 *   - Firebase Admin SDK installed
 *   - Images in public/images/menu/{category}/ folders
 */

import admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";
import { Timestamp } from "firebase-admin/firestore";

// Load service account key
const serviceAccountPath = path.join(process.cwd(), "serviceAccountKey.json");
if (!fs.existsSync(serviceAccountPath)) {
  console.error(
    "❌ Error: serviceAccountKey.json not found in current directory",
  );
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = admin.firestore();

/**
 * CULINARY METADATA
 * Sophisticated descriptions and names for high-end restaurant experience
 */

const royalNameMapping: Record<string, string> = {
  "Chicken 65": "Heritage Spiced Poultry Skewers",
  "Fish Fingers": "Pan-Seared Oceanic Delights",
  "Paneer Tikka": "Artisan Cottage Cheese Perfection",
  "Mutton Biryani": "Royal Lamb Biryani with Saffron Essence",
  "Gulab Jamun": "Rosewood-Infused Milk Solids",
  "Fruit Salad": "Seasonal Orchard Symphony",
  "Garlic Bread": "Tuscan Herb Charred Focaccia",
  "Ras Malai": "Cream Cardamom Heavens",
  "Veg Biryani": "Garden Treasure Fragrant Rice",
  "Crispy Spring Rolls": "Golden Wonton Scrolls",
  Momos: "Himalayan Pocket Delicacies",
  "French Fries": "Belgian-Style Golden Matchsticks",
  "Onion Bhaji": "Spiced Onion Fritters",
  "Chicken Pakora": "Tempura Poultry Morsels",
  "Veg Pakora": "Vegetable Fritter Medley",
  "Cheese Balls": "Mozzarella Sphere Treasures",
  "Pani Puri": "Street Elegant Water Puffed Shells",
  Kachori: "Crispy Spiced Pastry",
  Samosa: "Golden Triangle of Perfection",
  Dhokla: "Steamed Gram Flour Cake",
  "Paneer Butter Masala": "Creamed Cottage Cheese in Tomato Reduction",
  "Dal Makhani": "Slow-Cooked Lentil Luxe",
  "Chana Masala": "Chickpea Aromatic Explosion",
  "Palak Paneer": "Spinach Cottage Cheese Blend",
  "Aloo Gobi": "Rustic Potato Cauliflower",
  "Baingan Bharta": "Charred Eggplant Symphony",
  "Malai Kofta": "Cottage Cheese Dumpling Elegance",
  Rajma: "Kidney Bean Comfort Stew",
  "Kadai Paneer": "Wok-Tossed Cottage Cheese Medley",
  "Mushroom Masala": "Forest Funghi in Aromatic Sauce",
  "Pav Bhaji": "Mumbai Street Bread & Vegetable Curry",
  "Veg Thali": "Royal Vegetarian Feast Platter",
  "Cheese Pizza": "Neapolitan Artisan Flatbread",
  "Veg Burger": "Farm-to-Table Vegetable Sandwich",
  Rasgulla: "Syrup-Soaked Cheese Spheres",
  Kheer: "Cardamom Rice Pudding Decadence",
  Jalebi: "Saffron Spiral Sweet",
  Rabri: "Reduced Milk Dessert",
  Barfi: "Diamond-Cut Fudge Confection",
  Ladoo: "Golden Gram Flour Sphere",
  Halwa: "Carrot Pudding Perfection",
  Kulfi: "Indian Frozen Dessert Elegance",
  "Chocolate Brownie": "Artisanal Cocoa Decadence",
  "Ice Cream Sundae": "Layered Frozen Indulgence",
  "Panna Cotta": "Silken Italian Cream Dream",
  "Butter Chicken": "Mogul Tomato Cream Poultry",
  "Chicken Biryani": "Fragrant Spiced Poultry Rice",
  "Mutton Rogan Josh": "Braised Lamb in Aromatic Tomato",
  "Fish Curry": "Coastal Spiced Aquatic Delight",
  "Chicken Tikka Masala": "Charred Poultry in Cream Sauce",
  "Prawn Masala": "Succulent Shrimp Aromatic Sauce",
  "Lamb Vindaloo": "Fiery Lamb Vinegar Curry",
  "Chicken Korma": "Creamy Almond Poultry Reduction",
  "Beef Steak": "Prime Cut Grilled Perfection",
  "Chicken Shawarma": "Spit-Roasted Poultry Wrap",
  "Fish Tikka": "Charred Oceanic Treasure",
  "Chicken 65 Curry": "Fiery Spiced Poultry Reduction",
  "Pork Vindaloo": "Portuguese-Influenced Pork Fury",
  "Grilled Chicken": "Open-Flame Poultry Excellence",
};

const culinaryDescriptions: Record<string, string> = {
  starters:
    "Expertly crafted appetizers showcasing authentic spices and modern techniques. Each starter is designed to awaken the palate and set the tone for an exceptional dining experience.",
  vegetarian:
    "An exquisite celebration of fresh vegetables and paneer, prepared with traditional methods and contemporary presentation. Each dish balances nutrition with indulgence.",
  "non-veg":
    "Premium proteins sourced from the finest purveyors, marinated in house-blend spices and cooked to perfection. These dishes represent the pinnacle of our culinary artistry.",
  desserts:
    "Handcrafted sweetmeats and decadent finales. From traditional Indian confections to contemporary creations, each dessert provides a memorable conclusion to your dining journey.",
};

const categoryDescriptionMap: Record<string, string> = {
  starters: culinaryDescriptions.starters,
  veg: culinaryDescriptions.vegetarian,
  "non-veg": culinaryDescriptions["non-veg"],
  desserts: culinaryDescriptions.desserts,
};

/**
 * PRICING STRATEGY (Fine-Dining)
 * Starters: $12 - $24
 * Vegetarian: $16 - $28
 * Non-Veg: $24 - $52
 * Desserts: $10 - $18
 */

function getPriceForCategory(category: string): number {
  const priceRanges: Record<string, [number, number]> = {
    starters: [12, 24],
    vegetarian: [16, 28],
    "non-veg": [24, 52],
    desserts: [10, 18],
  };

  const [min, max] = priceRanges[category] || [15, 30];
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function getPreparationTime(category: string): number {
  const timeRanges: Record<string, [number, number]> = {
    starters: [12, 20],
    vegetarian: [20, 35],
    "non-veg": [25, 45],
    desserts: [8, 15],
  };

  const [min, max] = timeRanges[category] || [20, 30];
  return Math.floor(Math.random() * (max - min) + min);
}

/**
 * DIRECTORY SCANNING & MENU SEEDING
 */

interface MenuItem {
  name: string;
  description: string;
  price: number;
  category: "starters" | "veg" | "non-veg" | "desserts";
  imageUrl: string;
  available: boolean;
  preparationTime: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

async function seedMenuItems(): Promise<{ [key: string]: string }> {
  console.log("\n📋 Starting Menu Items Seeding...");

  const baseImagePath = path.join("public", "images", "menu");
  const categoryMapping: Record<
    string,
    "starters" | "veg" | "non-veg" | "desserts"
  > = {
    starters: "starters",
    vegetarian: "veg",
    "non-veg": "non-veg",
    desserts: "desserts",
  };

  const menuItemIds: { [key: string]: string } = {};
  const batch = db.batch();
  let itemCount = 0;

  for (const [folderName, firestoreCategory] of Object.entries(
    categoryMapping,
  )) {
    const categoryPath = path.join(baseImagePath, folderName);

    // Check if directory exists
    if (!fs.existsSync(categoryPath)) {
      console.warn(`⚠️  Directory not found: ${categoryPath}`);
      continue;
    }

    // Get all image files in the category folder
    const files = fs.readdirSync(categoryPath);
    const imageFiles = files.filter((file) =>
      /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(file),
    );

    if (imageFiles.length === 0) {
      console.warn(`⚠️  No images found in: ${categoryPath}`);
      continue;
    }

    for (const imageFile of imageFiles) {
      // Extract the name from the filename (remove extension)
      const itemName = path.parse(imageFile).name;

      // Get royal name or use original if not mapped
      const displayName = royalNameMapping[itemName] || itemName;

      // Get category-specific description or use generic
      const description = categoryDescriptionMap[firestoreCategory];

      // Create menu item document
      const menuItem: MenuItem = {
        name: displayName,
        description,
        price: getPriceForCategory(firestoreCategory),
        category: firestoreCategory,
        imageUrl: `/images/menu/${folderName}/${imageFile}`,
        available: Math.random() > 0.1, // 90% available
        preparationTime: getPreparationTime(firestoreCategory),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Add to batch
      const docRef = db.collection("menuItems").doc();
      batch.set(docRef, menuItem);
      menuItemIds[itemName] = docRef.id;
      itemCount++;

      console.log(
        `  ✓ ${displayName} (${firestoreCategory}) - ₹${menuItem.price.toFixed(2)}`,
      );
    }
  }

  // Commit batch
  await batch.commit();
  console.log(`✅ Seeded ${itemCount} Menu Items\n`);

  return menuItemIds;
}

/**
 * MOCK ORDERS SEEDING
 */

interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "completed"
    | "cancelled";
  paymentMethod?: "upi" | "card" | "cash";
  paymentStatus?: "pending" | "completed" | "failed";
  specialInstructions?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const mockCustomers = [
  {
    name: "Raj Patel",
    email: "raj.patel@example.com",
    phone: "+1-555-0101",
  },
  {
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    phone: "+1-555-0102",
  },
  {
    name: "Amit Kumar",
    email: "amit.kumar@example.com",
    phone: "+1-555-0103",
  },
  {
    name: "Neha Gupta",
    email: "neha.gupta@example.com",
    phone: "+1-555-0104",
  },
  {
    name: "Vikram Singh",
    email: "vikram.singh@example.com",
    phone: "+1-555-0105",
  },
];

const mockStatuses: Array<Order["status"]> = [
  "completed",
  "completed",
  "completed",
  "preparing",
  "pending",
  "confirmed",
  "cancelled",
];

const mockPaymentMethods: Array<Order["paymentMethod"]> = [
  "upi",
  "card",
  "cash",
];

async function seedOrders(menuItemIds: {
  [key: string]: string;
}): Promise<number> {
  console.log("📋 Starting Orders Seeding...");

  const itemIds = Object.values(menuItemIds);
  if (itemIds.length === 0) {
    console.warn("⚠️  No menu items available for orders seeding");
    return 0;
  }

  const batch = db.batch();
  let orderCount = 0;

  for (let i = 0; i < 15; i++) {
    const customer = mockCustomers[i % mockCustomers.length];

    // Random number of items per order (2-5)
    const itemCount = Math.floor(Math.random() * 4) + 2;
    const orderItems: OrderItem[] = [];
    let totalAmount = 0;

    for (let j = 0; j < itemCount; j++) {
      const randomItemId = itemIds[Math.floor(Math.random() * itemIds.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      const price = Math.round((Math.random() * 40 + 15) * 100) / 100;

      orderItems.push({
        menuItemId: randomItemId,
        name: `Menu Item ${j + 1}`,
        quantity,
        price,
      });

      totalAmount += price * quantity;
    }

    // Create order with timestamp spread across last 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = Timestamp.fromDate(
      new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
    );

    const order: Order = {
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      items: orderItems,
      totalAmount: Math.round(totalAmount * 100) / 100,
      status: mockStatuses[Math.floor(Math.random() * mockStatuses.length)],
      paymentMethod:
        mockPaymentMethods[
          Math.floor(Math.random() * mockPaymentMethods.length)
        ],
      paymentStatus:
        Math.random() > 0.1
          ? "completed"
          : Math.random() > 0.5
            ? "failed"
            : "pending",
      specialInstructions: Math.random() > 0.7 ? "No onions, extra spice" : "",
      createdAt,
      updatedAt: Timestamp.now(),
    };

    const docRef = db.collection("orders").doc();
    batch.set(docRef, order);
    orderCount++;

    console.log(
      `  ✓ Order for ${customer.name} - ₹${order.totalAmount.toFixed(2)} (${order.status})`,
    );
  }

  await batch.commit();
  console.log(`✅ Seeded ${orderCount} Orders\n`);

  return orderCount;
}

/**
 * MOCK RESERVATIONS SEEDING
 */

interface Reservation {
  userId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  date: string;
  time: string;
  numberOfGuests: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  specialRequests?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const timeSlots = [
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
];
const reservationStatuses: Reservation["status"][] = [
  "confirmed",
  "confirmed",
  "completed",
  "completed",
  "pending",
  "cancelled",
];

async function seedReservations(): Promise<number> {
  console.log("📋 Starting Reservations Seeding...");

  const batch = db.batch();
  let reservationCount = 0;

  for (let i = 0; i < 10; i++) {
    const customer = mockCustomers[i % mockCustomers.length];
    const daysAhead = Math.floor(Math.random() * 14) + 1; // 1-14 days ahead
    const reservationDate = new Date();
    reservationDate.setDate(reservationDate.getDate() + daysAhead);

    const reservation: Reservation = {
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      date: reservationDate.toISOString().split("T")[0],
      time: timeSlots[Math.floor(Math.random() * timeSlots.length)],
      numberOfGuests: Math.floor(Math.random() * 6) + 2, // 2-8 guests
      status:
        reservationStatuses[
          Math.floor(Math.random() * reservationStatuses.length)
        ],
      specialRequests:
        Math.random() > 0.6
          ? "Window table preferred, birthday celebration"
          : "",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = db.collection("reservations").doc();
    batch.set(docRef, reservation);
    reservationCount++;

    console.log(
      `  ✓ Reservation for ${customer.name} - ${reservation.date} at ${reservation.time} (${reservation.numberOfGuests} guests)`,
    );
  }

  await batch.commit();
  console.log(`✅ Seeded ${reservationCount} Reservations\n`);

  return reservationCount;
}

/**
 * COLLECTION CLEARING
 * Remove existing data to prevent duplicates
 */

async function clearCollections(collections: string[]): Promise<void> {
  console.log("🧹 Clearing existing data...");

  for (const collectionName of collections) {
    const snapshot = await db.collection(collectionName).get();

    if (snapshot.empty) {
      console.log(`  ✓ ${collectionName} is empty`);
      continue;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(
      `  ✓ Cleared ${snapshot.size} documents from ${collectionName}`,
    );
  }

  console.log("");
}

/**
 * MAIN EXECUTION
 */

async function main(): Promise<void> {
  console.log("════════════════════════════════════════════════════════════");
  console.log("🏛️  RestaurantHub Firebase Data Seeding Script");
  console.log("════════════════════════════════════════════════════════════");

  try {
    // Clear existing collections
    await clearCollections(["menuItems", "orders", "reservations"]);

    // Seed menu items and get their IDs for orders
    const menuItemIds = await seedMenuItems();

    // Seed orders
    const orderCount = await seedOrders(menuItemIds);

    // Seed reservations
    const reservationCount = await seedReservations();

    // Final summary
    console.log("════════════════════════════════════════════════════════════");
    console.log(`✅ Seeded ${Object.keys(menuItemIds).length} Menu Items`);
    console.log(`✅ Seeded ${orderCount} Orders`);
    console.log(`✅ Seeded ${reservationCount} Reservations`);
    console.log("════════════════════════════════════════════════════════════");
    console.log("🎉 Database seeding completed successfully!");
    console.log("");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

// Run the script
main();
