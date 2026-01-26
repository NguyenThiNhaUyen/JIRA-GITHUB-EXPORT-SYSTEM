// Button component - reusable button với variants
export function Button({ children, variant = "default", size = "md", className = "", ...props }) {
  const variants = {
    default: "bg-blue-500 hover:bg-blue-600 text-white",
    outline: "border border-blue-300 bg-white hover:bg-blue-50 text-blue-700",
    ghost: "hover:bg-blue-50 text-blue-700",
    danger: "bg-red-500 hover:bg-red-600 text-white",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={`rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}


