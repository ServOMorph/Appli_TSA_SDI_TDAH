import { useEffect, useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'

const backBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--color-text-muted)',
  fontSize: '1rem',
  padding: 0,
  alignSelf: 'flex-start',
}

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  fontSize: '1rem',
  fontFamily: 'var(--font-body)',
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-text)',
}

const profileLabels: Record<string, string> = {
  teenager: 'Adolescent',
  student: 'Étudiant',
  adult: 'Adulte',
}

export function E111Profile() {
  const { currentUser, settings, updateSettings, goTo } = useApp()

  const profileLabel = currentUser?.profile_type
    ? (profileLabels[currentUser.profile_type] ?? currentUser.profile_type)
    : 'Non défini'

  const storedCode = settings?.tester_code ?? ''
  const [code, setCode] = useState(storedCode)

  useEffect(() => {
    setCode(settings?.tester_code ?? '')
  }, [settings?.tester_code])

  const trimmed = code.trim()
  const dirty = trimmed !== storedCode

  async function saveTesterCode() {
    await updateSettings({ tester_code: trimmed || undefined })
  }

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: 'var(--spacing-xl)',
        gap: 'var(--spacing-lg)',
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
        minHeight: '100svh',
        paddingBottom: 'var(--bottomnav-h)',
      }}
    >
      <button style={backBtnStyle} onClick={() => goTo('settings')} aria-label="Retour">
        ← Retour
      </button>

      <h1>Profil</h1>

      <Card>
        <p style={{ margin: '0 0 var(--spacing-xs)', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Type de profil
        </p>
        <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text)' }} aria-label="type de profil">
          {profileLabel}
        </p>
      </Card>

      <Card>
        <p style={{ margin: '0 0 var(--spacing-xs)', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Code testeur
        </p>
        <p style={{ margin: '0 0 var(--spacing-sm)', color: 'var(--color-text-muted)' }}>
          Saisissez le code reçu dans votre message d’invitation. Il permet de rattacher vos retours
          de test à votre participation.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          <input
            type="text"
            aria-label="Code testeur"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Code testeur"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            style={inputStyle}
          />
          <Button fullWidth onClick={saveTesterCode} disabled={!dirty}>
            Enregistrer le code
          </Button>
          {!dirty && trimmed !== '' && (
            <p style={{ margin: 0, color: 'var(--color-success)', fontSize: '0.875rem' }} role="status">
              Code enregistré : {trimmed}
            </p>
          )}
          {!dirty && trimmed === '' && storedCode === '' && (
            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              Aucun code enregistré.
            </p>
          )}
        </div>
      </Card>

      <Card>
        <p style={{ margin: '0 0 var(--spacing-xs)', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Informations
        </p>
        <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
          Les données de profil sont stockées localement sur votre appareil.
        </p>
      </Card>

    </main>
  )
}
