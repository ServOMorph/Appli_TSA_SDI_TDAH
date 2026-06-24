export function DevResetButton() {
  if (!import.meta.env.DEV) return null

  async function handleReset() {
    await window.indexedDB.deleteDatabase('appli-tsa-sdi-tdah')
    window.location.reload()
  }

  return (
    <button
      onClick={handleReset}
      style={{
        position: 'fixed',
        top: '8px',
        right: '8px',
        zIndex: 9999,
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
  )
}
