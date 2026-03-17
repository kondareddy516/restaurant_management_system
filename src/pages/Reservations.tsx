import { useEffect, useState } from "react";
import { reservationService, Reservation } from "../services/firestoreService";
import { toast } from "sonner";
import ErrorBoundaryComponent from "../components/ErrorBoundaryComponent";
import { useAuth } from "../context/AuthContext";

function CopperSpinner({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div
        className="animate-spin rounded-full h-10 w-10 border-4 border-solid"
        style={{
          borderColor: "rgba(184, 115, 51, 0.25)",
          borderTopColor: "#B87333",
        }}
      ></div>
      <p className="mt-4 font-medium" style={{ color: "#B87333" }}>
        {label}
      </p>
    </div>
  );
}

export default function Reservations() {
  const { user, loading: authLoading } = useAuth();
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState(2);
  const [specialRequests, setSpecialRequests] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [myReservations, setMyReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's reservations
  useEffect(() => {
    const fetchReservations = async () => {
      if (authLoading) {
        return;
      }

      if (!user?.uid) {
        setMyReservations([]);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const reservations = await reservationService.getAll(
          user.uid,
          undefined,
          undefined,
          "customer",
        );
        setMyReservations(reservations);
      } catch (err) {
        console.error("Error fetching reservations:", err);
        const errMessage = err instanceof Error ? err.message : String(err);

        // Check if it's a Firestore index error
        if (errMessage.includes("index") || errMessage.includes("composite")) {
          const indexError =
            "Firestore indexes are being created. Please refresh in a moment.";
          setError(indexError);
          toast.error(indexError);
        } else {
          setError("Failed to load reservations");
          toast.error("Failed to load reservations");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [authLoading, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.uid) {
      toast.error("Please sign in to make a reservation.");
      return;
    }

    if (!customerName || !customerPhone || !date || !time) {
      toast.error("Please fill in all required fields!", {
        style: {
          backgroundColor: "#2D0B0B",
          color: "#F3E5AB",
          border: "1px solid #B87333",
        },
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Ensure NO undefined values - all fields have fallbacks
      await reservationService.create({
        userId: user.uid,
        customerName: customerName || "",
        customerEmail: customerEmail || "",
        customerPhone: customerPhone || "",
        date: date || "",
        time: time || "",
        numberOfGuests: numberOfGuests || 1,
        specialRequests: specialRequests || "",
        status: "confirmed",
      });

      toast.success("Reservation confirmed successfully!", {
        style: {
          backgroundColor: "#2D0B0B",
          color: "#F3E5AB",
          border: "1px solid #B87333",
        },
      });
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setDate("");
      setTime("");
      setNumberOfGuests(2);
      setSpecialRequests("");

      // Refresh reservations list
      if (user.uid) {
        const updated = await reservationService.getAll(
          user.uid,
          undefined,
          undefined,
          "customer",
        );
        setMyReservations(updated);
      }
    } catch (error) {
      console.error("Reservation submission error:", error);
      toast.error("Failed to create reservation. Please try again.", {
        style: {
          backgroundColor: "#2D0B0B",
          color: "#F3E5AB",
          border: "1px solid #B87333",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await reservationService.cancel(id);
      toast.success("Reservation cancelled successfully!");
      // Refresh reservations list
      if (user?.uid) {
        const updated = await reservationService.getAll(
          user.uid,
          undefined,
          undefined,
          "customer",
        );
        setMyReservations(updated);
      }
    } catch (error) {
      toast.error("Failed to cancel reservation.");
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
    <ErrorBoundaryComponent>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Table Reservations
        </h1>

        {authLoading ? (
          <CopperSpinner label="Authenticating your Royal account..." />
        ) : null}

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Make a Reservation
            </h2>
            {!user?.uid && !authLoading ? (
              <div
                className="mb-6 rounded-lg border px-4 py-3"
                style={{
                  borderColor: "#B87333",
                  backgroundColor: "#FFF7F0",
                  color: "#8C4A1F",
                }}
              >
                Sign in to create and sync reservations with your account.
              </div>
            ) : null}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Guests *
                </label>
                <input
                  type="number"
                  value={numberOfGuests}
                  onChange={(e) => setNumberOfGuests(parseInt(e.target.value))}
                  min={1}
                  max={20}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests
                </label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Any special requirements?"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting || authLoading || !user?.uid}
                className="w-full px-6 py-3 text-white rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: isSubmitting ? "#B87333" : "#E67E22",
                }}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div
                      className="w-4 h-4 border-2 border-t-2 rounded-full animate-spin"
                      style={{
                        borderColor: "rgba(255, 255, 255, 0.3)",
                        borderTopColor: "#FFFFFF",
                      }}
                    />
                    Submitting Reservation...
                  </div>
                ) : (
                  "Reserve Table"
                )}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              My Reservations
            </h2>
            {authLoading ? (
              <CopperSpinner label="Authenticating your Royal account..." />
            ) : loading ? (
              <CopperSpinner label="Loading your reservations..." />
            ) : !user?.uid ? (
              <p className="text-gray-600 text-center py-8">
                Sign in to view your reservation history.
              </p>
            ) : error ? (
              <div
                style={{
                  backgroundColor: "#2D0B0B",
                  borderRadius: "8px",
                  padding: "16px",
                  textAlign: "center",
                  border: "1px solid #B87333",
                }}
              >
                <p style={{ color: "#F3E5AB", fontSize: "14px", margin: "0" }}>
                  ⚠️ {error}
                </p>
                <p
                  style={{
                    color: "#B87333",
                    fontSize: "12px",
                    marginTop: "8px",
                    margin: "8px 0 0 0",
                  }}
                >
                  Try refreshing the page in a few moments.
                </p>
              </div>
            ) : myReservations.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                No reservations yet. Make your first reservation!
              </p>
            ) : (
              <div className="space-y-4">
                {myReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {reservation.customerName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {reservation.numberOfGuests} guests
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          reservation.status,
                        )}`}
                      >
                        {reservation.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>📅 {reservation.date}</p>
                      <p>🕐 {reservation.time}</p>
                      {reservation.specialRequests && (
                        <p className="text-xs italic">
                          Note: {reservation.specialRequests}
                        </p>
                      )}
                    </div>
                    {(reservation.status === "pending" ||
                      reservation.status === "confirmed") &&
                      reservation.id && (
                      <button
                        onClick={() => handleCancel(reservation.id!)}
                        className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Cancel Reservation
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundaryComponent>
  );
}
