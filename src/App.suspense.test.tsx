import { screen as dom, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { AppScreens } from './App'
import type { Route, Screen } from '@/app/AppContext'

const CASES: { screen: Screen; route?: Route }[] = [
  { screen: 'welcome' },
  { screen: 'profile' },
  { screen: 'energy' },
  { screen: 'dashboard' },
  { screen: 'planning', route: { name: 'planning' } },
  { screen: 'inbox' },
  { screen: 'task-create-v2' },
  { screen: 'task-detail', route: { name: 'task-detail', taskId: 'task-1' } },
  { screen: 'task-decompose' },
  { screen: 'energy-checkin' },
  { screen: 'overload-recovery' },
  { screen: 'resources' },
  { screen: 'manual-tests' },
  { screen: 'feedback', route: { name: 'feedback', sourceScreen: 'dashboard' } },
  { screen: 'feedback-list' },
  { screen: 'settings' },
  { screen: 'settings-profile' },
  { screen: 'settings-accessibility' },
  { screen: 'settings-privacy' },
  { screen: 'settings-export' },
  { screen: 'list-detail', route: { name: 'list-detail', listId: 'list-1' } },
  { screen: 'list-item-detail', route: { name: 'list-item-detail', itemId: 'item-1' } },
  { screen: 'tools' },
  { screen: 'folder-detail', route: { name: 'folder-detail', folderId: 'folder-1' } },
  { screen: 'budget' },
  { screen: 'budget-account' },
  { screen: 'budget-previsions' },
  { screen: 'budget-livrets' },
  { screen: 'budget-livret-detail', route: { name: 'budget-livret-detail', accountId: 'account-1' } },
  { screen: 'budget-category-detail', route: { name: 'budget-category-detail', categoryId: 'cat-1' } },
  { screen: 'budget-settings' },
]

describe('AppScreens — chargement différé (Phase 2 roadmap_bundle_2026-08-31.md)', () => {
  for (const { screen: s, route } of CASES) {
    it(`résout l'écran différé « ${s} » sans rester bloqué sur le fallback`, async () => {
      const ctx = makeAppContext({ screen: s, route: (route ?? { name: s }) as Route })
      renderWithApp(<AppScreens />, ctx)

      await waitFor(() => expect(dom.queryByText('Chargement...')).toBeNull())
    })
  }
})
