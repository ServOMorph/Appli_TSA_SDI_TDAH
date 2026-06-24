import { beforeEach, describe, it, expect } from 'vitest'
import { AppDatabase } from '@/data/db'
import { UserRepository } from './userRepository'
import type { User } from '@/domain/entities/user'

let db: AppDatabase
let repo: UserRepository
let testCount = 0

beforeEach(() => {
  db = new AppDatabase(`user-repo-test-${++testCount}`)
  repo = new UserRepository(db)
})

describe('UserRepository', () => {
  const mockUser = (overrides?: Partial<User>): User => ({
    id: 'user-1',
    profile_type: 'adult',
    created_at: '2026-06-24T00:00:00Z',
    updated_at: '2026-06-24T00:00:00Z',
    ...overrides,
  })

  it('creates and retrieves user', async () => {
    const user = mockUser()
    const id = await repo.create(user)
    const retrieved = await repo.getById(id)
    expect(retrieved).toEqual(user)
  })

  it('updates user', async () => {
    const user = mockUser()
    await repo.create(user)
    const updated = mockUser({ profile_type: 'student', updated_at: '2026-06-25T00:00:00Z' })
    await repo.update(updated)
    const retrieved = await repo.getById(user.id)
    expect(retrieved?.profile_type).toBe('student')
  })

  it('deletes user', async () => {
    const user = mockUser()
    await repo.create(user)
    await repo.delete(user.id)
    const retrieved = await repo.getById(user.id)
    expect(retrieved).toBeUndefined()
  })

  it('gets first user', async () => {
    const user1 = mockUser({ id: 'user-1' })
    const user2 = mockUser({ id: 'user-2' })
    await repo.create(user1)
    await repo.create(user2)
    const first = await repo.getFirst()
    expect(first?.id).toBeDefined()
  })
})
