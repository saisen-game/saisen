'use client'
import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error?: Error }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: 40, color: '#f87171', fontFamily: 'monospace',
          background: '#06060f', minHeight: '100vh',
        }}>
          <h2 style={{ marginBottom: 12 }}>Something went wrong</h2>
          <pre style={{ fontSize: 12, opacity: .7 }}>{this.state.error?.message}</pre>
        </div>
      )
    }
    return this.props.children
  }
}
