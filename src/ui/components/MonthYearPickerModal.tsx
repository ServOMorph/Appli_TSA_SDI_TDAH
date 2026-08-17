import { useState } from 'react'

const MONTH_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.75)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
}

const boxStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--spacing-xl)',
  maxWidth: '360px',
  width: '90%',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-md)',
}

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}

const yearNavBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--color-text)',
  fontSize: '1.25rem',
  padding: '4px 10px',
  lineHeight: 1,
  borderRadius: 'var(--radius-sm)',
}

const yearLabelStyle: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 700,
  color: 'var(--color-text)',
}

const closeBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: 'var(--color-text)',
  fontSize: '1.25rem',
  lineHeight: 1,
  cursor: 'pointer',
  padding: '4px 8px',
}

const monthGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 'var(--spacing-sm)',
}

function monthBtnStyle(isSelected: boolean): React.CSSProperties {
  return {
    background: isSelected ? 'var(--color-primary)' : 'none',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    color: isSelected ? '#fff' : 'var(--color-text)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.9375rem',
    fontWeight: 600,
    padding: '10px 4px',
    minHeight: '44px',
  }
}

interface MonthYearPickerModalProps {
  year: number
  month: number
  onSelect: (year: number, month: number) => void
  onClose: () => void
}

export function MonthYearPickerModal({ year, month, onSelect, onClose }: MonthYearPickerModalProps) {
  const [pickerYear, setPickerYear] = useState(year)

  return (
    <div style={overlayStyle} role="dialog" aria-label="Choisir le mois du planning" onClick={onClose}>
      <div style={boxStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <button type="button" style={yearNavBtnStyle} onClick={() => setPickerYear((y) => y - 1)} aria-label="Année précédente">
            &lsaquo;
          </button>
          <span style={yearLabelStyle}>{pickerYear}</span>
          <button type="button" style={yearNavBtnStyle} onClick={() => setPickerYear((y) => y + 1)} aria-label="Année suivante">
            &rsaquo;
          </button>
          <button type="button" style={closeBtnStyle} onClick={onClose} aria-label="Fermer">
            ×
          </button>
        </div>
        <div style={monthGridStyle}>
          {MONTH_LABELS.map((label, index) => (
            <button
              key={label}
              type="button"
              style={monthBtnStyle(pickerYear === year && index === month)}
              onClick={() => onSelect(pickerYear, index)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
