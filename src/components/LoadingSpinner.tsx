
import React from "react";

const LoadingSpinner: React.FC<{ size?: "small" | "medium" | "large", message?: string }> = ({ 
  size = "medium", 
  message = "Loading..." 
}) => {
  const sizeClass = {
    small: "w-5 h-5",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`loader ${sizeClass[size]}`}></div>
      {message && <p className="mt-2 text-sm text-muted-foreground">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
