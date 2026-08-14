import { useMemo, useState } from 'react'
import { useApp } from '@/app/AppContext'
import { manualTestsCatalog } from '@/domain/data/manualTestsCatalog'
import type { ManualTestResult, ManualTestStatus } from '@/domain/entities/manualTestResult'
import type { ManualTest } from '@/domain/data/manualTestsCatalog'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import { inputStyle, modalBox, modalOverlay } from '@/ui/styles/budget'

function latestResult(results: ManualTestResult[], testId: string): ManualTestResult | undefined {
  return results
    .filter((result) => result.test_id === testId)
    .reduce<ManualTestResult | undefined>(
      (latest, result) => (!latest || result.created_at > latest.created_at ? result : latest),
      undefined,
    )
}

function statusLabel(result: ManualTestResult | undefined): string {
  if (!result) return 'Jamais testé'
  return result.status === 'ok' ? 'Validé' : 'Non validé'
}

function statusColor(result: ManualTestResult | undefined): string {
  if (!result) return 'var(--color-text-muted)'
  return result.status === 'ok' ? 'var(--color-success)' : 'var(--color-error)'
}

function formatResultDate(value: string): string {
  return new Date(value).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
}

const URGENT_BANNER_STORAGE_KEY = 'urgent_banner_dismissed'

export function E121ManualTests() {
  const { back, manualTestResults, submitManualTestResult } = useApp()
  const [urgentBannerDismissed, setUrgentBannerDismissed] = useState(
    () => localStorage.getItem(URGENT_BANNER_STORAGE_KEY) === 'true',
  )
  const [selectedTest, setSelectedTest] = useState<ManualTest | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<ManualTestStatus>('ok')
  const [comment, setComment] = useState('')
  const latestByTest = useMemo(
    () => new Map(manualTestsCatalog.map((test) => [test.id, latestResult(manualTestResults, test.id)])),
    [manualTestResults],
  )

  const selectedResults = useMemo(
    () =>
      selectedTest
        ? manualTestResults
            .filter((result) => result.test_id === selectedTest.id)
            .sort((a, b) => b.created_at.localeCompare(a.created_at))
        : [],
    [manualTestResults, selectedTest],
  )
  const canSubmit = selectedStatus === 'ok' || Boolean(comment.trim())

  function openTest(test: ManualTest) {
    setSelectedTest(test)
    setSelectedStatus('ok')
    setComment('')
  }

  async function saveResult() {
    if (!selectedTest || !canSubmit) return
    await submitManualTestResult(selectedTest.id, selectedStatus, comment)
    setSelectedTest(null)
  }

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: 'var(--spacing-xl)',
        gap: 'var(--spacing-lg)',
        maxWidth: '480px',
        margin: '0 auto',
        minHeight: '100svh',
        paddingBottom: 'var(--bottomnav-h)',
      }}
    >
      <button
        onClick={() => back('dashboard')}
        aria-label="Retour"
        style={{ alignSelf: 'flex-start', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1rem', padding: 0 }}
      >
        ← Retour
      </button>
      {!urgentBannerDismissed && (
        <div
          role="alert"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 'var(--spacing-sm)',
            padding: 'var(--spacing-sm)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-error)',
            color: 'white',
          }}
        >
          <p style={{ margin: 0, fontWeight: 600, textAlign: 'left', color: 'white' }}>
            URGENCE : dans Paramètres, ouvre « Export et import » et réimporte le fichier que tu m'as envoyé — ça va réparer le bouton Budget disparu. Vérifie ensuite que tout est bien là.
          </p>
          <button
            onClick={() => {
              localStorage.setItem(URGENT_BANNER_STORAGE_KEY, 'true')
              setUrgentBannerDismissed(true)
            }}
            style={{
              background: 'none',
              border: '1px solid white',
              borderRadius: 'var(--radius-md)',
              color: 'white',
              fontWeight: 600,
              padding: '6px 16px',
              cursor: 'pointer',
            }}
          >
            Fait
          </button>
        </div>
      )}
      <div>
        <h1 style={{ margin: 0 }}>Tests à faire</h1>
        <p style={{ margin: 'var(--spacing-sm) 0 0', color: 'var(--color-text-muted)' }}>
          Chaque test aide à vérifier que l’application reste simple à utiliser.
        </p>
      </div>
      <ul aria-label="Liste des tests à faire" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
        {manualTestsCatalog.map((test) => {
          const result = latestByTest.get(test.id)
          const isNew = !result
          return (
            <li key={test.id}>
              <button
                aria-label={`Ouvrir le test ${test.title}`}
                onClick={() => openTest(test)}
                style={{ width: '100%', padding: 0, border: 'none', background: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit', textAlign: 'left' }}
              >
                <Card>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-sm)' }}>
                    {isNew && <span aria-label="Nouveau test" style={{ width: 10, height: 10, marginTop: 5, borderRadius: '50%', backgroundColor: 'var(--color-error)', flexShrink: 0 }} />}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 'var(--spacing-sm)' }}>
                        <h2 style={{ margin: 0, fontSize: '1rem' }}>{test.title}</h2>
                        <span style={{ color: statusColor(result), fontSize: '0.8125rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{statusLabel(result)}</span>
                      </div>
                      <p style={{ margin: 'var(--spacing-sm) 0 0', color: 'var(--color-text-muted)' }}>{test.description}</p>
                    </div>
                  </div>
                </Card>
              </button>
            </li>
          )
        })}
      </ul>
      {selectedTest && (
        <div role="dialog" aria-modal="true" aria-label={`Résultat du test ${selectedTest.title}`} style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>{selectedTest.title}</h2>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>{selectedTest.description}</p>
            <fieldset style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              <legend style={{ marginBottom: 'var(--spacing-sm)', fontWeight: 600 }}>Votre résultat</legend>
              <label>
                <input type="radio" name="manual-test-status" checked={selectedStatus === 'ok'} onChange={() => setSelectedStatus('ok')} /> Validé
              </label>
              <label>
                <input type="radio" name="manual-test-status" checked={selectedStatus === 'nok'} onChange={() => setSelectedStatus('nok')} /> Non validé
              </label>
            </fieldset>
            {selectedStatus === 'nok' && (
              <>
                <label htmlFor="manual-test-comment">Expliquez ce qui n’a pas fonctionné</label>
                <textarea id="manual-test-comment" value={comment} onChange={(event) => setComment(event.target.value)} style={inputStyle} rows={4} />
              </>
            )}
            <section aria-label="Historique du test">
              <h3 style={{ margin: '0 0 var(--spacing-sm)', fontSize: '1rem' }}>Historique</h3>
              {selectedResults.length === 0 ? (
                <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Aucun résultat pour le moment.</p>
              ) : (
                <ul style={{ margin: 0, paddingLeft: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                  {selectedResults.map((result) => (
                    <li key={result.id}>
                      <strong style={{ color: statusColor(result) }}>{statusLabel(result)}</strong> — {formatResultDate(result.created_at)}
                      {result.comment && <div>{result.comment}</div>}
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <Button fullWidth onClick={saveResult} disabled={!canSubmit}>Enregistrer</Button>
            <Button variant="secondary" fullWidth onClick={() => setSelectedTest(null)}>Annuler</Button>
          </div>
        </div>
      )}
    </main>
  )
}
