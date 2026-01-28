// Table Component - Part of UI Kit
export function Table({ children, className = '', ...props }) {
  return (
    <div className={`overflow-x-auto rounded-lg border border-secondary-200 ${className}`}>
      <table className="min-w-full divide-y divide-secondary-200" {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className = '', ...props }) {
  return (
    <thead className={`bg-secondary-50 ${className}`} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className = '', ...props }) {
  return (
    <tbody className={`bg-white divide-y divide-secondary-100 ${className}`} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className = '', hover = true, ...props }) {
  const hoverClasses = hover ? 'hover:bg-secondary-50' : '';
  return (
    <tr className={`${hoverClasses} transition-colors ${className}`} {...props}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className = '', ...props }) {
  return (
    <th 
      className={`px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className = '', ...props }) {
  return (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-secondary-900 ${className}`} {...props}>
      {children}
    </td>
  );
}
