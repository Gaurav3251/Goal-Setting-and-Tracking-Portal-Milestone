import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return <div className="rounded border bg-red-50 p-6 text-red-700">Something went wrong. Please refresh this page.</div>;
    return this.props.children;
  }
}
