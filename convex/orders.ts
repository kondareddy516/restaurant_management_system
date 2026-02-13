import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

async function getUserRole(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;

  const roleRecord = await ctx.db
    .query("userRoles")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .first();

  return roleRecord?.role || "customer";
}

// Create order
export const create = mutation({
  args: {
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
    specialInstructions: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    return await ctx.db.insert("orders", {
      userId: userId || undefined,
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      customerPhone: args.customerPhone,
      items: args.items,
      totalAmount: args.totalAmount,
      status: "pending",
      specialInstructions: args.specialInstructions,
    });
  },
});

// List orders
export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("confirmed"),
        v.literal("preparing"),
        v.literal("ready"),
        v.literal("completed"),
        v.literal("cancelled")
      )
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const role = await getUserRole(ctx);

    const orders = args.status
      ? await ctx.db
          .query("orders")
          .withIndex("by_status", (q) => q.eq("status", args.status!))
          .order("desc")
          .collect()
      : await ctx.db.query("orders").order("desc").collect();

    // Filter orders based on role
    const filteredOrders =
      role === "admin" || role === "staff"
        ? orders
        : orders.filter((order) => order.userId === userId);

    // Enrich orders with menu item details
    return Promise.all(
      filteredOrders.map(async (order) => {
        const itemsWithDetails = await Promise.all(
          order.items.map(async (item) => {
            const menuItem = await ctx.db.get(item.menuItemId);
            return {
              ...item,
              menuItem,
            };
          })
        );

        return {
          ...order,
          items: itemsWithDetails,
        };
      })
    );
  },
});

// Get single order
export const get = query({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    if (!order) return null;

    const userId = await getAuthUserId(ctx);
    const role = await getUserRole(ctx);

    // Check authorization
    if (
      role !== "admin" &&
      role !== "staff" &&
      order.userId !== userId
    ) {
      throw new Error("Unauthorized");
    }

    const itemsWithDetails = await Promise.all(
      order.items.map(async (item) => {
        const menuItem = await ctx.db.get(item.menuItemId);
        return {
          ...item,
          menuItem,
        };
      })
    );

    return {
      ...order,
      items: itemsWithDetails,
    };
  },
});

// Update order status
export const updateStatus = mutation({
  args: {
    id: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const role = await getUserRole(ctx);
    if (role !== "admin" && role !== "staff") {
      throw new Error("Unauthorized: Only admin and staff can update order status");
    }

    await ctx.db.patch(args.id, { status: args.status });
    return null;
  },
});
