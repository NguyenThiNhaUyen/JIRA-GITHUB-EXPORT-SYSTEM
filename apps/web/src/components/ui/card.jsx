// Card Component - Part of UI Kit
export function Card({ children, className = '', hover = false, ...props }) {
  const baseClasses = 'bg-white rounded-xl border border-secondary-200 shadow-sm';
  const hoverClasses = hover ? 'hover:shadow-md transition-shadow duration-200' : '';
<<<<<<< HEAD
  
  return (
    <div 
=======

  return (
    <div
>>>>>>> recover-local-code
      className={`${baseClasses} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`p-6 pb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3 className={`text-lg font-semibold text-secondary-900 ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
<<<<<<< HEAD
    <div className={`p-6 pt-0 ${className}`} {...props}>
=======
    <div className={`p-6 pt-6 ${className}`} {...props}>
>>>>>>> recover-local-code
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`p-6 pt-4 border-t border-secondary-100 ${className}`} {...props}>
      {children}
    </div>
  );
}


