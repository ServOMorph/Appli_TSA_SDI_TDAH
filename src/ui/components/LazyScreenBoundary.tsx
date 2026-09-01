import { Component, type ReactNode } from 'react'
import { ScreenLoading } from '@/ui/components/ScreenLoading'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

function reloadPage() {
  window.location.reload()
}

/**
 * Rattrape l'échec d'un `import()` dynamique vers un chunk purgé par un déploiement
 * (`registerType: 'autoUpdate'`, service worker qui purge les anciens chunks hashés pendant
 * qu'un onglet reste ouvert). Sans ce filet, le `<Suspense>` resterait bloqué indéfiniment sur
 * son fallback. Deux déclencheurs, l'un ne suffisant pas seul : l'erreur de rendu attrapée par
 * l'error boundary, et l'événement `vite:preloadError` que Vite émet avant qu'elle ne se propage.
 */
export class LazyScreenBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch() {
    reloadPage()
  }

  componentDidMount() {
    window.addEventListener('vite:preloadError', reloadPage)
  }

  componentWillUnmount() {
    window.removeEventListener('vite:preloadError', reloadPage)
  }

  render() {
    if (this.state.hasError) return <ScreenLoading />
    return this.props.children
  }
}
