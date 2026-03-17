import React, { useState, useEffect } from "react";
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
import { userCartService, userRoleService } from "./services/firestoreService";
import { useAuth } from "./context/AuthContext";

type Page = "home" | "menu" | "cart" | "reservations" | "orders" | "admin";

const VALID_PAGES: Page[] = [
  "home",
  "menu",
  "cart",
  "reservations",
  "orders",
  "admin",
];

const AUTH_REQUIRED_PAGES: Page[] = [
  "menu",
  "cart",
  "reservations",
  "orders",
  "admin",
];

function getPageFromHash(hash: string): Page {
  const page = hash.replace(/^#/, "") as Page;
  return VALID_PAGES.includes(page) ? page : "home";
}

function requiresAuth(page: Page): boolean {
  return AUTH_REQUIRED_PAGES.includes(page);
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    if (typeof window === "undefined") {
      return "home";
    }

    return getPageFromHash(window.location.hash);
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [userRole, setUserRole] = useState<string>("customer");
  const [cartSyncAvailable, setCartSyncAvailable] = useState(true);
  const { user, loading } = useAuth();
  const [_roleLoading, setRoleLoading] = useState(false);

  const showAuthRequiredMessage = () => {
    toast.error(
      "Please sign in to view the menu, reserve a table, or order food.",
    );
  };

  const navigateToPage = (page: Page) => {
    if (!user && requiresAuth(page)) {
      setCurrentPage("home");
      showAuthRequiredMessage();
      return;
    }

    setCurrentPage(page);
  };

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPage(getPageFromHash(window.location.hash));
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  useEffect(() => {
    const nextHash = `#${currentPage}`;

    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, "", nextHash);
    }
  }, [currentPage]);

  useEffect(() => {
    if (!user && requiresAuth(currentPage)) {
      setCurrentPage("home");
      window.history.replaceState(null, "", "#home");
    }
  }, [currentPage, user]);

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

  useEffect(() => {
    if (!user?.uid) {
      setCart([]);
      setCartSyncAvailable(true);
      return;
    }

    setCartSyncAvailable(true);

    const unsubscribe = userCartService.subscribe(
      user.uid,
      (items) => {
        setCart(items);
      },
      (error: any) => {
        console.error("Error syncing cart:", error);

        if (error?.code === "permission-denied") {
          setCartSyncAvailable(false);
          toast.error(
            "Royal Cart cloud sync is not permitted. Please publish userCarts Firestore rules.",
          );
          return;
        }

        toast.error("Failed to sync Royal Cart");
      },
    );

    return unsubscribe;
  }, [user?.uid]);

  // Cart management functions
  const addToCart = (item: { id: string; name: string; price: number }) => {
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === item.id);
      const nextCart = existing
        ? prev.map((cartItem) =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem,
          )
        : [...prev, { ...item, quantity: 1 }];

      if (user?.uid && cartSyncAvailable) {
        void userCartService.setCart(user.uid, nextCart).catch((error) => {
          console.error("Error persisting cart item:", error);
          if (error?.code !== "permission-denied") {
            toast.error("Failed to update Royal Cart");
          }
        });
      }

      return nextCart;
    });
    toast.success(`Added ${item.name} to cart`);
  };

  const updateCartQuantity = (id: string, quantity: number) => {
    setCart((prev) => {
      const nextCart =
        quantity <= 0
          ? prev.filter((item) => item.id !== id)
          : prev.map((item) =>
              item.id === id ? { ...item, quantity } : item,
            );

      if (user?.uid && cartSyncAvailable) {
        void userCartService.setCart(user.uid, nextCart).catch((error) => {
          console.error("Error updating cart quantity:", error);
          if (error?.code !== "permission-denied") {
            toast.error("Failed to update Royal Cart");
          }
        });
      }

      return nextCart;
    });
  };

  const clearCart = () => {
    setCart([]);

    if (user?.uid && cartSyncAvailable) {
      void userCartService.clear(user.uid).catch((error) => {
        console.error("Error clearing cart:", error);
        if (error?.code !== "permission-denied") {
          toast.error("Failed to clear Royal Cart");
        }
      });
    }
  };

  // Page rendering
  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return (
          <Home
            addToCart={addToCart}
            onNavigate={navigateToPage}
            isAuthenticated={!!user}
            onRequireSignIn={showAuthRequiredMessage}
          />
        );
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
              navigateToPage("orders");
            }}
            userId={user?.uid}
          />
        );
      case "reservations":
        return <Reservations />;
      case "orders":
        return <Orders userRole={userRole} />;
      case "admin":
        return <AdminDashboard userId={user?.uid} userRole={userRole} />;
      default:
        return (
          <Home
            addToCart={addToCart}
            onNavigate={navigateToPage}
            isAuthenticated={!!user}
            onRequireSignIn={showAuthRequiredMessage}
          />
        );
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
                ...(user
                  ? [
                      { id: "menu" as Page, label: "Menu" },
                      { id: "reservations" as Page, label: "Reservations" },
                    ]
                  : []),
              ].map((link) => (
                <button
                  key={link.id}
                  onClick={() => navigateToPage(link.id)}
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
                    onClick={() => navigateToPage("orders")}
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
                      onClick={() => navigateToPage("admin")}
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
              {user ? (
                <button
                  onClick={() => navigateToPage("cart")}
                  className="relative flex items-center space-x-2 px-3 py-2 rounded-lg bg-amber-700 hover:bg-amber-600 transition-all"
                >
                  <span className="text-xl">🛒</span>
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                      {cart.length}
                    </span>
                  )}
                </button>
              ) : null}

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
