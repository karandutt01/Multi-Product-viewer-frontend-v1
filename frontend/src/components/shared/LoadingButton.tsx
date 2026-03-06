import React from "react";

interface LoadingButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  className?: string;
  onClick?: () => void
}

const LoadingButton = ({
  isLoading,
  children,
  type = "button",
  className = "",
  onClick
}:LoadingButtonProps) => {

  return (
    <button
      type={type}
      className={className}
      disabled={isLoading}
      onClick={onClick}
    >
      {isLoading ? (
        <>
          <span
            className="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>
          Please wait...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default LoadingButton;