export type ManualTestStatus = 'ok' | 'nok'

export interface ManualTestResult {
  id: string
  test_id: string
  status: ManualTestStatus
  comment: string | null
  created_at: string
}
