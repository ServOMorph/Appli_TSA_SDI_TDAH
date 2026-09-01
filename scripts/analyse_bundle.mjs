#!/usr/bin/env node
// Composition du bundle JS : attribution des octets minifies aux fichiers sources
// via la sourcemap (decodage VLQ), puis regroupement par paquet et par dossier.
//
// Usage :
//   node scripts/analyse_bundle.mjs              build isole dans dist/_bundle-analyse puis analyse
//   node scripts/analyse_bundle.mjs --json       meme chose, sortie JSON
//   node scripts/analyse_bundle.mjs --dir <d>    analyse un build existant contenant ses .map
//
// Les colonnes de sourcemap sont comptees en unites UTF-16 ; sur du JS minifie
// quasi integralement ASCII l ecart avec les octets reels est negligeable.

import { execSync } from 'node:child_process'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const ANALYSE_DIR = 'dist/_bundle-analyse'

const args = process.argv.slice(2)
const asJson = args.includes('--json')
const dirFlag = args.indexOf('--dir')
const providedDir = dirFlag !== -1 ? args[dirFlag + 1] : null

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
const B64_INDEX = new Map([...B64].map((char, index) => [char, index]))

function decodeVlq(segment) {
  const values = []
  let shift = 0
  let value = 0
  for (const char of segment) {
    const digit = B64_INDEX.get(char)
    if (digit === undefined) throw new Error(`Caractere base64 invalide dans la sourcemap : ${char}`)
    value += (digit & 31) << shift
    if (digit & 32) {
      shift += 5
      continue
    }
    const negative = value & 1
    value >>= 1
    values.push(negative ? -value : value)
    value = 0
    shift = 0
  }
  return values
}

function attributeBytes(code, map) {
  const codeLines = code.split('\n')
  const mappingLines = map.mappings.split(';')
  const bytesBySource = new Map()
  let unmapped = 0
  let sourceIndex = 0

  for (let lineNo = 0; lineNo < codeLines.length; lineNo++) {
    const lineText = codeLines[lineNo]
    const lineLength = lineText.length + (lineNo < codeLines.length - 1 ? 1 : 0)
    const rawMapping = mappingLines[lineNo]

    if (!rawMapping) {
      unmapped += lineLength
      continue
    }

    let generatedColumn = 0
    const segments = []
    for (const segment of rawMapping.split(',')) {
      if (!segment) continue
      const values = decodeVlq(segment)
      generatedColumn += values[0]
      if (values.length >= 4) sourceIndex += values[1]
      segments.push({ column: generatedColumn, source: values.length >= 4 ? sourceIndex : null })
    }

    if (segments.length === 0) {
      unmapped += lineLength
      continue
    }

    unmapped += segments[0].column
    for (let k = 0; k < segments.length; k++) {
      const start = segments[k].column
      const end = k + 1 < segments.length ? segments[k + 1].column : lineLength
      const span = Math.max(0, end - start)
      const source = segments[k].source
      if (source === null) {
        unmapped += span
        continue
      }
      const name = map.sources[source] ?? `<source ${source}>`
      bytesBySource.set(name, (bytesBySource.get(name) ?? 0) + span)
    }
  }

  return { bytesBySource, unmapped }
}

function groupOf(source) {
  const clean = source.replace(/\\/g, '/').replace(/^(\.\.\/)+/, '')
  const nodeModules = clean.lastIndexOf('node_modules/')

  if (nodeModules !== -1) {
    const rest = clean.slice(nodeModules + 'node_modules/'.length)
    const parts = rest.split('/')
    const pkg = parts[0].startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0]
    if (pkg.startsWith('@supabase/') || pkg === 'iceberg-js') return '@supabase/* + iceberg-js'
    if (pkg.startsWith('@dnd-kit/')) return '@dnd-kit/*'
    if (pkg === 'react' || pkg === 'react-dom' || pkg === 'scheduler') return 'react + react-dom + scheduler'
    if (pkg === 'dexie') return 'dexie'
    return `node_modules/${pkg}`
  }

  if (clean.includes('manualTestsCatalog')) return 'src/domain/data/manualTestsCatalog.ts'

  const parts = clean.split('/')
  const srcAt = parts.indexOf('src')
  if (srcAt !== -1) {
    const after = parts.slice(srcAt + 1)
    if (after[0] === 'ui' && after[1] === 'screens') return 'src/ui/screens/*'
    if (after[0] === 'ui') return `src/ui/${after[1] ?? ''}`
    if (after[0] === 'domain') return `src/domain/${after[1] ?? ''}`
    return `src/${after[0] ?? ''}`
  }

  return clean
}

function listChunks(dir) {
  const assetsDir = join(dir, 'assets')
  if (!existsSync(assetsDir)) throw new Error(`Dossier introuvable : ${assetsDir}`)
  const chunks = readdirSync(assetsDir)
    .filter((file) => file.endsWith('.js'))
    .map((file) => ({ file, path: join(assetsDir, file), size: readFileSync(join(assetsDir, file)).length }))
    .sort((a, b) => b.size - a.size)
  if (chunks.length === 0) throw new Error(`Aucun chunk JS dans ${assetsDir}`)
  return chunks
}

if (!providedDir) {
  execSync(`npx vite build --sourcemap --outDir ${ANALYSE_DIR} --emptyOutDir`, {
    stdio: asJson ? 'ignore' : 'inherit',
  })
}

const buildDir = providedDir ?? ANALYSE_DIR
const chunks = listChunks(buildDir)
const entry = chunks[0]
const mapPath = `${entry.path}.map`

if (!existsSync(mapPath)) {
  throw new Error(`Sourcemap absente : ${mapPath}\nRelancer sans --dir, ou builder avec --sourcemap.`)
}

const code = readFileSync(entry.path, 'utf-8')
const map = JSON.parse(readFileSync(mapPath, 'utf-8'))
const { bytesBySource, unmapped } = attributeBytes(code, map)

const byGroup = new Map()
for (const [source, bytes] of bytesBySource) {
  const group = groupOf(source)
  byGroup.set(group, (byGroup.get(group) ?? 0) + bytes)
}

const total = entry.size
const attributed = [...bytesBySource.values()].reduce((sum, n) => sum + n, 0)
const rows = [...byGroup.entries()]
  .map(([group, bytes]) => ({ group, bytes, kb: bytes / 1000, share: bytes / total }))
  .sort((a, b) => b.bytes - a.bytes)

if (asJson) {
  console.log(
    JSON.stringify(
      {
        buildDir,
        entryFile: entry.file,
        entryBytes: total,
        entryKb: Number((total / 1000).toFixed(2)),
        attributedBytes: attributed,
        unmappedBytes: unmapped,
        chunkCount: chunks.length,
        moduleCount: map.sources.length,
        groups: rows.map((row) => ({
          group: row.group,
          bytes: row.bytes,
          kb: Number(row.kb.toFixed(2)),
          share: Number((row.share * 100).toFixed(2)),
        })),
      },
      null,
      2,
    ),
  )
} else {
  const label = (text, width) => String(text).padEnd(width)
  const num = (text, width) => String(text).padStart(width)
  console.log('')
  console.log(`Build analyse : ${buildDir}`)
  console.log(`Chunk d entree : ${entry.file} — ${(total / 1000).toFixed(2)} kB`)
  console.log(`Chunks JS : ${chunks.length} · modules sources : ${map.sources.length}`)
  console.log(
    `Octets attribues : ${(attributed / 1000).toFixed(2)} kB · non mappes : ${(unmapped / 1000).toFixed(2)} kB`,
  )
  console.log('')
  console.log(`${label('Groupe', 42)}${num('kB', 10)}${num('%', 8)}`)
  console.log('-'.repeat(60))
  for (const row of rows) {
    console.log(`${label(row.group, 42)}${num(row.kb.toFixed(2), 10)}${num((row.share * 100).toFixed(1), 8)}`)
  }
  console.log('-'.repeat(60))
  console.log(
    `${label('total attribue', 42)}${num((attributed / 1000).toFixed(2), 10)}${num(((attributed / total) * 100).toFixed(1), 8)}`,
  )
  if (chunks.length > 1) {
    console.log('')
    console.log('Autres chunks JS :')
    for (const chunk of chunks.slice(1)) {
      console.log(`  ${label(chunk.file, 40)}${num((chunk.size / 1000).toFixed(2), 10)} kB`)
    }
  }
  console.log('')
}
