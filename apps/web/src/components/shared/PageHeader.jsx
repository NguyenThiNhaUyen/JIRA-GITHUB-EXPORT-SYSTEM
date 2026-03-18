import React from "react";
import { ChevronRight } from "lucide-react";

export function PageHeader({ 
  title, 
  subtitle, 
  breadcrumb = [], 
  actions = [] 
}) {
  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* Breadcrumb */}
      {breadcrumb.length > 0 && (
        <nav className="flex items-center gap-2 text-xs font-medium text-gray-400">
          {breadcrumb.map((item, idx) => (
            <React.Fragment key={idx}>
              <span className={idx === breadcrumb.length - 1 ? "text-gray-600 font-semibold" : "text-teal-600/70 hover:text-teal-600 transition-colors cursor-pointer"}>
                {item}
              </span>
              {idx < breadcrumb.length - 1 && <ChevronRight size={12} strokeWidth={2} className="text-gray-300" />}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Title and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1.5">
          <h2 className="text-3xl font-bold text-gray-800 leading-tight">
            {title.split(' ').map((word, i) => i === title.split(' ').length - 1 ? <span key={i} className="text-teal-600">{word}</span> : word + ' ')}
          </h2>
          {subtitle && (
            <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {actions.length > 0 && (
          <div className="flex items-center gap-3">
            {actions.map((action, idx) => (
              <React.Fragment key={idx}>{action}</React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}







