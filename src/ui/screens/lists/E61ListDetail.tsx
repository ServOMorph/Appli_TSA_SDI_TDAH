import { useEffect, useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import { RecurrenceEditor } from '@/ui/components/RecurrenceEditor'
import { groupListItemsBySection } from '@/domain/rules/listItemSortRules'
import { todayDate } from '@/app/repositories'
import type { ListItem } from '@/domain/entities/listItem'
import type { RecurrenceRuleInput } from '@/app/contexts/usePlanningState'

const defaultRecurrence: RecurrenceRuleInput = {
  frequency: 'daily',
  interval: 1,
  weekdays: null,
  end_type: 'never',
  end_date: null,
  end_count: null,
}

export function E61ListDetail() {
  const { lists, tools, selectedListId, getListItems, addListItem, deleteListItem, toggleListItem, back, createDetailedTask, deleteTool } = useApp()
  const list = lists.find((l) => l.id === selectedListId) ?? null
  const tool = tools.find((t) => t.type === 'liste' && t.list_id === selectedListId) ?? null

  const [items, setItems] = useState<ListItem[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newSection, setNewSection] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [alarmItem, setAlarmItem] = useState<ListItem | null>(null)
  const [alarmDate, setAlarmDate] = useState(todayDate())
  const [alarmStartTime, setAlarmStartTime] = useState('09:00')
  const [alarmRecurring, setAlarmRecurring] = useState(false)
  const [alarmRecurrence, setAlarmRecurrence] = useState<RecurrenceRuleInput>(defaultRecurrence)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  useEffect(() => {
    if (!selectedListId) return
    getListItems(selectedListId).then(setItems)
  }, [selectedListId, getListItems])

  async function refresh() {
    if (!selectedListId) return
    setItems(await getListItems(selectedListId))
  }

  async function handleAdd() {
    const title = newTitle.trim()
    if (!title || !selectedListId) return
    setSubmitting(true)
    await addListItem(selectedListId, title, newSection.trim() || null)
    await refresh()
    setNewTitle('')
    setNewSection('')
    setShowAddForm(false)
    setSubmitting(false)
  }

  async function handleDelete(id: string) {
    await deleteListItem(id)
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  async function handleToggle(id: string) {
    await toggleListItem(id)
    await refresh()
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

  const sections = groupListItemsBySection(items)

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: 'var(--spacing-xl)',
        gap: 'var(--spacing-lg)',
        maxWidth: '480px',
        margin: '0 auto',
        minHeight: '100svh',
        paddingBottom: 'var(--bottomnav-h)',
      }}
    >
      <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
        <button
          aria-label="Retour"
          onClick={() => back('tools')}
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
          {list?.name ?? 'Liste'}
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

      {items.length === 0 && !showAddForm && (
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', margin: 0 }}>
          Cette liste est vide.
        </p>
      )}

      {sections.map(({ section, items: sectionItems }) => (
        <section key={section ?? '__no_section__'}>
          {section && (
            <h2 style={{ fontSize: '0.95rem', margin: '0 0 var(--spacing-xs) 0', color: 'var(--color-text-muted)' }}>
              {section}
            </h2>
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
            {sectionItems.map((item) => (
              <li
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
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
                <span style={{ flex: 1, textDecoration: item.checked ? 'line-through' : 'none', color: item.checked ? 'var(--color-text-muted)' : 'var(--color-text)' }}>
                  {item.title}
                </span>
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
              </li>
            ))}
          </ul>
        </section>
      ))}

      {showAddForm ? (
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
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
            <label
              htmlFor="new-item-section"
              style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}
            >
              Rubrique (optionnel)
            </label>
            <input
              id="new-item-section"
              type="text"
              value={newSection}
              onChange={(e) => setNewSection(e.target.value)}
              placeholder="Ex. Habits été"
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
                  setNewSection('')
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Button fullWidth onClick={() => setShowAddForm(true)}>
          Ajouter un élément
        </Button>
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
    </main>
  )
}
