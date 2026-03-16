/**
 * UPI Payment Integration Service
 * Handles UPI payment processing and verification
 *
 * Note: For production, integrate with actual payment gateway like:
 * - Razorpay UPI
 * - Cashfree
 * - PhonePe Business
 */

import axios from "axios";

export interface UPIPaymentRequest {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  merchantUPI: string; // e.g., "yourmerchant@upi"
  description?: string;
}

export interface UPIPaymentResponse {
  success: boolean;
  transactionId?: string;
  message: string;
  paymentUrl?: string;
}

export const upiPaymentService = {
  /**
   * Initiate UPI payment
   * This is a demo implementation - integrate with actual payment gateway
   */
  async initiatePayment(
    request: UPIPaymentRequest,
  ): Promise<UPIPaymentResponse> {
    try {
      // For demo purposes, we'll simulate payment initiation
      // In production, integrate with Razorpay, Cashfree, PhonePe, etc.

      console.log("Initiating UPI payment:", request);

      // Example: Razorpay integration (uncomment and configure for production)
      /*
      const response = await axios.post(
        "https://api.razorpay.com/v1/payments",
        {
          amount: request.amount * 100, // Convert to paise
          currency: "INR",
          receipt: request.orderId,
          customer_notify: 1,
          email: request.customerEmail,
          contact: request.customerPhone,
          description: request.description || `Order ${request.orderId}`,
        },
        {
          auth: {
            username: import.meta.env.VITE_RAZORPAY_KEY_ID!,
            password: import.meta.env.VITE_RAZORPAY_KEY_SECRET!,
          },
        }
      );
      */

      // Demo response
      return {
        success: true,
        transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: "UPI payment initiated successfully",
        paymentUrl: `upi://pay?pa=${request.merchantUPI}&pn=Restaurant&am=${request.amount}&tr=${request.orderId}`,
      };
    } catch (error) {
      console.error("UPI payment initiation error:", error);
      return {
        success: false,
        message: "Failed to initiate UPI payment",
      };
    }
  },

  /**
   * Verify UPI payment
   * Call this after payment is completed by user
   */
  async verifyPayment(transactionId: string): Promise<UPIPaymentResponse> {
    try {
      console.log("Verifying UPI payment:", transactionId);

      // Example: Razorpay verification (uncomment and configure for production)
      /*
      const response = await axios.get(
        `https://api.razorpay.com/v1/payments/${transactionId}`,
        {
          auth: {
            username: import.meta.env.VITE_RAZORPAY_KEY_ID!,
            password: import.meta.env.VITE_RAZORPAY_KEY_SECRET!,
          },
        }
      );
      
      if (response.data.status === "captured") {
        return {
          success: true,
          message: "Payment verified successfully",
        };
      }
      */

      // Demo verification
      return {
        success: true,
        message: "Payment verified successfully",
      };
    } catch (error) {
      console.error("Payment verification error:", error);
      return {
        success: false,
        message: "Failed to verify payment",
      };
    }
  },

  /**
   * Generate UPI deep link
   * For mobile apps to handle UPI payment directly
   */
  generateUPIDeepLink(
    merchantUPI: string,
    amount: number,
    orderId: string,
    customerName: string,
  ): string {
    const params = new URLSearchParams({
      pa: merchantUPI,
      pn: customerName || "Restaurant",
      am: amount.toString(),
      tr: orderId,
      tn: `Order ${orderId}`,
    });

    return `upi://pay?${params.toString()}`;
  },

  /**
   * Format amount in INR with currency symbol
   */
  formatAmount(amount: number): string {
    return `₹${amount.toFixed(2)}`;
  },

  /**
   * Parse UPI ID (validate format)
   */
  isValidUPIID(upiId: string): boolean {
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/;
    return upiRegex.test(upiId);
  },
};
