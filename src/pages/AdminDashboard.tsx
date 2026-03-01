import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"orders" | "reservations" | "menu">(
    "orders"
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        Admin Dashboard
      </h1>

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
  const orders = useQuery(api.orders.list, {});
  const updateOrderStatus = useMutation(api.orders.updateStatus);

  const handleStatusUpdate = async (
    orderId: Id<"orders">,
    status: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled"
  ) => {
    try {
      await updateOrderStatus({ id: orderId, status });
      toast.success("Order status updated!");
    } catch (error) {
      toast.error("Failed to update order status.");
      console.error(error);
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

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Orders Management
      </h2>
      {orders === undefined ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      ) : orders.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">
                    Order #{order._id.slice(-6)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {order.customerName} - {order.customerPhone}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(order._creationTime).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>

              <div className="mb-3">
                <p className="text-sm font-semibold text-gray-700 mb-1">Items:</p>
                {order.items.map((item, index) => (
                  <p key={index} className="text-sm text-gray-600">
                    {item.menuItem?.name} × {item.quantity}
                  </p>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <p className="font-bold text-orange-600">
                  ₹{order.totalAmount.toFixed(2)}
                </p>
                <select
                  value={order.status}
                  onChange={(e) => void handleStatusUpdate(order._id, e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReservationsManagement() {
  const reservations = useQuery(api.reservations.list, {});
  const updateReservationStatus = useMutation(api.reservations.updateStatus);

  const handleStatusUpdate = async (
    reservationId: Id<"reservations">,
    status: "pending" | "confirmed" | "cancelled" | "completed"
  ) => {
    try {
      await updateReservationStatus({ id: reservationId, status });
      toast.success("Reservation status updated!");
    } catch (error) {
      toast.error("Failed to update reservation status.");
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
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Reservations Management
      </h2>
      {reservations === undefined ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      ) : reservations.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No reservations yet.</p>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <div
              key={reservation._id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
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
                    reservation.status
                  )}`}
                >
                  {reservation.status}
                </span>
              </div>

              <div className="flex justify-end">
                <select
                  value={reservation.status}
                  onChange={(e) => void handleStatusUpdate(reservation._id, e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MenuManagement() {
  const menuItems = useQuery(api.menuItems.list, {});
  const createMenuItem = useMutation(api.menuItems.create);
  const updateMenuItem = useMutation(api.menuItems.update);
  const deleteMenuItem = useMutation(api.menuItems.remove);
  const generateUploadUrl = useMutation(api.menuItems.generateUploadUrl);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<Id<"menuItems"> | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "starters" as "starters" | "veg" | "non-veg" | "desserts",
    preparationTime: 15,
    available: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const convexUrl = import.meta.env.VITE_CONVEX_URL;
      const response = await fetch(`${convexUrl}/api/seed`, { method: "POST" });
      if (response.ok) {
        toast.success("Menu items seeded successfully!");
      } else {
        toast.error("Failed to seed menu items.");
      }
    } catch (error) {
      toast.error("Failed to seed menu items.");
      console.error(error);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageId: Id<"_storage"> | undefined;

      if (imageFile) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": imageFile.type },
          body: imageFile,
        });
        const json = await result.json();
        if (!result.ok) {
          throw new Error(`Upload failed: ${JSON.stringify(json)}`);
        }
        imageId = json.storageId;
      }

      if (editingId) {
        await updateMenuItem({
          id: editingId,
          ...formData,
          imageId,
        });
        toast.success("Menu item updated!");
        setEditingId(null);
      } else {
        await createMenuItem({
          ...formData,
          imageId,
        });
        toast.success("Menu item created!");
      }

      setFormData({
        name: "",
        description: "",
        price: 0,
        category: "starters",
        preparationTime: 15,
        available: true,
      });
      setImageFile(null);
      setIsAdding(false);
    } catch (error) {
      toast.error("Failed to save menu item.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item._id);
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

  const handleDelete = async (id: Id<"menuItems">) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteMenuItem({ id });
        toast.success("Menu item deleted!");
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
        <div className="flex space-x-2">
          {menuItems?.length === 0 && (
            <button
              onClick={() => void handleSeedData()}
              disabled={isSeeding}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
            >
              {isSeeding ? "Seeding..." : "Seed Sample Data"}
            </button>
          )}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
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

      {menuItems === undefined ? (
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
            <div key={item._id} className="border border-gray-200 rounded-lg p-4">
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
                    onClick={() => void handleDelete(item._id)}
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
