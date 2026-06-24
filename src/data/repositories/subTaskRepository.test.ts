import { beforeEach, describe, it, expect } from 'vitest'
import { AppDatabase } from '@/data/db'
import { SubTaskRepository } from './subTaskRepository'
import type { SubTask } from '@/domain/entities/subTask'

let db: AppDatabase
let repo: SubTaskRepository
let repoEncrypted: SubTaskRepository
let testCount = 0

beforeEach(() => {
  db = new AppDatabase(`subtask-repo-test-${++testCount}`)
  repo = new SubTaskRepository(db)
  repoEncrypted = new SubTaskRepository(db, 'test-password')
})

describe('SubTaskRepository', () => {
  const mockSubTask = (overrides?: Partial<SubTask>): SubTask => ({
    id: 'subtask-1',
    task_id: 'task-1',
    title: 'Subtask',
    is_completed: false,
    position: 0,
    ...overrides,
  })

  describe('without encryption', () => {
    it('creates and retrieves subtask', async () => {
      const subTask = mockSubTask()
      const id = await repo.create(subTask)
      const retrieved = await repo.getById(id)
      expect(retrieved).toEqual(subTask)
    })

    it('updates subtask', async () => {
      const subTask = mockSubTask()
      await repo.create(subTask)
      const updated = mockSubTask({ is_completed: true })
      await repo.update(updated)
      const retrieved = await repo.getById(subTask.id)
      expect(retrieved?.is_completed).toBe(true)
    })

    it('deletes subtask', async () => {
      const subTask = mockSubTask()
      await repo.create(subTask)
      await repo.delete(subTask.id)
      const retrieved = await repo.getById(subTask.id)
      expect(retrieved).toBeUndefined()
    })

    it('gets subtasks by task_id', async () => {
      await repo.create(mockSubTask({ id: 'st1', task_id: 'task-1' }))
      await repo.create(mockSubTask({ id: 'st2', task_id: 'task-1' }))
      await repo.create(mockSubTask({ id: 'st3', task_id: 'task-2' }))

      const subTasks = await repo.getByTaskId('task-1')
      expect(subTasks).toHaveLength(2)
    })
  })

  describe('with encryption', () => {
    it('encrypts title on create', async () => {
      const subTask = mockSubTask({ title: 'Secret subtask' })
      const id = await repoEncrypted.create(subTask)

      const raw = await db.subTasks.get(id)
      expect(raw?.title).not.toBe('Secret subtask')
    })

    it('decrypts title on read', async () => {
      const subTask = mockSubTask({ title: 'Secret subtask' })
      const id = await repoEncrypted.create(subTask)

      const retrieved = await repoEncrypted.getById(id)
      expect(retrieved?.title).toBe('Secret subtask')
    })
  })
})
