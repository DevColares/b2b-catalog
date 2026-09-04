import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './responsive.css'
import App from './App.tsx'

// Peça qualquer erro de renderização e o mostra na tela (em vez de tela branca)
class ErrorBoundary extends Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  componentDidCatch(error: Error, info: unknown) {
    console.error('Erro ao renderizar:', error, info)
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'sans-serif' }}>
          <div style={{ maxWidth: 480, textAlign: 'center' }}>
            <p style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Ops, algo deu errado</p>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 16, overflowWrap: 'anywhere' }}>
              {this.state.error.message}
            </p>
            <button onClick={() => location.reload()} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: '#111827', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
              Tentar novamente
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
