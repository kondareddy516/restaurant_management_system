import { useState } from "react";
import { auth } from "./config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
} from "firebase/auth";
import { toast } from "sonner";
import { userService } from "./services/firestoreService";

export default function SignInForm() {
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
        setEmail("");
        setPassword("");
        setFlow("signIn");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Signed in successfully!");
        setEmail("");
        setPassword("");
      }
    } catch (error: any) {
      let errorMessage = "Authentication failed";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email already in use. Try signing in instead.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak (min 6 characters)";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "User not found. Did you mean to sign up?";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Invalid password";
      }
      toast.error(errorMessage);
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
    } catch (error) {
      toast.error("Failed to sign in anonymously");
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <form
        className="flex flex-col gap-4 bg-white p-6 rounded-lg shadow-lg border-2 border-amber-200"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold text-amber-900 mb-4">
          {flow === "signIn" ? "Sign In" : "Create Account"}
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={submitting}
          className="w-full px-4 py-2 border-2 border-amber-300 rounded-lg focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-300 transition disabled:bg-gray-100"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={submitting}
          className="w-full px-4 py-2 border-2 border-amber-300 rounded-lg focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-300 transition disabled:bg-gray-100"
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

      <div className="flex items-center justify-center my-4 gap-4">
        <hr className="flex-1 border-amber-300" />
        <span className="text-sm text-amber-700">or</span>
        <hr className="flex-1 border-amber-300" />
      </div>

      <button
        onClick={handleAnonymous}
        disabled={submitting}
        className="w-full max-w-sm px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-lg hover:from-amber-600 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Signing in..." : "Continue as Guest"}
      </button>
    </div>
  );
}
