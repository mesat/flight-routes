import React, { Component } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
          <div className="w-full max-w-md">
            <Alert variant="destructive">
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription>
                <p className="mb-4">
                  The application encountered an unexpected error.
                </p>
                <p className="text-sm text-gray-700 mb-4">
                  {this.state.error?.message || "Unknown error"}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded"
                >
                  Reload Application
                </button>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;