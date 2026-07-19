import { describe, it, expect } from 'vitest'
import { scheduleSubTask, reportSubTask, renameSubTask } from './subTaskRules'
import type { SubTask } from '@/domain/entities/subTask'

describe('subTaskRules', () => {
  const baseSubTask: SubTask = {
    id: 'st-1',
    task_id: 'task-1',
    title: 'Ranger le bureau',
    is_completed: false,
    position: 0,
    scheduled_date: null,
    scheduled_start: null,
    scheduled_end: null,
  }

  describe('scheduleSubTask', () => {
    it('schedules the sub-task to a specific date and slot', () => {
      const scheduled = scheduleSubTask(baseSubTask, '2026-07-20', '10:00', '10:30')
      expect(scheduled.scheduled_date).toBe('2026-07-20')
      expect(scheduled.scheduled_start).toBe('10:00')
      expect(scheduled.scheduled_end).toBe('10:30')
      expect(scheduled.postponed).toBe(false)
    })

    it('clears the postponed flag', () => {
      const postponed: SubTask = { ...baseSubTask, postponed: true }
      const scheduled = scheduleSubTask(postponed, '2026-07-20', '10:00', '10:30')
      expect(scheduled.postponed).toBe(false)
    })
  })

  describe('reportSubTask', () => {
    it('reschedules and marks as postponed', () => {
      const reported = reportSubTask(baseSubTask, '2026-07-21', '11:00', '11:30')
      expect(reported.scheduled_date).toBe('2026-07-21')
      expect(reported.postponed).toBe(true)
    })
  })

  describe('renameSubTask', () => {
    it('updates the title only', () => {
      const renamed = renameSubTask(baseSubTask, 'Nouveau titre')
      expect(renamed.title).toBe('Nouveau titre')
      expect(renamed.id).toBe(baseSubTask.id)
    })
  })
})
