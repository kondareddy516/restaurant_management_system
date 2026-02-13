import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";

async function createAdmin() {
  const convexUrl = process.env.VITE_CONVEX_URL;
  const client = new ConvexHttpClient(convexUrl);

  try {
    const result = await client.mutation(api.seedData.createInitialAdmin, {
      email: "admin@restaurant.com",
      name: "Restaurant Admin"
    });
    console.log("Admin created:", result);
  } catch (error) {
    console.error("Error creating admin:", error);
  }
}

createAdmin();