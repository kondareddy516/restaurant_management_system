import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState } from "react";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Reservations from "./pages/Reservations";
import Orders from "./pages/Orders";
import AdminDashboard from "./pages/AdminDashboard";

type Page = "home" | "menu" | "cart" | "reservations" | "orders" | "admin";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [cart, setCart] = useState<Array<{ id: string; name: string; price: number; quantity: number }>>([]);
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const userRole = useQuery(api.users.getCurrentUserRole);

  const addToCart = (item: { id: string; name: string; price: number }) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateCartQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((i) => i.id !== id));
    } else {
      setCart((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity } : i))
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <Home onNavigate={setCurrentPage} />;
      case "menu":
        return <Menu onAddToCart={addToCart} />;
      case "cart":
        return (
          <Cart
            cart={cart}
            onUpdateQuantity={updateCartQuantity}
            onClearCart={clearCart}
            onNavigate={setCurrentPage}
          />
        );
      case "reservations":
        return <Reservations />;
      case "orders":
        return <Orders />;
      case "admin":
        return <AdminDashboard />;
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1
                className="text-2xl font-bold text-orange-600 cursor-pointer"
                onClick={() => setCurrentPage("home")}
              >
                🍽️ RestaurantHub
              </h1>
              <nav className="hidden md:flex space-x-6">
                <button
                  onClick={() => setCurrentPage("home")}
                  className={`text-sm font-medium transition-colors ${
                    currentPage === "home"
                      ? "text-orange-600"
                      : "text-gray-700 hover:text-orange-600"
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => setCurrentPage("menu")}
                  className={`text-sm font-medium transition-colors ${
                    currentPage === "menu"
                      ? "text-orange-600"
                      : "text-gray-700 hover:text-orange-600"
                  }`}
                >
                  Menu
                </button>
                <button
                  onClick={() => setCurrentPage("reservations")}
                  className={`text-sm font-medium transition-colors ${
                    currentPage === "reservations"
                      ? "text-orange-600"
                      : "text-gray-700 hover:text-orange-600"
                  }`}
                >
                  Reservations
                </button>
                <Authenticated>
                  <button
                    onClick={() => setCurrentPage("orders")}
                    className={`text-sm font-medium transition-colors ${
                      currentPage === "orders"
                        ? "text-orange-600"
                        : "text-gray-700 hover:text-orange-600"
                    }`}
                  >
                    My Orders
                  </button>
                  {(userRole === "admin" || userRole === "staff") && (
                    <button
                      onClick={() => setCurrentPage("admin")}
                      className={`text-sm font-medium transition-colors ${
                        currentPage === "admin"
                          ? "text-orange-600"
                          : "text-gray-700 hover:text-orange-600"
                      }`}
                    >
                      Dashboard
                    </button>
                  )}
                </Authenticated>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentPage("cart")}
                className="relative p-2 text-gray-700 hover:text-orange-600 transition-colors"
              >
                <span className="text-2xl">🛒</span>
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
              <Authenticated>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-700">
                    {loggedInUser?.email}
                  </span>
                  <SignOutButton />
                </div>
              </Authenticated>
              <Unauthenticated>
                <button
                  onClick={() => setCurrentPage("home")}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                >
                  Sign In
                </button>
              </Unauthenticated>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Unauthenticated>
          {currentPage === "home" ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    Welcome to RestaurantHub
                  </h2>
                  <p className="text-lg text-gray-600 mb-6">
                    Experience delicious cuisine and seamless dining. Sign in to
                    place orders and make reservations.
                  </p>
                  <SignInForm />
                </div>
                <div className="hidden md:block">
                  <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-8 text-white">
                    <h3 className="text-2xl font-bold mb-4">
                      Browse as Guest
                    </h3>
                    <p className="mb-6">
                      You can explore our menu and features without signing in!
                    </p>
                    <button
                      onClick={() => setCurrentPage("menu")}
                      className="px-6 py-3 bg-white text-orange-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                    >
                      View Menu
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            renderPage()
          )}
        </Unauthenticated>
        <Authenticated>{renderPage()}</Authenticated>
      </main>
      <Toaster position="top-right" />
    </div>
  );
}
