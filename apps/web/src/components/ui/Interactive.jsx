// Tabs Component - Part of UI Kit
import React, { useState, useEffect } from 'react';
import { Button } from "./Button.jsx";

export function Tabs({ children, defaultValue, className = '', ...props }) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <div className={className} {...props}>
      {children.map((child, index) => {
        if (child.type === TabsList) {
          return React.cloneElement(child, { activeTab, setActiveTab });
        }
        if (child.type === TabsContent) {
          return React.cloneElement(child, { activeTab });
        }
        return child;
      })}
    </div>
  );
}

export function TabsList({ children, activeTab, setActiveTab, className = '', ...props }) {
  return (
    <div className={`flex space-x-1 ${className}`} {...props}>
      {children.map((child, index) => {
        if (child.type === TabsTrigger) {
          return React.cloneElement(child, {
            isActive: child.props.value === activeTab,
            onClick: () => setActiveTab(child.props.value)
          });
        }
        return child;
      })}
    </div>
  );
}

export function TabsTrigger({ children, value, isActive, onClick, className = '', ...props }) {
  const baseClasses = 'px-8 py-3 text-[10px] font-black tracking-[0.2em] font-display rounded-2xl transition-all duration-300 active:scale-95';
  const activeClasses = isActive
    ? 'bg-teal-600 text-white shadow-xl shadow-teal-100 -translate-y-0.5'
    : 'text-gray-400 bg-gray-100/50 hover:bg-gray-100 hover:text-gray-600';

  return (
    <button
      className={`${baseClasses} ${activeClasses} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ children, value, activeTab, className = '', ...props }) {
  if (value !== activeTab) return null;

  return (
    <div className={`animate-in fade-in slide-in-from-bottom-2 duration-500 ${className}`} {...props}>
      {children}
    </div>
  );
}

// Modal Component - Part of UI Kit
export function Modal({ isOpen, onClose, title, children, size = 'md', showDefaultFooter = false, className = '', ...props }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className={`relative bg-white rounded-[40px] shadow-premium w-full border border-gray-100 overflow-hidden animate-in zoom-in-95 fade-in duration-300 ${sizes[size]} ${className}`}>
        {title && (
          <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
            <h3 className="text-xl font-black text-gray-800 font-display">{title}</h3>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-200 transition-all">âœ•</button>
          </div>
        )}
        <div className="px-10 py-8">
          {children}
        </div>
        {showDefaultFooter && (
          <div className="px-10 py-8 border-t border-gray-50 bg-gray-50/10 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} className="rounded-2xl h-12 px-8">
              Há»§y
            </Button>
            <Button onClick={onClose} className="rounded-2xl h-12 px-8 bg-black text-white hover:bg-zinc-800 border-0">
              XĂ¡c nháº­n
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Alert/Callout Component - Part of UI Kit
export function Alert({ children, variant = 'default', className = '', ...props }) {
  const variants = {
    default: 'bg-secondary-50 border-secondary-200 text-secondary-800',
    primary: 'bg-primary-50 border-primary-200 text-primary-800',
    success: 'bg-success-50 border-success-200 text-success-800',
    warning: 'bg-warning-50 border-warning-200 text-warning-800',
    error: 'bg-error-50 border-error-200 text-error-800',
  };

  const icons = {
    default: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border ${variants[variant]} ${className}`} {...props}>
      <div className="flex-shrink-0">
        {icons[variant] || icons.default}
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}

