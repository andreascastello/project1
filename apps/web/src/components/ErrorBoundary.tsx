import React from 'react'

export class ErrorBoundary extends React.Component<React.PropsWithChildren> {
  state: { hasError: boolean; error: unknown } = { hasError: false, error: null }

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error }
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    console.error('Canvas Error:', error, errorInfo)
  }

  render() {
    if ((this.state as any).hasError) {
      return (
        <div className="flex items-center justify-center h-full bg-black/50 text-white">
          <div className="text-center p-8">
            <h2 className="text-2xl mb-4">Erreur de rendu 3D</h2>
            <p className="mb-4">Une erreur s'est produite lors du chargement de la scène 3D.</p>
            <button 
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-white/20 rounded hover:bg-white/30 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}


