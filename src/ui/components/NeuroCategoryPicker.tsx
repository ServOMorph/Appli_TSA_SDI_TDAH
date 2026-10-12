import { useState } from 'react'
import type { NeuroCategory } from '@/domain/entities/user'
import { NEURO_CATEGORY_OPTIONS, toggleNeuroCategory } from '@/domain/rules/profileRules'

interface NeuroCategoryPickerProps {
  value: NeuroCategory[]
  onChange: (next: NeuroCategory[]) => void
}

export function NeuroCategoryPicker({ value, onChange }: NeuroCategoryPickerProps) {
  const [openDefinition, setOpenDefinition] = useState<NeuroCategory | null>(null)
  return (
    <fieldset
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-sm)',
        border: 'none',
        padding: 0,
        margin: 0,
        minWidth: 0,
      }}
    >
      <legend style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
        Catégories
      </legend>
      {NEURO_CATEGORY_OPTIONS.map((option) => {
        const checked = value.includes(option.value)
        const definitionOpen = openDefinition === option.value
        return (
          <div key={option.value} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
            <div style={{ display: 'flex', alignItems: 'stretch', gap: 'var(--spacing-sm)' }}>
              <label
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-md)',
                  padding: 'var(--spacing-md) var(--spacing-lg)',
                  backgroundColor: 'var(--color-surface)',
                  border: checked ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onChange(toggleNeuroCategory(value, option.value))}
                  style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0 }}
                />
                <span style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '1rem' }}>{option.label}</span>
              </label>
              <button
                type="button"
                aria-label={`Définition de ${option.label}`}
                aria-expanded={definitionOpen}
                onClick={() => setOpenDefinition(definitionOpen ? null : option.value)}
                style={{
                  flexShrink: 0,
                  width: '2.75rem',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-text)',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer',
                }}
              >
                ?
              </button>
            </div>
            {definitionOpen && (
              <p style={{ margin: 0, padding: '0 var(--spacing-sm)', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                {option.definition}
              </p>
            )}
          </div>
        )
      })}
    </fieldset>
  )
}
