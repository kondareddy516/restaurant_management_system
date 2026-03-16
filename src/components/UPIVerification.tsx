/**
 * UPI Verification Component - Exchequer Verification Module
 * Admin dashboard for verifying UPI payments waiting for manual verification
 *
 * Colors (Royal Heritage):
 * - Deep Burgundy: #2D0B0B (background)
 * - Burnished Copper: #B87333 (primary action)
 * - Wheat Silk: #F3E5AB (text/accents)
 * - Gold Accent: #FFD700 (highlights)
 */

import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { Order } from "../services/firestoreService";
import { toast } from "sonner";

interface UPIVerificationProps {
  userRole?: string;
}

export const UPIVerification: React.FC<UPIVerificationProps> = ({
  userRole,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Fetch orders waiting for verification
  useEffect(() => {
    const fetchPendingOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const q = query(
          collection(db, "orders"),
          where("paymentStatus", "==", "waiting_verification"),
        );
        const snapshot = await getDocs(q);
        const fetchedOrders: Order[] = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Order,
        );
        setOrders(fetchedOrders);
      } catch (err) {
        console.error("Error fetching pending orders:", err);
        const errMessage = err instanceof Error ? err.message : String(err);
        setError("Failed to load pending verifications");
        toast.error("Failed to load pending verifications");
      } finally {
        setLoading(false);
      }
    };

    if (userRole === "admin") {
      fetchPendingOrders();
    }
  }, [userRole]);

  // Copy UTR to clipboard
  const copyToClipboard = (utr: string) => {
    navigator.clipboard.writeText(utr);
    toast.success("UTR copied to clipboard!", {
      style: {
        backgroundColor: "#2D0B0B",
        color: "#F3E5AB",
        border: "1px solid #B87333",
      },
    });
  };

  // Verify and approve payment
  const handleVerifyPayment = async (orderId: string) => {
    if (!orderId) {
      toast.error("Invalid order ID", {
        style: {
          backgroundColor: "#2D0B0B",
          color: "#F3E5AB",
          border: "1px solid #B87333",
        },
      });
      return;
    }

    setVerifyingId(orderId);

    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        paymentStatus: "completed",
        status: "confirmed",
        verifiedAt: new Date(),
      });

      // Remove from pending list
      setOrders(orders.filter((o) => o.id !== orderId));

      toast.success("Payment verified and approved! ✅", {
        style: {
          backgroundColor: "#2D0B0B",
          color: "#F3E5AB",
          border: "1px solid #B87333",
        },
      });
    } catch (err) {
      console.error("Error verifying payment:", err);
      toast.error("Failed to verify payment", {
        style: {
          backgroundColor: "#2D0B0B",
          color: "#F3E5AB",
          border: "1px solid #B87333",
        },
      });
    } finally {
      setVerifyingId(null);
    }
  };

  // Reject payment with reason
  const handleRejectPayment = async () => {
    if (!selectedOrderId || !rejectReason.trim()) {
      toast.error("Please provide a rejection reason", {
        style: {
          backgroundColor: "#2D0B0B",
          color: "#F3E5AB",
          border: "1px solid #B87333",
        },
      });
      return;
    }

    setRejectingId(selectedOrderId);

    try {
      const orderRef = doc(db, "orders", selectedOrderId);
      await updateDoc(orderRef, {
        paymentStatus: "failed",
        status: "payment_failed",
        rejectionReason: rejectReason,
        rejectedAt: new Date(),
      });

      // Remove from pending list
      setOrders(orders.filter((o) => o.id !== selectedOrderId));

      toast.success(`Payment rejected: ${rejectReason}`, {
        style: {
          backgroundColor: "#2D0B0B",
          color: "#F3E5AB",
          border: "1px solid #B87333",
        },
      });

      // Reset modal
      setShowRejectModal(false);
      setSelectedOrderId(null);
      setRejectReason("");
    } catch (err) {
      console.error("Error rejecting payment:", err);
      toast.error("Failed to reject payment", {
        style: {
          backgroundColor: "#2D0B0B",
          color: "#F3E5AB",
          border: "1px solid #B87333",
        },
      });
    } finally {
      setRejectingId(null);
    }
  };

  if (userRole !== "admin") {
    return (
      <div
        style={{
          backgroundColor: "#2D0B0B",
          borderRadius: "12px",
          padding: "32px",
          textAlign: "center",
          border: "1px solid #B87333",
        }}
      >
        <p style={{ color: "#F3E5AB", fontSize: "16px", margin: "0" }}>
          🔐 Access Denied: Admin Only
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1
        className="text-4xl font-bold mb-2"
        style={{
          fontFamily: "Cormorant Garamond, serif",
          color: "#2D0B0B",
        }}
      >
        The Royal Exchequer: Payment Verification
      </h1>
      <p
        className="text-gray-600 mb-8"
        style={{
          fontFamily: "Cormorant Garamond, serif",
          color: "#B87333",
        }}
      >
        Verify and approve pending UPI payments
      </p>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : error ? (
        <div
          style={{
            backgroundColor: "#2D0B0B",
            borderRadius: "12px",
            padding: "32px",
            textAlign: "center",
            border: "1px solid #B87333",
          }}
        >
          <p style={{ color: "#F3E5AB", fontSize: "16px", margin: "0" }}>
            ⚠️ {error}
          </p>
        </div>
      ) : orders.length === 0 ? (
        <div
          style={{
            backgroundColor: "#2D0B0B",
            borderRadius: "12px",
            padding: "32px",
            textAlign: "center",
            border: "1px solid #B87333",
          }}
        >
          <p
            style={{
              color: "#F3E5AB",
              fontSize: "16px",
              margin: "0",
              fontFamily: "Cormorant Garamond, serif",
            }}
          >
            ✅ All payments verified! No pending verifications.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr
                style={{
                  backgroundColor: "#2D0B0B",
                  borderBottom: "2px solid #B87333",
                }}
              >
                <th
                  className="px-6 py-4 text-left"
                  style={{
                    fontFamily: "Cormorant Garamond, serif",
                    color: "#F3E5AB",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                >
                  Order ID
                </th>
                <th
                  className="px-6 py-4 text-left"
                  style={{
                    fontFamily: "Cormorant Garamond, serif",
                    color: "#F3E5AB",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                >
                  Customer Name
                </th>
                <th
                  className="px-6 py-4 text-left"
                  style={{
                    fontFamily: "Cormorant Garamond, serif",
                    color: "#F3E5AB",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                >
                  UTR Number
                </th>
                <th
                  className="px-6 py-4 text-right"
                  style={{
                    fontFamily: "Cormorant Garamond, serif",
                    color: "#F3E5AB",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                >
                  Amount
                </th>
                <th
                  className="px-6 py-4 text-center"
                  style={{
                    fontFamily: "Cormorant Garamond, serif",
                    color: "#F3E5AB",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr
                  key={order.id}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#F9F9F9" : "#FFFFFF",
                    borderBottom: "1px solid #EEEEEE",
                  }}
                >
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <code
                      style={{
                        backgroundColor: "#F0F0F0",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontFamily: "monospace",
                        fontSize: "12px",
                        color: "#2D0B0B",
                      }}
                    >
                      {order.id?.slice(-8)}
                    </code>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    {order.customerName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <code
                        style={{
                          backgroundColor: "#F0F0F0",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontFamily: "monospace",
                          fontSize: "12px",
                          color: "#2D0B0B",
                        }}
                      >
                        {order.specialInstructions || "N/A"}
                      </code>
                      <button
                        onClick={() =>
                          copyToClipboard(order.specialInstructions || "")
                        }
                        disabled={!order.specialInstructions}
                        style={{
                          backgroundColor: "transparent",
                          border: "none",
                          cursor: order.specialInstructions
                            ? "pointer"
                            : "not-allowed",
                          padding: "4px",
                          fontSize: "16px",
                          opacity: order.specialInstructions ? 1 : 0.5,
                        }}
                        title="Copy UTR to clipboard"
                      >
                        📋
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-right text-gray-900">
                    ₹{order.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    <div className="flex gap-2 justify-center flex-wrap">
                      <button
                        onClick={() => handleVerifyPayment(order.id!)}
                        disabled={verifyingId === order.id}
                        style={{
                          backgroundColor:
                            verifyingId === order.id ? "#B87333" : "#27AE60",
                          color: "#FFFFFF",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          border: "none",
                          cursor:
                            verifyingId === order.id
                              ? "not-allowed"
                              : "pointer",
                          fontSize: "13px",
                          fontWeight: "bold",
                          transition: "background-color 0.3s",
                          opacity: verifyingId === order.id ? 0.7 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (verifyingId !== order.id) {
                            (
                              e.target as HTMLButtonElement
                            ).style.backgroundColor = "#229954";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (verifyingId !== order.id) {
                            (
                              e.target as HTMLButtonElement
                            ).style.backgroundColor = "#27AE60";
                          }
                        }}
                      >
                        {verifyingId === order.id ? (
                          <div className="flex items-center gap-1">
                            <div
                              className="w-3 h-3 border-2 border-t-2 rounded-full animate-spin"
                              style={{
                                borderColor: "rgba(255, 255, 255, 0.3)",
                                borderTopColor: "#FFFFFF",
                              }}
                            />
                            Verifying...
                          </div>
                        ) : (
                          "✓ Approve"
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setSelectedOrderId(order.id || null);
                          setShowRejectModal(true);
                        }}
                        disabled={rejectingId === order.id}
                        style={{
                          backgroundColor:
                            rejectingId === order.id ? "#B87333" : "#E74C3C",
                          color: "#FFFFFF",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          border: "none",
                          cursor:
                            rejectingId === order.id
                              ? "not-allowed"
                              : "pointer",
                          fontSize: "13px",
                          fontWeight: "bold",
                          transition: "background-color 0.3s",
                          opacity: rejectingId === order.id ? 0.7 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (rejectingId !== order.id) {
                            (
                              e.target as HTMLButtonElement
                            ).style.backgroundColor = "#C0392B";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (rejectingId !== order.id) {
                            (
                              e.target as HTMLButtonElement
                            ).style.backgroundColor = "#E74C3C";
                          }
                        }}
                      >
                        {rejectingId === order.id ? (
                          <div className="flex items-center gap-1">
                            <div
                              className="w-3 h-3 border-2 border-t-2 rounded-full animate-spin"
                              style={{
                                borderColor: "rgba(255, 255, 255, 0.3)",
                                borderTopColor: "#FFFFFF",
                              }}
                            />
                            Processing...
                          </div>
                        ) : (
                          "✗ Reject"
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              padding: "32px",
              maxWidth: "500px",
              width: "90%",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
              border: "2px solid #B87333",
            }}
          >
            <h2
              style={{
                fontFamily: "Cormorant Garamond, serif",
                color: "#2D0B0B",
                fontSize: "24px",
                marginBottom: "16px",
              }}
            >
              Reject Payment
            </h2>
            <p style={{ color: "#666", marginBottom: "16px" }}>
              Please provide a reason for rejecting this payment.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Funds not received / Invalid account / Other reason..."
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #B87333",
                borderRadius: "6px",
                fontFamily: "inherit",
                fontSize: "14px",
                marginBottom: "16px",
                boxSizing: "border-box",
              }}
              rows={4}
            />
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#CCCCCC",
                  color: "#333333",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectPayment}
                disabled={rejectingId === selectedOrderId}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor:
                    rejectingId === selectedOrderId ? "#B87333" : "#E74C3C",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  cursor:
                    rejectingId === selectedOrderId ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                }}
              >
                {rejectingId === selectedOrderId
                  ? "Processing..."
                  : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UPIVerification;
