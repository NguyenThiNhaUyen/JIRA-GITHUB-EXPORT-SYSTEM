import React from "react";

export function StatusBadge({ status, label, variant = "default", icon: Icon }) {
  const variants = {
    default: "bg-gray-100 text-gray-600 border-gray-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    danger: "bg-red-50 text-red-700 border-red-100",
    info: "bg-sky-50 text-sky-700 border-sky-100",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${variants[variant]}`}>
      {Icon && <Icon size={12} />}
      {label || status}
    </span>
  );
}

export function StatusPill({ ok, icon: Icon, label }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${ok ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-gray-100 text-gray-500 border border-gray-200"}`}>
      {Icon && <Icon size={10} />}
      {label}
      {ok && <span className="text-[8px] ml-0.5">✓</span>}
    </span>
  );
}






