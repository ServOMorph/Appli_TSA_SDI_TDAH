import '@testing-library/jest-dom'
import 'fake-indexeddb/auto'

if (typeof window !== 'undefined' && typeof window.PointerEvent === 'undefined') {
  class PointerEventPolyfill extends MouseEvent {
    pointerId: number
    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params)
      this.pointerId = params.pointerId ?? 0
    }
  }
  window.PointerEvent = PointerEventPolyfill as unknown as typeof PointerEvent
}
