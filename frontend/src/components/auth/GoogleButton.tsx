import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from "firebase/auth";
import { toast } from "react-toastify";
import { auth, googleProvider } from "../../firebase/firebase";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import "./GoogleButton.css";

export default function GoogleButton() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const gUser = result.user;

      const payload = {
        name: gUser.displayName || "",
        email: gUser.email || "",
        avatar: gUser.photoURL || "",
      };

      const res = await api.post("/auth/google", payload);

      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        sessionStorage.setItem("token", res.data.token);
      }
      if (res.data?.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        sessionStorage.setItem("user", JSON.stringify(res.data.user));
      }

      toast.success(`Welcome ${res.data.user?.name || "back"}!`);
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Google sign-in error", err);

      if (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request") {
        toast.info("Google sign-in cancelled.");
      } else if (err.code === "auth/unauthorized-domain") {
        toast.error("This domain is not authorized in Firebase Console -> Auth -> Authorized Domains.");
      } else if (err.code === "auth/popup-blocked") {
        toast.error("Popup was blocked by browser. Please allow popups for this site.");
      } else if (!err.response && (err.isAxiosError || err.message?.includes("Network Error"))) {
        toast.error("Cannot connect to server. If Render backend was sleeping, please wait 30 seconds and retry.");
      } else {
        toast.error(err.response?.data?.message || err.message || "Google sign-in failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="google-btn"
      type="button"
      onClick={handleGoogle}
      disabled={loading}
      style={{ opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
    >
      <FcGoogle size={22} />
      <span>{loading ? "Connecting to Google..." : "Continue with Google"}</span>
    </button>
  );
}