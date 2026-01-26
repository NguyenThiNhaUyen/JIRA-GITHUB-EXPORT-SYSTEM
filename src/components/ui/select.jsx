// Select component
export function Select({ children, className = "", ...props }) {
  return (
    <select
      className={`w-full px-4 py-2 bg-white border border-blue-200 rounded-lg text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}


