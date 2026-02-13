import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  menuItems: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.union(
      v.literal("starters"),
      v.literal("veg"),
      v.literal("non-veg"),
      v.literal("desserts")
    ),
    imageId: v.optional(v.id("_storage")),
    available: v.boolean(),
    preparationTime: v.number(), // in minutes
  }).index("by_category", ["category"]),

  orders: defineTable({
    userId: v.optional(v.id("users")),
    customerName: v.string(),
    customerEmail: v.optional(v.string()),
    customerPhone: v.string(),
    items: v.array(
      v.object({
        menuItemId: v.id("menuItems"),
        quantity: v.number(),
        price: v.number(),
      })
    ),
    totalAmount: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    specialInstructions: v.optional(v.string()),
  }).index("by_status", ["status"]),

  reservations: defineTable({
    userId: v.optional(v.id("users")),
    customerName: v.string(),
    customerEmail: v.optional(v.string()),
    customerPhone: v.string(),
    date: v.string(),
    time: v.string(),
    numberOfGuests: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled"),
      v.literal("completed")
    ),
    specialRequests: v.optional(v.string()),
  })
    .index("by_date", ["date"])
    .index("by_status", ["status"]),

  userRoles: defineTable({
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("staff"), v.literal("customer")),
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
