// Input component
export function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all ${className}`}
      {...props}
    />
  );
}


