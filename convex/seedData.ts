import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const seedMenuItems = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if menu items already exist
    const existingItems = await ctx.db.query("menuItems").collect();
    if (existingItems.length > 0) {
      return { message: "Menu items already exist" };
    }

    // Starters (15 items)
    const starters = [
      { name: "Crispy Spring Rolls", description: "Golden fried rolls filled with fresh vegetables and served with sweet chili sauce", price: 120, prepTime: 15 },
      { name: "Garlic Bread", description: "Toasted bread with garlic butter, herbs, and melted mozzarella cheese", price: 100, prepTime: 10 },
      { name: "Paneer Tikka", description: "Marinated cottage cheese cubes grilled to perfection with spices", price: 180, prepTime: 20 },
      { name: "Chicken 65", description: "Spicy, deep-fried chicken bites with curry leaves and red chilies", price: 160, prepTime: 18 },
      { name: "Momos", description: "Steamed dumplings filled with spiced vegetables, served with spicy chutney", price: 90, prepTime: 15 },
      { name: "French Fries", description: "Crispy golden fries seasoned with herbs and served with ketchup", price: 80, prepTime: 10 },
      { name: "Onion Bhaji", description: "Crispy onion fritters made with chickpea flour and spices", price: 70, prepTime: 12 },
      { name: "Chicken Pakora", description: "Chicken pieces coated in spiced batter and deep fried", price: 140, prepTime: 16 },
      { name: "Veg Pakora", description: "Assorted vegetable fritters in chickpea batter", price: 60, prepTime: 12 },
      { name: "Fish Fingers", description: "Breaded fish strips fried until golden, served with tartar sauce", price: 150, prepTime: 18 },
      { name: "Cheese Balls", description: "Mozzarella cheese balls coated in breadcrumbs and fried", price: 110, prepTime: 14 },
      { name: "Pani Puri", description: "Hollow puris filled with spiced water, tamarind chutney, and potatoes", price: 50, prepTime: 8 },
      { name: "Samosa", description: "Crispy pastries filled with spiced potatoes and peas", price: 40, prepTime: 10 },
      { name: "Kachori", description: "Deep-fried pastry filled with spiced lentils and potatoes", price: 45, prepTime: 12 },
      { name: "Dhokla", description: "Steamed fermented rice and chickpea flour cake with spices", price: 55, prepTime: 15 }
    ];

    // Vegetarian Main Courses (15 items)
    const vegItems = [
      { name: "Paneer Butter Masala", description: "Creamy tomato-based curry with soft paneer cubes and aromatic spices", price: 220, prepTime: 25 },
      { name: "Dal Makhani", description: "Slow-cooked black lentils in creamy tomato sauce with butter and cream", price: 180, prepTime: 30 },
      { name: "Chana Masala", description: "Chickpea curry cooked with tomatoes, onions, and traditional spices", price: 160, prepTime: 20 },
      { name: "Palak Paneer", description: "Cottage cheese in creamy spinach sauce with Indian spices", price: 200, prepTime: 22 },
      { name: "Aloo Gobi", description: "Cauliflower and potatoes cooked with cumin, coriander, and turmeric", price: 140, prepTime: 18 },
      { name: "Baingan Bharta", description: "Smoky eggplant mash cooked with tomatoes, onions, and green chilies", price: 150, prepTime: 20 },
      { name: "Malai Kofta", description: "Soft paneer and potato dumplings in rich creamy sauce", price: 190, prepTime: 25 },
      { name: "Rajma", description: "Kidney beans cooked in spicy tomato gravy with aromatic spices", price: 170, prepTime: 28 },
      { name: "Kadai Paneer", description: "Paneer cooked with bell peppers, onions, and kadai masala", price: 210, prepTime: 23 },
      { name: "Mushroom Masala", description: "Button mushrooms cooked in rich onion-tomato gravy", price: 180, prepTime: 20 },
      { name: "Veg Biryani", description: "Fragrant basmati rice with mixed vegetables and aromatic spices", price: 160, prepTime: 35 },
      { name: "Pav Bhaji", description: "Spicy vegetable mash served with butter-toasted bread rolls", price: 120, prepTime: 20 },
      { name: "Veg Thali", description: "Complete meal with dal, vegetables, rice, roti, and salad", price: 250, prepTime: 30 },
      { name: "Cheese Pizza", description: "Wood-fired pizza with mozzarella cheese and tomato sauce", price: 280, prepTime: 20 },
      { name: "Veg Burger", description: "Grilled vegetable patty with lettuce, tomato, and special sauce", price: 130, prepTime: 15 }
    ];

    // Non-Vegetarian Main Courses (15 items)
    const nonVegItems = [
      { name: "Butter Chicken", description: "Tender chicken in rich, creamy tomato-based curry with butter and cream", price: 280, prepTime: 30 },
      { name: "Chicken Biryani", description: "Fragrant basmati rice with marinated chicken and aromatic spices", price: 260, prepTime: 35 },
      { name: "Mutton Rogan Josh", description: "Tender mutton cooked in Kashmiri spices and yogurt-based curry", price: 350, prepTime: 40 },
      { name: "Fish Curry", description: "Fresh fish cooked in coconut milk with tamarind and traditional spices", price: 240, prepTime: 25 },
      { name: "Chicken Tikka Masala", description: "Grilled chicken pieces in creamy tomato-based curry sauce", price: 270, prepTime: 28 },
      { name: "Prawn Masala", description: "Juicy prawns cooked in spicy onion-tomato gravy with coconut", price: 320, prepTime: 22 },
      { name: "Lamb Vindaloo", description: "Spicy Goan curry with tender lamb and vinegar-based sauce", price: 330, prepTime: 35 },
      { name: "Chicken Korma", description: "Chicken cooked in rich, creamy cashew-based sauce with saffron", price: 290, prepTime: 32 },
      { name: "Beef Steak", description: "Grilled beef steak with herb butter, mashed potatoes, and vegetables", price: 450, prepTime: 25 },
      { name: "Chicken Shawarma", description: "Marinated chicken wrapped in pita bread with garlic sauce and salad", price: 180, prepTime: 20 },
      { name: "Mutton Biryani", description: "Aromatic rice dish with tender mutton and caramelized onions", price: 300, prepTime: 40 },
      { name: "Fish Tikka", description: "Marinated fish pieces grilled with spices and lemon", price: 220, prepTime: 18 },
      { name: "Chicken 65 Curry", description: "Spicy chicken curry with deep-fried chicken 65 pieces", price: 250, prepTime: 30 },
      { name: "Prawn Curry", description: "Prawns cooked in a spicy and tangy tomato-based sauce", price: 320, prepTime: 25 },
      { name: "Tandoori Chicken", description: "Chicken marinated in yogurt and spices, grilled in a tandoor", price: 270, prepTime: 35 }
    ];

    // Desserts (15 items)
    const desserts = [
      { name: "Ras Malai", description: "Soft cheese dumplings soaked in sweetened cardamom-flavored milk", price: 80, prepTime: 10 },
      { name: "Gulab Jamun", description: "Warm milk dumplings soaked in rose-flavored sugar syrup", price: 70, prepTime: 15 },
      { name: "Rasgulla", description: "Spongy cheese balls in sweetened syrup with cardamom", price: 60, prepTime: 12 },
      { name: "Kheer", description: "Creamy rice pudding with nuts, saffron, and cardamom", price: 90, prepTime: 20 },
      { name: "Jalebi", description: "Crispy, deep-fried spirals soaked in saffron sugar syrup", price: 50, prepTime: 15 },
      { name: "Rabri", description: "Thickened sweetened milk with nuts and saffron", price: 85, prepTime: 25 },
      { name: "Barfi", description: "Sweet milk fudge made with condensed milk and flavored with cardamom", price: 120, prepTime: 30 },
      { name: "Ladoo", description: "Sweet balls made from flour, sugar, and ghee", price: 40, prepTime: 20 },
      { name: "Halwa", description: "Sweet pudding made from carrots, ghee, and sugar", price: 75, prepTime: 25 },
      { name: "Kulfi", description: "Indian ice cream made with condensed milk and flavored with pistachios", price: 95, prepTime: 180 },
      { name: "Ras Malai", description: "Soft cheese dumplings soaked in sweetened cardamom-flavored milk", price: 80, prepTime: 10 },
      { name: "Chocolate Brownie", description: "Rich chocolate brownie served with vanilla ice cream", price: 150, prepTime: 20 },
      { name: "Ice Cream Sundae", description: "Vanilla ice cream with chocolate sauce, nuts, and cherry", price: 130, prepTime: 5 },
      { name: "Fruit Salad", description: "Fresh seasonal fruits with honey and mint dressing", price: 100, prepTime: 10 },
      { name: "Panna Cotta", description: "Italian cream dessert with berry compote", price: 140, prepTime: 180 }
    ];

    // Insert all starters
    for (const item of starters) {
      await ctx.db.insert("menuItems", {
        name: item.name,
        description: item.description,
        price: item.price,
        category: "starters",
        available: true,
        preparationTime: item.prepTime,
      });
    }

    // Insert all vegetarian items
    for (const item of vegItems) {
      await ctx.db.insert("menuItems", {
        name: item.name,
        description: item.description,
        price: item.price,
        category: "veg",
        available: true,
        preparationTime: item.prepTime,
      });
    }

    // Insert all non-vegetarian items
    for (const item of nonVegItems) {
      await ctx.db.insert("menuItems", {
        name: item.name,
        description: item.description,
        price: item.price,
        category: "non-veg",
        available: true,
        preparationTime: item.prepTime,
      });
    }

    // Insert all desserts
    for (const item of desserts) {
      await ctx.db.insert("menuItems", {
        name: item.name,
        description: item.description,
        price: item.price,
        category: "desserts",
        available: true,
        preparationTime: item.prepTime,
      });
    }

    return { message: "Menu items seeded successfully with 60 items across 4 categories" };
  },
});

// Create initial admin user
export const createInitialAdmin = internalMutation({
  args: {
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if admin already exists
    const existingAdmins = await ctx.db.query("userRoles").filter(q => q.eq("role", "admin")).collect();
    if (existingAdmins.length > 0) {
      return { message: "Admin user already exists" };
    }

    // Create admin user
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      // Password will be set during sign up
    });

    // Set admin role
    await ctx.db.insert("userRoles", {
      userId: userId,
      role: "admin",
    });

    return { message: `Admin user created with email: ${args.email}`, userId };
  },
});

// Create initial admin user (simplified version)
export const setupAdmin = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if admin already exists
    const existingAdmins = await ctx.db.query("userRoles").filter(q => q.eq("role", "admin")).collect();
    if (existingAdmins.length > 0) {
      return { message: "Admin user already exists", userId: existingAdmins[0].userId };
    }

    // Create admin user with a known email
    const userId = await ctx.db.insert("users", {
      email: "admin@restaurant.com",
      name: "Restaurant Admin",
    });

    // Set admin role
    await ctx.db.insert("userRoles", {
      userId: userId,
      role: "admin",
    });

    return { message: "Admin user created successfully", userId, email: "admin@restaurant.com" };
  },
});

// Clean up admin user for fresh signup
export const cleanupAdmin = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Find the admin user
    const adminUsers = await ctx.db.query("users").filter(q => q.eq("email", "admin@restaurant.com")).collect();

    if (adminUsers.length > 0) {
      const userId = adminUsers[0]._id;

      // Delete user roles
      const roles = await ctx.db.query("userRoles").withIndex("by_user", (q) => q.eq("userId", userId)).collect();
      for (const role of roles) {
        await ctx.db.delete(role._id);
      }

      // Delete user
      await ctx.db.delete(userId);

      return { message: "Admin user cleaned up successfully. You can now sign up fresh." };
    }

    return { message: "No admin user found to clean up." };
  },
});

// Create fresh admin user with new email
export const createFreshAdmin = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if admin already exists
    const existingAdmins = await ctx.db.query("userRoles").filter(q => q.eq("role", "admin")).collect();
    if (existingAdmins.length > 0) {
      return { message: "Admin user already exists", email: "admin@restaurant.com" };
    }

    // Create admin user with fresh email
    const userId = await ctx.db.insert("users", {
      email: "admin@restaurant.com",
      name: "Restaurant Admin",
    });

    // Set admin role
    await ctx.db.insert("userRoles", {
      userId: userId,
      role: "admin",
    });

    return {
      message: "Fresh admin user created successfully. You can now sign up with this email.",
      email: "admin@restaurant.com",
      instructions: "Go to the app and click 'Sign up' (not 'Sign in') with this email and choose a password."
    };
  },
});
