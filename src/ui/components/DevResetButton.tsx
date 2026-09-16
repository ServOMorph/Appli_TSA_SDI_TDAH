export function DevResetButton() {
  if (!import.meta.env.DEV) return null
  if (import.meta.env.VITE_HIDE_DEV_TOOLS === '1') return null

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
