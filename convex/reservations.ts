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

// Create reservation
export const create = mutation({
  args: {
    customerName: v.string(),
    customerEmail: v.optional(v.string()),
    customerPhone: v.string(),
    date: v.string(),
    time: v.string(),
    numberOfGuests: v.number(),
    specialRequests: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    return await ctx.db.insert("reservations", {
      userId: userId || undefined,
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      customerPhone: args.customerPhone,
      date: args.date,
      time: args.time,
      numberOfGuests: args.numberOfGuests,
      status: "pending",
      specialRequests: args.specialRequests,
    });
  },
});

// List reservations
export const list = query({
  args: {
    date: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("confirmed"),
        v.literal("cancelled"),
        v.literal("completed")
      )
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const role = await getUserRole(ctx);

    const reservations = args.date
      ? await ctx.db
          .query("reservations")
          .withIndex("by_date", (q) => q.eq("date", args.date!))
          .order("desc")
          .collect()
      : args.status
      ? await ctx.db
          .query("reservations")
          .withIndex("by_status", (q) => q.eq("status", args.status!))
          .order("desc")
          .collect()
      : await ctx.db.query("reservations").order("desc").collect();

    // Filter reservations based on role
    return role === "admin" || role === "staff"
      ? reservations
      : reservations.filter((reservation) => reservation.userId === userId);
  },
});

// Get single reservation
export const get = query({
  args: { id: v.id("reservations") },
  handler: async (ctx, args) => {
    const reservation = await ctx.db.get(args.id);
    if (!reservation) return null;

    const userId = await getAuthUserId(ctx);
    const role = await getUserRole(ctx);

    // Check authorization
    if (
      role !== "admin" &&
      role !== "staff" &&
      reservation.userId !== userId
    ) {
      throw new Error("Unauthorized");
    }

    return reservation;
  },
});

// Update reservation status
export const updateStatus = mutation({
  args: {
    id: v.id("reservations"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled"),
      v.literal("completed")
    ),
  },
  handler: async (ctx, args) => {
    const role = await getUserRole(ctx);
    if (role !== "admin" && role !== "staff") {
      throw new Error(
        "Unauthorized: Only admin and staff can update reservation status"
      );
    }

    await ctx.db.patch(args.id, { status: args.status });
    return null;
  },
});

// Cancel reservation (customers can cancel their own)
export const cancel = mutation({
  args: { id: v.id("reservations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const reservation = await ctx.db.get(args.id);

    if (!reservation) {
      throw new Error("Reservation not found");
    }

    const role = await getUserRole(ctx);

    // Check authorization
    if (
      role !== "admin" &&
      role !== "staff" &&
      reservation.userId !== userId
    ) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.id, { status: "cancelled" });
    return null;
  },
});
