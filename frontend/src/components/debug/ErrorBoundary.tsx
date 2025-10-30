import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // When an error is caught, we render a fallback UI.
      // But to keep the rest of the UI interactive, we will render children anyway.
      // A small, non-intrusive error message will appear.
      return (
        <>
          <div
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              backgroundColor: '#b71c1c',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              zIndex: 9999,
              fontSize: '14px'
            }}
          >
            A client-side error occurred. See console for details.
          </div>
          {this.props.children}
        </>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
