import { describe, it, expect } from 'vitest'
import {
  type NavStack,
  isRootScreen,
  toRoute,
  currentRoute,
  sameRoute,
  push,
  pop,
  replace,
  canGoBack,
  previousRoute,
} from '@/app/navigation'

const dashboard: NavStack = [{ name: 'dashboard' }]

describe('isRootScreen', () => {
  it('reconnaît les écrans qui réinitialisent la pile', () => {
    expect(isRootScreen('dashboard')).toBe(true)
    expect(isRootScreen('welcome')).toBe(true)
    expect(isRootScreen('energy-checkin')).toBe(true)
  })

  it('ne considère pas les écrans de détail comme racines', () => {
    expect(isRootScreen('list-detail')).toBe(false)
    expect(isRootScreen('settings')).toBe(false)
  })
})

describe('toRoute', () => {
  it('accepte un nom d écran nu', () => {
    expect(toRoute('lists')).toEqual({ name: 'lists' })
  })

  it('laisse intacte une route déjà construite', () => {
    expect(toRoute({ name: 'list-detail', listId: 'l1' })).toEqual({ name: 'list-detail', listId: 'l1' })
  })
})

describe('sameRoute', () => {
  it('distingue deux routes de même nom mais de paramètres différents', () => {
    expect(sameRoute({ name: 'list-detail', listId: 'a' }, { name: 'list-detail', listId: 'b' })).toBe(false)
    expect(sameRoute({ name: 'list-detail', listId: 'a' }, { name: 'list-detail', listId: 'a' })).toBe(true)
  })
})

describe('push', () => {
  it('empile un écran non racine', () => {
    const next = push(dashboard, 'lists')
    expect(next).toEqual([{ name: 'dashboard' }, { name: 'lists' }])
  })

  it('réinitialise la pile sur un écran racine', () => {
    const deep = push(push(dashboard, 'lists'), 'list-detail')
    expect(push(deep, 'dashboard')).toEqual([{ name: 'dashboard' }])
  })

  it('ne réempile pas la route déjà courante', () => {
    const next = push(dashboard, 'lists')
    expect(push(next, 'lists')).toBe(next)
  })

  it('empile un écran déjà présent plus bas dans la pile sans collapser', () => {
    const deep = push(push(push(dashboard, 'lists'), 'list-detail'), 'task-create-v2')
    expect(push(deep, 'lists')).toEqual([
      { name: 'dashboard' },
      { name: 'lists' },
      { name: 'list-detail' },
      { name: 'task-create-v2' },
      { name: 'lists' },
    ])
  })

  it('réutilise un écran sans paramètre deux fois dans le même flux sans perdre les niveaux intermédiaires', () => {
    const stack = push(push(push(dashboard, 'task-create-v2'), 'today'), 'task-create-v2')
    expect(currentRoute(pop(stack))).toEqual({ name: 'today' })
  })

  it('conserve les paramètres de route', () => {
    const next = push(dashboard, { name: 'list-detail', listId: 'l1' })
    expect(currentRoute(next)).toEqual({ name: 'list-detail', listId: 'l1' })
  })

  it('empile deux détails distincts du même écran', () => {
    const a = push(dashboard, { name: 'list-detail', listId: 'a' })
    const b = push(a, { name: 'list-detail', listId: 'b' })
    expect(b).toHaveLength(3)
  })
})

describe('pop', () => {
  it('revient d un cran', () => {
    const next = push(dashboard, 'lists')
    expect(pop(next)).toEqual([{ name: 'dashboard' }])
  })

  it('laisse une pile à un seul élément inchangée', () => {
    expect(pop(dashboard)).toBe(dashboard)
  })

  it('traverse plusieurs niveaux successifs', () => {
    const deep = push(push(dashboard, 'lists'), 'list-detail')
    expect(currentRoute(pop(deep))).toEqual({ name: 'lists' })
    expect(currentRoute(pop(pop(deep)))).toEqual({ name: 'dashboard' })
  })
})

describe('replace', () => {
  it('remplace la route courante sans ajouter de niveau', () => {
    const next = push(dashboard, 'lists')
    const replaced = replace(next, 'tools')
    expect(replaced).toEqual([{ name: 'dashboard' }, { name: 'tools' }])
  })

  it('réinitialise la pile si la cible est racine', () => {
    const next = push(dashboard, 'lists')
    expect(replace(next, 'dashboard')).toEqual([{ name: 'dashboard' }])
  })
})

describe('canGoBack et previousRoute', () => {
  it('signale l absence de retour à la racine', () => {
    expect(canGoBack(dashboard)).toBe(false)
    expect(previousRoute(dashboard)).toBeNull()
  })

  it('expose la route de retour', () => {
    const next = push(dashboard, 'lists')
    expect(canGoBack(next)).toBe(true)
    expect(previousRoute(next)).toEqual({ name: 'dashboard' })
  })
})

describe('parcours de navigation complets', () => {
  it('retourne à l origine réelle depuis la création de tâche', () => {
    const fromTools = push(push(dashboard, 'tools'), 'task-create-v2')
    expect(currentRoute(pop(fromTools))).toEqual({ name: 'tools' })

    const fromLists = push(push(dashboard, 'lists'), 'task-create-v2')
    expect(currentRoute(pop(fromLists))).toEqual({ name: 'lists' })
  })

  it('retourne au hub Outils depuis le détail d une liste ouverte depuis Outils', () => {
    const stack = push(push(dashboard, 'tools'), { name: 'list-detail', listId: 'l1' })
    expect(currentRoute(pop(stack))).toEqual({ name: 'tools' })
  })

  it('ne grandit pas indéfiniment sur un aller-retour répété', () => {
    let stack = dashboard
    for (let i = 0; i < 5; i++) {
      stack = push(stack, 'lists')
      stack = push(stack, 'list-detail')
      stack = pop(stack)
    }
    expect(stack).toHaveLength(2)
  })
})
