import type { Routine, RoutineType } from '@/domain/entities/routine'
import type { RoutineStep } from '@/domain/entities/routineStep'

export function createRoutine(
  id: string,
  name: string,
  type: RoutineType,
  durationMinutes: number,
  now: string,
): Routine {
  return {
    id,
    name,
    type,
    duration_minutes: durationMinutes,
    scheduled_date: null,
    scheduled_start: null,
    created_at: now,
    updated_at: now,
  }
}

export function createRoutineStep(
  id: string,
  routineId: string,
  title: string,
  position: number,
  now: string,
): RoutineStep {
  return { id, routine_id: routineId, title, position, is_completed: false, created_at: now }
}

export function scheduleRoutine(routine: Routine, date: string, start: string, now: string): Routine {
  return { ...routine, scheduled_date: date, scheduled_start: start, updated_at: now }
}

export function toggleRoutineStep(step: RoutineStep): RoutineStep {
  return { ...step, is_completed: !step.is_completed }
}
