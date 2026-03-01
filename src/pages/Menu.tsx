import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface MenuProps {
  onAddToCart: (item: { id: string; name: string; price: number }) => void;
}

type Category = "starters" | "veg" | "non-veg" | "desserts";

// Mapping of menu items to image files
const imageMapping: Record<string, string> = {
  "Chicken 65": "/images/Chicken 65.jpg",
  "Fish Fingers": "/images/Fish Fingers.jpg",
  "Paneer Tikka": "/images/Paneer Tikka.jpg",
  "Veg Biryani": "/images/Veg Biryani.jpg",
  "Mutton Biryani": "/images/Mutton Biryani.webp",
  "Gulab Jamun": "/images/Gulab Jamun.jpg",
  "Fruit Salad": "/images/Fruit Salad.webp",
  "Garlic Bread": "/images/Garlic Bread.jpg.jpg",
  "Ras Malai": "/images/Ras Malai.jpg",
  "Veg Biryani":"/images/Veg Biryani.webp",
  "Crispy Spring Rolls":"/images/Crispy Spring Rolls.jpg",
  "Paneer Tikka":"/images/Paneer Tikka.jpg",
  "Momos":"/images/Momos.jpg",
  "French Fries":"/images/French Fries.jpg",
  "Onion Bhaji":"/images/Onion Bhaji.jpg",
  "Chicken Pakora":"/images/Chicken Pakora.jpg",
  "Veg Pakora":"/images/Veg Pakora.jpg",
  "Fish Fingers":"/images/Fish Fingers.jpg",
  "Cheese Balls":"/images/Cheese Balls.jpg",
  "Pani Puri":"/images/Pani Puri.jpg",
  "Kachori":"/images/Kachori.avif",
  "Samosa":"/images/Samosa.jpg",
  "Dhokla":"/images/Dhokla.avif",
  "Paneer Butter Masala":"/images/Paneer Butter Masala.webp",
  "Dal Makhani":"/images/Dal Makhani.webp",
  "Chana Masala":"/images/Chana Masala.avif",
  "Palak Paneer":"/images/Palak Paneer.webp",
  "Aloo Gobi":"/images/Aloo Gobi.webp",
  "Baingan Bharta":"/images/Baingan Bharta.webp",
  "Malai Kofta":"/images/Malai Kofta.webp",
  "Rajma":"/images/Rajma.avif",
  "Kadai Paneer":"/images/Kadai Paneer.webp",
  "Mushroom Masala":"/images/Mushroom Masala.jpg",
  "Pav Bhaji":"/images/Pav Bhaji.webp",
  "Veg Thali":"/images/Veg Thali.webp",
  "Cheese Pizza":"/images/Cheese Pizza.webp",
  "Veg Burger":"/images/Veg Burger.jpg",
  "Rasgulla":"/images/Rasgulla.jpg",
  "Kheer":"/images/Kheer.webp",
  "Jalebi":"/images/Jalebi.webp",
  "Rabri":"/images/Rabri.webp",
  "Barfi":"/images/Barfi.webp",
  "Ladoo":"/images/Ladoo.avif",
  "Halwa":"/images/Halwa.jpg",
  "Kulfi":"/images/Kulfi.jpg",
  "Chocolate Brownie":"/images/Chocolate Brownie.webp",
  "Ice Cream Sundae":"/images/Ice Cream Sundae.webp",
  "Panna Cotta":"/images/Panna Cotta.webp",
  "Butter Chicken":"/images/Butter Chicken.webp",
  "Chicken Biryani":"/images/Chicken Biryani.avif",
  "Mutton Rogan Josh":"/images/Mutton Rogan Josh.jpg",
  "Fish Curry":"/images/Fish Curry.jpg",
  "Chicken Tikka Masala":"/images/Chicken Tikka Masala.webp",
  "Prawn Masala":"/images/Prawn Masala.jpg",
  "Lamb Vindaloo":"/images/Lamb Vindaloo.jpg",
  "Chicken Korma":"/images/Chicken Korma.webp",
  "Beef Steak":"/images/Beef Steak.webp",
  "Chicken Shawarma":"/images/Chicken Shawarma.avif",
  "Fish Tikka":"/images/Fish Tikka.avif",
  "Chicken 65 Curry":"/images/Chicken 65 Curry.jpg",
  "Pork Vindaloo":"/images/Pork Vindaloo.jpg",
  "Grilled Chicken":"/images/Grilled Chicken.webp",
};


// Get image URL for a menu item
const getImageUrl = (itemName: string): string | undefined => {
  return imageMapping[itemName] || undefined;
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
