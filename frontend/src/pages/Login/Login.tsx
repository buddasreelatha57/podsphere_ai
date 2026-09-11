import { Link, useNavigate } from "react-router-dom";
import { FiLogIn } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import AuthLayout from "../../components/auth/AuthLayout";
import Input from "../../components/auth/Input";
import PasswordInput from "../../components/auth/PasswordInput";
import GoogleButton from "../../components/auth/GoogleButton";

import { loginUser } from "../../services/authService";

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await loginUser(data);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      toast.success("Welcome back!");

      navigate("/dashboard");

    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Login Failed"
      );
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to continue to PodSphere AI"
    >
      <form onSubmit={handleSubmit(onSubmit)}>

        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          registration={register("email", {
            required: "Email is required",
          })}
        />

        {errors.email && (
          <p className="input-error">{errors.email.message}</p>
        )}

        <PasswordInput
          label="Password"
          placeholder="Enter your password"
          registration={register("password", {
            required: "Password is required",
          })}
        />

        {errors.password && (
          <p className="input-error">{errors.password.message}</p>
        )}

        <div className="login-options">
          <label className="remember-me">
            <input type="checkbox" />
            Remember Me
          </label>

          <Link to="/forgot-password" className="forgot-link">
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          className="auth-btn"
          disabled={isSubmitting}
        >
          <FiLogIn />
          <span>&nbsp;
            {isSubmitting ? "Signing In..." : "Login"}
          </span>
        </button>

      </form>

      <div className="divider">
        <span>or continue with</span>
      </div>

      <GoogleButton />

      <p className="auth-switch">
        Don't have an account?
        <Link to="/register" className="auth-link">
          Create one
        </Link>
      </p>

    </AuthLayout>
  );
}