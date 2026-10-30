import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught application error:", error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FFF8F3] flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[rgba(216,170,185,0.3)] shadow-lg text-center space-y-4">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <h1 className="text-xl font-bold text-[#2B2B2B]" style={{ fontFamily: "'Playfair Display', serif" }}>
              Something went wrong
            </h1>
            <p className="text-xs text-[#8A7A72] leading-relaxed" style={{ fontFamily: "'Poppins', sans-serif" }}>
              An unexpected error occurred while loading this view. You can reload the page or return to the storefront.
            </p>
            <button
              onClick={this.handleReset}
              className="w-full bg-[#1A1A1A] text-white py-3 rounded-full font-medium text-xs hover:bg-[#D1748C] transition-all flex items-center justify-center gap-2"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <RotateCcw size={14} /> Refresh Store
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
