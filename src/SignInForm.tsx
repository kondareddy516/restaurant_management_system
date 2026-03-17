import { useState, useEffect, useRef } from "react";
import { auth } from "./config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
} from "firebase/auth";
import { toast } from "sonner";
import { userService } from "./services/firestoreService";

export default function SignInForm() {
  const [open, setOpen] = useState(false);
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const closeModal = () => {
    setOpen(false);
    setEmail("");
    setPassword("");
    setFlow("signIn");
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      closeModal();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (flow === "signUp") {
        const result = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        // Create user profile in Firestore
        await userService.createOrUpdateUser(
          result.user.uid,
          result.user.email || "",
        );
        toast.success("Account created successfully!");
        closeModal();
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Signed in successfully!");
        closeModal();
      }
    } catch (error: any) {
      let errorMessage = "Authentication failed";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email already in use. Try signing in instead.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak (min 6 characters)";
      } else if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/invalid-credential" ||
        error.code === "auth/invalid-login-credentials"
      ) {
        errorMessage = "Invalid email or password";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Invalid password";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many attempts. Please try again later.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Check your connection and retry.";
      }
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnonymous = async () => {
    try {
      setSubmitting(true);
      const result = await signInAnonymously(auth);
      await userService.createOrUpdateUser(
        result.user.uid,
        "anonymous@guest.local",
      );
      toast.success("Signed in as guest!");
      closeModal();
    } catch (error) {
      toast.error("Failed to sign in anonymously");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Trigger button shown in the header */}
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-lg hover:from-amber-600 hover:to-orange-600 transition shadow"
      >
        Sign In
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <div
            ref={modalRef}
            className="relative w-full max-w-sm mx-4"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={closeModal}
              aria-label="Close sign in"
              className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-amber-900 text-white hover:bg-red-700 transition shadow-lg text-lg leading-none"
            >
              ✕
            </button>

            <form
              className="flex flex-col gap-4 bg-white p-6 rounded-xl shadow-2xl border-2 border-amber-200"
              onSubmit={handleSubmit}
            >
              <h2 className="text-2xl font-bold text-amber-900 mb-2">
                {flow === "signIn" ? "Sign In" : "Create Account"}
              </h2>

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                disabled={submitting}
                className="w-full px-4 py-2 border-2 border-amber-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-300 transition disabled:bg-gray-100 disabled:text-gray-500"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={submitting}
                className="w-full px-4 py-2 border-2 border-amber-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-300 transition disabled:bg-gray-100 disabled:text-gray-500"
              />

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-lg hover:from-amber-700 hover:to-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting
                  ? flow === "signIn"
                    ? "Signing in..."
                    : "Creating account..."
                  : flow === "signIn"
                    ? "Sign In"
                    : "Create Account"}
              </button>

              <div className="text-center text-sm text-amber-700">
                <span>
                  {flow === "signIn"
                    ? "Don't have an account? "
                    : "Already have an account? "}
                </span>
                <button
                  type="button"
                  className="font-semibold hover:underline text-amber-600"
                  onClick={() => {
                    setFlow(flow === "signIn" ? "signUp" : "signIn");
                    setEmail("");
                    setPassword("");
                  }}
                >
                  {flow === "signIn" ? "Sign up" : "Sign in"}
                </button>
              </div>
            </form>

            <div className="flex items-center justify-center my-3 gap-4">
              <hr className="flex-1 border-amber-300" />
              <span className="text-sm text-amber-200">or</span>
              <hr className="flex-1 border-amber-300" />
            </div>

            <button
              onClick={handleAnonymous}
              disabled={submitting}
              className="w-full px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-lg hover:from-amber-600 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Signing in..." : "Continue as Guest"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
