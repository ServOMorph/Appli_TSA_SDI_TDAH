import { useApp } from '@/app/AppContext'
import type { Screen } from '@/app/AppContext'

const SCREEN_CODES: Record<Screen, string> = {
  welcome: 'E01',
  profile: 'E02',
  energy: 'E03',
  dashboard: 'E10',
  inbox: 'E20',
  'task-create-v2': 'E21v2',
  planning: 'E40',
  'task-detail': 'E22',
  'task-decompose': 'E23',
  'energy-view': 'E30',
  'energy-checkin': 'E31',
  'overload-recovery': 'E90',
  resources: 'E120',
  'manual-tests': 'E121',
  settings: 'E110',
  'settings-profile': 'E111',
  'settings-accessibility': 'E112',
  'settings-privacy': 'E116',
  'settings-export': 'E117',
  'list-detail': 'E61',
  'list-item-detail': 'E62',
  tools: 'E70',
  'folder-detail': 'E72',
  budget: 'E71',
  'budget-category-detail': 'E73',
  'budget-settings': 'E74',
}

export function DevResetButton() {
  const { screen } = useApp()

  if (!import.meta.env.DEV) return null

  const realToday = new Date().toISOString().slice(0, 10)
  const fakeDate = localStorage.getItem('dev_fake_date') ?? ''

  async function handleReset() {
    await window.indexedDB.deleteDatabase('appli-tsa-sdi-tdah')
    window.location.reload()
  }

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    if (val) {
      localStorage.setItem('dev_fake_date', val)
    } else {
      localStorage.removeItem('dev_fake_date')
    }
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
      <span
        style={{
          fontSize: '0.7rem',
          fontWeight: 700,
          color: '#374151',
          background: 'rgba(0,0,0,0.08)',
          borderRadius: '3px',
          padding: '1px 6px',
          fontFamily: 'monospace',
        }}
      >
        {__APP_DEV_VERSION__}
      </span>
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
      <input
        type="date"
        value={fakeDate || realToday}
        min="2026-01-01"
        max="2030-12-31"
        onChange={handleDateChange}
        title="Date simulée (dev)"
        style={{
          fontSize: '0.7rem',
          padding: '1px 4px',
          borderRadius: '3px',
          border: fakeDate ? '1px solid #f59e0b' : '1px solid #d1d5db',
          background: fakeDate ? '#fef3c7' : 'transparent',
          color: '#374151',
          cursor: 'pointer',
        }}
      />
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
    </div>
  )
}
