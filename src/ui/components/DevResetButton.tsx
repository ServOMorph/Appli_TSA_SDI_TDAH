import { useApp } from '@/app/AppContext'
import type { Screen } from '@/app/AppContext'

const SCREEN_CODES: Record<Screen, string> = {
  'welcome':        'E01',
  'profile':        'E02',
  'energy':         'E03',
  'first-task':     'E04',
  'dashboard':      'E10',
  'inbox':          'E20',
  'task-create':    'E21',
  'task-detail':    'E22',
  'task-decompose': 'E23',
  'today':          'E24',
  'later':          'E25',
}

export function DevResetButton() {
  if (!import.meta.env.DEV) return null

  const { screen } = useApp()

  async function handleReset() {
    await window.indexedDB.deleteDatabase('appli-tsa-sdi-tdah')
    window.location.reload()
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '8px',
        right: '8px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '4px',
      }}
    >
      <button
        onClick={handleReset}
        style={{
          padding: '4px 10px',
          fontSize: '0.75rem',
          background: '#dc2626',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          opacity: 0.8,
        }}
      >
        Reset DB
      </button>
      <span
        style={{
          fontSize: '0.7rem',
          color: '#6b7280',
          background: 'rgba(0,0,0,0.05)',
          borderRadius: '3px',
          padding: '1px 6px',
          fontFamily: 'monospace',
        }}
      >
        {SCREEN_CODES[screen]}
      </span>
    </div>
  )
}
