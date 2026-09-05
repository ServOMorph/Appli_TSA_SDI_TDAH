import { describe, expect, it } from 'vitest'
import { SCREEN_CODES, getScreenCode } from '@/domain/data/screenCodes'
import type { Route } from '@/app/navigation'

const ROUTES: Route[] = [
  { name: 'welcome' },
  { name: 'profile' },
  { name: 'energy' },
  { name: 'dashboard' },
  { name: 'planning' },
  { name: 'inbox' },
  { name: 'task-create-v2' },
  { name: 'task-detail' },
  { name: 'task-decompose' },
  { name: 'energy-checkin' },
  { name: 'overload-recovery' },
  { name: 'resources' },
  { name: 'manual-tests' },
  { name: 'feedback' },
  { name: 'feedback-list' },
  { name: 'settings' },
  { name: 'settings-profile' },
  { name: 'settings-accessibility' },
  { name: 'settings-privacy' },
  { name: 'settings-export' },
  { name: 'list-detail' },
  { name: 'list-item-detail' },
  { name: 'tools' },
  { name: 'folder-detail' },
  { name: 'budget' },
  { name: 'budget-account' },
  { name: 'budget-previsions' },
  { name: 'budget-livrets' },
  { name: 'budget-livret-detail' },
  { name: 'budget-category-detail' },
  { name: 'budget-settings' },
]

describe('screenCodes', () => {
  it('associe un code à chaque route navigable', () => {
    expect(Object.keys(SCREEN_CODES).sort()).toEqual(ROUTES.map(({ name }) => name).sort())
    expect(ROUTES.map(getScreenCode).every(({ code, label }) => /^E\d+$/.test(code) && label.length > 0)).toBe(true)
  })
})
