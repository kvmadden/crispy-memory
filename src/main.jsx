import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error: error };
  }
  componentDidCatch(error, info) {
    console.error('React Error:', error, info);
  }
  render() {
    if (this.state.error) {
      return React.createElement('div', {
        style: { padding: 40, fontFamily: 'monospace', color: '#ff6b6b', background: '#1a1a2e', minHeight: '100vh' }
      },
        React.createElement('h2', null, 'Runtime Error'),
        React.createElement('pre', { style: { whiteSpace: 'pre-wrap', fontSize: 14 } }, String(this.state.error)),
        React.createElement('pre', { style: { whiteSpace: 'pre-wrap', fontSize: 12, color: '#888', marginTop: 16 } }, this.state.error && this.state.error.stack)
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(ErrorBoundary, null,
    React.createElement(React.StrictMode, null,
      React.createElement(App)
    )
  )
)
