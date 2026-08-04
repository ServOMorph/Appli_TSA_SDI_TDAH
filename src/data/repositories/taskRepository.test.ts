import { beforeEach, describe, it, expect } from 'vitest'
import { AppDatabase } from '@/data/db'
import { TaskRepository } from './taskRepository'
import type { Task } from '@/domain/entities/task'
import { makeTask } from '@/test/factories'

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
  const mockTask = (overrides?: Partial<Task>): Task => makeTask(overrides)

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

    it('gets active and completed tasks for today', async () => {
      const today = new Date().toISOString()
      await repo.create(mockTask({ id: 't1', status: 'today' }))
      await repo.create(mockTask({ id: 't2', status: 'inbox' }))
      await repo.create(mockTask({ id: 't3', status: 'completed', completed_at: today }))
      await repo.create(mockTask({ id: 't4', status: 'completed', completed_at: '2020-01-01T12:00:00.000Z' }))

      const todayTasks = await repo.getTodayTasks()
      expect(todayTasks.map((task) => task.id)).toEqual(['t1', 't3'])
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

    it('exclut les sous-étapes de getTodayTasks', async () => {
      await repo.create(mockTask({ id: 'root', status: 'today' }))
      await repo.create(mockTask({ id: 'child', status: 'today', parent_id: 'root' }))

      const tasks = await repo.getTodayTasks()
      expect(tasks.map((t) => t.id)).toEqual(['root'])
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

    it('ne réencrypte pas le titre lors du réordonnancement', async () => {
      await repoEncrypted.create(mockTask({ id: 't1', title: 'Première', position: 0 }))
      await repoEncrypted.create(mockTask({ id: 't2', title: 'Seconde', position: 1 }))

      await repoEncrypted.reorder(['t2', 't1'])

      expect((await repoEncrypted.getById('t2'))?.title).toBe('Seconde')
      expect((await repoEncrypted.getById('t1'))?.title).toBe('Première')
    })

    it('chiffre et déchiffre la description', async () => {
      const task = mockTask({ description: 'Notes privées' })
      const id = await repoEncrypted.create(task)

      const raw = await db.tasks.get(id)
      expect(raw?.description).not.toBe('Notes privées')

      const retrieved = await repoEncrypted.getById(id)
      expect(retrieved?.description).toBe('Notes privées')
    })

    it('ne chiffre pas une description vide', async () => {
      const task = mockTask({ description: '' })
      const id = await repoEncrypted.create(task)

      const raw = await db.tasks.get(id)
      expect(raw?.description).toBe('')
    })

    it('déchiffre les titres des sous-étapes', async () => {
      await repoEncrypted.create(mockTask({ id: 'root', title: 'Parent' }))
      await repoEncrypted.create(mockTask({ id: 'child', parent_id: 'root', title: 'Étape secrète' }))

      const children = await repoEncrypted.getChildren('root')
      expect(children.map((t) => t.title)).toEqual(['Étape secrète'])
    })
  })
})
