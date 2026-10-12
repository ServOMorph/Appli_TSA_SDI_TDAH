import { useState } from 'react'
import { useApp } from '@/app/AppContext'
import { isAdminIdentity } from '@/domain/rules/adminCredentials'
import { verifyAdminSecret } from '@/domain/rules/adminLogin'
import { Button } from '@/ui/components/Button'

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  fontSize: '1rem',
  fontFamily: 'var(--font-body)',
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-text)',
}

export function E05TesterCode() {
  const { pendingTesterCode, setPendingTesterCode, setPendingAdminKey, goTo } = useApp()
  const [code, setCode] = useState(pendingTesterCode)
  const [adminSecret, setAdminSecret] = useState('')
  const [adminError, setAdminError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const showAdminField = isAdminIdentity(code)

  async function next() {
    const trimmed = code.trim()
    setAdminError(null)
    if (isAdminIdentity(trimmed) && adminSecret) {
      setChecking(true)
      const verification = await verifyAdminSecret(trimmed, adminSecret)
      setChecking(false)
      if (!verification.ok) {
        setAdminError(verification.error)
        return
      }
      setPendingAdminKey(verification.adminKey)
    } else {
      setPendingAdminKey('')
    }
    setPendingTesterCode(trimmed)
    goTo('consent')
  }

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: 'var(--spacing-xl)',
        gap: 'var(--spacing-lg)',
        width: '100%',
        minWidth: 0,
        maxWidth: '480px',
        margin: '0 auto',
        minHeight: '100svh',
        justifyContent: 'center',
      }}
    >
      <div>
        <h1>Code testeur</h1>
        <p>
          Si vous avez reçu un code testeur dans votre message d’invitation, indiquez-le ici. Sinon,
          continuez sans code : vous pourrez le renseigner plus tard dans Paramètres.
        </p>
      </div>
      <input
        type="text"
        aria-label="Code testeur"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Code testeur (facultatif)"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        style={inputStyle}
      />
      {showAdminField && (
        <input
          type="password"
          aria-label="Mot de passe administrateur"
          value={adminSecret}
          onChange={(e) => setAdminSecret(e.target.value)}
          placeholder="Mot de passe administrateur"
          autoComplete="off"
          style={inputStyle}
        />
      )}
      {adminError && (
        <p role="alert" style={{ margin: 0, color: 'var(--color-error)', fontSize: '0.875rem' }}>
          {adminError}
        </p>
      )}
      <Button fullWidth onClick={next} disabled={checking}>
        Continuer
      </Button>
    </main>
  )
}
