// EmptyState Component - Part of UI Kit
export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  className = '', 
  ...props 
}) {
  return (
    <div className={`text-center py-12 ${className}`} {...props}>
      {icon && (
        <div className="mx-auto h-12 w-12 text-secondary-400 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-secondary-900 mb-2">
        {title}
      </h3>
      <p className="text-secondary-500 mb-6 max-w-sm mx-auto">
        {description}
      </p>
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  );
}
