export function Card({ children, className = '', hover = false, ...props }) {
  const baseClasses = 'bg-white rounded-[32px] border border-gray-100 shadow-sm transition-all duration-500 overflow-hidden';
  const hoverClasses = hover ? 'hover:shadow-premium hover:-translate-y-1' : '';

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`px-8 py-6 border-b border-gray-50 bg-gray-50/10 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3 className={`text-base font-black text-gray-800 uppercase tracking-[0.1em] font-display ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`p-8 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`px-8 py-6 border-t border-gray-50 bg-gray-50/5 ${className}`} {...props}>
      {children}
    </div>
  );
}


