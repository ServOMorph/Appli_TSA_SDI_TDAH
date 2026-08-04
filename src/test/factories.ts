import type { Task } from '@/domain/entities/task'
import type { TaskRecurrence } from '@/domain/entities/taskRecurrence'
import type { TaskException } from '@/domain/entities/taskException'
import type { PlannedSubTask } from '@/app/contexts/usePlanningState'

const FIXED_DATE = '2026-06-24T00:00:00Z'

export function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    parent_id: null,
    title: 'Test task',
    description: '',
    status: 'inbox',
    essential: false,
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

export function makeTaskRecurrence(overrides: Partial<TaskRecurrence> = {}): TaskRecurrence {
  return {
    id: 'recurrence-1',
    frequency: 'weekly',
    interval: 1,
    weekdays: [1],
    end_type: 'never',
    end_date: null,
    end_count: null,
    created_at: FIXED_DATE,
    updated_at: FIXED_DATE,
    ...overrides,
  }
}

export function makeTaskException(overrides: Partial<TaskException> = {}): TaskException {
  return {
    id: 'exception-1',
    recurrence_id: 'recurrence-1',
    occurrence_date: '2026-08-10',
    created_at: FIXED_DATE,
    ...overrides,
  }
}

export function makePlannedSubTask(overrides: Partial<PlannedSubTask> = {}): PlannedSubTask {
  return {
    ...makeSubTask({ id: 'sub-1', parent_id: 'parent-1', title: 'Ranger le bureau' }),
    parentTitle: 'Rangement',
    ...overrides,
  }
}
