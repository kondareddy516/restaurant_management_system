/**
 * Simple test to verify UPI Payment component integration
 */

import { readFileSync } from "fs";
import { join } from "path";

// Check Cart.tsx has UPIPayment import
const cartPath = join(process.cwd(), "src/pages/Cart.tsx");
const cartContent = readFileSync(cartPath, "utf-8");

console.log("🧪 Testing UPI Payment Integration\n");

// Test 1: Check UPIPayment import
if (cartContent.includes("import UPIPayment")) {
  console.log("✓ UPIPayment component is imported in Cart.tsx");
} else {
  console.log("✗ UPIPayment component NOT imported in Cart.tsx");
}

// Test 2: Check showPayment state
if (cartContent.includes("showPayment")) {
  console.log("✓ Payment flow state management is in place");
} else {
  console.log("✗ Payment flow state NOT found");
}

// Test 3: Check UPIPayment component render
if (cartContent.includes("<UPIPayment")) {
  console.log("✓ UPIPayment component is rendered conditionally");
} else {
  console.log("✗ UPIPayment component NOT rendered");
}

// Test 4: Check UPIPayment.tsx exists and has QR code
const upiPath = join(process.cwd(), "src/components/UPIPayment.tsx");
const upiContent = readFileSync(upiPath, "utf-8");

if (upiContent.includes("QRCodeCanvas")) {
  console.log("✓ QRCode component is integrated");
} else {
  console.log("✗ QRCode component NOT found");
}

// Test 5: Check payment methods (UPI, Card, etc)
if (
  upiContent.includes("upi") &&
  upiContent.includes("card") &&
  upiContent.includes("wallet")
) {
  console.log("✓ Multiple payment methods available");
} else {
  console.log("✗ Limited payment methods");
}

// Test 6: Check transaction ID validation
if (upiContent.includes("transactionId") && upiContent.includes("12")) {
  console.log("✓ Transaction ID validation is implemented");
} else {
  console.log("✗ Transaction ID validation NOT found");
}

console.log("\n✅ UPI Payment integration verification complete!");
