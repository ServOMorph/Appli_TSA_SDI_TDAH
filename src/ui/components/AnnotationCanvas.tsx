import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import type { FeedbackPoint, FeedbackStroke } from '@/domain/entities/feedbackReport'
import { addStroke } from '@/domain/rules/annotationStrokes'

type Props = {
  imageUrl: string
  strokes: FeedbackStroke[]
  onChange: (strokes: FeedbackStroke[]) => void
  active?: boolean
}

function pointFor(event: PointerEvent<HTMLCanvasElement>): FeedbackPoint {
  const bounds = event.currentTarget.getBoundingClientRect()
  return { x: (event.clientX - bounds.left) / bounds.width, y: (event.clientY - bounds.top) / bounds.height }
}

function draw(canvas: HTMLCanvasElement, strokes: FeedbackStroke[]) {
  const context = canvas.getContext('2d')
  if (!context) return
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.strokeStyle = '#e11d48'
  context.lineWidth = 4
  context.lineCap = 'round'
  context.lineJoin = 'round'
  for (const stroke of strokes) {
    if (!stroke.points.length) continue
    context.beginPath()
    context.moveTo(stroke.points[0].x * canvas.width, stroke.points[0].y * canvas.height)
    for (const point of stroke.points.slice(1)) context.lineTo(point.x * canvas.width, point.y * canvas.height)
    context.stroke()
  }
}

export function AnnotationCanvas({ imageUrl, strokes, onChange, active = true }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [drawing, setDrawing] = useState<FeedbackPoint[] | null>(null)
  const allStrokes = useMemo(() => (drawing ? [...strokes, { points: drawing }] : strokes), [drawing, strokes])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) draw(canvas, allStrokes)
  }, [allStrokes])

  useEffect(() => {
    if (!active) setDrawing(null)
  }, [active])

  function finishStroke() {
    if (!drawing) return
    onChange(addStroke(strokes, drawing))
    setDrawing(null)
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <img src={imageUrl} alt="Capture à annoter" style={{ display: 'block', width: '100%', height: 'auto', borderRadius: 'var(--radius-md)' }} />
      <canvas
        ref={canvasRef}
        aria-label="Zone d’annotation"
        width={1200}
        height={800}
        onPointerDown={
          active
            ? (event) => {
                event.currentTarget.setPointerCapture(event.pointerId)
                setDrawing([pointFor(event)])
              }
            : undefined
        }
        onPointerMove={active ? (event) => drawing && setDrawing([...drawing, pointFor(event)]) : undefined}
        onPointerUp={active ? finishStroke : undefined}
        onPointerCancel={active ? finishStroke : undefined}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          touchAction: active ? 'none' : 'auto',
          pointerEvents: active ? 'auto' : 'none',
          cursor: active ? 'crosshair' : 'default',
        }}
      />
    </div>
  )
}
