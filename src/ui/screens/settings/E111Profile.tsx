import { useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import { NeuroCategoryPicker } from '@/ui/components/NeuroCategoryPicker'
import { isSyncConsentCurrent, isSyncConsentGranted } from '@/data/sync/syncConsent'
import type { NeuroCategory } from '@/domain/entities/user'
import { MAX_AGE, MIN_AGE, parseAge } from '@/domain/rules/profileRules'
import { isAdminIdentity, normalizeIdentity } from '@/domain/rules/adminCredentials'
import { verifyAdminSecret } from '@/domain/rules/adminLogin'

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
  flex: 1,
  minWidth: 0,
  padding: '10px 12px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  fontSize: '1rem',
  fontFamily: 'var(--font-body)',
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-text)',
}

export function E111Profile() {
  const { currentUser, settings, updateSettings, updateProfile, goTo } = useApp()

  const savedCategories = currentUser?.neuro_categories ?? []
  const savedAge = currentUser?.age
  const [categories, setCategories] = useState<NeuroCategory[]>(savedCategories)
  const [ageInput, setAgeInput] = useState(savedAge !== undefined ? String(savedAge) : '')
  const age = parseAge(ageInput)
  const ageInvalid = ageInput.trim() !== '' && age === null
  const profileDirty = categories.join() !== savedCategories.join() || age !== (savedAge ?? null)
  const profileValid = categories.length > 0 && age !== null

  const testerCode = (settings?.tester_code ?? '').trim()
  const [testerCodeInput, setTesterCodeInput] = useState(testerCode)
  const [adminSecret, setAdminSecret] = useState('')
  const [adminError, setAdminError] = useState<string | null>(null)
  const showAdminField = isAdminIdentity(testerCodeInput)
  const dirty = testerCodeInput.trim() !== testerCode || (showAdminField && adminSecret !== '')

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
        paddingBottom: 'var(--bottomnav-h)',
      }}
    >
      <button style={backBtnStyle} onClick={() => goTo('settings')} aria-label="Retour">
        ← Retour
      </button>

      <h1>Profil</h1>

      <Card>
        <p style={{ margin: '0 0 var(--spacing-sm)', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Catégories
        </p>
        <NeuroCategoryPicker value={categories} onChange={setCategories} />
        <label
          htmlFor="profile-age"
          style={{ display: 'block', margin: 'var(--spacing-md) 0 var(--spacing-xs)', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}
        >
          Âge
        </label>
        <input
          id="profile-age"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={ageInput}
          onChange={(e) => setAgeInput(e.target.value)}
          aria-invalid={ageInvalid}
          style={{ ...inputStyle, flex: 'none', width: '100%', boxSizing: 'border-box' }}
        />
        {ageInvalid && (
          <p role="alert" style={{ margin: 'var(--spacing-xs) 0 0', color: 'var(--color-error)', fontSize: '0.875rem' }}>
            Entrez un âge entre {MIN_AGE} et {MAX_AGE}.
          </p>
        )}
        <div style={{ marginTop: 'var(--spacing-md)' }}>
          <Button
            fullWidth
            disabled={!profileDirty || !profileValid}
            onClick={async () => {
              if (age === null) return
              await updateProfile({ neuro_categories: categories, age })
            }}
          >
            Enregistrer le profil
          </Button>
        </div>
      </Card>

      <Card>
        <p style={{ margin: '0 0 var(--spacing-xs)', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Code testeur
        </p>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', minWidth: 0 }}>
          <input
            type="text"
            aria-label="Code testeur"
            value={testerCodeInput}
            onChange={(e) => setTesterCodeInput(e.target.value)}
            placeholder="Aucun code enregistré"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            style={inputStyle}
          />
          <Button
            onClick={async () => {
              const trimmed = testerCodeInput.trim()
              setAdminError(null)
              if (isAdminIdentity(trimmed) && adminSecret) {
                const verification = await verifyAdminSecret(trimmed, adminSecret)
                if (!verification.ok) {
                  setAdminError(verification.error)
                  return
                }
                await updateSettings({ tester_code: trimmed, admin_key: verification.adminKey })
              } else if (isAdminIdentity(trimmed) && normalizeIdentity(trimmed) === normalizeIdentity(testerCode)) {
                await updateSettings({ tester_code: trimmed })
              } else {
                await updateSettings({ tester_code: trimmed || undefined, admin_key: undefined })
              }
              setTesterCodeInput(trimmed)
              setAdminSecret('')
            }}
            disabled={!dirty}
          >
            Enregistrer
          </Button>
        </div>
        {showAdminField && (
          <input
            type="password"
            aria-label="Mot de passe administrateur"
            value={adminSecret}
            onChange={(e) => setAdminSecret(e.target.value)}
            placeholder="Mot de passe administrateur"
            autoComplete="off"
            style={{ ...inputStyle, flex: 'none', width: '100%', marginTop: 'var(--spacing-sm)', boxSizing: 'border-box' }}
          />
        )}
        {adminError && (
          <p role="alert" style={{ margin: 'var(--spacing-sm) 0 0', color: 'var(--color-error)', fontSize: '0.875rem' }}>
            {adminError}
          </p>
        )}
      </Card>

      <Card>
        <p style={{ margin: '0 0 var(--spacing-xs)', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Informations
        </p>
        <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
          {isSyncConsentCurrent()
            ? 'Les données de profil, y compris les catégories (données de santé) et l’âge, sont stockées sur votre appareil et incluses dans la copie envoyée à l’équipe. Vous pouvez retirer le partage dans Paramètres, rubrique « Vie privée ».'
            : isSyncConsentGranted()
              ? 'Les données de profil sont stockées sur votre appareil. Les catégories (données de santé) et l’âge ne sont pas envoyés à l’équipe.'
              : 'Les données de profil sont stockées localement sur votre appareil.'}
        </p>
      </Card>

    </main>
  )
}
