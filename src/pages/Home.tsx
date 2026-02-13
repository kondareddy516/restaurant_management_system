import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface HomeProps {
  onNavigate: (page: "home" | "menu" | "cart" | "reservations" | "orders" | "admin") => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const featuredItems = useQuery(api.menuItems.list, {});

  const currentYear = new Date().getFullYear();

  // Get first 3 available items as featured
  const featuredDishes = featuredItems?.filter(item => item.available).slice(0, 3) || [];

  return (
    <div className="min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 text-white">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-5xl lg:text-7xl font-bold mb-6">
              RestaurantHub
            </h1>
            <p className="text-xl lg:text-2xl mb-8 max-w-3xl mx-auto">
              Deliciously Crafted Meals, Served with Love
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onNavigate("menu")}
                className="px-8 py-4 bg-white text-orange-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg shadow-lg"
              >
                🍽️ Order Now
              </button>
              <button
                onClick={() => onNavigate("reservations")}
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white hover:text-orange-600 transition-colors font-semibold text-lg"
              >
                📅 Book a Table
              </button>
              <button
                onClick={() => onNavigate("menu")}
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white hover:text-orange-600 transition-colors font-semibold text-lg"
              >
                📖 View Menu
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. About the Restaurant */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                About RestaurantHub
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Established in 2020, RestaurantHub has been serving authentic cuisine
                with a modern twist. Our passion for culinary excellence and commitment
                to using fresh, locally-sourced ingredients sets us apart from the rest.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Whether you're looking for a romantic dinner, family gathering, or quick
                bite, our diverse menu and warm ambiance create the perfect dining experience.
              </p>
              <button className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold">
                Read More About Us
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow-lg p-4">
                <div className="text-4xl mb-2">👨‍🍳</div>
                <h3 className="font-semibold text-gray-900">Expert Chefs</h3>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-4">
                <div className="text-4xl mb-2">🥗</div>
                <h3 className="font-semibold text-gray-900">Fresh Ingredients</h3>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-4">
                <div className="text-4xl mb-2">🏆</div>
                <h3 className="font-semibold text-gray-900">Award Winning</h3>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-4">
                <div className="text-4xl mb-2">❤️</div>
                <h3 className="font-semibold text-gray-900">Customer Love</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Menu Items */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Signature Dishes
            </h2>
            <p className="text-xl text-gray-600">
              Discover our most loved culinary creations
            </p>
          </div>

          {featuredDishes.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {featuredDishes.map((item) => (
                <div key={item._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
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
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-orange-600">
                        ₹{item.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">
                        ~{item.preparationTime} mins
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍽️</div>
              <p className="text-xl text-gray-600">Featured dishes coming soon!</p>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={() => onNavigate("menu")}
              className="px-8 py-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold text-lg"
            >
              View Full Menu
            </button>
          </div>
        </div>
      </section>

      {/* 4. Services / Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need for a perfect dining experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🍽️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Dine-in</h3>
              <p className="text-gray-600">Enjoy our cozy ambiance and excellent service</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🥡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Takeaway</h3>
              <p className="text-gray-600">Fresh food packaged for your convenience</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Delivery</h3>
              <p className="text-gray-600">Hot and fresh food delivered to your doorstep</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📅</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Reservations</h3>
              <p className="text-gray-600">Book your table in advance for special occasions</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Reservation/Order Section */}
      <section className="py-16 bg-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Experience RestaurantHub?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Whether you want to dine-in, order delivery, or make a reservation,
            we're here to serve you the best culinary experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate("reservations")}
              className="px-8 py-4 bg-white text-orange-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg"
            >
              📅 Book a Table
            </button>
            <button
              onClick={() => onNavigate("menu")}
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white hover:text-orange-600 transition-colors font-semibold text-lg"
            >
              🛒 Order Now
            </button>
          </div>
        </div>
      </section>

      {/* 6. Customer Reviews */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600">
              Don't just take our word for it
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-xl">👤</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Sarah Johnson</h4>
                  <div className="flex text-yellow-400">
                    ⭐⭐⭐⭐⭐
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Absolutely amazing food and service! The ambiance is perfect for
                special occasions. Will definitely be back!"
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-xl">👤</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Mike Chen</h4>
                  <div className="flex text-yellow-400">
                    ⭐⭐⭐⭐⭐
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "The delivery was super fast and the food was still hot and fresh.
                Best restaurant app experience I've had!"
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-xl">👤</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Emma Davis</h4>
                  <div className="flex text-yellow-400">
                    ⭐⭐⭐⭐⭐
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Great variety on the menu and everything we tried was delicious.
                The staff was very accommodating for our large group."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Gallery / Atmosphere */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Experience the Atmosphere
            </h2>
            <p className="text-xl text-gray-600">
              Take a glimpse into our world
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="aspect-square bg-gradient-to-br from-orange-200 to-red-200 rounded-lg flex items-center justify-center">
              <span className="text-4xl">🏪</span>
            </div>
            <div className="aspect-square bg-gradient-to-br from-red-200 to-pink-200 rounded-lg flex items-center justify-center">
              <span className="text-4xl">🍽️</span>
            </div>
            <div className="aspect-square bg-gradient-to-br from-pink-200 to-purple-200 rounded-lg flex items-center justify-center">
              <span className="text-4xl">👨‍🍳</span>
            </div>
            <div className="aspect-square bg-gradient-to-br from-purple-200 to-orange-200 rounded-lg flex items-center justify-center">
              <span className="text-4xl">🎉</span>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Contact & Location */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Visit Us
            </h2>
            <p className="text-xl text-gray-600">
              Find us and get in touch
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Location</h3>
              <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center mb-6">
                <span className="text-gray-600">🗺️ Google Map Placeholder</span>
              </div>
              <div className="space-y-4">
                <p className="flex items-center text-gray-600">
                  <span className="mr-3">📍</span>
                  123 Culinary Street, Food District, City 12345
                </p>
                <p className="flex items-center text-gray-600">
                  <span className="mr-3">📞</span>
                  +91 98765 43210
                </p>
                <p className="flex items-center text-gray-600">
                  <span className="mr-3">✉️</span>
                  info@restauranthub.com
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Opening Hours</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Monday - Friday</span>
                  <span>11:00 AM - 10:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Saturday</span>
                  <span>12:00 PM - 11:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Sunday</span>
                  <span>12:00 PM - 9:00 PM</span>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-6 mt-8">Follow Us</h3>
              <div className="flex space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-blue-700 transition-colors">
                  <span>📘</span>
                </div>
                <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-pink-700 transition-colors">
                  <span>📷</span>
                </div>
                <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-blue-500 transition-colors">
                  <span>🐦</span>
                </div>
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-red-700 transition-colors">
                  <span>📺</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. News / Events / Offers */}
      <section className="py-16 bg-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Special Offers & Events
            </h2>
            <p className="text-xl text-gray-600">
              Stay updated with our latest happenings
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Weekend Buffet
              </h3>
              <p className="text-gray-600 mb-4">
                Enjoy unlimited dishes from our special weekend buffet.
                Every Saturday and Sunday, 7:00 PM - 10:00 PM.
              </p>
              <span className="inline-block px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
                ₹499 per person
              </span>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-4xl mb-4">🎂</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Birthday Special
              </h3>
              <p className="text-gray-600 mb-4">
                Celebrate your special day with us! Free cake and 20% off
                on your entire order.
              </p>
              <span className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                Book in advance
              </span>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-4xl mb-4">🎵</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Live Music Night
              </h3>
              <p className="text-gray-600 mb-4">
                Join us for acoustic music performances every Friday evening.
                8:00 PM - 11:00 PM.
              </p>
              <span className="inline-block px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                Free entry
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">RestaurantHub</h3>
              <p className="text-gray-400">
                Serving delicious meals with love and passion since 2020.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => onNavigate("home")} className="hover:text-white transition-colors">Home</button></li>
                <li><button onClick={() => onNavigate("menu")} className="hover:text-white transition-colors">Menu</button></li>
                <li><button onClick={() => onNavigate("reservations")} className="hover:text-white transition-colors">Reservations</button></li>
                <li><button onClick={() => onNavigate("orders")} className="hover:text-white transition-colors">Orders</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Dine-in</li>
                <li>Takeaway</li>
                <li>Delivery</li>
                <li>Catering</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>+91 6300522709</li>
                <li>info@restauranthub.com</li>
                <li>123 brodipet Street</li>
                <li>Food District, guntur 12345</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © {currentYear} RestaurantHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
