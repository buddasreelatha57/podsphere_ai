import { Link, useNavigate } from "react-router-dom";
import { FiUserPlus } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import AuthLayout from "../../components/auth/AuthLayout";
import Input from "../../components/auth/Input";
import PasswordInput from "../../components/auth/PasswordInput";
import GoogleButton from "../../components/auth/GoogleButton";

import { registerUser } from "../../services/authService";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

export default function Register() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    try {
      const response = await registerUser(data);

      toast.success(response.data.message);

      navigate("/login");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Registration Failed"
      );
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Start your AI learning journey today"
    >
      <form onSubmit={handleSubmit(onSubmit)}>

        <Input
          label="Full Name"
          type="text"
          placeholder="Enter your full name"
          registration={register("name", {
            required: "Full name is required",
            minLength: {
              value: 3,
              message: "Name must be at least 3 characters",
            },
          })}
        />

        {errors.name && (
          <p className="input-error">
            {errors.name.message}
          </p>
        )}

        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          registration={register("email", {
            required: "Email is required",
            pattern: {
              value: /^\S+@\S+\.\S+$/,
              message: "Enter a valid email address",
            },
          })}
        />

        {errors.email && (
          <p className="input-error">
            {errors.email.message}
          </p>
        )}

        <PasswordInput
          label="Password"
          placeholder="Create a password"
          registration={register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          })}
        />

        {errors.password && (
          <p className="input-error">
            {errors.password.message}
          </p>
        )}

        <button
          type="submit"
          className="auth-btn"
          disabled={isSubmitting}
        >
          <FiUserPlus />

          <span>&nbsp;
            {isSubmitting
              ? "Creating Account..."
              : "Create Account"}
          </span>
        </button>
      </form>

      <div className="divider">
        <span> or continue with</span>
      </div>

      <GoogleButton />

      <p className="auth-switch">
        Already have an account?
        <Link to="/login" className="auth-link">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}