import type { ManualTest } from '@/domain/data/manualTestsCatalog'
import type { ManualTestResult } from '@/domain/entities/manualTestResult'

export function latestManualTestResult(
  results: ManualTestResult[],
  testId: string,
): ManualTestResult | undefined {
  return results
    .filter((result) => result.test_id === testId)
    .reduce<ManualTestResult | undefined>(
      (latest, result) => (!latest || result.created_at > latest.created_at ? result : latest),
      undefined,
    )
}

// Un test est « fait » dès qu'un résultat (validé ou non) a été enregistré sur sa révision
// courante. Le statut ok/nok n'entre pas en compte : marquer un test « Non validé » suffit à
// le retirer de la liste et à éteindre la pastille. Une nouvelle révision du test (rectification)
// le rend de nouveau « à faire ».
export function isManualTestDone(
  test: ManualTest,
  result: ManualTestResult | undefined,
): boolean {
  if (!result) return false
  return test.revision === undefined || result.test_revision === test.revision
}

export function pendingManualTests(
  catalog: ManualTest[],
  results: ManualTestResult[],
): ManualTest[] {
  return catalog.filter(
    (test) => !isManualTestDone(test, latestManualTestResult(results, test.id)),
  )
}

export function hasPendingManualTests(
  catalog: ManualTest[],
  results: ManualTestResult[],
): boolean {
  return pendingManualTests(catalog, results).length > 0
}
