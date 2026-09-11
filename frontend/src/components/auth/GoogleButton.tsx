import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase/firebase";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import "./GoogleButton.css";

export default function GoogleButton() {
  const navigate = useNavigate();

  const handleGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const gUser = result.user;

      const payload = {
        name: gUser.displayName,
        email: gUser.email,
        avatar: gUser.photoURL,
      };

      const res = await api.post("/auth/google", payload);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/dashboard");
    } catch (err: any) {
      console.error("Google sign-in error", err);
      alert(err.message || "Google sign-in failed");
    }
  };

  return (
    <button className="google-btn" type="button" onClick={handleGoogle}>
      <FcGoogle size={22} />
      Continue with Google
    </button>
  );
}