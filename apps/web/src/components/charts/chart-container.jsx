// Chart container wrapper với loading, error, empty states
export function ChartContainer({
  title,
  subtitle,
  isLoading,
  isError,
  isEmpty,
  children,
  className = "",
  emptyMessage = "Không có dữ liệu",
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
            <p>Đã xảy ra lỗi khi tải dữ liệu</p>
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


