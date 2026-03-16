/**
 * Database Update Service - Exchequer & Concierge
 * Handles Payment and Reservation updates with audit trails
 *
 * Features:
 * - Payment verification with status transitions
 * - Reservation status management with date validation
 * - Comprehensive audit trail (editHistory)
 * - Royal branding integration
 */

import {
  doc,
  updateDoc,
  Timestamp,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { Order, Reservation } from "./firestoreService";

/**
 * Audit Trail Entry
 * Records every update with complete context
 */
export interface EditHistoryEntry {
  updatedAt: Timestamp;
  updatedBy: string;
  previousStatus: string;
  newStatus: string;
  notes?: string; // For rejection reasons, etc.
}

/**
 * Payment Update Request
 * Contains transaction details and verification info
 */
export interface PaymentUpdateRequest {
  orderId: string;
  status: "verified" | "rejected";
  transactionId?: string;
  transactionDetails?: {
    upiId?: string;
    timestamp?: string;
    amount?: number;
    refId?: string;
  };
  rejectionReason?: string;
  updatedBy: string; // Admin user ID
}

/**
 * Reservation Update Request
 * Contains status change and validation info
 */
export interface ReservationUpdateRequest {
  reservationId: string;
  newStatus: "pending" | "confirmed" | "cancelled" | "completed" | "no-show";
  updatedBy: string; // Admin or customer user ID
  reason?: string; // For cancellations, etc.
}

/**
 * PAYMENT UPDATE FUNCTION - Exchequer Verification
 *
 * Handles payment verification and rejection with state transitions:
 * - verified: paymentStatus→'paid', status→'preparing'
 * - rejected: paymentStatus→'failed', add rejectionReason
 *
 * @param request Payment update request with all verification details
 * @returns Updated order ID
 * @throws Error if order not found or update fails
 */
export async function updatePaymentStatus(
  request: PaymentUpdateRequest,
): Promise<string> {
  const {
    orderId,
    status,
    transactionId,
    transactionDetails,
    rejectionReason,
    updatedBy,
  } = request;

  try {
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      throw new Error(`Order ${orderId} not found`);
    }

    const currentOrder = orderSnap.data() as Order;
    const previousStatus = currentOrder.paymentStatus || "pending";

    const historyEntry: EditHistoryEntry = {
      updatedAt: Timestamp.now(),
      updatedBy,
      previousStatus,
      newStatus: status === "verified" ? "paid" : "failed",
      notes:
        rejectionReason ||
        (status === "verified" ? "Payment verified" : "Payment rejected"),
    };

    if (status === "verified") {
      // ✓ VERIFIED: Update payment status and move to preparing
      const basePayload = {
        paymentStatus: "paid",
        status: "preparing",
        updatedAt: Timestamp.now(),
        editHistory: arrayUnion(historyEntry),
      };

      // Store transaction details for audit if provided
      if (transactionId) {
        (basePayload as Record<string, unknown>).transactionId = transactionId;
      }
      if (transactionDetails) {
        (basePayload as Record<string, unknown>).transactionDetails =
          transactionDetails;
      }

      await updateDoc(orderRef, basePayload);
    } else if (status === "rejected") {
      // ✗ REJECTED: Mark as failed and store rejection reason
      await updateDoc(orderRef, {
        paymentStatus: "failed",
        rejectionReason: rejectionReason || "Payment rejected by admin",
        updatedAt: Timestamp.now(),
        editHistory: arrayUnion(historyEntry),
      });
    }

    console.log(`✓ Payment status updated for order ${orderId}: ${status}`, {
      transactionId,
      rejectionReason,
    });

    return orderId;
  } catch (error) {
    console.error(
      `✗ Error updating payment status for order ${orderId}:`,
      error,
    );
    throw error;
  }
}

/**
 * RESERVATION UPDATE FUNCTION - The Concierge
 *
 * Handles reservation status updates with validation:
 * - Customers can only cancel if reservation date is in the future
 * - Admins can update any status without date restrictions
 * - All statuses: 'pending', 'confirmed', 'cancelled', 'completed', 'no-show'
 *
 * @param request Reservation update request with status and permissions
 * @param userRole Role of user making the update ('admin' or 'customer')
 * @returns Updated reservation ID
 * @throws Error if validation fails or update fails
 */
export async function updateReservationStatus(
  request: ReservationUpdateRequest,
  userRole: "admin" | "customer" = "customer",
): Promise<string> {
  const { reservationId, newStatus, updatedBy, reason } = request;

  try {
    const reservationRef = doc(db, "reservations", reservationId);
    const reservationSnap = await getDoc(reservationRef);

    if (!reservationSnap.exists()) {
      throw new Error(`Reservation ${reservationId} not found`);
    }

    const currentReservation = reservationSnap.data() as Reservation;
    const previousStatus = currentReservation.status;

    // VALIDATION: Check if customer is trying to cancel in the past
    if (userRole === "customer" && newStatus === "cancelled") {
      const reservationDate = new Date(currentReservation.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (reservationDate < today) {
        throw new Error(
          "Cannot cancel a reservation for a past date. Please contact the restaurant.",
        );
      }
    }

    // VALIDATION: Only admins can mark as no-show
    if (userRole === "customer" && newStatus === "no-show") {
      throw new Error("Only administrators can mark reservations as no-show");
    }

    const historyEntry: EditHistoryEntry = {
      updatedAt: Timestamp.now(),
      updatedBy,
      previousStatus,
      newStatus,
      notes: reason || getStatusChangeReason(previousStatus, newStatus),
    };

    await updateDoc(reservationRef, {
      status: newStatus,
      updatedAt: Timestamp.now(),
      editHistory: arrayUnion(historyEntry),
    });

    console.log(
      `✓ Reservation status updated for ID ${reservationId}: ${previousStatus} → ${newStatus}`,
      { userRole, updatedBy, reason },
    );

    return reservationId;
  } catch (error) {
    console.error(
      `✗ Error updating reservation status for ID ${reservationId}:`,
      error,
    );
    throw error;
  }
}

/**
 * Helper function to generate status change reason
 * Provides audit trail context for automatic status updates
 */
function getStatusChangeReason(
  previousStatus: string,
  newStatus: string,
): string {
  const reasons: Record<string, string> = {
    "pending-confirmed": "Reservation confirmed by restaurant",
    "pending-cancelled": "Reservation cancelled by customer",
    "confirmed-cancelled": "Reservation cancelled by customer",
    "confirmed-completed": "Reservation completed",
    "confirmed-no-show": "Customer did not arrive",
    "pending-no-show": "Customer no-show",
  };

  return reasons[`${previousStatus}-${newStatus}`] || "Status updated";
}

/**
 * Batch update multiple orders' payment status
 * Useful for bulk verification operations
 *
 * @param updates Array of payment update requests
 * @returns Array of updated order IDs
 */
export async function batchUpdatePaymentStatus(
  updates: PaymentUpdateRequest[],
): Promise<string[]> {
  const results: string[] = [];
  const errors: Array<{ orderId: string; error: string }> = [];

  for (const update of updates) {
    try {
      const orderId = await updatePaymentStatus(update);
      results.push(orderId);
    } catch (error) {
      errors.push({
        orderId: update.orderId,
        error: (error as Error).message,
      });
    }
  }

  if (errors.length > 0) {
    console.warn("Some payment updates failed:", errors);
  }

  return results;
}

/**
 * Get edit history for an order
 * Returns complete audit trail
 */
export async function getOrderEditHistory(
  orderId: string,
): Promise<EditHistoryEntry[]> {
  try {
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      throw new Error(`Order ${orderId} not found`);
    }

    const order = orderSnap.data() as Order & {
      editHistory?: EditHistoryEntry[];
    };
    return order.editHistory || [];
  } catch (error) {
    console.error(`Error fetching edit history for order ${orderId}:`, error);
    return [];
  }
}

/**
 * Get edit history for a reservation
 * Returns complete audit trail with all status changes
 */
export async function getReservationEditHistory(
  reservationId: string,
): Promise<EditHistoryEntry[]> {
  try {
    const reservationRef = doc(db, "reservations", reservationId);
    const reservationSnap = await getDoc(reservationRef);

    if (!reservationSnap.exists()) {
      throw new Error(`Reservation ${reservationId} not found`);
    }

    const reservation = reservationSnap.data() as Reservation & {
      editHistory?: EditHistoryEntry[];
    };
    return reservation.editHistory || [];
  } catch (error) {
    console.error(
      `Error fetching edit history for reservation ${reservationId}:`,
      error,
    );
    return [];
  }
}

/**
 * Royal Toast Message Templates
 * Consistent messaging for user feedback
 */
export const RoyalToastMessages = {
  payment: {
    success: "🏛️ Royal Record Updated Successfully",
    successDescription: (transactionId: string) =>
      `Payment verified - Transaction ID: ${transactionId}`,
    error: "⚠️ Exchequer Error: Update Failed",
    errorDescription: (reason?: string) =>
      reason ? `Payment rejected: ${reason}` : "Payment update failed",
  },
  reservation: {
    success: "🏛️ Royal Record Updated Successfully",
    successDescription: (status: string) => `Reservation ${status}`,
    error: "⚠️ Exchequer Error: Update Failed",
    errorDescription: (reason?: string) =>
      reason ? `Cannot update: ${reason}` : "Reservation update failed",
  },
};

/**
 * Color palette for Royal Heritage UI
 */
export const RoyalColors = {
  copper: "#B87333",
  copperLight: "#D4A574",
  copperDark: "#8B5A2B",
  deepBurgundy: "#44142D",
  wheatSilk: "#F5DEB3",
  gold: "#DAA520",
};
