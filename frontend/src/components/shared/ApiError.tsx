import React from "react";

interface ApiErrorProps {
  message?: string;
}

const ApiError = ({ message }:ApiErrorProps) => {
  if (!message) return null;

  return (
    <div className="alert alert-danger mt-3" role="alert">
      {message}
    </div>
  );
};

export default ApiError;