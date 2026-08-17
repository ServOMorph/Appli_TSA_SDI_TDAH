import { useMemo, useState } from 'react'
import { useApp } from '@/app/AppContext'
import { MANUAL_TEST_CATEGORIES, manualTestsCatalog } from '@/domain/data/manualTestsCatalog'
import type { ManualTestResult, ManualTestStatus } from '@/domain/entities/manualTestResult'
import type { ManualTest, ManualTestCategory } from '@/domain/data/manualTestsCatalog'
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

export function E121ManualTests() {
  const { back, manualTestResults, submitManualTestResult } = useApp()
  const [selectedTest, setSelectedTest] = useState<ManualTest | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<ManualTestStatus>('ok')
  const [comment, setComment] = useState('')
  const [expandedTestIds, setExpandedTestIds] = useState<Set<string>>(new Set())
  const [expandedCategories, setExpandedCategories] = useState<Set<ManualTestCategory>>(new Set())
  const latestByTest = useMemo(
    () => new Map(manualTestsCatalog.map((test) => [test.id, latestResult(manualTestResults, test.id)])),
    [manualTestResults],
  )

  const visibleTests = useMemo(
    () => manualTestsCatalog.filter((test) => latestByTest.get(test.id)?.status !== 'ok'),
    [latestByTest],
  )

  const groupedTests = useMemo(() => {
    const byCategory = new Map<ManualTestCategory, ManualTest[]>()
    for (const test of visibleTests) {
      const tests = byCategory.get(test.category) ?? []
      tests.push(test)
      byCategory.set(test.category, tests)
    }
    return MANUAL_TEST_CATEGORIES.filter((category) => byCategory.has(category)).map((category) => ({
      category,
      tests: byCategory.get(category)!,
    }))
  }, [visibleTests])

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

  function toggleDescription(testId: string) {
    setExpandedTestIds((previous) => {
      const next = new Set(previous)
      if (next.has(testId)) next.delete(testId)
      else next.add(testId)
      return next
    })
  }

  function toggleCategory(category: ManualTestCategory) {
    setExpandedCategories((previous) => {
      const next = new Set(previous)
      if (next.has(category)) next.delete(category)
      else next.add(category)
      return next
    })
  }

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
      <div>
        <h1 style={{ margin: 0 }}>Tests à faire</h1>
        <p style={{ margin: 'var(--spacing-sm) 0 0', color: 'var(--color-text-muted)' }}>
          Chaque test aide à vérifier que l’application reste simple à utiliser.
        </p>
      </div>
      {groupedTests.map(({ category, tests }) => {
        const isCategoryExpanded = expandedCategories.has(category)
        return (
        <section key={category} aria-label={category}>
          <button
            aria-label={isCategoryExpanded ? `Replier la catégorie ${category}` : `Déplier la catégorie ${category}`}
            aria-expanded={isCategoryExpanded}
            onClick={() => toggleCategory(category)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: 'var(--spacing-sm) 0',
              border: 'none',
              borderBottom: '2px solid var(--color-primary)',
              background: 'none',
              cursor: 'pointer',
              font: 'inherit',
              textAlign: 'left',
            }}
          >
            <h2 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-primary)' }}>{category}</h2>
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', color: 'var(--color-primary)' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{tests.length}</span>
              <span style={{ fontSize: '1rem', lineHeight: 1 }}>{isCategoryExpanded ? '▾' : '▸'}</span>
            </span>
          </button>
          {isCategoryExpanded && (
          <ul aria-label={`Tests de la catégorie ${category}`} style={{ listStyle: 'none', padding: 0, margin: 'var(--spacing-sm) 0 0', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {tests.map((test) => {
              const result = latestByTest.get(test.id)
              const isNew = !result
              const isExpanded = expandedTestIds.has(test.id)
              return (
                <li key={test.id}>
                  <Card>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-sm)' }}>
                      {isNew && <span aria-label="Nouveau test" style={{ width: 10, height: 10, marginTop: 5, borderRadius: '50%', backgroundColor: 'var(--color-error)', flexShrink: 0 }} />}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                          <button
                            aria-label={`Ouvrir le test ${test.title}`}
                            onClick={() => openTest(test)}
                            style={{ flex: 1, padding: 0, border: 'none', background: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit', textAlign: 'left' }}
                          >
                            <h3 style={{ margin: 0, fontSize: '1rem' }}>{test.title}</h3>
                          </button>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', flexShrink: 0 }}>
                            <span style={{ color: statusColor(result), fontSize: '0.8125rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{statusLabel(result)}</span>
                            <button
                              aria-label={isExpanded ? `Replier la description de ${test.title}` : `Déplier la description de ${test.title}`}
                              onClick={() => toggleDescription(test.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '0.9375rem', padding: 0, lineHeight: 1 }}
                            >
                              {isExpanded ? '▾' : '▸'}
                            </button>
                          </div>
                        </div>
                        {isExpanded && (
                          <ol style={{ margin: 'var(--spacing-sm) 0 0', paddingLeft: 'var(--spacing-lg)', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                            {test.steps.map((step, index) => (
                              <li key={index}>{step}</li>
                            ))}
                          </ol>
                        )}
                      </div>
                    </div>
                  </Card>
                </li>
              )
            })}
          </ul>
          )}
        </section>
        )
      })}
      {selectedTest && (
        <div role="dialog" aria-modal="true" aria-label={`Résultat du test ${selectedTest.title}`} style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>{selectedTest.title}</h2>
            <ol style={{ margin: 0, paddingLeft: 'var(--spacing-lg)', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
              {selectedTest.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
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
