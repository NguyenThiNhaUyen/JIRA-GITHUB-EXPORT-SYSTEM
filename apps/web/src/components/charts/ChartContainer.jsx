// Chart container wrapper vá»›i loading, error, empty states
export function ChartContainer({
  title,
  subtitle,
  isLoading,
  isError,
  isEmpty,
  children,
  className = "",
  emptyMessage = "KhĂ´ng cĂ³ dá»¯ liá»‡u",
}) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-blue-100 ${className}`}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-blue-100">
          {title && <h3 className="text-lg font-semibold text-blue-900">{title}</h3>}
          {subtitle && <p className="text-sm text-blue-600 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="p-6">
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        )}
        {isError && (
          <div className="flex items-center justify-center h-64 text-red-600">
            <p>ÄĂ£ xáº£y ra lá»—i khi táº£i dá»¯ liá»‡u</p>
          </div>
        )}
        {isEmpty && !isLoading && !isError && (
          <div className="flex items-center justify-center h-64 text-blue-500">
            <p>{emptyMessage}</p>
          </div>
        )}
        {!isLoading && !isError && !isEmpty && children}
      </div>
    </div>
  );
}
