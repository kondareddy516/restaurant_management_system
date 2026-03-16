import { auth } from "./config/firebase";
import { signOut } from "firebase/auth";
import { toast } from "sonner";

export default function SignOutButton() {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success("Signed out successfully!");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-lg hover:from-red-700 hover:to-orange-700 transition border-2 border-red-700"
    >
      Sign Out
    </button>
  );
}
