import { useState } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import {
  CATEGORIES,
  ITEM_COUNTS,
  generateItems,
  isCorrectPlacement,
  type Color,
  type Item,
  type Rule,
  type Shape,
} from './logic'

const COLOR_HEX: Record<Color, string> = { bleu: '#4a7c99', orange: '#d98a3d' }
const LABELS: Record<string, string> = { bleu: 'Bleu', orange: 'Orange', cercle: 'Cercle', carre: 'Carré' }
const RULE_LABELS: Record<Rule, string> = { couleur: 'Par couleur', forme: 'Par forme' }

function ShapeView({ color, shape, size }: { color: Color; shape: Shape; size: number }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        backgroundColor: COLOR_HEX[color],
        borderRadius: shape === 'cercle' ? '50%' : 8,
      }}
    />
  )
}

function itemLabel(item: Item): string {
  return `${LABELS[item.shape]} ${item.color === 'bleu' ? 'bleu' : 'orange'}`
}

function DraggableItem({ item, selected, onSelect }: { item: Item; selected: boolean; onSelect: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: item.id })
  return (
    <button
      ref={setNodeRef}
      type="button"
      {...attributes}
      {...listeners}
      aria-label={itemLabel(item)}
      aria-pressed={selected}
      onClick={onSelect}
      style={{
        background: 'var(--color-surface)',
        border: selected ? '3px solid var(--color-accent)' : '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--spacing-md)',
        cursor: 'grab',
        touchAction: 'none',
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        zIndex: isDragging ? 10 : undefined,
        position: 'relative',
      }}
    >
      <ShapeView color={item.color} shape={item.shape} size={44} />
    </button>
  )
}

function Bin({
  id,
  rule,
  placed,
  armed,
  onChoose,
}: {
  id: string
  rule: Rule
  placed: Item[]
  armed: boolean
  onChoose: () => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const swatch =
    rule === 'couleur' ? (
      <ShapeView color={id as Color} shape="cercle" size={18} />
    ) : (
      <ShapeView color="bleu" shape={id as Shape} size={18} />
    )
  return (
    <div
      ref={setNodeRef}
      role="button"
      tabIndex={0}
      aria-label={`Bac ${LABELS[id]}`}
      onClick={onChoose}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onChoose()
        }
      }}
      style={{
        flex: 1,
        minHeight: 180,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-sm)',
        padding: 'var(--spacing-md)',
        borderRadius: 'var(--radius-lg)',
        border: `2px ${isOver || armed ? 'solid' : 'dashed'} ${isOver || armed ? 'var(--color-accent)' : 'var(--color-border)'}`,
        backgroundColor: 'var(--color-surface)',
        cursor: armed ? 'pointer' : 'default',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', fontWeight: 600 }}>
        {swatch}
        {LABELS[id]}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
        {placed.map((item) => (
          <ShapeView key={item.id} color={item.color} shape={item.shape} size={32} />
        ))}
      </div>
    </div>
  )
}

function Segmented<T extends string | number>({
  label,
  options,
  value,
  render,
  onChange,
}: {
  label: string
  options: readonly T[]
  value: T
  render: (v: T) => string
  onChange: (v: T) => void
}) {
  return (
    <div role="group" aria-label={label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
      <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      {options.map((opt) => (
        <Button
          key={String(opt)}
          variant={opt === value ? 'primary' : 'secondary'}
          aria-pressed={opt === value}
          onClick={() => onChange(opt)}
          style={{ padding: '8px 14px' }}
        >
          {render(opt)}
        </Button>
      ))}
    </div>
  )
}

export function TriCalme() {
  const [rule, setRule] = useState<Rule>('couleur')
  const [count, setCount] = useState<number>(6)
  const [items, setItems] = useState<Item[]>(() => generateItems(6))
  const [placed, setPlaced] = useState<Record<string, Item[]>>({})
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const placedIds = new Set(Object.values(placed).flat().map((i) => i.id))
  const remaining = items.filter((i) => !placedIds.has(i.id))
  const done = remaining.length === 0

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  )

  function restart(next?: { rule?: Rule; count?: number }) {
    if (next?.rule) setRule(next.rule)
    if (next?.count) setCount(next.count)
    setPlaced({})
    setSelectedId(null)
    setItems(generateItems(next?.count ?? count))
  }

  function tryPlace(itemId: string, bin: string) {
    const item = items.find((i) => i.id === itemId)
    if (!item || placedIds.has(itemId)) return
    if (!isCorrectPlacement(item, bin, rule)) return
    setPlaced((prev) => ({ ...prev, [bin]: [...(prev[bin] ?? []), item] }))
    setSelectedId(null)
  }

  function onDragEnd(event: DragEndEvent) {
    if (event.over) tryPlace(String(event.active.id), String(event.over.id))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <Segmented
            label="Règle"
            options={['couleur', 'forme'] as const}
            value={rule}
            render={(v) => RULE_LABELS[v]}
            onChange={(v) => restart({ rule: v })}
          />
          <Segmented
            label="Éléments"
            options={ITEM_COUNTS}
            value={count as (typeof ITEM_COUNTS)[number]}
            render={String}
            onChange={(v) => restart({ count: v })}
          />
        </div>
      </Card>

      <p style={{ margin: 0, fontWeight: 600 }} aria-live="polite">
        {done
          ? 'Tout est rangé.'
          : `Rangez chaque élément ${rule === 'couleur' ? 'dans le bac de sa couleur' : 'dans le bac de sa forme'}.`}
      </p>

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
          {CATEGORIES[rule].map((bin) => (
            <Bin
              key={bin}
              id={bin}
              rule={rule}
              placed={placed[bin] ?? []}
              armed={selectedId !== null}
              onChoose={() => selectedId && tryPlace(selectedId, bin)}
            />
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--spacing-md)',
            minHeight: 80,
            justifyContent: 'center',
          }}
        >
          {remaining.map((item) => (
            <DraggableItem
              key={item.id}
              item={item}
              selected={item.id === selectedId}
              onSelect={() => setSelectedId((cur) => (cur === item.id ? null : item.id))}
            />
          ))}
        </div>
      </DndContext>

      <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center' }}>
        <Button variant={done ? 'primary' : 'secondary'} onClick={() => restart()}>
          {done ? 'Nouveau tri' : 'Recommencer'}
        </Button>
      </div>
    </div>
  )
}
