import { beforeEach, describe, it, expect } from 'vitest'
import { AppDatabase } from '@/data/db'
import { TaskRepository } from './taskRepository'
import type { Task } from '@/domain/entities/task'
import { makeTask } from '@/test/factories'

let db: AppDatabase
let repo: TaskRepository
let testCount = 0

beforeEach(() => {
  db = new AppDatabase(`task-repo-test-${++testCount}`)
  repo = new TaskRepository(db)
})

describe('TaskRepository', () => {
  const mockTask = (overrides?: Partial<Task>): Task => makeTask(overrides)

  describe('CRUD', () => {
    it('creates and retrieves task', async () => {
      const task = mockTask()
      const id = await repo.create(task)
      const retrieved = await repo.getById(id)
      expect(retrieved).toEqual(task)
    })

    it('updates task', async () => {
      const task = mockTask()
      await repo.create(task)
      const updated = mockTask({ title: 'Updated', status: 'planned' })
      await repo.update(updated)
      const retrieved = await repo.getById(task.id)
      expect(retrieved?.title).toBe('Updated')
      expect(retrieved?.status).toBe('planned')
    })

    it('deletes task', async () => {
      const task = mockTask()
      await repo.create(task)
      await repo.delete(task.id)
      const retrieved = await repo.getById(task.id)
      expect(retrieved).toBeUndefined()
    })

    it('gets tasks by status', async () => {
      await repo.create(mockTask({ id: 't1', status: 'planned' }))
      await repo.create(mockTask({ id: 't2', status: 'planned' }))
      await repo.create(mockTask({ id: 't3', status: 'inbox' }))

      const plannedTasks = await repo.getByStatus('planned')
      expect(plannedTasks).toHaveLength(2)
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

  describe('hiérarchie tâche / sous-étape', () => {
    it('exclut les sous-étapes de getByStatus', async () => {
      await repo.create(mockTask({ id: 'root', status: 'inbox' }))
      await repo.create(mockTask({ id: 'child', status: 'inbox', parent_id: 'root' }))

      const roots = await repo.getByStatus('inbox')
      expect(roots.map((t) => t.id)).toEqual(['root'])
    })

    it('retourne les sous-étapes triées par position', async () => {
      await repo.create(mockTask({ id: 'root' }))
      await repo.create(mockTask({ id: 'b', parent_id: 'root', position: 1 }))
      await repo.create(mockTask({ id: 'a', parent_id: 'root', position: 0 }))
      await repo.create(mockTask({ id: 'autre', parent_id: 'root-2', position: 0 }))

      const children = await repo.getChildren('root')
      expect(children.map((t) => t.id)).toEqual(['a', 'b'])
    })

    it('sépare tâches principales et sous-étapes planifiées à une date', async () => {
      await repo.create(mockTask({ id: 'root', status: 'planned', scheduled_date: '2026-07-22' }))
      await repo.create(
        mockTask({ id: 'child', parent_id: 'root', status: 'planned', scheduled_date: '2026-07-22' }),
      )
      await repo.create(mockTask({ id: 'autre-jour', status: 'planned', scheduled_date: '2026-07-23' }))

      expect((await repo.getRootByDate('2026-07-22')).map((t) => t.id)).toEqual(['root'])
      expect((await repo.getChildrenByDate('2026-07-22')).map((t) => t.id)).toEqual(['child'])
    })

    it('supprime une tâche avec toutes ses sous-étapes', async () => {
      await repo.create(mockTask({ id: 'root' }))
      await repo.create(mockTask({ id: 'child-1', parent_id: 'root' }))
      await repo.create(mockTask({ id: 'child-2', parent_id: 'root' }))
      await repo.create(mockTask({ id: 'autre', parent_id: 'root-2' }))

      await repo.deleteWithChildren('root')

      expect(await repo.getById('root')).toBeUndefined()
      expect(await repo.getById('child-1')).toBeUndefined()
      expect(await repo.getById('child-2')).toBeUndefined()
      expect(await repo.getById('autre')).toBeDefined()
    })

    it('retourne les tâches obligatoires', async () => {
      await repo.create(mockTask({ id: 't1', essential: true }))
      await repo.create(mockTask({ id: 't2', essential: false }))

      expect((await repo.getEssentialTasks()).map((t) => t.id)).toEqual(['t1'])
    })
  })
})
