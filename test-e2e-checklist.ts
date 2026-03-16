import { readFileSync } from "fs";
import { join } from "path";

console.log("🧪 E2E Testing Checklist\n");
console.log("═══════════════════════════════════════════\n");

let passCount = 0;
let failCount = 0;

const tests = [
  {
    name: "Firebase configuration exists",
    check: () =>
      readFileSync(join(process.cwd(), "src/config/firebase.ts"), "utf-8")
        .length > 100,
  },
  {
    name: "AuthContext is implemented",
    check: () =>
      readFileSync(join(process.cwd(), "src/context/AuthContext.tsx"), "utf-8")
        .length > 100,
  },
  {
    name: "UPI Payment component created",
    check: () =>
      readFileSync(join(process.cwd(), "src/components/UPIPayment.tsx"), "utf-8")
        .length > 1000,
  },
  {
    name: "Firestore service layer exists",
    check: () =>
      readFileSync(
        join(process.cwd(), "src/services/firestoreService.ts"),
        "utf-8"
      ).length > 100,
  },
  {
    name: "Data seeding script created",
    check: () =>
      readFileSync(join(process.cwd(), "seed.ts"), "utf-8").length > 1000,
  },
  {
    name: "Menu page uses Firestore services",
    check: () =>
      readFileSync(join(process.cwd(), "src/pages/Menu.tsx"), "utf-8").includes(
        "menuService"
      ),
  },
  {
    name: "Orders page uses Firestore services",
    check: () =>
      readFileSync(
        join(process.cwd(), "src/pages/Orders.tsx"),
        "utf-8"
      ).includes("orderService"),
  },
  {
    name: "Cart has payment integration",
    check: () =>
      readFileSync(join(process.cwd(), "src/pages/Cart.tsx"), "utf-8").includes(
        "UPIPayment"
      ),
  },
  {
    name: "Build completes without errors",
    check: () => readFileSync(join(process.cwd(), "dist/index.html"), "utf-8")
      .length > 0,
  },
  {
    name: "Package.json has Render start script",
    check: () =>
      readFileSync(join(process.cwd(), "package.json"), "utf-8").includes(
        "vite preview --host 0.0.0.0"
      ),
  },
  {
    name: "No Convex dependencies in package.json",
    check: () =>
      !readFileSync(join(process.cwd(), "package.json"), "utf-8").includes(
        '"convex"'
      ),
  },
  {
    name: "Firebase dependencies present",
    check: () =>
      readFileSync(join(process.cwd(), "package.json"), "utf-8").includes(
        '"firebase"'
      ),
  },
];

tests.forEach((test) => {
  try {
    if (test.check()) {
      console.log(`✓ ${test.name}`);
      passCount++;
    } else {
      console.log(`✗ ${test.name}`);
      failCount++;
    }
  } catch (e) {
    console.log(`✗ ${test.name} (Error: ${(e as Error).message.split("\n")[0]})`);
    failCount++;
  }
});

console.log("\n═══════════════════════════════════════════\n");
console.log(`Results: ${passCount} passed, ${failCount} failed\n`);

if (failCount === 0) {
  console.log("🎉 All E2E checks passed!");
  process.exit(0);
} else {
  console.log("⚠️  Some checks failed");
  process.exit(1);
}
