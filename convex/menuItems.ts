import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get user role
async function getUserRole(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;

  const roleRecord = await ctx.db
    .query("userRoles")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .first();

  return roleRecord?.role || "customer";
}

// List all menu items
export const list = query({
  args: {
    category: v.optional(
      v.union(
        v.literal("starters"),
        v.literal("veg"),
        v.literal("non-veg"),
        v.literal("desserts")
      )
    ),
  },
  handler: async (ctx, args) => {
    const items = args.category
      ? await ctx.db
          .query("menuItems")
          .withIndex("by_category", (q) => q.eq("category", args.category!))
          .collect()
      : await ctx.db.query("menuItems").collect();

    return Promise.all(
      items.map(async (item) => ({
        ...item,
        imageUrl: item.imageId ? await ctx.storage.getUrl(item.imageId) : null,
      }))
    );
  },
});

// Get single menu item
export const get = query({
  args: { id: v.id("menuItems") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) return null;

    return {
      ...item,
      imageUrl: item.imageId ? await ctx.storage.getUrl(item.imageId) : null,
    };
  },
});

// Generate upload URL for menu item image
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const role = await getUserRole(ctx);
    if (role !== "admin" && role !== "staff") {
      throw new Error("Unauthorized: Only admin and staff can upload images");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

// Create menu item
export const create = mutation({
  args: {
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
    preparationTime: v.number(),
  },
  handler: async (ctx, args) => {
    const role = await getUserRole(ctx);
    if (role !== "admin" && role !== "staff") {
      throw new Error("Unauthorized: Only admin and staff can create menu items");
    }

    return await ctx.db.insert("menuItems", {
      name: args.name,
      description: args.description,
      price: args.price,
      category: args.category,
      imageId: args.imageId,
      available: true,
      preparationTime: args.preparationTime,
    });
  },
});

// Update menu item
export const update = mutation({
  args: {
    id: v.id("menuItems"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    category: v.optional(
      v.union(
        v.literal("starters"),
        v.literal("veg"),
        v.literal("non-veg"),
        v.literal("desserts")
      )
    ),
    imageId: v.optional(v.id("_storage")),
    available: v.optional(v.boolean()),
    preparationTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const role = await getUserRole(ctx);
    if (role !== "admin" && role !== "staff") {
      throw new Error("Unauthorized: Only admin and staff can update menu items");
    }

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

// Delete menu item
export const remove = mutation({
  args: { id: v.id("menuItems") },
  handler: async (ctx, args) => {
    const role = await getUserRole(ctx);
    if (role !== "admin") {
      throw new Error("Unauthorized: Only admin can delete menu items");
    }

    await ctx.db.delete(args.id);
    return null;
  },
});
