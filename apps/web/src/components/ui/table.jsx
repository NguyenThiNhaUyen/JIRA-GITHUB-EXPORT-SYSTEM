// Table Component - Part of UI Kit
export function Table({ children, className = '', ...props }) {
  return (
<<<<<<< HEAD
    <div className={`overflow-x-auto rounded-lg border border-secondary-200 ${className}`}>
      <table className="min-w-full divide-y divide-secondary-200" {...props}>
=======
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full" {...props}>
>>>>>>> recover-local-code
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className = '', ...props }) {
  return (
<<<<<<< HEAD
    <thead className={`bg-secondary-50 ${className}`} {...props}>
=======
    <thead className={`bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 ${className}`} {...props}>
>>>>>>> recover-local-code
      {children}
    </thead>
  );
}

export function TableBody({ children, className = '', ...props }) {
  return (
<<<<<<< HEAD
    <tbody className={`bg-white divide-y divide-secondary-100 ${className}`} {...props}>
=======
    <tbody className={`bg-white ${className}`} {...props}>
>>>>>>> recover-local-code
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
<<<<<<< HEAD
    <th 
=======
    <th
>>>>>>> recover-local-code
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
