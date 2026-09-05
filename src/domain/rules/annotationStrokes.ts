import type { FeedbackPoint, FeedbackStroke } from '@/domain/entities/feedbackReport'

export type AnnotationState = FeedbackStroke[]

function samePoint(a: FeedbackPoint, b: FeedbackPoint): boolean {
  return a.x === b.x && a.y === b.y
}

export function clampPoint(point: FeedbackPoint): FeedbackPoint {
  return { x: Math.min(1, Math.max(0, point.x)), y: Math.min(1, Math.max(0, point.y)) }
}

export function simplifyStroke(points: FeedbackPoint[], minimumDistance = 0.003): FeedbackPoint[] {
  if (points.length < 3) return points.map(clampPoint)
  const simplified = [clampPoint(points[0])]
  for (const point of points.slice(1, -1)) {
    const previous = simplified[simplified.length - 1]
    const clamped = clampPoint(point)
    if (Math.hypot(clamped.x - previous.x, clamped.y - previous.y) >= minimumDistance) simplified.push(clamped)
  }
  const last = clampPoint(points[points.length - 1])
  if (!samePoint(simplified[simplified.length - 1], last)) simplified.push(last)
  return simplified
}

export function addStroke(strokes: AnnotationState, points: FeedbackPoint[]): AnnotationState {
  const simplified = simplifyStroke(points)
  return simplified.length === 0 ? strokes : [...strokes, { points: simplified }]
}

export function undoStroke(strokes: AnnotationState): AnnotationState {
  return strokes.slice(0, -1)
}

export function clearStrokes(): AnnotationState {
  return []
}
