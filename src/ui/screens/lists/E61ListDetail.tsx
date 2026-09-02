import { useEffect, useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import { RecurrenceEditor } from '@/ui/components/RecurrenceEditor'
import { groupListItemsByCategory } from '@/domain/rules/listItemSortRules'
import { todayDate } from '@/app/repositories'
import type { ListItem } from '@/domain/entities/listItem'
import type { ListCategory } from '@/domain/entities/listCategory'
import type { ListItemSubTask } from '@/domain/entities/listItemSubTask'
import type { RecurrenceRuleInput } from '@/app/contexts/usePlanningState'

const fieldInputStyle: React.CSSProperties = {
  padding: '8px',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  fontFamily: 'var(--font-body)',
  fontSize: '1rem',
  color: 'var(--color-text)',
  background: 'var(--color-surface)',
}

const defaultRecurrence: RecurrenceRuleInput = {
  frequency: 'daily',
  interval: 1,
  weekdays: null,
  end_type: 'never',
  end_date: null,
  end_count: null,
}

export function E61ListDetail() {
  const {
    lists,
    tools,
    selectedListId,
    getListItems,
    getListCategories,
    createListCategory,
    deleteListCategory,
    addListItem,
    deleteListItem,
    toggleListItem,
    selectListItem,
    goTo,
    replace,
    back,
    route,
    createDetailedTask,
    deleteTool,
    getListItemSubTasks,
    toggleListItemSubTask,
  } = useApp()
  const list = lists.find((l) => l.id === selectedListId) ?? null
  const tool = tools.find((t) => t.type === 'liste' && t.list_id === selectedListId) ?? null

  const [items, setItems] = useState<ListItem[]>([])
  const [categories, setCategories] = useState<ListCategory[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    route.name === 'list-detail' ? route.categoryId ?? null : null,
  )
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false)
  const [addCategoryName, setAddCategoryName] = useState('')
  const [addingCategory, setAddingCategory] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [alarmItem, setAlarmItem] = useState<ListItem | null>(null)
  const [alarmDate, setAlarmDate] = useState(todayDate())
  const [alarmStartTime, setAlarmStartTime] = useState('09:00')
  const [alarmRecurring, setAlarmRecurring] = useState(false)
  const [alarmRecurrence, setAlarmRecurrence] = useState<RecurrenceRuleInput>(defaultRecurrence)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deletingCategory, setDeletingCategory] = useState<ListCategory | null>(null)
  const [subTasksByItem, setSubTasksByItem] = useState<Record<string, ListItemSubTask[]>>({})
  const [expandedItemIds, setExpandedItemIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!selectedListId) return
    getListItems(selectedListId).then(setItems)
    getListCategories(selectedListId).then(setCategories)
  }, [selectedListId, getListItems, getListCategories])

  async function refresh() {
    if (!selectedListId) return
    setItems(await getListItems(selectedListId))
  }

  async function handleAdd() {
    const title = newTitle.trim()
    if (!title || !selectedListId || !selectedCategoryId) return
    setSubmitting(true)
    await addListItem(selectedListId, title, selectedCategoryId)
    await refresh()
    setNewTitle('')
    setShowAddForm(false)
    setSubmitting(false)
  }

  async function handleAddCategory() {
    const trimmed = addCategoryName.trim()
    if (!trimmed || !selectedListId) return
    setAddingCategory(true)
    await createListCategory(selectedListId, trimmed)
    setCategories(await getListCategories(selectedListId))
    setAddingCategory(false)
    setAddCategoryName('')
    setShowAddCategoryForm(false)
  }

  async function handleDelete(id: string) {
    await deleteListItem(id)
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  async function handleToggle(id: string) {
    await toggleListItem(id)
    await refresh()
  }

  function openItemDetail(item: ListItem) {
    selectListItem(item.id)
    goTo('list-item-detail')
  }

  function selectCategory(categoryId: string | null) {
    setSelectedCategoryId(categoryId)
    replace(categoryId ? { name: 'list-detail', categoryId } : 'list-detail')
  }

  function openAlarm(item: ListItem) {
    setAlarmItem(item)
    setAlarmDate(todayDate())
    setAlarmStartTime('09:00')
    setAlarmRecurring(false)
    setAlarmRecurrence(defaultRecurrence)
  }

  async function handleDeleteList() {
    if (!tool) return
    await deleteTool(tool.id)
    setConfirmingDelete(false)
    back('tools')
  }

  async function handleConfirmDeleteCategory() {
    if (!deletingCategory) return
    await deleteListCategory(deletingCategory.id)
    setCategories((prev) => prev.filter((c) => c.id !== deletingCategory.id))
    if (selectedCategoryId === deletingCategory.id) setSelectedCategoryId(null)
    setDeletingCategory(null)
    await refresh()
  }

  async function handleConfirmAlarm() {
    if (!alarmItem || !alarmDate || !alarmStartTime) return
    await createDetailedTask({
      title: alarmItem.title,
      description: '',
      icon: null,
      color: null,
      energyCost: null,
      essential: false,
      durationMinutes: null,
      date: alarmDate,
      startTime: alarmStartTime,
      status: 'planned',
      recurrence: alarmRecurring ? alarmRecurrence : null,
    })
    setAlarmItem(null)
  }

  const groups = groupListItemsByCategory(items, categories)
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId) ?? null
  const currentGroup = groups.find((g) => g.category.id === selectedCategoryId) ?? null
  const currentItems = currentGroup?.items ?? []

  const currentItemIdsKey = currentItems.map((i) => i.id).join(',')
  useEffect(() => {
    let cancelled = false
    const ids = currentItemIdsKey ? currentItemIdsKey.split(',') : []
    if (ids.length === 0) {
      setSubTasksByItem({})
      return
    }
    Promise.all(ids.map((id) => getListItemSubTasks(id))).then((results) => {
      if (cancelled) return
      const map: Record<string, ListItemSubTask[]> = {}
      ids.forEach((id, idx) => {
        map[id] = results[idx]
      })
      setSubTasksByItem(map)
    })
    return () => {
      cancelled = true
    }
  }, [currentItemIdsKey, getListItemSubTasks])

  function toggleItemExpand(itemId: string) {
    setExpandedItemIds((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) next.delete(itemId)
      else next.add(itemId)
      return next
    })
  }

  async function handleToggleItemSubTask(itemId: string, subTaskId: string) {
    await toggleListItemSubTask(subTaskId)
    const updated = await getListItemSubTasks(itemId)
    setSubTasksByItem((prev) => ({ ...prev, [itemId]: updated }))
  }

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: 'var(--spacing-xl)',
        gap: 'var(--spacing-lg)',
        maxWidth: '480px',
        width: '100%',
        margin: '0 auto',
        minHeight: '100svh',
        paddingBottom: 'var(--bottomnav-h)',
      }}
    >
      <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
        <button
          aria-label="Retour"
          onClick={() => (selectedCategory ? selectCategory(null) : back('tools'))}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.25rem',
            color: 'var(--color-text)',
            padding: 0,
          }}
        >
          ←
        </button>
        <h1
          style={{
            margin: 0,
            fontSize: '1.25rem',
            flex: 1,
            padding: 'var(--spacing-md)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {selectedCategory ? selectedCategory.name : list?.name ?? 'Liste'}
        </h1>
        <button
          aria-label="Supprimer la liste"
          onClick={() => setConfirmingDelete(true)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.1rem',
            color: 'var(--color-error)',
            padding: 0,
          }}
        >
          ×
        </button>
      </header>

      {!selectedCategory && (
        <>
          {categories.length === 0 && (
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', margin: 0 }}>
              Cette liste n'a pas encore de catégorie.
            </p>
          )}

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
            {groups.map(({ category, items: categoryItems }) => (
              <li
                key={category.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                }}
              >
                <button
                  onClick={() => selectCategory(category.id)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flex: 1,
                    minWidth: 0,
                    gap: 'var(--spacing-sm)',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: 'var(--spacing-md)',
                    cursor: 'pointer',
                    color: 'var(--color-text)',
                    fontSize: '1rem',
                  }}
                >
                  <span>{category.name}</span>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                    {categoryItems.length}
                  </span>
                </button>
                <button
                  aria-label={`Supprimer la catégorie ${category.name}`}
                  onClick={() => setDeletingCategory(category)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                    color: 'var(--color-error)',
                    padding: '0 4px',
                    flexShrink: 0,
                  }}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>

          {showAddCategoryForm ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              <input
                type="text"
                value={addCategoryName}
                onChange={(e) => setAddCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddCategory()
                }}
                autoFocus
                placeholder="Nom de la catégorie…"
                aria-label="Nom de la catégorie"
                style={{ ...fieldInputStyle, width: '100%' }}
              />
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                <Button fullWidth onClick={handleAddCategory} disabled={!addCategoryName.trim() || addingCategory}>
                  Ajouter
                </Button>
                <Button
                  fullWidth
                  variant="secondary"
                  onClick={() => {
                    setShowAddCategoryForm(false)
                    setAddCategoryName('')
                  }}
                >
                  Annuler
                </Button>
              </div>
            </div>
          ) : (
            <Button fullWidth variant="secondary" onClick={() => setShowAddCategoryForm(true)}>
              Ajouter une catégorie
            </Button>
          )}
        </>
      )}

      {selectedCategory && (
        <>
          {currentItems.length === 0 && !showAddForm && (
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', margin: 0 }}>
              Cette catégorie est vide.
            </p>
          )}

          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-xs)',
            }}
          >
            {currentItems.map((item) => {
              const subs = subTasksByItem[item.id] ?? []
              const hasSubs = subs.length > 0
              const doneSubs = subs.filter((s) => s.checked).length
              const expanded = expandedItemIds.has(item.id)
              return (
                <li
                  key={item.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 'var(--spacing-sm)',
                      padding: 'var(--spacing-xs)',
                    }}
                  >
                    <button
                      aria-label={item.checked ? `Décocher ${item.title}` : `Cocher ${item.title}`}
                      onClick={() => handleToggle(item.id)}
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: '2px solid var(--color-accent)',
                        backgroundColor: item.checked ? 'var(--color-accent)' : 'transparent',
                        cursor: 'pointer',
                        flexShrink: 0,
                        padding: 0,
                      }}
                    />
                    <button
                      onClick={() => openItemDetail(item)}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        font: 'inherit',
                        textDecoration: item.checked ? 'line-through' : 'none',
                        color: item.checked ? 'var(--color-text-muted)' : 'var(--color-text)',
                      }}
                    >
                      {item.title}
                    </button>
                    {hasSubs && (
                      <button
                        aria-label={`${doneSubs} sur ${subs.length} sous-tâches, ${expanded ? 'replier' : 'déplier'}`}
                        onClick={() => toggleItemExpand(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.8125rem',
                          color: 'var(--color-text-muted)',
                          padding: '0 4px',
                          flexShrink: 0,
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {doneSubs}/{subs.length} {expanded ? '▾' : '▸'}
                      </button>
                    )}
                    <button
                      aria-label={`Planifier ${item.title}`}
                      onClick={() => openAlarm(item)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--color-text-muted)', padding: '0 4px' }}
                    >
                      ⏰
                    </button>
                    <button
                      aria-label={`Supprimer ${item.title}`}
                      onClick={() => handleDelete(item.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1.1rem',
                        color: 'var(--color-text-muted)',
                        padding: '0 4px',
                      }}
                    >
                      ×
                    </button>
                  </div>
                  {hasSubs && expanded && (
                    <ul
                      style={{
                        listStyle: 'none',
                        margin: 0,
                        padding: '0 var(--spacing-sm) var(--spacing-sm) 34px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                    >
                      {subs.map((sub) => (
                        <li key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                          <input
                            type="checkbox"
                            checked={sub.checked}
                            aria-label={`${sub.checked ? 'Décocher' : 'Cocher'} ${sub.title}`}
                            onChange={() => handleToggleItemSubTask(item.id, sub.id)}
                            style={{ width: '16px', height: '16px', flexShrink: 0, cursor: 'pointer', accentColor: 'var(--color-accent)' }}
                          />
                          <span
                            style={{
                              fontSize: '0.875rem',
                              textDecoration: sub.checked ? 'line-through' : 'none',
                              color: sub.checked ? 'var(--color-text-muted)' : 'var(--color-text)',
                            }}
                          >
                            {sub.title}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>

          <Button fullWidth onClick={() => setShowAddForm(true)}>
            Ajouter un élément
          </Button>
        </>
      )}

      {showAddForm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Ajouter un élément"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--spacing-xl)',
              maxWidth: '360px',
              width: '90%',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-md)',
            }}
          >
            <label
              htmlFor="new-item-title"
              style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}
            >
              Élément
            </label>
            <input
              id="new-item-title"
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd()
              }}
              autoFocus
              placeholder="Nom de l'élément…"
              style={{
                padding: '8px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                color: 'var(--color-text)',
                background: 'var(--color-surface)',
              }}
            />
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <Button
                fullWidth
                onClick={handleAdd}
                disabled={!newTitle.trim() || submitting}
              >
                Ajouter
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  setShowAddForm(false)
                  setNewTitle('')
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}

      {alarmItem && (
        <div
          role="dialog"
          aria-label={`Planifier ${alarmItem.title}`}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--spacing-xl)',
              maxWidth: '360px',
              width: '90%',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-md)',
            }}
          >
            <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Planifier « {alarmItem.title} »</h2>
            <label htmlFor="alarm-date" style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Date
            </label>
            <input
              id="alarm-date"
              type="date"
              value={alarmDate}
              onChange={(e) => setAlarmDate(e.target.value)}
              style={{
                padding: '8px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                color: 'var(--color-text)',
                background: 'var(--color-surface)',
              }}
            />
            <label htmlFor="alarm-time" style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Heure
            </label>
            <input
              id="alarm-time"
              type="time"
              value={alarmStartTime}
              onChange={(e) => setAlarmStartTime(e.target.value)}
              style={{
                padding: '8px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                color: 'var(--color-text)',
                background: 'var(--color-surface)',
              }}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              <input
                type="checkbox"
                checked={alarmRecurring}
                onChange={(e) => setAlarmRecurring(e.target.checked)}
              />
              Tâche récurrente
            </label>
            {alarmRecurring && <RecurrenceEditor value={alarmRecurrence} onChange={setAlarmRecurrence} />}
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <Button fullWidth disabled={!alarmDate || !alarmStartTime} onClick={handleConfirmAlarm}>
                Planifier
              </Button>
              <Button fullWidth variant="secondary" onClick={() => setAlarmItem(null)}>
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}

      {confirmingDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Supprimer la liste"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--spacing-xl)',
              maxWidth: '360px',
              width: '90%',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-md)',
            }}
          >
            <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Supprimer cette liste ?</h2>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
              Tous ses éléments seront définitivement supprimés.
            </p>
            <Button fullWidth onClick={handleDeleteList} style={{ backgroundColor: 'var(--color-error)', borderColor: 'var(--color-error)' }}>
              Supprimer
            </Button>
            <Button variant="secondary" fullWidth onClick={() => setConfirmingDelete(false)}>
              Annuler
            </Button>
          </div>
        </div>
      )}

      {deletingCategory && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Supprimer la catégorie"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--spacing-xl)',
              maxWidth: '360px',
              width: '90%',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-md)',
            }}
          >
            <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Supprimer « {deletingCategory.name} » ?</h2>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
              Ses éléments seront définitivement supprimés. Le reste de la liste n'est pas affecté.
            </p>
            <Button fullWidth onClick={handleConfirmDeleteCategory} style={{ backgroundColor: 'var(--color-error)', borderColor: 'var(--color-error)' }}>
              Supprimer
            </Button>
            <Button variant="secondary" fullWidth onClick={() => setDeletingCategory(null)}>
              Annuler
            </Button>
          </div>
        </div>
      )}
    </main>
  )
}
