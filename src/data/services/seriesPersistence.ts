import type { AppDatabase } from '@/data/db'
import type { Task } from '@/domain/entities/task'
import type { TaskRecurrence } from '@/domain/entities/taskRecurrence'

/**
 * Lot de changements d'une opération de série, préparé en mémoire avant toute écriture.
 * `persistSeriesBatch` l'applique dans une transaction unique : l'opération réussit
 * entièrement ou est annulée entièrement.
 */
export interface SeriesBatch {
  /** Règle de récurrence à créer (création de série). */
  recurrenceToCreate?: TaskRecurrence
  /** Tâches à insérer : racine puis occurrences futures. */
  tasksToCreate?: Task[]
  /** Tâches à réécrire (édition de série sur les occurrences ciblées). */
  tasksToUpdate?: Task[]
  /** Identifiants de tâches à supprimer avec leurs sous-étapes (suppression de série). */
  taskIdsToDelete?: string[]
  /** Tâche source consommée par une création depuis une source, supprimée avec ses sous-étapes. */
  sourceIdToDelete?: string
}

async function resolveWithChildren(db: AppDatabase, ids: string[]): Promise<string[]> {
  const all = new Set<string>()
  for (const id of ids) {
    all.add(id)
    const children = (await db.tasks.where('parent_id').equals(id).primaryKeys()) as string[]
    for (const child of children) all.add(child)
  }
  return [...all]
}

/**
 * Persiste un lot de changements de série dans une transaction unique portant sur les
 * tâches et les règles de récurrence. En cas d'échec d'une écriture, toute la transaction
 * est annulée : ni série partielle, ni règle orpheline, ni tâche source supprimée.
 * L'interface ne doit être rafraîchie qu'après le retour sans erreur de cette fonction.
 */
export async function persistSeriesBatch(db: AppDatabase, batch: SeriesBatch): Promise<void> {
  const {
    recurrenceToCreate,
    tasksToCreate = [],
    tasksToUpdate = [],
    taskIdsToDelete = [],
    sourceIdToDelete,
  } = batch

  await db.transaction('rw', db.tasks, db.taskRecurrences, async () => {
    if (recurrenceToCreate) await db.taskRecurrences.add(recurrenceToCreate)
    if (tasksToCreate.length) await db.tasks.bulkAdd(tasksToCreate)
    for (const task of tasksToUpdate) await db.tasks.put(task)

    const toDelete = [...taskIdsToDelete]
    if (sourceIdToDelete) toDelete.push(sourceIdToDelete)
    if (toDelete.length) {
      const ids = await resolveWithChildren(db, toDelete)
      await db.tasks.bulkDelete(ids)
    }
  })
}
