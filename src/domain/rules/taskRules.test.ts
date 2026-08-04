import { describe, it, expect } from 'vitest'
import {
  createTask,
  completeTask,
  uncompleteTask,
  toggleTaskCompletion,
  scheduleTask,
  reportTask,
  renameTask,
  toggleEssential,
  setEnergyCost,
  isCompleted,
  isSubTask,
  getSubTasks,
  getSubTaskCounts,
  getRemainingPlannedCost,
  sortByPosition,
  nextPosition,
  taskSlotRange,
  taskOccupiesSlot,
} from './taskRules'
import type { Task } from '@/domain/entities/task'

const now = '2026-06-29T10:00:00Z'

const mockTask = (overrides?: Partial<Task>): Task => ({
  ...createTask('task-1', 'Test task', 'today', false, now),
  ...overrides,
})

describe('taskRules', () => {
  describe('createTask', () => {
    it('crée une tâche principale avec les valeurs par défaut', () => {
      expect(createTask('id-1', 'My task', 'inbox', true, now)).toEqual({
        id: 'id-1',
        parent_id: null,
        title: 'My task',
        description: '',
        status: 'inbox',
        essential: true,
        energy_cost: null,
        postponed: false,
        position: 0,
        scheduled_date: null,
        scheduled_start: null,
        scheduled_end: null,
        duration_minutes: null,
        icon: null,
        color: null,
        recurrence_id: null,
        is_recurrence_root: false,
        recurrence_exception: false,
        created_at: now,
        updated_at: now,
        completed_at: null,
      })
    })

    it('crée une sous-étape rattachée à sa tâche parente', () => {
      const subTask = createTask('id-2', 'Étape', 'inbox', false, now, 'id-1', 3)
      expect(subTask.parent_id).toBe('id-1')
      expect(subTask.position).toBe(3)
    })

    it('crée une tâche planifiée', () => {
      const task = createTask('id-1', 'Scheduled task', 'planned', false, now)
      expect(task.status).toBe('planned')
      expect(task.essential).toBe(false)
    })
  })

  describe('hiérarchie', () => {
    it('distingue une sous-étape d une tâche principale', () => {
      expect(isSubTask(createTask('a', 'A', 'inbox', false, now))).toBe(false)
      expect(isSubTask(createTask('b', 'B', 'inbox', false, now, 'a'))).toBe(true)
    })

    it('retourne les sous-étapes d une tâche triées par position', () => {
      const tasks = [
        mockTask({ id: 'root' }),
        mockTask({ id: 'c', parent_id: 'root', position: 2 }),
        mockTask({ id: 'a', parent_id: 'root', position: 0 }),
        mockTask({ id: 'b', parent_id: 'root', position: 1 }),
        mockTask({ id: 'other', parent_id: 'autre' }),
      ]
      expect(getSubTasks(tasks, 'root').map((t) => t.id)).toEqual(['a', 'b', 'c'])
    })

    it('compte les sous-étapes terminées', () => {
      const subTasks = [
        mockTask({ status: 'completed' }),
        mockTask({ status: 'inbox' }),
        mockTask({ status: 'planned' }),
      ]
      expect(getSubTaskCounts(subTasks)).toEqual({ done: 1, total: 3 })
    })

    it('retourne 0/0 sans sous-étape', () => {
      expect(getSubTaskCounts([])).toEqual({ done: 0, total: 0 })
    })
  })

  describe('taskSlotRange', () => {
    function planned(start: string | null, end: string | null): Task {
      return mockTask({
        status: 'planned',
        scheduled_date: '2026-07-18',
        scheduled_start: start,
        scheduled_end: end,
      })
    }

    it('retourne null si aucun début planifié', () => {
      expect(taskSlotRange(planned(null, null))).toBeNull()
    })

    it('couvre un seul créneau pour une plage de 30 minutes', () => {
      expect(taskSlotRange(planned('10:00', '10:30'))).toEqual({ start: 20, end: 20 })
    })

    it('couvre plusieurs créneaux pour une plage plus longue', () => {
      expect(taskSlotRange(planned('10:00', '12:00'))).toEqual({ start: 20, end: 23 })
    })

    it('retombe sur le créneau de début si la fin est absente', () => {
      expect(taskSlotRange(planned('08:30', null))).toEqual({ start: 17, end: 17 })
    })

    it('ne descend jamais sous le créneau de début si la fin est antérieure', () => {
      expect(taskSlotRange(planned('10:00', '09:00'))).toEqual({ start: 20, end: 20 })
    })
  })

  describe('taskOccupiesSlot', () => {
    const task = mockTask({
      status: 'planned',
      scheduled_date: '2026-07-18',
      scheduled_start: '10:00',
      scheduled_end: '11:30',
    })

    it('occupe tous les créneaux de la plage', () => {
      expect(taskOccupiesSlot(task, 20)).toBe(true)
      expect(taskOccupiesSlot(task, 21)).toBe(true)
      expect(taskOccupiesSlot(task, 22)).toBe(true)
    })

    it("n'occupe pas les créneaux hors plage", () => {
      expect(taskOccupiesSlot(task, 19)).toBe(false)
      expect(taskOccupiesSlot(task, 23)).toBe(false)
    })

    it('retourne false pour une tâche non planifiée', () => {
      expect(taskOccupiesSlot(mockTask({ status: 'inbox' }), 20)).toBe(false)
    })
  })

  describe('completeTask', () => {
    it('marque la tâche terminée et horodate', () => {
      const completed = completeTask(mockTask(), now)
      expect(completed.status).toBe('completed')
      expect(completed.completed_at).toBe(now)
      expect(completed.updated_at).toBe(now)
      expect(isCompleted(completed)).toBe(true)
    })

    it('ne mute pas la tâche source', () => {
      const task = mockTask()
      const original = { ...task }
      completeTask(task, now)
      expect(task).toEqual(original)
    })
  })

  describe('uncompleteTask', () => {
    it('rétablit le statut planifié quand la tâche porte un créneau', () => {
      const task = mockTask({
        status: 'completed',
        completed_at: now,
        scheduled_date: '2026-06-30',
        scheduled_start: '10:00',
        scheduled_end: '10:30',
      })

      expect(uncompleteTask(task, '2026-06-30T11:00:00Z')).toMatchObject({
        status: 'planned',
        completed_at: null,
        scheduled_date: '2026-06-30',
        scheduled_start: '10:00',
        scheduled_end: '10:30',
      })
    })

    it('renvoie en réception une tâche sans créneau', () => {
      const task = mockTask({ status: 'completed', completed_at: now })
      expect(uncompleteTask(task, now).status).toBe('inbox')
    })
  })

  describe('toggleTaskCompletion', () => {
    it('termine une tâche en cours', () => {
      expect(toggleTaskCompletion(mockTask({ status: 'planned' }), now).status).toBe('completed')
    })

    it('réactive une tâche terminée sans modifier son créneau', () => {
      const task = mockTask({
        status: 'completed',
        completed_at: now,
        scheduled_date: '2026-06-30',
        scheduled_start: '10:00',
        scheduled_end: '10:30',
      })

      expect(toggleTaskCompletion(task, '2026-06-30T11:00:00Z')).toMatchObject({
        status: 'planned',
        completed_at: null,
        scheduled_start: '10:00',
      })
    })
  })

  describe('scheduleTask', () => {
    it('planifie une tâche à une date et un créneau', () => {
      const scheduled = scheduleTask(mockTask({ status: 'inbox' }), '2026-06-30', '10:00', '11:00', now)
      expect(scheduled.status).toBe('planned')
      expect(scheduled.scheduled_date).toBe('2026-06-30')
      expect(scheduled.scheduled_start).toBe('10:00')
      expect(scheduled.scheduled_end).toBe('11:00')
    })

    it('efface le marqueur de report', () => {
      const task = mockTask({ status: 'planned', postponed: true })
      expect(scheduleTask(task, '2026-06-30', '10:00', '11:00', now).postponed).toBe(false)
    })
  })

  describe('reportTask', () => {
    it('replanifie en marquant la tâche comme reportée', () => {
      const task = mockTask({
        status: 'planned',
        scheduled_date: '2026-07-07',
        scheduled_start: '10:00',
        scheduled_end: '11:00',
      })
      const reported = reportTask(task, '2026-07-08', '14:00', '15:00', now)
      expect(reported.scheduled_date).toBe('2026-07-08')
      expect(reported.scheduled_start).toBe('14:00')
      expect(reported.scheduled_end).toBe('15:00')
      expect(reported.postponed).toBe(true)
      expect(reported.updated_at).toBe(now)
    })
  })

  describe('renameTask', () => {
    it('met à jour le titre et updated_at', () => {
      const renamed = renameTask(mockTask({ title: 'Old title' }), 'New title', '2026-07-08T09:00:00Z')
      expect(renamed.title).toBe('New title')
      expect(renamed.updated_at).toBe('2026-07-08T09:00:00Z')
    })
  })

  describe('toggleEssential', () => {
    it('bascule de obligatoire à facultatif', () => {
      expect(toggleEssential(mockTask({ essential: true }), now).essential).toBe(false)
    })

    it('bascule de facultatif à obligatoire', () => {
      expect(toggleEssential(mockTask({ essential: false }), now).essential).toBe(true)
    })
  })

  describe('setEnergyCost', () => {
    it('accepte une valeur valide entre 1 et 12', () => {
      expect(setEnergyCost(mockTask(), 5, now).energy_cost).toBe(5)
    })

    it('accepte null (aucune valeur imposée)', () => {
      expect(setEnergyCost(mockTask({ energy_cost: 5 }), null, now).energy_cost).toBeNull()
    })

    it('ignore une valeur hors bornes', () => {
      expect(setEnergyCost(mockTask(), 13, now).energy_cost).toBeNull()
    })

    it('ignore une valeur non entière', () => {
      expect(setEnergyCost(mockTask(), 3.5, now).energy_cost).toBeNull()
    })
  })

  describe('getRemainingPlannedCost', () => {
    const planned = (overrides: Partial<Task>) => mockTask({ status: 'planned', ...overrides })

    it('somme le coût des tâches planifiées', () => {
      expect(getRemainingPlannedCost([planned({ energy_cost: 3 }), planned({ energy_cost: 5 })])).toBe(8)
    })

    it('exclut les tâches terminées', () => {
      const tasks = [planned({ energy_cost: 3 }), planned({ energy_cost: 5, status: 'completed' })]
      expect(getRemainingPlannedCost(tasks)).toBe(3)
    })

    it('exclut les tâches non planifiées', () => {
      const tasks = [planned({ energy_cost: 3 }), planned({ energy_cost: 5, status: 'inbox' })]
      expect(getRemainingPlannedCost(tasks)).toBe(3)
    })

    it('traite un coût absent comme 0', () => {
      expect(getRemainingPlannedCost([planned({ energy_cost: null }), planned({ energy_cost: 4 })])).toBe(4)
    })

    it('retourne 0 pour une liste vide', () => {
      expect(getRemainingPlannedCost([])).toBe(0)
    })
  })

  describe('sortByPosition', () => {
    it('trie par position croissante', () => {
      const items = [mockTask({ position: 2 }), mockTask({ position: 0 }), mockTask({ position: 1 })]
      expect(sortByPosition(items).map((t) => t.position)).toEqual([0, 1, 2])
    })

    it('ne mute pas la liste source', () => {
      const items = [mockTask({ position: 2 }), mockTask({ position: 0 })]
      const original = [...items]
      sortByPosition(items)
      expect(items).toEqual(original)
    })
  })

  describe('nextPosition', () => {
    it('retourne 0 pour une liste vide', () => {
      expect(nextPosition([])).toBe(0)
    })

    it('retourne la position max + 1', () => {
      expect(nextPosition([{ position: 5 }, { position: 3 }, { position: 2 }])).toBe(6)
    })
  })
})
