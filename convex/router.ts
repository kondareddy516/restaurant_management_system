import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/api/seed",
  method: "POST",
  handler: httpAction(async (ctx) => {
    await ctx.runMutation(internal.seedData.seedMenuItems);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

http.route({
  path: "/api/create-admin",
  method: "POST",
  handler: httpAction(async (ctx) => {
    const result = await ctx.runMutation(internal.seedData.setupAdmin);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

http.route({
  path: "/api/setup-admin",
  method: "POST",
  handler: httpAction(async (ctx) => {
    const result = await ctx.runMutation(internal.seedData.setupAdmin);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
