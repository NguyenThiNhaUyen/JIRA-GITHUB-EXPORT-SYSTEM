import React from "react";
import { ChevronRight } from "lucide-react";

export function PageHeader({ 
  title, 
  subtitle, 
  breadcrumb = [], 
  actions = [] 
}) {
  return (
    <div className="flex flex-col gap-8 mb-12">
      {/* Breadcrumb */}
      {breadcrumb.length > 0 && (
        <nav className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
          {breadcrumb.map((item, idx) => (
            <React.Fragment key={idx}>
              <span className={idx === breadcrumb.length - 1 ? "text-gray-900" : "text-teal-600/70 hover:text-teal-600 transition-colors cursor-pointer"}>
                {item}
              </span>
              {idx < breadcrumb.length - 1 && <ChevronRight size={10} strokeWidth={3} className="text-gray-300" />}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Title and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-8">
        <div className="space-y-3">
          <h2 className="text-5xl font-black tracking-tight text-gray-900 leading-none font-display">
            {title.split(' ').map((word, i) => i === title.split(' ').length - 1 ? <span key={i} className="text-teal-600">{word}</span> : word + ' ')}
          </h2>
          {subtitle && (
            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>

        {actions.length > 0 && (
          <div className="flex items-center gap-4">
            {actions.map((action, idx) => (
              <React.Fragment key={idx}>{action}</React.Fragment>
            ))}
          </div>
        )}
      </div>
      <div className="h-px w-full bg-gradient-to-r from-gray-100 via-gray-100 to-transparent" />
    </div>
  );
}
