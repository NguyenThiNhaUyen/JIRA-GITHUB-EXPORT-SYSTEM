// ErrorBoundary - Báº¯t lá»—i React vĂ  hiá»ƒn thá»‹ fallback thay vĂ¬ tráº¯ng trang
import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  handleReset() {
    this.setState({ hasError: false, error: null });
    window.location.href = "/login";
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center space-y-4 border border-red-100">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800">ÄĂ£ cĂ³ lá»—i xáº£y ra</h2>
            <p className="text-sm text-gray-500">
              á»¨ng dá»¥ng gáº·p lá»—i khĂ´ng mong Ä‘á»£i. Vui lĂ²ng thá»­ Ä‘Äƒng nháº­p láº¡i.
            </p>
            {this.state.error && (
              <pre className="text-xs text-left bg-red-50 text-red-700 rounded-lg p-3 overflow-auto max-h-32 break-words whitespace-pre-wrap">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => this.handleReset()}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition-colors"
            >
              Quay láº¡i trang Ä‘Äƒng nháº­p
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

