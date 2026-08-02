import type { Task } from '@/domain/entities/task'
import type { PlannedSubTask } from '@/app/contexts/usePlanningState'

const FIXED_DATE = '2026-06-24T00:00:00Z'

export function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    parent_id: null,
    title: 'Test task',
    status: 'inbox',
    essential: false,
    energy_cost: null,
    postponed: false,
    position: 0,
    scheduled_date: null,
    scheduled_start: null,
    scheduled_end: null,
    created_at: FIXED_DATE,
    updated_at: FIXED_DATE,
    completed_at: null,
    ...overrides,
  }
}

export function makeSubTask(overrides: Partial<Task> = {}): Task {
  return makeTask({
    id: 'st-1',
    parent_id: 'task-1',
    title: 'Ouvrir le template',
    ...overrides,
  })
}

export function makePlannedSubTask(overrides: Partial<PlannedSubTask> = {}): PlannedSubTask {
  return {
    ...makeSubTask({ id: 'sub-1', parent_id: 'parent-1', title: 'Ranger le bureau' }),
    parentTitle: 'Rangement',
    ...overrides,
  }
}
