import { useState } from 'react'
import { useApp } from '@/app/AppContext'
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
  const { pendingTesterCode, setPendingTesterCode, goTo } = useApp()
  const [code, setCode] = useState(pendingTesterCode)

  function next() {
    setPendingTesterCode(code.trim())
    goTo('profile')
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
      <Button fullWidth onClick={next}>
        Continuer
      </Button>
    </main>
  )
}
