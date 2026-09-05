import type { FeedbackStroke } from '@/domain/entities/feedbackReport'

const MAX_EDGE = 1600

function loadImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const url = URL.createObjectURL(blob)
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Image illisible'))
    }
    image.src = url
  })
}

function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Compression impossible'))), 'image/jpeg', 0.8)
  })
}

export async function flattenImage(imageBlob: Blob, strokes: FeedbackStroke[]): Promise<Blob> {
  const image = await loadImage(imageBlob)
  const scale = Math.min(1, MAX_EDGE / Math.max(image.naturalWidth, image.naturalHeight))
  const width = Math.max(1, Math.round(image.naturalWidth * scale))
  const height = Math.max(1, Math.round(image.naturalHeight * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas indisponible')
  context.drawImage(image, 0, 0, width, height)
  context.strokeStyle = '#e11d48'
  context.lineWidth = Math.max(3, Math.round(width / 180))
  context.lineCap = 'round'
  context.lineJoin = 'round'
  for (const stroke of strokes) {
    if (stroke.points.length === 0) continue
    context.beginPath()
    context.moveTo(stroke.points[0].x * width, stroke.points[0].y * height)
    for (const point of stroke.points.slice(1)) context.lineTo(point.x * width, point.y * height)
    context.stroke()
  }
  return canvasBlob(canvas)
}
