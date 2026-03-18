import React from "react";

export function SelectField({ label, children, ...props }) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-[10px] font-black  text-gray-400">
          {label}
        </label>
      )}
      <select
        className="w-full h-11 px-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm text-gray-700 outline-none focus:bg-white focus:border-teal-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

export function InputField({ label, icon: Icon, ...props }) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-[10px] font-black  text-gray-400">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
        )}
        <input
          className={`w-full h-11 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm outline-none focus:bg-white focus:border-teal-500 transition-all font-medium ${Icon ? 'pl-11' : 'px-4'}`}
          {...props}
        />
      </div>
    </div>
  );
}






