import React, { type ButtonHTMLAttributes, type ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "alternative";
}

const UiButton: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  className = "",
  ...props
}) => {
  const baseClasses =
    "flex w-full justify-center rounded-md px-3 py-1.5 text-white shadow-xs transition-colors hover:cursor-pointer";

  let variantClasses = "";
  switch (variant) {
    case "primary":
      variantClasses = "bg-indigo-600 hover:bg-indigo-700";
      break;
    case "secondary":
      variantClasses = "bg-gray-400 hover:bg-gray-300 text-gray-900";
      break;
    case "danger":
      variantClasses = "bg-red-600 hover:bg-red-700";
      break;
    case "alternative":
      variantClasses = "bg-green-600 hover:bg-green-700";
      break;
    default:
      variantClasses = "";
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default UiButton;
