import { describe, it, expect } from 'vitest'
import { generateOccurrenceDates, nextOccurrenceAfter, isValidRecurrence } from './taskRecurrenceRules'
import { makeTaskRecurrence } from '@/test/factories'

describe('taskRecurrenceRules', () => {
  describe('generateOccurrenceDates', () => {
    it('génère des occurrences quotidiennes avec intervalle 1', () => {
      const recurrence = makeTaskRecurrence({ frequency: 'daily', interval: 1 })
      const dates = generateOccurrenceDates(recurrence, '2026-08-10', '2026-08-10', '2026-08-13')
      expect(dates).toEqual(['2026-08-10', '2026-08-11', '2026-08-12', '2026-08-13'])
    })

    it('respecte un intervalle quotidien de 2 (un jour sur deux)', () => {
      const recurrence = makeTaskRecurrence({ frequency: 'daily', interval: 2 })
      const dates = generateOccurrenceDates(recurrence, '2026-08-10', '2026-08-10', '2026-08-16')
      expect(dates).toEqual(['2026-08-10', '2026-08-12', '2026-08-14', '2026-08-16'])
    })

    it('génère les occurrences hebdomadaires sur plusieurs jours de semaine', () => {
      // 2026-08-10 = lundi
      const recurrence = makeTaskRecurrence({ frequency: 'weekly', interval: 1, weekdays: [1, 3, 5] })
      const dates = generateOccurrenceDates(recurrence, '2026-08-10', '2026-08-10', '2026-08-23')
      expect(dates).toEqual(['2026-08-10', '2026-08-12', '2026-08-14', '2026-08-17', '2026-08-19', '2026-08-21'])
    })

    it('respecte un intervalle hebdomadaire de 2 (une semaine sur deux)', () => {
      const recurrence = makeTaskRecurrence({ frequency: 'weekly', interval: 2, weekdays: [1] })
      const dates = generateOccurrenceDates(recurrence, '2026-08-10', '2026-08-10', '2026-09-07')
      expect(dates).toEqual(['2026-08-10', '2026-08-24', '2026-09-07'])
    })

    it('génère les occurrences mensuelles au même quantième', () => {
      const recurrence = makeTaskRecurrence({ frequency: 'monthly', interval: 1 })
      const dates = generateOccurrenceDates(recurrence, '2026-08-15', '2026-08-15', '2026-11-15')
      expect(dates).toEqual(['2026-08-15', '2026-09-15', '2026-10-15', '2026-11-15'])
    })

    it('ne produit aucune occurrence les mois trop courts pour le quantième', () => {
      const recurrence = makeTaskRecurrence({ frequency: 'monthly', interval: 1 })
      const dates = generateOccurrenceDates(recurrence, '2026-01-31', '2026-01-31', '2026-05-31')
      expect(dates).toEqual(['2026-01-31', '2026-03-31', '2026-05-31'])
    })

    it('génère les occurrences annuelles', () => {
      const recurrence = makeTaskRecurrence({ frequency: 'yearly', interval: 1 })
      const dates = generateOccurrenceDates(recurrence, '2026-08-10', '2026-08-10', '2029-08-10')
      expect(dates).toEqual(['2026-08-10', '2027-08-10', '2028-08-10', '2029-08-10'])
    })

    it('arrête à la date de fin (end_type: date)', () => {
      const recurrence = makeTaskRecurrence({ frequency: 'daily', interval: 1, end_type: 'date', end_date: '2026-08-12' })
      const dates = generateOccurrenceDates(recurrence, '2026-08-10', '2026-08-10', '2026-08-20')
      expect(dates).toEqual(['2026-08-10', '2026-08-11', '2026-08-12'])
    })

    it('arrête après N occurrences (end_type: count), comptées depuis l\'ancre', () => {
      const recurrence = makeTaskRecurrence({ frequency: 'daily', interval: 1, end_type: 'count', end_count: 3 })
      const dates = generateOccurrenceDates(recurrence, '2026-08-10', '2026-08-10', '2026-08-20')
      expect(dates).toEqual(['2026-08-10', '2026-08-11', '2026-08-12'])
    })

    it('ne renvoie que les occurrences dans la fenêtre demandée, même si le comptage part de l\'ancre', () => {
      const recurrence = makeTaskRecurrence({ frequency: 'daily', interval: 1, end_type: 'count', end_count: 5 })
      const dates = generateOccurrenceDates(recurrence, '2026-08-10', '2026-08-12', '2026-08-13')
      expect(dates).toEqual(['2026-08-12', '2026-08-13'])
    })

    it('retourne un tableau vide si la fenêtre précède l\'ancre', () => {
      const recurrence = makeTaskRecurrence({ frequency: 'daily', interval: 1 })
      const dates = generateOccurrenceDates(recurrence, '2026-08-10', '2026-08-01', '2026-08-09')
      expect(dates).toEqual([])
    })
  })

  describe('nextOccurrenceAfter', () => {
    it('retourne la prochaine occurrence après une date donnée', () => {
      const recurrence = makeTaskRecurrence({ frequency: 'weekly', interval: 1, weekdays: [1] })
      expect(nextOccurrenceAfter(recurrence, '2026-08-10', '2026-08-10')).toBe('2026-08-17')
    })

    it('retourne null si la série est terminée', () => {
      const recurrence = makeTaskRecurrence({ frequency: 'daily', interval: 1, end_type: 'date', end_date: '2026-08-10' })
      expect(nextOccurrenceAfter(recurrence, '2026-08-10', '2026-08-10')).toBeNull()
    })
  })

  describe('isValidRecurrence', () => {
    it('accepte une règle valide', () => {
      expect(isValidRecurrence(makeTaskRecurrence())).toBe(true)
    })

    it('rejette un intervalle non entier ou nul', () => {
      expect(isValidRecurrence(makeTaskRecurrence({ interval: 0 }))).toBe(false)
      expect(isValidRecurrence(makeTaskRecurrence({ interval: 1.5 }))).toBe(false)
    })

    it('rejette des jours de semaine hors bornes', () => {
      expect(isValidRecurrence(makeTaskRecurrence({ weekdays: [7] }))).toBe(false)
      expect(isValidRecurrence(makeTaskRecurrence({ weekdays: [-1] }))).toBe(false)
    })

    it('rejette une fin par date sans date', () => {
      expect(isValidRecurrence(makeTaskRecurrence({ end_type: 'date', end_date: null }))).toBe(false)
    })

    it('rejette une fin par nombre sans nombre positif', () => {
      expect(isValidRecurrence(makeTaskRecurrence({ end_type: 'count', end_count: null }))).toBe(false)
      expect(isValidRecurrence(makeTaskRecurrence({ end_type: 'count', end_count: 0 }))).toBe(false)
    })
  })
})
