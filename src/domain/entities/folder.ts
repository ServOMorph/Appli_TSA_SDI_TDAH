export interface Folder {
  id: string
  name: string
  parent_id?: string | null
  position: number
  created_at: string
  updated_at: string
}
