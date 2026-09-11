import { FaEnvelope, FaUser } from "react-icons/fa";
import type { UseFormRegisterReturn } from "react-hook-form";
import "./InputField.css";

interface InputProps {
  label: string;
  type: string;
  placeholder: string;
  registration?: UseFormRegisterReturn;
}

export default function Input({
  label,
  type,
  placeholder,
  registration,
}: InputProps) {
  const icon =
    type === "email" ? (
      <FaEnvelope className="input-icon" />
    ) : (
      <FaUser className="input-icon" />
    );

  return (
    <div className="input-group">
      <label>{label}</label>

      <div className="password-box">
        {icon}

        <input
          type={type}
          placeholder={placeholder}
          {...registration}
        />
      </div>
    </div>
  );
}