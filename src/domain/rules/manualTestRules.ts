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

export function isManualTestValidated(
  test: ManualTest,
  result: ManualTestResult | undefined,
): boolean {
  return (
    result?.status === 'ok' &&
    (test.revision === undefined || result.test_revision === test.revision)
  )
}

export function pendingManualTests(
  catalog: ManualTest[],
  results: ManualTestResult[],
): ManualTest[] {
  return catalog.filter(
    (test) => !isManualTestValidated(test, latestManualTestResult(results, test.id)),
  )
}

export function hasPendingManualTests(
  catalog: ManualTest[],
  results: ManualTestResult[],
): boolean {
  return pendingManualTests(catalog, results).length > 0
}
