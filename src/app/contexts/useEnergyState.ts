import { useState } from 'react'
import { energyRepo, newId, todayDate } from '@/app/repositories'

export function useEnergyState() {
  const [todayEnergy, setTodayEnergy] = useState<number | null>(null)
  const [todayEnergyStatus, setTodayEnergyStatus] = useState<'filled' | 'skipped' | null>(null)

  async function load() {
    const entry = await energyRepo.getByDate(todayDate())
    setTodayEnergy(entry?.value ?? null)
    setTodayEnergyStatus(entry?.status ?? null)
  }

  function reset() {
    setTodayEnergy(null)
    setTodayEnergyStatus(null)
  }

  async function saveTodayEnergy(value: number) {
    const date = todayDate()
    const existing = await energyRepo.getByDate(date)
    if (existing) {
      await energyRepo.update({ ...existing, value, status: 'filled' })
    } else {
      await energyRepo.create({ id: newId(), value, status: 'filled', entry_date: date })
    }
    setTodayEnergy(value)
    setTodayEnergyStatus('filled')
  }

  async function skipTodayEnergy() {
    const date = todayDate()
    const existing = await energyRepo.getByDate(date)
    if (!existing) {
      await energyRepo.create({ id: newId(), value: null, status: 'skipped', entry_date: date })
    }
    setTodayEnergy(null)
    setTodayEnergyStatus('skipped')
  }

  return {
    todayEnergy,
    todayEnergyStatus,
    saveTodayEnergy,
    skipTodayEnergy,
    load,
    reset,
  }
}
