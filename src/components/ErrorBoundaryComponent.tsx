/**
 * Error Boundary Component
 * Catches and displays errors gracefully with Royal Heritage styling
 * Specifically designed for Firestore index creation errors
 */

import React, { ReactNode, ReactElement } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactElement;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundaryComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "400px",
              padding: "32px",
              backgroundColor: "#2D0B0B", // Heritage Crimson
              borderRadius: "12px",
              border: "1px solid #B87333", // Burnished Copper
            }}
          >
            <div style={{ textAlign: "center", maxWidth: "500px" }}>
              <h2
                style={{
                  color: "#F3E5AB", // Wheat Silk
                  marginBottom: "16px",
                  fontSize: "20px",
                  fontFamily: "Cormorant Garamond, serif",
                }}
              >
                ⚠️ Something Went Wrong
              </h2>
              <p
                style={{
                  color: "#F3E5AB", // Wheat Silk
                  marginBottom: "12px",
                  fontSize: "14px",
                  lineHeight: "1.6",
                }}
              >
                We're sorry, but something unexpected happened. This might be
                temporary.
              </p>

              {/* Firestore Index Error Handling */}
              {this.state.error?.message?.includes("index") && (
                <div
                  style={{
                    backgroundColor: "rgba(184, 115, 51, 0.2)", // Burnished Copper with transparency
                    padding: "12px",
                    borderRadius: "8px",
                    marginBottom: "16px",
                    border: "1px solid #B87333",
                  }}
                >
                  <p
                    style={{
                      color: "#FFD700", // Gold
                      fontSize: "13px",
                      margin: "0",
                      fontWeight: "bold",
                    }}
                  >
                    📊 Firestore Index Building
                  </p>
                  <p
                    style={{
                      color: "#F3E5AB",
                      fontSize: "12px",
                      margin: "4px 0 0 0",
                    }}
                  >
                    Firebase is building necessary indexes. This typically takes
                    2-5 minutes. Please refresh the page in a moment.
                  </p>
                </div>
              )}

              <p
                style={{
                  color: "#B87333", // Burnished Copper
                  fontSize: "12px",
                  fontStyle: "italic",
                  margin: "0",
                }}
              >
                Error: {this.state.error?.message || "Unknown error"}
              </p>

              <button
                onClick={() => window.location.reload()}
                style={{
                  marginTop: "20px",
                  padding: "10px 24px",
                  backgroundColor: "#B87333", // Burnished Copper
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold",
                  transition: "background-color 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor =
                    "#A0632D";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor =
                    "#B87333";
                }}
              >
                Refresh Page
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundaryComponent;
