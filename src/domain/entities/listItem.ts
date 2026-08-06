export interface ListItem {
  id: string
  list_id: string
  title: string
  position: number
  checked: boolean
  section: string | null
  created_at: string
}
