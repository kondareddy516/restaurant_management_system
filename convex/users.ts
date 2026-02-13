import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get current user role
export const getCurrentUserRole = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const roleRecord = await ctx.db
      .query("userRoles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return roleRecord?.role || "customer";
  },
});

// Set user role (admin only)
export const setUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("staff"), v.literal("customer")),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Unauthorized");
    }

    const currentUserRole = await ctx.db
      .query("userRoles")
      .withIndex("by_user", (q) => q.eq("userId", currentUserId))
      .first();

    if (currentUserRole?.role !== "admin") {
      throw new Error("Unauthorized: Only admin can set user roles");
    }

    const existingRole = await ctx.db
      .query("userRoles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existingRole) {
      await ctx.db.patch(existingRole._id, { role: args.role });
    } else {
      await ctx.db.insert("userRoles", {
        userId: args.userId,
        role: args.role,
      });
    }

    return null;
  },
});

// List all users with roles (admin only)
export const listUsersWithRoles = query({
  args: {},
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Unauthorized");
    }

    const currentUserRole = await ctx.db
      .query("userRoles")
      .withIndex("by_user", (q) => q.eq("userId", currentUserId))
      .first();

    if (currentUserRole?.role !== "admin") {
      throw new Error("Unauthorized: Only admin can view all users");
    }

    const users = await ctx.db.query("users").collect();
    const roles = await ctx.db.query("userRoles").collect();

    const roleMap: Record<string, string> = {};
    roles.forEach((role) => {
      roleMap[role.userId] = role.role;
    });

    return users.map((user) => ({
      ...user,
      role: roleMap[user._id] || "customer",
    }));
  },
});
