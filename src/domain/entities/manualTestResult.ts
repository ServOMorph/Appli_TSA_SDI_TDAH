export type ManualTestStatus = 'ok' | 'nok'

export interface ManualTestResult {
  id: string
  test_id: string
  test_revision?: number
  status: ManualTestStatus
  comment: string | null
  created_at: string
}
