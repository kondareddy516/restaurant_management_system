import admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";

// Load service account key
const serviceAccountPath = path.join(process.cwd(), "serviceAccountKey.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = admin.firestore();

async function verifyData() {
  console.log("🔍 Verifying seeded data...\n");

  try {
    // Count menu items
    const menuSnapshot = await db.collection("menuItems").get();
    console.log(`✓ Menu Items: ${menuSnapshot.size} documents`);

    // Count orders
    const ordersSnapshot = await db.collection("orders").get();
    console.log(`✓ Orders: ${ordersSnapshot.size} documents`);

    // Count reservations
    const reservationsSnapshot = await db.collection("reservations").get();
    console.log(`✓ Reservations: ${reservationsSnapshot.size} documents`);

    // Show sample menu item
    const sampleMenu = menuSnapshot.docs[0];
    if (sampleMenu) {
      console.log(`\n📌 Sample Menu Item:`);
      console.log(`   Name: ${sampleMenu.data().name}`);
      console.log(`   Price: ₹${sampleMenu.data().price}`);
      console.log(`   Category: ${sampleMenu.data().category}`);
    }

    // Show sample order
    const sampleOrder = ordersSnapshot.docs[0];
    if (sampleOrder) {
      console.log(`\n📌 Sample Order:`);
      console.log(`   Customer: ${sampleOrder.data().customerName}`);
      console.log(`   Amount: ₹${sampleOrder.data().totalAmount}`);
      console.log(`   Status: ${sampleOrder.data().status}`);
      console.log(`   Items: ${sampleOrder.data().items.length}`);
    }

    console.log(`\n✅ Data verification complete!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

verifyData();
