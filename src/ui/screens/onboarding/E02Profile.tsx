import { useState } from 'react'
import { useApp } from '@/app/AppContext'
import type { NeuroCategory } from '@/domain/entities/user'
import { MAX_AGE, MIN_AGE, parseAge } from '@/domain/rules/profileRules'
import { Button } from '@/ui/components/Button'
import { NeuroCategoryPicker } from '@/ui/components/NeuroCategoryPicker'

export function E02Profile() {
  const { createUser, updateProfile, currentUser, route, goTo } = useApp()
  const catchUpTarget = route.name === 'profile' ? route.next : undefined
  const [categories, setCategories] = useState<NeuroCategory[]>(currentUser?.neuro_categories ?? [])
  const [ageInput, setAgeInput] = useState(currentUser?.age !== undefined ? String(currentUser.age) : '')
  const [submitting, setSubmitting] = useState(false)

  const age = parseAge(ageInput)
  const ageInvalid = ageInput.trim() !== '' && age === null
  const canContinue = categories.length > 0 && age !== null && !submitting

  async function submit() {
    if (!canContinue || age === null) return
    setSubmitting(true)
    const profile = { neuro_categories: categories, age }
    try {
      if (catchUpTarget) {
        await updateProfile(profile)
        goTo(catchUpTarget)
      } else {
        await createUser(profile)
        goTo('energy')
      }
    } catch {
      setSubmitting(false)
    }
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
        <h1>Votre profil</h1>
        <p>Choisissez les catégories qui vous correspondent. Plusieurs choix sont possibles.</p>
        {catchUpTarget && <p>Ces informations sont maintenant demandées à toutes les personnes qui utilisent l’application.</p>}
      </div>
      <NeuroCategoryPicker value={categories} onChange={setCategories} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
        <label htmlFor="profile-age" style={{ fontWeight: 600, color: 'var(--color-text)' }}>
          Votre âge
        </label>
        <input
          id="profile-age"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={ageInput}
          onChange={(e) => setAgeInput(e.target.value)}
          aria-invalid={ageInvalid}
          style={{
            padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            fontSize: '1rem',
            fontFamily: 'var(--font-body)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
        {ageInvalid && (
          <p role="alert" style={{ margin: 0, color: 'var(--color-error)', fontSize: '0.875rem' }}>
            Entrez un âge entre {MIN_AGE} et {MAX_AGE}.
          </p>
        )}
      </div>
      <Button fullWidth onClick={submit} disabled={!canContinue}>
        Continuer
      </Button>
    </main>
  )
}
