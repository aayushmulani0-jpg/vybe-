import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service here (like Sentry)
    console.error("Uncaught error in React component tree:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900 px-4">
          <div className="max-w-md w-full p-8 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl text-center border border-gray-100 dark:border-zinc-700">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Oops! Something went wrong.</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              An unexpected error has occurred. We have been notified and are working to fix the issue.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              Reload Page
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 p-4 bg-gray-100 dark:bg-black rounded-lg text-left overflow-auto text-xs text-red-500 font-mono">
                <p className="font-bold mb-2">{this.state.error.toString()}</p>
                <p className="whitespace-pre-wrap">{this.state.errorInfo?.componentStack}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
