import React from "react";

export function StatsCard({ 
  label, 
  value, 
  icon: Icon, 
  variant = "default", // default, success, warning, danger, info
  trend,
  description,
  loading = false
}) {
  const variants = {
    default: "bg-white border-gray-100 text-gray-700",
    success: "bg-white border-emerald-100/50 text-gray-700",
    warning: "bg-white border-amber-100/50 text-gray-700",
    danger: "bg-white border-red-100/50 text-gray-700",
    info: "bg-white border-sky-100/50 text-gray-700",
    indigo: "bg-white border-indigo-100/50 text-gray-700",
  };

  const iconVariants = {
    default: "bg-gray-50 text-gray-500",
    success: "bg-emerald-50 text-emerald-600",
    warning: "bg-amber-50 text-amber-600",
    danger: "bg-red-50 text-red-600",
    info: "bg-sky-50 text-sky-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };

  if (loading) {
    return (
      <div className="h-24 rounded-[32px] border border-gray-100 bg-gray-50 animate-pulse" />
    );
  }

  return (
    <div className={`group rounded-[32px] border px-6 py-6 transition-all duration-500 hover:shadow-premium hover:-translate-y-1 ${variants[variant]}`}>
      <div className="flex flex-col h-full justify-between gap-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">
            {label}
          </span>
          <div className={`p-2.5 rounded-2xl transition-transform duration-300 group-hover:scale-110 ${iconVariants[variant]}`}>
            {Icon && <Icon size={18} strokeWidth={2.5} />}
          </div>
        </div>
        
        <div className="flex items-end justify-between">
          <div className="text-4xl font-black tracking-tight text-gray-800">{value}</div>
          {trend && (
            <div className={`flex items-center px-2 py-1 rounded-xl text-[10px] font-black ${trend > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
              {trend > 0 ? "â†‘" : "â†“"} {Math.abs(trend)}%
            </div>
          )}
        </div>
        
        {description && (
          <p className="text-[10px] font-black text-gray-300 mt-1 uppercase tracking-wider">{description}</p>
        )}
      </div>
    </div>
  );
}

