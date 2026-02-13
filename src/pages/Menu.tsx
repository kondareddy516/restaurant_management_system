import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";
import { internal } from "../../convex/_generated/api";

interface MenuProps {
  onAddToCart: (item: { id: string; name: string; price: number }) => void;
}

type Category = "starters" | "veg" | "non-veg" | "desserts";

// Mapping of menu items to image files
const imageMapping: Record<string, string> = {
  "Crispy Corn": "/images/Crispy Corn.jpg",
  "Chicken 65": "/images/Chicken 65.jpg",
  "Chicken Lollipop (6 pcs)": "/images/Chicken Lollipop (6 pcs).jpg",
  "Fish Fingers": "/images/Fish Fingers.jpg",
  "Paneer Tikka": "/images/Paneer Tikka.jpg",
  "Chicken Tikka": "/images/Chicken Tikka.jpg",
  "Chicken Roomali Roll": "/images/Chicken Roomali Roll.jpg",
  "Egg Roomali Roll": "/images/Egg Roomali Roll.jpg",
  "Paneer Roomali Roll": "/images/Paneer Roomali Roll.jpg",
  "Veg Roomali Roll": "/images/Veg Roomali Roll.jpg",
  "Veg Spring Rolls": "/images/Veg Spring Rolls.jpg",
  "Paneer Biryani": "/images/Paneer Biryani.jpg",
  "Veg Biryani": "/images/Veg Biryani.jpg",
  "Hyd. Chicken Dum Biryani": "/images/Hyd. Chicken Dum Biryani.jpg",
  "Chicken Biryani": "/images/Chicken Biryani.jpg",
  "Mutton Biryani": "/images/Mutton Biryani.jpg",
  "Egg Biryani": "/images/Egg Biryani.jpg",
  "Prawns Biryani": "/images/Prawns Biryani.jpg",
  "Hyderabadi Veg Dum Biryani": "/images/Hyderabadi Veg Dum Biryani.jpg",
  "Gobi Manchurian": "/images/Gobi Manchurian.jpg",
  "Egg Manchurian": "/images/Egg Manchurian.jpg",
  "Mushroom 65": "/images/Mushroom 65.jpg",
  "Hara Bhara Kabab": "/images/Hara Bhara Kabab.jpg",
  "Seekh Kebab Roll": "/images/Seekh Kebab Roll.jpg",
  "Prawns Fry": "/images/Prawns Fry.jpg",
  "Gulab Jamun": "/images/Gulab Jamun.jpg",
  "Gajar Halwa": "/images/Gajar Halwa.jpg",
  "Rasmalai": "/images/Rasmalai.jpg",
  "Falooda": "/images/Falooda.jpg",
  "Fruit Salad": "/images/Fruit Salad.webp",
  
};

// Get image URL for a menu item
const getImageUrl = (itemName: string): string | null => {
  return imageMapping[itemName] || null;
};

export default function Menu({ onAddToCart }: MenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(
    undefined
  );
  const menuItems = useQuery(api.menuItems.list, {
    category: selectedCategory,
  });

  const categories = [
    { id: undefined, name: "All", icon: "🍽️" },
    { id: "starters" as Category, name: "Starters", icon: "🥗" },
    { id: "veg" as Category, name: "Vegetarian", icon: "🥬" },
    { id: "non-veg" as Category, name: "Non-Veg", icon: "🍖" },
    { id: "desserts" as Category, name: "Desserts", icon: "🍰" },
  ];

  const handleAddToCart = (item: {
    _id: Id<"menuItems">;
    name: string;
    price: number;
  }) => {
    onAddToCart({ id: item._id, name: item.name, price: item.price });
    toast.success(`${item.name} added to cart!`);
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

      {menuItems === undefined ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
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
              key={item._id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="h-48 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                {item.imageUrl || getImageUrl(item.name) ? (
                  <img
                    src={getImageUrl(item.name) || item.imageUrl}
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
