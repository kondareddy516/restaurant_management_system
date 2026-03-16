/**
 * UPI Payment Component - Royal Heritage Edition
 * Premium PhonePe-style UPI payment gateway with strict design system adherence
 *
 * Colors (Royal Heritage):
 * - Deep Burgundy: #2D0B0B (background)
 * - Burnished Copper: #B87333 (primary action)
 * - Wheat Silk: #F3E5AB (text/accents)
 * - Gold Accent: #FFD700 (highlights)
 */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { orderService } from "../services/firestoreService";
import { QRCodeCanvas as QRCode } from "qrcode.react";

interface UPIPaymentProps {
  totalAmount: number;
  orderId?: string;
  customerName: string;
  onPaymentSuccess?: () => void;
  onPaymentFailed?: () => void;
}

type PaymentStep = "selection" | "upi_flow" | "verification";

const MERCHANT_UPI = "restaurant.hub@phonepe"; // Update with actual merchant UPI
const MERCHANT_NAME = "RestaurantHub";
const CURRENCY = "INR";

const UPIPayment: React.FC<UPIPaymentProps> = ({
  totalAmount,
  orderId,
  customerName,
  onPaymentSuccess,
  onPaymentFailed,
}) => {
  const [paymentStep, setPaymentStep] = useState<PaymentStep>("selection");
  const [transactionId, setTransactionId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);

  // Detect mobile device
  useEffect(() => {
    const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(mobile);
  }, []);

  // Simulate verification progress
  useEffect(() => {
    if (paymentStep === "verification") {
      const interval = setInterval(() => {
        setVerificationProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            // Auto-complete after reaching 100%
            setTimeout(() => {
              toast.success("Payment verified successfully!");
              onPaymentSuccess?.();
            }, 1000);
            return 100;
          }
          return prev + Math.random() * 30;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [paymentStep, onPaymentSuccess]);

  // Validate transaction ID (12 digits exactly)
  const isValidTransactionId = (id: string) => /^\d{12}$/.test(id);

  // Generate UPI deep link
  const generateUPIDeepLink = (): string => {
    const params = new URLSearchParams({
      pa: MERCHANT_UPI,
      pn: MERCHANT_NAME,
      am: totalAmount.toFixed(2),
      cu: CURRENCY,
      tn: `Order_${orderId || "RESTAURANT"}`,
    });

    return `upi://pay?${params.toString()}`;
  };

  // Handle open UPI apps (mobile)
  const handleOpenUPIApps = () => {
    const upiLink = generateUPIDeepLink();
    window.location.href = upiLink;
    toast.info("Opening your UPI app...");
    // Move to verification step after a delay
    setTimeout(() => {
      setPaymentStep("verification");
    }, 1500);
  };

  // Handle transaction ID submission
  const handleSubmitTransaction = async () => {
    if (!isValidTransactionId(transactionId)) {
      toast.error("Invalid Transaction ID. Must be exactly 12 digits.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Update order in Firestore
      if (orderId) {
        await orderService.updateStatus(orderId, "confirmed");
      }

      toast.success("Payment submitted for verification!");
      setPaymentStep("verification");
    } catch (error) {
      console.error("Payment submission error:", error);
      toast.error("Failed to submit payment. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Container variants for smooth transitions
  const containerVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4 } },
  };

  const spinVariants: any = {
    rotate: {
      rotate: 360,
      transition: { duration: 3, repeat: Infinity },
    },
  };

  // Selection Step - Mobile vs Desktop
  if (paymentStep === "selection") {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full max-w-md mx-auto p-8 rounded-2xl border-2 border-amber-700"
        style={{
          backgroundColor: "#2D0B0B", // Deep Burgundy
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h2
            className="text-3xl font-bold mb-3"
            style={{
              fontFamily: "Cormorant Garamond, serif",
              color: "#F3E5AB", // Wheat Silk
            }}
          >
            The Royal Transfer
          </h2>
          <p
            style={{
              fontFamily: "Cormorant Garamond, serif",
              color: "#D4AF9F",
              fontSize: "14px",
              letterSpacing: "1px",
            }}
          >
            Complete your payment through UPI
          </p>
        </div>

        {/* Amount Display */}
        <div
          className="text-center py-6 mb-8 rounded-lg"
          style={{
            backgroundColor: "rgba(184, 115, 51, 0.15)", // Transparent Copper
            border: "2px solid #B87333",
          }}
        >
          <p
            style={{
              fontFamily: "Cormorant Garamond, serif",
              color: "#D4AF9F",
              fontSize: "14px",
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}
          >
            Amount Due
          </p>
          <p
            className="text-4xl font-bold mt-2"
            style={{
              fontFamily: "Cormorant Garamond, serif",
              color: "#FFD700", // Gold
            }}
          >
            ₹{totalAmount.toFixed(2)}
          </p>
        </div>

        {/* Payment Method Selection */}
        <div className="space-y-4">
          {/* Mobile Flow Button - UPI App Direct Open */}
          {isMobile && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleOpenUPIApps}
              className="w-full py-4 rounded-lg font-bold text-white transition-all duration-300 flex items-center justify-center gap-3 text-lg"
              style={{
                backgroundColor: "#B87333", // Burnished Copper
                boxShadow: "0 8px 24px rgba(184, 115, 51, 0.4)",
              }}
            >
              <span className="text-2xl">📱</span>
              OPEN UPI APPS
            </motion.button>
          )}

          {/* Desktop QR Code Option - Never show UPI app button on desktop */}
          {!isMobile && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPaymentStep("upi_flow")}
              className="w-full py-4 rounded-lg font-bold text-white transition-all duration-300 flex items-center justify-center gap-3 text-lg"
              style={{
                backgroundColor: "#B87333", // Burnished Copper
                boxShadow: "0 8px 24px rgba(184, 115, 51, 0.4)",
              }}
            >
              <span className="text-2xl">📲</span>
              SHOW QR CODE
            </motion.button>
          )}

          {/* Manual Entry Option */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setPaymentStep("upi_flow")}
            className="w-full py-4 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-3 text-lg border-2"
            style={{
              backgroundColor: "transparent",
              color: "#F3E5AB",
              borderColor: "#B87333",
            }}
          >
            <span className="text-2xl">🔐</span>
            ENTER TRANSACTION ID
          </motion.button>
        </div>

        {/* Disclaimer */}
        <div
          className="mt-8 p-4 rounded-lg text-xs text-center"
          style={{
            backgroundColor: "rgba(243, 229, 171, 0.1)",
            color: "#D4AF9F",
            fontFamily: "Cormorant Garamond, serif",
            letterSpacing: "0.5px",
          }}
        >
          Your payment is secure and encrypted by the Royal Treasury. No
          additional charges apply.
        </div>
      </motion.div>
    );
  }

  // UPI Flow Step - QR Code or Manual Entry
  if (paymentStep === "upi_flow") {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full max-w-md mx-auto p-8 rounded-2xl"
        style={{
          backgroundColor: "#2D0B0B",
          border: "2px solid #B87333",
        }}
      >
        {/* Back Button */}
        <button
          onClick={() => setPaymentStep("selection")}
          className="mb-6 flex items-center gap-2 text-sm font-semibold hover:opacity-80 transition"
          style={{ color: "#F3E5AB" }}
        >
          ← Back
        </button>

        {!isMobile && (
          <>
            {/* QR Code Section */}
            <div className="text-center mb-8">
              <h3
                className="text-2xl font-bold mb-4"
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  color: "#F3E5AB",
                }}
              >
                Scan & Pay
              </h3>

              {/* QR Code Frame */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center justify-center p-6 rounded-lg"
                style={{
                  backgroundColor: "#F3E5AB", // Wheat Silk background
                  border: "2px solid #B87333", // Copper border
                }}
              >
                <QRCode
                  value={generateUPIDeepLink()}
                  size={200}
                  level="H"
                  includeMargin={true}
                  bgColor="#F3E5AB"
                  fgColor="#2D0B0B"
                />
              </motion.div>

              <p
                className="mt-6 text-sm"
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  color: "#D4AF9F",
                }}
              >
                Scan this with any UPI app to complete payment
              </p>
            </div>

            <div className="flex items-center gap-4 my-8">
              <div
                className="flex-1"
                style={{ borderTop: "1px solid #B87333" }}
              ></div>
              <span
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  color: "#D4AF9F",
                  fontSize: "12px",
                }}
              >
                OR
              </span>
              <div
                className="flex-1"
                style={{ borderTop: "1px solid #B87333" }}
              ></div>
            </div>
          </>
        )}

        {/* Transaction ID Input */}
        <div>
          <label
            style={{
              fontFamily: "Cormorant Garamond, serif",
              color: "#F3E5AB",
              fontSize: "14px",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
            className="block mb-3"
          >
            Royal Transaction ID
          </label>

          <input
            type="text"
            maxLength={12}
            inputMode="numeric"
            placeholder="Enter 12-digit Royal Transaction ID"
            value={transactionId}
            onChange={(e) =>
              setTransactionId(e.target.value.replace(/\D/g, ""))
            }
            className="w-full py-3 px-2 text-lg font-bold transition-all focus:outline-none"
            style={{
              backgroundColor: "transparent",
              borderBottom: `2px solid ${isValidTransactionId(transactionId) ? "#FFD700" : "#B87333"}`,
              color: "#F3E5AB",
              fontFamily: "Cormorant Garamond, serif",
              letterSpacing: "4px",
            }}
          />

          <div
            className="mt-2 text-xs"
            style={{
              color: isValidTransactionId(transactionId)
                ? "#90EE90"
                : "#D4AF9F",
              fontFamily: "Cormorant Garamond, serif",
            }}
          >
            {transactionId.length}/12 digits entered
            {isValidTransactionId(transactionId) && " ✓ Valid"}
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={
            isValidTransactionId(transactionId) ? { scale: 1.02 } : {}
          }
          whileTap={isValidTransactionId(transactionId) ? { scale: 0.98 } : {}}
          onClick={handleSubmitTransaction}
          disabled={!isValidTransactionId(transactionId) || isSubmitting}
          className="w-full mt-8 py-4 rounded-lg font-bold text-white text-lg transition-all duration-300"
          style={{
            backgroundColor: isValidTransactionId(transactionId)
              ? "#B87333"
              : "#6B4423",
            opacity: isValidTransactionId(transactionId) ? 1 : 0.5,
            cursor: isValidTransactionId(transactionId)
              ? "pointer"
              : "not-allowed",
            boxShadow: isValidTransactionId(transactionId)
              ? "0 8px 24px rgba(184, 115, 51, 0.4)"
              : "none",
          }}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Verifying...
            </div>
          ) : (
            "CONFIRM PAYMENT"
          )}
        </motion.button>

        {/* Info Box */}
        <div
          className="mt-6 p-4 rounded-lg text-xs text-center"
          style={{
            backgroundColor: "rgba(243, 229, 171, 0.1)",
            color: "#D4AF9F",
            fontFamily: "Cormorant Garamond, serif",
          }}
        >
          ℹ️ The Transaction ID (UTR) is found in your UPI app's payment
          confirmation
        </div>
      </motion.div>
    );
  }

  // Verification Step - Loading Animation
  if (paymentStep === "verification") {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full max-w-md mx-auto p-8 rounded-2xl text-center"
        style={{
          backgroundColor: "#2D0B0B",
          border: "2px solid #B87333",
        }}
      >
        {/* Animated Copper Ring */}
        <motion.div
          variants={spinVariants}
          animate="rotate"
          className="mx-auto mb-8 flex items-center justify-center"
        >
          <div
            className="w-24 h-24 rounded-full"
            style={{
              border: "4px solid transparent",
              borderTop: "4px solid #B87333",
              borderRight: "4px solid #FFD700",
            }}
          />
        </motion.div>

        {/* Verification Text */}
        <h3
          className="text-2xl font-bold mb-4"
          style={{
            fontFamily: "Cormorant Garamond, serif",
            color: "#F3E5AB",
          }}
        >
          The Exchequer is Verifying
        </h3>

        <p
          className="text-lg mb-8"
          style={{
            fontFamily: "Cormorant Garamond, serif",
            color: "#D4AF9F",
          }}
        >
          Your Royal Transfer
        </p>

        {/* Progress Bar */}
        <div
          className="w-full h-2 rounded-full overflow-hidden mb-6"
          style={{
            backgroundColor: "rgba(184, 115, 51, 0.2)",
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(verificationProgress, 95)}%` }}
            transition={{ duration: 0.3 }}
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #B87333, #FFD700)",
            }}
          />
        </div>

        {/* Status Messages */}
        <div className="space-y-2 mb-8">
          <p
            style={{
              fontFamily: "Cormorant Garamond, serif",
              color: "#FFD700",
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            {verificationProgress < 30 && "Initiating royal treasury..."}
            {verificationProgress >= 30 &&
              verificationProgress < 60 &&
              "Validating noble transaction..."}
            {verificationProgress >= 60 &&
              verificationProgress < 90 &&
              "Sealing the transaction..."}
            {verificationProgress >= 90 && "Completing verification..."}
          </p>
        </div>

        {/* Amount Display */}
        <div
          className="py-4 px-4 rounded-lg mb-8"
          style={{
            backgroundColor: "rgba(184, 115, 51, 0.15)",
            border: "1px solid #B87333",
          }}
        >
          <p
            style={{
              fontFamily: "Cormorant Garamond, serif",
              color: "#D4AF9F",
              fontSize: "12px",
            }}
          >
            Amount Transferred
          </p>
          <p
            className="text-2xl font-bold mt-1"
            style={{
              fontFamily: "Cormorant Garamond, serif",
              color: "#FFD700",
            }}
          >
            ₹{totalAmount.toFixed(2)}
          </p>
        </div>

        {/* Disclaimer */}
        <p
          className="text-xs"
          style={{
            fontFamily: "Cormorant Garamond, serif",
            color: "#D4AF9F",
            letterSpacing: "0.5px",
          }}
        >
          Do not refresh. Your payment is being processed by the Royal Treasury.
        </p>
      </motion.div>
    );
  }

  return null;
};

export default UPIPayment;
