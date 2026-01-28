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

// PageHeader Component - Part of UI Kit
export function PageHeader({ title, subtitle, actions, breadcrumbs, className = '', ...props }) {
  return (
    <div className={`mb-8 ${className}`} {...props}>
      {breadcrumbs && (
        <nav className="text-sm text-secondary-500 mb-4">
          {breadcrumbs}
        </nav>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">
            {title}
          </h1>
          {subtitle && (
            <p className="text-secondary-600 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

// StatCard Component - Part of UI Kit
export function StatCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon, 
  className = '', 
  ...props 
}) {
  const changeColors = {
    positive: 'text-success-600',
    negative: 'text-error-600',
    neutral: 'text-secondary-600',
  };

  return (
    <Card className={`${className}`} {...props}>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-secondary-600">{title}</p>
            <p className="text-2xl font-bold text-secondary-900">{value}</p>
            {change && (
              <p className={`text-sm ${changeColors[changeType]}`}>
                {change}
              </p>
            )}
          </div>
          {icon && (
            <div className="h-8 w-8 text-primary-600 opacity-20">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Simple StatCard without icon requirement
export function SimpleStatCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  className = '', 
  ...props 
}) {
  const changeColors = {
    positive: 'text-success-600',
    negative: 'text-error-600',
    neutral: 'text-secondary-600',
  };

  const bgColors = {
    positive: 'bg-success-50',
    negative: 'bg-error-50', 
    neutral: 'bg-secondary-50',
  };

  return (
    <div className={`bg-white rounded-xl border border-secondary-200 shadow-sm p-6 ${className}`} {...props}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-secondary-600">{title}</p>
          <p className="text-2xl font-bold text-secondary-900">{value}</p>
          {change && (
            <p className={`text-sm ${changeColors[changeType]}`}>
              {change}
            </p>
          )}
        </div>
        <div className={`h-12 w-12 rounded-lg ${bgColors[changeType]} flex items-center justify-center`}>
          <div className={`h-6 w-6 rounded ${changeType === 'positive' ? 'bg-success-500' : changeType === 'negative' ? 'bg-error-500' : 'bg-secondary-500'}`}></div>
        </div>
      </div>
    </div>
  );
}
