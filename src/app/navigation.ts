export type Route =
  | { name: 'welcome' }
  | { name: 'profile' }
  | { name: 'energy' }
  | { name: 'dashboard'; date?: string }
  | { name: 'inbox' }
  | { name: 'task-create-v2' }
  | { name: 'planning'; date?: string }
  | { name: 'task-detail'; taskId?: string }
  | { name: 'task-edit' }
  | { name: 'task-decompose' }
  | { name: 'energy-checkin' }
  | { name: 'overload-recovery' }
  | { name: 'resources' }
  | { name: 'manual-tests' }
  | { name: 'settings' }
  | { name: 'settings-profile' }
  | { name: 'settings-accessibility' }
  | { name: 'settings-privacy' }
  | { name: 'settings-export' }
  | { name: 'list-detail'; listId?: string; categoryId?: string }
  | { name: 'list-item-detail'; itemId?: string }
  | { name: 'tools' }
  | { name: 'folder-detail'; folderId?: string }
  | { name: 'budget' }
  | { name: 'budget-account' }
  | { name: 'budget-previsions' }
  | { name: 'budget-livrets' }
  | { name: 'budget-livret-detail'; accountId?: string }
  | { name: 'budget-category-detail'; categoryId?: string; date?: string }
  | { name: 'budget-settings' }

export type Screen = Route['name']

export type NavStack = [Route, ...Route[]]

/** Écrans qui repartent d'une pile neuve : y arriver n'empile pas un retour. */
const ROOT_SCREENS: Screen[] = ['welcome', 'dashboard', 'energy-checkin']

export function isRootScreen(name: Screen): boolean {
  return ROOT_SCREENS.includes(name)
}

export function toRoute(target: Screen | Route): Route {
  return typeof target === 'string' ? ({ name: target } as Route) : target
}

export function currentRoute(stack: NavStack): Route {
  return stack[stack.length - 1]
}

export function sameRoute(a: Route, b: Route): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

/**
 * Empile une route. Un écran racine réinitialise la pile ; réempiler la route déjà
 * courante ne duplique pas. Ne collapse pas sur une occurrence antérieure du même
 * écran : les routes sans paramètre différenciant (ex. task-create-v2 réutilisé
 * deux fois dans un même flux) seraient alors confondues à tort.
 */
export function push(stack: NavStack, target: Screen | Route): NavStack {
  const route = toRoute(target)
  if (isRootScreen(route.name)) return [route]
  if (sameRoute(currentRoute(stack), route)) return stack
  return [...stack, route]
}

/** Dépile d'un cran. Une pile à un seul élément reste inchangée. */
export function pop(stack: NavStack): NavStack {
  if (stack.length <= 1) return stack
  return stack.slice(0, -1) as NavStack
}

/** Remplace la route courante sans ajouter de niveau de retour. */
export function replace(stack: NavStack, target: Screen | Route): NavStack {
  const route = toRoute(target)
  if (isRootScreen(route.name)) return [route]
  const [first, ...rest] = stack
  if (rest.length === 0) return [route]
  return [first, ...rest.slice(0, -1), route]
}

export function canGoBack(stack: NavStack): boolean {
  return stack.length > 1
}

/** Route sous la route courante, cible du retour. */
export function previousRoute(stack: NavStack): Route | null {
  return stack.length > 1 ? stack[stack.length - 2] : null
}
