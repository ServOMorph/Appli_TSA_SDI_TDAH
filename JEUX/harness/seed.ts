import { energyRepo, listRepo, newId, settingsRepo, todayDate, toolRepo, userRepo } from '@/app/repositories'
import { createList } from '@/domain/rules/listRules'
import { createTool } from '@/domain/rules/toolRules'
import type { Settings } from '@/domain/entities/settings'
import type { User } from '@/domain/entities/user'

export async function seedTestDatabase(): Promise<void> {
  const now = new Date().toISOString()

  if (!(await userRepo.getFirst())) {
    const userId = newId()
    const user: User = {
      id: userId,
      profile_type: 'adult',
      onboarding_completed: true,
      created_at: now,
      updated_at: now,
    }
    const settings: Settings = {
      id: newId(),
      user_id: userId,
      dark_mode: false,
      font_size: 'medium',
      reduced_motion: false,
    }
    await userRepo.create(user)
    await settingsRepo.create(settings)
  }

  if ((await toolRepo.getAll()).length === 0) {
    const todoList = createList(newId(), 'To Do', now)
    await listRepo.create(todoList)
    await toolRepo.create(createTool(newId(), 'liste', null, todoList.id, 0, now))
    await toolRepo.create(createTool(newId(), 'tableau_comptage', null, null, 1, now))
  }

  if (!(await energyRepo.getByDate(todayDate()))) {
    await energyRepo.create({ id: newId(), value: null, status: 'skipped', entry_date: todayDate() })
  }
}
