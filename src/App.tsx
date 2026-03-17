import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./config/firebase";
import { Toaster } from "sonner";
import { toast } from "sonner";

// Pages
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Reservations from "./pages/Reservations";
import Orders from "./pages/Orders";
import AdminDashboard from "./pages/AdminDashboard";
import SignInForm from "./SignInForm";
import SignOutButton from "./SignOutButton";

// Services
import { userRoleService } from "./services/firestoreService";

type Page = "home" | "menu" | "cart" | "reservations" | "orders" | "admin";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [userRole, setUserRole] = useState<string>("customer");
  const [user, loading] = useAuthState(auth);
  const [_roleLoading, setRoleLoading] = useState(false);

  // Fetch user role whenever user changes
  useEffect(() => {
    if (user) {
      setRoleLoading(true);
      userRoleService
        .getUserRole(user.uid)
        .then((role) => {
          setUserRole(role);
          setRoleLoading(false);
        })
        .catch(() => {
          setUserRole("customer");
          setRoleLoading(false);
        });
    } else {
      setUserRole("customer");
    }
  }, [user]);

  // Cart management functions
  const addToCart = (item: { id: string; name: string; price: number }) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    toast.success(`Added ${item.name} to cart`);
  };

  const updateCartQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((i) => i.id !== id));
    } else {
      setCart((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity } : i)),
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  // Page rendering
  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <Home addToCart={addToCart} onNavigate={setCurrentPage} />;
      case "menu":
        return <Menu addToCart={addToCart} />;
      case "cart":
        return (
          <Cart
            cart={cart}
            onUpdateQuantity={updateCartQuantity}
            clearCart={clearCart}
            onOrderComplete={() => {
              clearCart();
              setCurrentPage("orders");
            }}
            userId={user?.uid}
          />
        );
      case "reservations":
        return <Reservations userId={user?.uid} />;
      case "orders":
        return <Orders userId={user?.uid} userRole={userRole} />;
      case "admin":
        return <AdminDashboard userId={user?.uid} userRole={userRole} />;
      default:
        return <Home addToCart={addToCart} onNavigate={setCurrentPage} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto"></div>
          <p className="mt-4 text-amber-800 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-amber-900 via-orange-900 to-amber-900 text-white shadow-xl border-b-4 border-amber-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🏛️</span>
              <div>
                <h1 className="text-2xl font-bold text-amber-200">
                  RestaurantHub
                </h1>
                <p className="text-xs text-amber-300">Royal Heritage Dining</p>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {[
                { id: "home" as Page, label: "Home" },
                { id: "menu" as Page, label: "Menu" },
                { id: "reservations" as Page, label: "Reservations" },
              ].map((link) => (
                <button
                  key={link.id}
                  onClick={() => setCurrentPage(link.id)}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    currentPage === link.id
                      ? "bg-amber-600 text-white"
                      : "text-amber-100 hover:bg-amber-800"
                  }`}
                >
                  {link.label}
                </button>
              ))}

              {/* Conditionally show orders and admin links */}
              {user && (
                <>
                  <button
                    onClick={() => setCurrentPage("orders")}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                      currentPage === "orders"
                        ? "bg-amber-600 text-white"
                        : "text-amber-100 hover:bg-amber-800"
                    }`}
                  >
                    My Orders
                  </button>

                  {(userRole === "admin" || userRole === "staff") && (
                    <button
                      onClick={() => setCurrentPage("admin")}
                      className={`px-4 py-2 rounded-lg transition-all duration-200 font-semibold ${
                        currentPage === "admin"
                          ? "bg-red-600 text-white"
                          : "text-amber-100 hover:bg-red-700"
                      }`}
                    >
                      Dashboard
                    </button>
                  )}
                </>
              )}
            </nav>

            {/* Right Side - Cart & Auth */}
            <div className="flex items-center space-x-4">
              {/* Cart Icon */}
              <button
                onClick={() => setCurrentPage("cart")}
                className="relative flex items-center space-x-2 px-3 py-2 rounded-lg bg-amber-700 hover:bg-amber-600 transition-all"
              >
                <span className="text-xl">🛒</span>
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>

              {/* User Info & Auth Buttons */}
              <div className="flex items-center space-x-3">
                {user ? (
                  <>
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-semibold text-amber-200">
                        {user.email}
                      </p>
                      <p className="text-xs text-amber-300 capitalize">
                        {userRole}
                      </p>
                    </div>
                    <SignOutButton />
                  </>
                ) : (
                  <SignInForm />
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderPage()}
      </main>

      {/* Toast Notifications */}
      <Toaster position="top-right" richColors theme="light" />

      {/* Footer */}
      <footer className="bg-gradient-to-r from-amber-900 via-orange-900 to-amber-900 text-white mt-12 border-t-4 border-amber-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold text-amber-200 mb-4">
                RestaurantHub
              </h3>
              <p className="text-amber-100 text-sm">
                Experience authentic Royal Heritage dining with modern
                convenience.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-200 mb-4">
                Quick Links
              </h3>
              <ul className="text-amber-100 text-sm space-y-2">
                <li>About Us</li>
                <li>Privacy Policy</li>
                <li>Terms & Conditions</li>
              </ul>
            </div>
           <div>
              <h4 className="text-lg font-bold text-amber-200 mb-4">Contact</h4>
              <ul className="space-y-2 text-amber-100">
                <li>+91 6300522709</li>
                <li>info@restauranthub.com</li>
                <li>123 brodipet Street</li>
                <li>Food District, guntur 12345</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-amber-700 mt-8 pt-8 text-center text-amber-300 text-sm">
            <p>
              &copy; 2026 RestaurantHub. All rights reserved. Powered by
            konda reddy.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
