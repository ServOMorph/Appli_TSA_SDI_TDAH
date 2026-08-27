import { useCallback, useState } from 'react'
import { manualTestResultRepo, newId } from '@/app/repositories'
import type { ManualTestResult, ManualTestStatus } from '@/domain/entities/manualTestResult'

export function useManualTestsState() {
  const [manualTestResults, setManualTestResults] = useState<ManualTestResult[]>([])

  const load = useCallback(async () => {
    setManualTestResults(await manualTestResultRepo.getAll())
  }, [])

  async function submitManualTestResult(testId: string, status: ManualTestStatus, comment: string, testRevision?: number) {
    const result: ManualTestResult = {
      id: newId(),
      test_id: testId,
      test_revision: testRevision,
      status,
      comment: status === 'nok' ? comment.trim() : null,
      created_at: new Date().toISOString(),
    }
    await manualTestResultRepo.create(result)
    setManualTestResults((previous) => [...previous, result])
  }

  function reset() {
    setManualTestResults([])
  }

  return { manualTestResults, submitManualTestResult, load, reset }
}
