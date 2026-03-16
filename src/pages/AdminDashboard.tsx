import { useEffect, useState } from "react";
import {
  menuService,
  orderService,
  reservationService,
  MenuItem,
  Order,
  Reservation,
} from "../services/firestoreService";
import {
  updatePaymentStatus,
  updateReservationStatus,
  RoyalToastMessages,
  RoyalColors,
} from "../services/dbUpdates";
import { toast } from "sonner";

interface AdminDashboardProps {
  userId?: string;
  userRole: string;
}

export default function AdminDashboard({
  userId,
  userRole,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    "orders" | "reservations" | "menu"
  >("orders");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === "orders"
              ? "bg-orange-600 text-white shadow-lg"
              : "bg-white text-gray-700 hover:bg-gray-100 shadow"
          }`}
        >
          Orders
        </button>
        <button
          onClick={() => setActiveTab("reservations")}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === "reservations"
              ? "bg-orange-600 text-white shadow-lg"
              : "bg-white text-gray-700 hover:bg-gray-100 shadow"
          }`}
        >
          Reservations
        </button>
        <button
          onClick={() => setActiveTab("menu")}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === "menu"
              ? "bg-orange-600 text-white shadow-lg"
              : "bg-white text-gray-700 hover:bg-gray-100 shadow"
          }`}
        >
          Menu Management
        </button>
      </div>

      {activeTab === "orders" && <OrdersManagement />}
      {activeTab === "reservations" && <ReservationsManagement />}
      {activeTab === "menu" && <MenuManagement />}
    </div>
  );
}

function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentModal, setPaymentModal] = useState(false);
  const [paymentAction, setPaymentAction] = useState<
    "verified" | "rejected" | null
  >(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const allOrders = await orderService.getAll();
        setOrders(allOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusUpdate = async (
    orderId: string,
    status:
      | "pending"
      | "confirmed"
      | "preparing"
      | "ready"
      | "completed"
      | "cancelled",
  ) => {
    try {
      await orderService.updateStatus(orderId, status);
      toast.success("Order status updated!");
      const allOrders = await orderService.getAll();
      setOrders(allOrders);
    } catch (error) {
      toast.error("Failed to update order status.");
      console.error(error);
    }
  };

  const handleOpenPaymentModal = (order: Order) => {
    setSelectedOrder(order);
    setPaymentModal(true);
    setPaymentAction(null);
    setRejectionReason("");
  };

  const handlePaymentVerification = async () => {
    if (!selectedOrder || !paymentAction) return;

    setIsSubmittingPayment(true);
    try {
      await updatePaymentStatus({
        orderId: selectedOrder.id!,
        status: paymentAction,
        transactionId: `TXN_${Date.now()}`,
        transactionDetails: {
          upiId:
            selectedOrder.paymentMethod === "upi" ? "merchant@upi" : undefined,
          timestamp: new Date().toISOString(),
          amount: selectedOrder.totalAmount,
        },
        rejectionReason:
          paymentAction === "rejected" ? rejectionReason : undefined,
        updatedBy: "admin", // Should be actual admin user ID
      });

      // Show success toast with custom message
      if (paymentAction === "verified") {
        toast.success(RoyalToastMessages.payment.success, {
          description: RoyalToastMessages.payment.successDescription(
            `TXN_${Date.now()}`,
          ),
        });
      } else {
        toast.error(RoyalToastMessages.payment.error, {
          description:
            RoyalToastMessages.payment.errorDescription(rejectionReason),
        });
      }

      // Refresh orders
      const allOrders = await orderService.getAll();
      setOrders(allOrders);
      setPaymentModal(false);
      setSelectedOrder(null);
    } catch (error) {
      toast.error(RoyalToastMessages.payment.error, {
        description: (error as Error).message,
      });
      console.error("Payment update error:", error);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-yellow-100 text-yellow-800";
      case "ready":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-orange-100 text-orange-800";
    }
  };

  const getPaymentStatusColor = (status?: string) => {
    switch (status) {
      case "completed":
      case "paid":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Orders Management
      </h2>
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      ) : orders.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">
                    Order #{order.id?.slice(-6) || ""}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {order.customerName} - {order.customerPhone}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.createdAt
                      ? new Date(order.createdAt.toMillis()).toLocaleString()
                      : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      order.status,
                    )}`}
                  >
                    {order.status}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(
                      order.paymentStatus,
                    )}`}
                  >
                    {order.paymentStatus || "pending"}
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  Items:
                </p>
                {order.items.map((item, index) => (
                  <p key={index} className="text-sm text-gray-600">
                    {item.name} × {item.quantity}
                  </p>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-orange-600">
                    ₹{order.totalAmount.toFixed(2)}
                  </p>
                  {order.paymentMethod && (
                    <p className="text-xs text-gray-500">
                      Payment: {order.paymentMethod.toUpperCase()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 items-center">
                  {order.paymentStatus === "pending" && (
                    <button
                      onClick={() => handleOpenPaymentModal(order)}
                      style={{ backgroundColor: RoyalColors.copper }}
                      className="px-3 py-1 text-white rounded text-sm hover:opacity-90 transition-opacity font-medium"
                    >
                      Verify Payment
                    </button>
                  )}
                  {order.id && (
                    <select
                      value={order.status}
                      onChange={(e) =>
                        void handleStatusUpdate(
                          order.id!,
                          e.target.value as any,
                        )
                      }
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Verification Modal */}
      {paymentModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            className="bg-white rounded-lg p-8 max-w-md w-full"
            style={{ borderTop: `4px solid ${RoyalColors.copper}` }}
          >
            <h3
              className="text-2xl font-bold mb-6"
              style={{ color: RoyalColors.deepBurgundy }}
            >
              🏛️ Exchequer Verification
            </h3>

            {/* Order & Payment Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-bold">{selectedOrder.id?.slice(-6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold">
                  ₹{selectedOrder.totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-bold">
                  {selectedOrder.paymentMethod?.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="font-bold">{selectedOrder.customerName}</span>
              </div>
            </div>

            {/* Action Selection */}
            {!paymentAction ? (
              <div className="space-y-3">
                <button
                  onClick={() => setPaymentAction("verified")}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  ✓ Verify Payment
                </button>
                <button
                  onClick={() => setPaymentAction("rejected")}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  ✗ Reject Payment
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentAction === "rejected" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Reason
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Enter reason for rejection..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-sm"
                      rows={3}
                    />
                  </div>
                )}

                <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                  {paymentAction === "verified"
                    ? "✓ Payment will be marked as PAID and order status will move to PREPARING"
                    : "✗ Payment will be marked as FAILED and order will require manual action"}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setPaymentAction(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePaymentVerification}
                    disabled={
                      isSubmittingPayment ||
                      (paymentAction === "rejected" && !rejectionReason.trim())
                    }
                    style={{
                      backgroundColor:
                        paymentAction === "verified" ? "#22c55e" : "#ef4444",
                    }}
                    className="flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingPayment ? "Processing..." : "Confirm"}
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setPaymentModal(false);
                setSelectedOrder(null);
                setPaymentAction(null);
                setRejectionReason("");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ReservationsManagement() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      try {
        const allReservations = await reservationService.getAll();
        setReservations(allReservations);
      } catch (err) {
        console.error("Error fetching reservations:", err);
        toast.error("Failed to load reservations");
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const handleStatusUpdate = async (
    reservationId: string,
    status: "pending" | "confirmed" | "cancelled" | "completed" | "no-show",
  ) => {
    try {
      await updateReservationStatus(
        {
          reservationId,
          newStatus: status,
          updatedBy: "admin",
        },
        "admin",
      );

      // Show appropriate toast message
      if (status === "confirmed") {
        toast.success(RoyalToastMessages.reservation.success, {
          description: "Reservation confirmed",
        });
      } else if (status === "cancelled") {
        toast.success(RoyalToastMessages.reservation.success, {
          description: "Reservation cancelled",
        });
      } else if (status === "completed") {
        toast.success(RoyalToastMessages.reservation.success, {
          description: "Reservation completed",
        });
      } else if (status === "no-show") {
        toast.success("Reservation marked as no-show");
      }

      // Refresh reservations
      const allReservations = await reservationService.getAll();
      setReservations(allReservations);
      setExpandedId(null);
    } catch (error) {
      toast.error(RoyalToastMessages.reservation.error, {
        description: (error as Error).message,
      });
      console.error(error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "no-show":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isReservationInFuture = (date: string): boolean => {
    const reservationDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return reservationDate >= today;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Reservations Management
      </h2>
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      ) : reservations.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No reservations yet.</p>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <div
              key={reservation.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">
                    {reservation.customerName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {reservation.customerPhone}
                  </p>
                  <p className="text-sm text-gray-600">
                    📅 {reservation.date} at {reservation.time}
                  </p>
                  <p className="text-sm text-gray-600">
                    👥 {reservation.numberOfGuests} guests
                  </p>
                  {reservation.specialRequests && (
                    <p className="text-xs text-gray-500 italic mt-1">
                      {reservation.specialRequests}
                    </p>
                  )}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                    reservation.status,
                  )}`}
                >
                  {reservation.status}
                </span>
              </div>

              {/* Quick Action Dropdown */}
              <div className="flex items-center gap-2">
                {reservation.id && !expandedId ? (
                  <button
                    onClick={() => setExpandedId(reservation.id!)}
                    style={{ backgroundColor: RoyalColors.copper }}
                    className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
                  >
                    Quick Action ▼
                  </button>
                ) : expandedId === reservation.id ? (
                  <div className="flex flex-wrap gap-2 w-full">
                    <button
                      onClick={() =>
                        void handleStatusUpdate(reservation.id!, "confirmed")
                      }
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      ✓ Confirm
                    </button>
                    <button
                      onClick={() =>
                        void handleStatusUpdate(reservation.id!, "completed")
                      }
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      ✓ Complete
                    </button>
                    {isReservationInFuture(reservation.date) && (
                      <button
                        onClick={() =>
                          void handleStatusUpdate(reservation.id!, "cancelled")
                        }
                        className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 transition-colors"
                      >
                        ✗ Cancel
                      </button>
                    )}
                    <button
                      onClick={() =>
                        void handleStatusUpdate(reservation.id!, "no-show")
                      }
                      className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors"
                    >
                      ⊘ No-Show
                    </button>
                    <button
                      onClick={() => setExpandedId(null)}
                      className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition-colors ml-auto"
                    >
                      Close
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "starters" as "starters" | "veg" | "non-veg" | "desserts",
    preparationTime: 15,
    available: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenuItems = async () => {
      setLoading(true);
      try {
        const items = await menuService.getAll();
        setMenuItems(items);
      } catch (err) {
        console.error("Error fetching menu items:", err);
        toast.error("Failed to load menu items");
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingId) {
        await menuService.update(editingId, formData);
        toast.success("Menu item updated!");
        setEditingId(null);
      } else {
        await menuService.create(formData);
        toast.success("Menu item created!");
      }

      // Refresh menu items
      const items = await menuService.getAll();
      setMenuItems(items);

      setFormData({
        name: "",
        description: "",
        price: 0,
        category: "starters",
        preparationTime: 15,
        available: true,
      });
      setIsAdding(false);
    } catch (error) {
      toast.error("Failed to save menu item.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingId(item.id || null);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      preparationTime: item.preparationTime,
      available: item.available,
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        await menuService.delete(id);
        toast.success("Menu item deleted!");
        // Refresh menu items
        const items = await menuService.getAll();
        setMenuItems(items);
      } catch (error) {
        toast.error("Failed to delete menu item.");
        console.error(error);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Menu Management</h2>
        <button
          onClick={() => {
            setIsAdding(!isAdding);
            setEditingId(null);
            setFormData({
              name: "",
              description: "",
              price: 0,
              category: "starters",
              preparationTime: 15,
              available: true,
            });
          }}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
        >
          {isAdding ? "Cancel" : "Add Item"}
        </button>
      </div>

      {isAdding && (
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="mb-8 p-6 bg-gray-50 rounded-lg"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {editingId ? "Edit Menu Item" : "Add New Menu Item"}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as any,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                required
              >
                <option value="starters">Starters</option>
                <option value="veg">Vegetarian</option>
                <option value="non-veg">Non-Veg</option>
                <option value="desserts">Desserts</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prep Time (mins) *
              </label>
              <input
                type="number"
                value={formData.preparationTime}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    preparationTime: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                required
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.available}
                  onChange={(e) =>
                    setFormData({ ...formData, available: e.target.checked })
                  }
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-600"
                />
                <span className="text-sm font-medium text-gray-700">
                  Available
                </span>
              </label>
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? "Saving..."
              : editingId
                ? "Update Item"
                : "Add Item"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      ) : menuItems.length === 0 ? (
        <p className="text-gray-600 text-center py-8">
          No menu items yet. Add your first item!
        </p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
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
              <div className="flex justify-between items-center mt-3">
                <div>
                  <p className="text-lg font-bold text-orange-600">
                    ₹{item.price.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.category} • {item.preparationTime} mins
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => item.id && void handleDelete(item.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                  >
                    Delete
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
