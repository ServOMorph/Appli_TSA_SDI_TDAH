import { afterEach, describe, expect, it } from 'vitest'
import { db, settingsRepo, userRepo } from '@/app/repositories'
import { buildSnapshotPayload } from '@/data/sync/buildSnapshot'
import type { User } from '@/domain/entities/user'
import type { Settings } from '@/domain/entities/settings'

const user: User = {
  id: 'user-1',
  profile_type: 'adult',
  onboarding_completed: true,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

const settings: Settings = {
  id: 'settings-1',
  user_id: 'user-1',
  dark_mode: false,
  font_size: 'medium',
  reduced_motion: false,
}

afterEach(async () => {
  await db.users.clear()
  await db.settings.clear()
})

describe('buildSnapshotPayload', () => {
  it('sérialise le code testeur porté par les paramètres', async () => {
    await userRepo.create(user)
    await settingsRepo.create({ ...settings, tester_code: 'alpha-01' })

    const snapshot = await buildSnapshotPayload()

    expect(snapshot?.settings?.tester_code).toBe('alpha-01')
  })

  it('n’ajoute pas de champ code testeur quand il n’est pas renseigné', async () => {
    await userRepo.create(user)
    await settingsRepo.create(settings)

    const snapshot = await buildSnapshotPayload()

    expect(snapshot?.settings).toBeDefined()
    expect(snapshot?.settings?.tester_code).toBeUndefined()
  })
})
