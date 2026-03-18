import React from "react";

export function StatsCard({ 
  label, 
  value, 
  icon: Icon, 
  variant = "default", // default, success, warning, danger, info
  trend,
  loading = false
}) {
  const variants = {
    default: "bg-white border-gray-200 text-gray-700",
    success: "bg-emerald-50 border-emerald-100 text-emerald-700",
    warning: "bg-amber-50 border-amber-100 text-amber-700",
    danger: "bg-red-50 border-red-100 text-red-700",
    info: "bg-sky-50 border-sky-100 text-sky-700",
    indigo: "bg-indigo-50 border-indigo-100 text-indigo-700",
  };

  const iconVariants = {
    default: "bg-gray-100 text-gray-500",
    success: "bg-emerald-100 text-emerald-600",
    warning: "bg-amber-100 text-amber-600",
    danger: "bg-red-100 text-red-600",
    info: "bg-sky-100 text-sky-600",
    indigo: "bg-indigo-100 text-indigo-600",
  };

  if (loading) {
    return (
      <div className="h-24 rounded-2xl border border-gray-100 bg-gray-50 animate-pulse" />
    );
  }

  return (
    <div className={`group rounded-[32px] border px-6 py-6 transition-all duration-500 hover:shadow-premium hover:-translate-y-2 last:hover:rotate-1 first:hover:-rotate-1 ${variants[variant]}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 font-display">
          {label}
        </span>
        <div className={`p-2.5 rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${iconVariants[variant]}`}>
          {Icon && <Icon size={18} strokeWidth={2.5} />}
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-4xl font-black tracking-tighter font-display">{value}</div>
        {trend && (
          <div className={`flex items-center px-1.5 py-0.5 rounded-lg text-[10px] font-black ${trend > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
            {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );
}
