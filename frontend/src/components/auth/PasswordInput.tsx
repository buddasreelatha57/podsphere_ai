import { useState } from "react";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import type { UseFormRegisterReturn } from "react-hook-form";
import "./InputField.css";

interface PasswordInputProps {
  label: string;
  placeholder: string;
  registration?: UseFormRegisterReturn;
}

export default function PasswordInput({
  label,
  placeholder,
  registration,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="input-group">
      <label>{label}</label>

      <div className="password-box">
        <FaLock className="input-icon" />

        <input
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          {...registration}
        />

        <button
          type="button"
          className="toggle-password"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
    </div>
  );
}