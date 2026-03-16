import { useState, useEffect } from "react";
import { menuService, MenuItem } from "../services/firestoreService";
import { toast } from "sonner";

interface MenuProps {
  addToCart: (item: { id: string; name: string; price: number }) => void;
}

// Helper function to check if error is a permission error
const isPermissionError = (err: unknown): boolean => {
  const error = err as any;
  return (
    error?.code === "permission-denied" ||
    error?.message?.includes("Missing or insufficient permissions") ||
    error?.message?.includes("permission-denied")
  );
};

// Retry logic with exponential backoff
async function fetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 500,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetchFn();
    } catch (err) {
      lastError = err;

      // Don't retry on permission errors
      if (isPermissionError(err)) {
        throw err;
      }

      // Calculate exponential backoff delay
      const delayMs = baseDelayMs * Math.pow(2, attempt);

      // Only retry if not the last attempt
      if (attempt < maxRetries - 1) {
        console.warn(
          `Fetch attempt ${attempt + 1} failed, retrying in ${delayMs}ms...`,
          err,
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError;
}

type Category = "starters" | "veg" | "non-veg" | "desserts";

// Royal Fallback Menu Data - Used when Firestore is unavailable
const ROYAL_FALLBACK_MENU: MenuItem[] = [
  {
    id: "royal-starter-1",
    name: "🏛️ Heritage Spiced Poultry Skewers",
    description:
      "Premium appetizers featuring authentic spices and modern culinary techniques.",
    price: 18.99,
    category: "starters",
    available: true,
    preparationTime: 12,
  },
  {
    id: "royal-veg-1",
    name: "🏛️ Creamed Cottage Cheese in Tomato Reduction",
    description:
      "Exquisite celebration of fresh vegetables and paneer, balanced with nutrition and indulgence.",
    price: 22.99,
    category: "veg",
    available: true,
    preparationTime: 15,
  },
  {
    id: "royal-nonveg-1",
    name: "🏛️ Mogul Tomato Cream Poultry",
    description:
      "Premium proteins sourced from finest purveyors, representing the pinnacle of culinary artistry.",
    price: 29.99,
    category: "non-veg",
    available: true,
    preparationTime: 18,
  },
  {
    id: "royal-dessert-1",
    name: "🏛️ Artisanal Cocoa Decadence",
    description:
      "Handcrafted sweetmeat providing a memorable conclusion to your Royal dining experience.",
    price: 14.99,
    category: "desserts",
    available: true,
    preparationTime: 8,
  },
];

// Mapping of menu items to image files
const imageMapping: Record<string, string> = {
  "Chicken 65": "/images/Chicken 65.jpg",
  "Fish Fingers": "/images/Fish Fingers.jpg",
  "Paneer Tikka": "/images/Paneer Tikka.jpg",
  "Mutton Biryani": "/images/Mutton Biryani.webp",
  "Gulab Jamun": "/images/Gulab Jamun.jpg",
  "Fruit Salad": "/images/Fruit Salad.webp",
  "Garlic Bread": "/images/Garlic Bread.jpg.jpg",
  "Ras Malai": "/images/Ras Malai.jpg",
  "Veg Biryani": "/images/Veg Biryani.webp",
  "Crispy Spring Rolls": "/images/Crispy Spring Rolls.jpg",
  Momos: "/images/Momos.jpg",
  "French Fries": "/images/French Fries.jpg",
  "Onion Bhaji": "/images/Onion Bhaji.jpg",
  "Chicken Pakora": "/images/Chicken Pakora.jpg",
  "Veg Pakora": "/images/Veg Pakora.jpg",
  "Cheese Balls": "/images/Cheese Balls.jpg",
  "Pani Puri": "/images/Pani Puri.jpg",
  Kachori: "/images/Kachori.avif",
  Samosa: "/images/Samosa.jpg",
  Dhokla: "/images/Dhokla.avif",
  "Paneer Butter Masala": "/images/Paneer Butter Masala.webp",
  "Dal Makhani": "/images/Dal Makhani.webp",
  "Chana Masala": "/images/Chana Masala.avif",
  "Palak Paneer": "/images/Palak Paneer.webp",
  "Aloo Gobi": "/images/Aloo Gobi.webp",
  "Baingan Bharta": "/images/Baingan Bharta.webp",
  "Malai Kofta": "/images/Malai Kofta.webp",
  Rajma: "/images/Rajma.avif",
  "Kadai Paneer": "/images/Kadai Paneer.webp",
  "Mushroom Masala": "/images/Mushroom Masala.jpg",
  "Pav Bhaji": "/images/Pav Bhaji.webp",
  "Veg Thali": "/images/Veg Thali.webp",
  "Cheese Pizza": "/images/Cheese Pizza.webp",
  "Veg Burger": "/images/Veg Burger.jpg",
  Rasgulla: "/images/Rasgulla.jpg",
  Kheer: "/images/Kheer.webp",
  Jalebi: "/images/Jalebi.webp",
  Rabri: "/images/Rabri.webp",
  Barfi: "/images/Barfi.webp",
  Ladoo: "/images/Ladoo.avif",
  Halwa: "/images/Halwa.jpg",
  Kulfi: "/images/Kulfi.jpg",
  "Chocolate Brownie": "/images/Chocolate Brownie.webp",
  "Ice Cream Sundae": "/images/Ice Cream Sundae.webp",
  "Panna Cotta": "/images/Panna Cotta.webp",
  "Butter Chicken": "/images/Butter Chicken.webp",
  "Chicken Biryani": "/images/Chicken Biryani.avif",
  "Mutton Rogan Josh": "/images/Mutton Rogan Josh.jpg",
  "Fish Curry": "/images/Fish Curry.jpg",
  "Chicken Tikka Masala": "/images/Chicken Tikka Masala.webp",
  "Prawn Masala": "/images/Prawn Masala.jpg",
  "Lamb Vindaloo": "/images/Lamb Vindaloo.jpg",
  "Chicken Korma": "/images/Chicken Korma.webp",
  "Beef Steak": "/images/Beef Steak.webp",
  "Chicken Shawarma": "/images/Chicken Shawarma.avif",
  "Fish Tikka": "/images/Fish Tikka.avif",
  "Chicken 65 Curry": "/images/Chicken 65 Curry.jpg",
  "Pork Vindaloo": "/images/Pork Vindaloo.jpg",
  "Grilled Chicken": "/images/Grilled Chicken.webp",
};

// Get image URL for a menu item
const getImageUrl = (itemName: string): string | undefined => {
  return imageMapping[itemName] || undefined;
};

export default function Menu({ addToCart }: MenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    Category | undefined
  >(undefined);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { id: undefined, name: "All", icon: "🍽️" },
    { id: "starters" as Category, name: "Starters", icon: "🥗" },
    { id: "veg" as Category, name: "Vegetarian", icon: "🥬" },
    { id: "non-veg" as Category, name: "Non-Veg", icon: "🍖" },
    { id: "desserts" as Category, name: "Desserts", icon: "🍰" },
  ];

  // Fetch menu items when category changes
  useEffect(() => {
    const fetchMenuItems = async () => {
      setLoading(true);
      setError(null);

      try {
        // Attempt to fetch from Firestore with retry logic
        const items = await fetchWithRetry(
          () => menuService.getAll(selectedCategory),
          3, // max 3 retries
          500, // 500ms initial delay
        );

        if (!items || items.length === 0) {
          console.warn("No menu items found in Firestore");
          throw new Error("No menu items available");
        }

        setMenuItems(items);
        setError(null);
      } catch (err) {
        const error = err as any;
        const errorMessage = error?.message || String(error);

        console.error("🏛️ Menu Loading Error:", {
          code: error?.code,
          message: errorMessage,
          isPermission: isPermissionError(error),
          timestamp: new Date().toISOString(),
        });

        // Handle specific error types
        if (isPermissionError(error)) {
          console.warn(
            "⚠️ Firestore permission denied. Using Royal Fallback Menu...",
          );
          setError(
            "Royal service temporarily using fallback menu. Please ensure Firestore security rules allow read access.",
          );
          toast.warning(
            "🏛️ Using Royal Fallback Menu - Firestore permissions need configuration",
          );

          // Filter fallback menu by category
          const fallbackItems =
            selectedCategory === undefined
              ? ROYAL_FALLBACK_MENU
              : ROYAL_FALLBACK_MENU.filter(
                  (item) => item.category === selectedCategory,
                );

          setMenuItems(fallbackItems);
        } else if (errorMessage.includes("No menu items available")) {
          setError(
            "No items available in this category. Please try another category.",
          );
          setMenuItems([]);
          toast.info("No items in this category");
        } else {
          // Generic network or other error
          console.error("Failed to load menu items:", errorMessage);
          setError(
            "Failed to load menu items. Please check your connection and try again.",
          );
          toast.error("Failed to load menu items");

          // Offer fallback as last resort
          const fallbackItems =
            selectedCategory === undefined
              ? ROYAL_FALLBACK_MENU
              : ROYAL_FALLBACK_MENU.filter(
                  (item) => item.category === selectedCategory,
                );

          if (fallbackItems.length > 0) {
            toast.info("🏛️ Using Royal Fallback Menu");
            setMenuItems(fallbackItems);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, [selectedCategory]);

  const handleAddToCart = (item: MenuItem) => {
    if (item.id && item.name) {
      addToCart({ id: item.id, name: item.name, price: item.price });
      toast.success(`${item.name} added to cart!`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Menu</h1>
        <p className="text-lg text-gray-600">
          Discover our delicious selection of dishes
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {categories.map((category) => (
          <button
            key={category.id || "all"}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              selectedCategory === category.id
                ? "bg-orange-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-100 shadow"
            }`}
          >
            <span className="mr-2">{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : error ? (
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-8">
            <p className="text-2xl font-bold text-amber-900 mb-2">
              🏛️ Royal Notice
            </p>
            <p className="text-lg text-amber-800 mb-4">{error}</p>
            <p className="text-sm text-amber-700 mb-6">
              Our Royal establishment is working to restore full service. Please
              try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
            >
              Refresh Page
            </button>
          </div>
        </div>
      ) : menuItems.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-gray-600">
            No items available in this category yet.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="h-48 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                {item.imageUrl || getImageUrl(item.name) ? (
                  <img
                    src={getImageUrl(item.name) || item.imageUrl || ""}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-6xl">
                    {item.category === "starters"
                      ? "🥗"
                      : item.category === "veg"
                        ? "🥬"
                        : item.category === "non-veg"
                          ? "🍖"
                          : "🍰"}
                  </span>
                )}
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {item.name}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      item.available
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.available ? "Available" : "Unavailable"}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold text-orange-600">
                      ₹{item.price.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      ~{item.preparationTime} mins
                    </p>
                  </div>
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={!item.available}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
