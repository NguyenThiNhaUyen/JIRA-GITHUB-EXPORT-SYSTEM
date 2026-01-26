// Skeleton loader component
export function Skeleton({ className = "", ...props }) {
  return (
    <div
      className={`animate-pulse bg-blue-100 rounded ${className}`}
      {...props}
    />
  );
}


