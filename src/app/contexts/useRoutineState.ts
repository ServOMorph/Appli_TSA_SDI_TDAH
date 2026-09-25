import { useCallback, useState } from 'react'
import {
  newId,
  routineRepo,
  routineScheduleRepo,
  routineStepRepo,
  routineStepCompletionRepo,
} from '@/app/repositories'
import {
  createRoutineStep as createRoutineStepRule,
  isRoutineOccurrenceCompleted,
  resolveRoutineStepsForWeekday,
} from '@/domain/rules/routineRules'
import { weekdayOf } from '@/domain/rules/planningSlotRules'
import type { Routine } from '@/domain/entities/routine'
import type { RoutineStep } from '@/domain/entities/routineStep'
import type { RoutineSchedule } from '@/domain/entities/routineSchedule'

export interface PlannedRoutineOccurrence {
  scheduleId: string
  routineId: string
  routineName: string
  color: string | null
  time: string
  completed: boolean
}

export function useRoutineState() {
  const [routines, setRoutines] = useState<Routine[]>([])
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null)

  async function load() {
    setRoutines(await routineRepo.getAll())
  }

  function reset() {
    setRoutines([])
    setSelectedRoutineId(null)
  }

  async function renameRoutine(id: string, name: string) {
    const trimmed = name.trim()
    if (!trimmed) return
    const routine = routines.find((r) => r.id === id)
    if (!routine) return
    const updated = { ...routine, name: trimmed, updated_at: new Date().toISOString() }
    await routineRepo.update(updated)
    setRoutines((prev) => prev.map((r) => (r.id === id ? updated : r)))
  }

  async function updateRoutineColor(id: string, color: string | null) {
    const routine = routines.find((r) => r.id === id)
    if (!routine) return
    const updated = { ...routine, color, updated_at: new Date().toISOString() }
    await routineRepo.update(updated)
    setRoutines((prev) => prev.map((r) => (r.id === id ? updated : r)))
  }

  const getRoutineSteps = useCallback(async (routineId: string): Promise<RoutineStep[]> => {
    const all = await routineStepRepo.getByRoutineId(routineId)
    return all.filter((s) => s.weekday === null)
  }, [])

  async function addRoutineStep(routineId: string, title: string, durationMinutes: number | null, weekday: number | null = null) {
    const trimmed = title.trim()
    if (!trimmed) return
    const existing = (await routineStepRepo.getByRoutineId(routineId)).filter((s) => s.weekday === weekday)
    const now = new Date().toISOString()
    const step = createRoutineStepRule(newId(), routineId, trimmed, existing.length, now, durationMinutes, weekday)
    await routineStepRepo.create(step)
  }

  async function updateRoutineStep(id: string, title: string, durationMinutes: number | null) {
    const trimmed = title.trim()
    if (!trimmed) return
    const step = await routineStepRepo.getById(id)
    if (!step) return
    await routineStepRepo.update({ ...step, title: trimmed, duration_minutes: durationMinutes, updated_at: new Date().toISOString() })
  }

  async function deleteRoutineStep(id: string) {
    await routineStepRepo.delete(id)
  }

  async function reorderRoutineSteps(_routineId: string, ids: string[]) {
    await routineStepRepo.reorder(ids)
  }

  const getRoutineSchedules = useCallback(async (routineId: string): Promise<RoutineSchedule[]> => {
    return routineScheduleRepo.getByRoutineId(routineId)
  }, [])

  async function setRoutineDaySchedule(routineId: string, weekday: number, time: string) {
    const existing = await routineScheduleRepo.getByRoutineId(routineId)
    const current = existing.find((s) => s.weekday === weekday)
    const now = new Date().toISOString()
    if (current) {
      await routineScheduleRepo.update({ ...current, time, updated_at: now })
    } else {
      await routineScheduleRepo.create({
        id: newId(),
        routine_id: routineId,
        weekday,
        time,
        steps_overridden: false,
        created_at: now,
        updated_at: now,
      })
    }
  }

  async function removeRoutineDaySchedule(id: string) {
    const schedule = await routineScheduleRepo.getById(id)
    if (schedule?.steps_overridden) {
      const daySteps = (await routineStepRepo.getByRoutineId(schedule.routine_id)).filter((s) => s.weekday === schedule.weekday)
      const dayStepIds = daySteps.map((s) => s.id)
      await routineStepCompletionRepo.deleteByStepIds(dayStepIds)
      await routineStepRepo.deleteMany(dayStepIds)
    }
    await routineScheduleRepo.delete(id)
  }

  const resolveEffectiveSteps = useCallback(
    async (routineId: string, weekday: number): Promise<{ steps: RoutineStep[]; overridden: boolean }> => {
      const [allSteps, schedules] = await Promise.all([
        routineStepRepo.getByRoutineId(routineId),
        routineScheduleRepo.getByRoutineId(routineId),
      ])
      const overridden = schedules.find((s) => s.weekday === weekday)?.steps_overridden ?? false
      return { steps: resolveRoutineStepsForWeekday(allSteps, weekday, overridden), overridden }
    },
    [],
  )

  const getRoutineCompletionForDate = useCallback(
    async (routineId: string, date: string): Promise<boolean> => {
      const [{ steps }, completions] = await Promise.all([
        resolveEffectiveSteps(routineId, weekdayOf(date)),
        routineStepCompletionRepo.getByRoutineAndDate(routineId, date),
      ])
      const completedIds = new Set(completions.map((c) => c.routine_step_id))
      return isRoutineOccurrenceCompleted(steps.map((s) => s.id), completedIds)
    },
    [resolveEffectiveSteps],
  )

  const getRoutineStepsForDate = useCallback(
    async (routineId: string, date: string): Promise<{ steps: RoutineStep[]; overridden: boolean }> => {
      return resolveEffectiveSteps(routineId, weekdayOf(date))
    },
    [resolveEffectiveSteps],
  )

  async function detachRoutineDay(routineId: string, weekday: number, date: string) {
    const schedules = await routineScheduleRepo.getByRoutineId(routineId)
    const schedule = schedules.find((s) => s.weekday === weekday)
    if (!schedule || schedule.steps_overridden) return
    const [commonSteps, completions] = await Promise.all([
      routineStepRepo.getByRoutineId(routineId).then((steps) => steps.filter((s) => s.weekday === null)),
      routineStepCompletionRepo.getByRoutineAndDate(routineId, date),
    ])
    const completedCommonIds = new Set(completions.map((c) => c.routine_step_id))
    const now = new Date().toISOString()
    for (const step of commonSteps) {
      const clonedId = newId()
      await routineStepRepo.create({ ...step, id: clonedId, weekday, created_at: now, updated_at: now })
      if (completedCommonIds.has(step.id)) {
        await routineStepCompletionRepo.create({
          id: newId(),
          routine_step_id: clonedId,
          routine_id: routineId,
          date,
          created_at: now,
        })
      }
    }
    await routineScheduleRepo.update({ ...schedule, steps_overridden: true, updated_at: now })
  }

  async function reattachRoutineDay(routineId: string, weekday: number) {
    const schedules = await routineScheduleRepo.getByRoutineId(routineId)
    const schedule = schedules.find((s) => s.weekday === weekday)
    if (!schedule || !schedule.steps_overridden) return
    const daySteps = (await routineStepRepo.getByRoutineId(routineId)).filter((s) => s.weekday === weekday)
    const dayStepIds = daySteps.map((s) => s.id)
    await routineStepCompletionRepo.deleteByStepIds(dayStepIds)
    await routineStepRepo.deleteMany(dayStepIds)
    await routineScheduleRepo.update({ ...schedule, steps_overridden: false, updated_at: new Date().toISOString() })
  }

  const getRoutineStepCompletionsForDate = useCallback(async (routineId: string, date: string): Promise<Set<string>> => {
    const completions = await routineStepCompletionRepo.getByRoutineAndDate(routineId, date)
    return new Set(completions.map((c) => c.routine_step_id))
  }, [])

  async function toggleRoutineStepCompletion(routineId: string, stepId: string, date: string) {
    const completions = await routineStepCompletionRepo.getByRoutineAndDate(routineId, date)
    const existing = completions.find((c) => c.routine_step_id === stepId)
    if (existing) {
      await routineStepCompletionRepo.delete(existing.id)
    } else {
      await routineStepCompletionRepo.create({
        id: newId(),
        routine_step_id: stepId,
        routine_id: routineId,
        date,
        created_at: new Date().toISOString(),
      })
    }
  }

  const getPlannedRoutinesForDate = useCallback(async (date: string): Promise<PlannedRoutineOccurrence[]> => {
    const schedules = await routineScheduleRepo.getByWeekday(weekdayOf(date))
    const occurrences = await Promise.all(
      schedules.map(async (schedule): Promise<PlannedRoutineOccurrence | null> => {
        const routine = await routineRepo.getById(schedule.routine_id)
        if (!routine) return null
        return {
          scheduleId: schedule.id,
          routineId: schedule.routine_id,
          routineName: routine.name,
          color: routine.color,
          time: schedule.time,
          completed: await getRoutineCompletionForDate(schedule.routine_id, date),
        }
      }),
    )
    return occurrences.filter((o): o is PlannedRoutineOccurrence => o !== null)
  }, [getRoutineCompletionForDate])

  return {
    routines,
    selectedRoutineId,
    selectRoutine: setSelectedRoutineId,
    renameRoutine,
    updateRoutineColor,
    getRoutineSteps,
    addRoutineStep,
    updateRoutineStep,
    deleteRoutineStep,
    reorderRoutineSteps,
    getRoutineSchedules,
    setRoutineDaySchedule,
    removeRoutineDaySchedule,
    getPlannedRoutinesForDate,
    getRoutineStepCompletionsForDate,
    toggleRoutineStepCompletion,
    getRoutineStepsForDate,
    detachRoutineDay,
    reattachRoutineDay,
    load,
    reset,
  }
}
