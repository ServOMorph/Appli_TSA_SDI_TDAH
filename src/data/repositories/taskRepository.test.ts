import { beforeEach, describe, it, expect } from 'vitest'
import { AppDatabase } from '@/data/db'
import { TaskRepository } from './taskRepository'
import type { Task } from '@/domain/entities/task'

let db: AppDatabase
let repo: TaskRepository
let repoEncrypted: TaskRepository
let testCount = 0

beforeEach(() => {
  db = new AppDatabase(`task-repo-test-${++testCount}`)
  repo = new TaskRepository(db)
  repoEncrypted = new TaskRepository(db, 'test-password')
})

describe('TaskRepository', () => {
  const mockTask = (overrides?: Partial<Task>): Task => ({
    id: 'task-1',
    title: 'Test task',
    status: 'inbox',
    position: 0,
    created_at: '2026-06-24T00:00:00Z',
    updated_at: '2026-06-24T00:00:00Z',
    completed_at: null,
    ...overrides,
  })

  describe('without encryption', () => {
    it('creates and retrieves task', async () => {
      const task = mockTask()
      const id = await repo.create(task)
      const retrieved = await repo.getById(id)
      expect(retrieved).toEqual(task)
    })

    it('updates task', async () => {
      const task = mockTask()
      await repo.create(task)
      const updated = mockTask({ title: 'Updated', status: 'today' })
      await repo.update(updated)
      const retrieved = await repo.getById(task.id)
      expect(retrieved?.title).toBe('Updated')
      expect(retrieved?.status).toBe('today')
    })

    it('deletes task', async () => {
      const task = mockTask()
      await repo.create(task)
      await repo.delete(task.id)
      const retrieved = await repo.getById(task.id)
      expect(retrieved).toBeUndefined()
    })

    it('gets tasks by status', async () => {
      await repo.create(mockTask({ id: 't1', status: 'today' }))
      await repo.create(mockTask({ id: 't2', status: 'today' }))
      await repo.create(mockTask({ id: 't3', status: 'inbox' }))

      const todayTasks = await repo.getByStatus('today')
      expect(todayTasks).toHaveLength(2)
    })

    it('gets today tasks', async () => {
      await repo.create(mockTask({ id: 't1', status: 'today' }))
      await repo.create(mockTask({ id: 't2', status: 'inbox' }))

      const todayTasks = await repo.getTodayTasks()
      expect(todayTasks).toHaveLength(1)
    })

    it('reorders tasks', async () => {
      const t1 = mockTask({ id: 't1', position: 0 })
      const t2 = mockTask({ id: 't2', position: 1 })
      await repo.create(t1)
      await repo.create(t2)

      await repo.reorder(['t2', 't1'])
      const first = await repo.getById('t2')
      const second = await repo.getById('t1')

      expect(first?.position).toBe(0)
      expect(second?.position).toBe(1)
    })
  })

  describe('with encryption', () => {
    it('encrypts title on create', async () => {
      const task = mockTask({ title: 'Secret task' })
      const id = await repoEncrypted.create(task)

      const raw = await db.tasks.get(id)
      expect(raw?.title).not.toBe('Secret task')
      expect(raw?.title.length).toBeGreaterThan(0)
    })

    it('decrypts title on read', async () => {
      const task = mockTask({ title: 'Secret task' })
      const id = await repoEncrypted.create(task)

      const retrieved = await repoEncrypted.getById(id)
      expect(retrieved?.title).toBe('Secret task')
    })

    it('cannot read encrypted data without password', async () => {
      const task = mockTask({ title: 'Secret task' })
      const id = await repoEncrypted.create(task)

      const unencrypted = new TaskRepository(db)
      const retrieved = await unencrypted.getById(id)
      expect(retrieved?.title).not.toBe('Secret task')
    })
  })
})
