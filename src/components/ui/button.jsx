// Button Component - Part of UI Kit
import { theme } from '../../lib/uiTheme.js';

const buttonVariants = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-2 focus:ring-primary-500',
  secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-2 focus:ring-secondary-500',
  ghost: 'bg-transparent text-primary-600 hover:bg-primary-50 focus:ring-2 focus:ring-primary-500',
  outline: 'border border-primary-300 text-primary-600 hover:bg-primary-50 focus:ring-2 focus:ring-primary-500',
  danger: 'bg-error-600 text-white hover:bg-error-700 focus:ring-2 focus:ring-error-500',
  success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-2 focus:ring-success-500',
  warning: 'bg-warning-600 text-white hover:bg-warning-700 focus:ring-2 focus:ring-warning-500',
  default: 'bg-blue-500 hover:bg-blue-600 text-white',
};

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  xl: 'px-8 py-4 text-xl',
};

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  className = '', 
  ...props 
}) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClasses = buttonVariants[variant] || buttonVariants.primary;
  const sizeClasses = buttonSizes[size] || buttonSizes.md;
  
  const classes = `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`;
  
  return (
    <button 
      className={classes} 
      disabled={disabled} 
      {...props}
    >
      {children}
    </button>
  );
}


