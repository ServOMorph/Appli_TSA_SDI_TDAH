#!/usr/bin/env node
// Garde-fou de taille du bundle : mesure le chunk JS d entree d un build et le
// compare aux seuils de bundle.budget.json. Sort en code 1 si un seuil est depasse.
//
// Usage :
//   node scripts/check_bundle_budget.mjs <dossier-de-build>
//   node scripts/check_bundle_budget.mjs dist/v5.70
//   node scripts/check_bundle_budget.mjs dist/_bundle-check --json
//
// Le dossier est TOUJOURS explicite : dist/ contient des dizaines de builds
// versionnes et build.outDir de vite.config.ts ne designe pas le build courant.
// Aucune deduction automatique n est faite ici.

import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

const BUDGET_FILE = 'bundle.budget.json'

const args = process.argv.slice(2)
const asJson = args.includes('--json')
const buildDir = args.find((arg) => !arg.startsWith('--'))

function fail(message) {
  console.error(`ERREUR — ${message}`)
  process.exit(1)
}

if (!buildDir) {
  fail(
    'dossier de build manquant.\n' +
      '  usage : node scripts/check_bundle_budget.mjs <dossier-de-build>\n' +
      '  exemple : node scripts/check_bundle_budget.mjs dist/v5.70',
  )
}

const indexPath = join(buildDir, 'index.html')
if (!existsSync(indexPath)) fail(`index.html introuvable dans ${buildDir}`)

const html = readFileSync(indexPath, 'utf-8')
const scriptTags = [...html.matchAll(/<script\b[^>]*>/g)].map((match) => match[0])
const entrySrc = scriptTags
  .filter((tag) => /type\s*=\s*["']module["']/.test(tag))
  .map((tag) => tag.match(/src\s*=\s*["']([^"']+)["']/)?.[1])
  .find((src) => src && src.includes('/assets/') && src.endsWith('.js'))

if (!entrySrc) fail(`aucun script module d entree trouve dans ${indexPath}`)

const entryPath = join(buildDir, entrySrc.replace(/^\//, ''))
if (!existsSync(entryPath)) fail(`chunk d entree introuvable : ${entryPath}`)

// Chunks precharges de force via <link rel="modulepreload"> : Vite les fait telecharger en
// parallele du chunk d entree, pas a la demande (ex. AppContext.tsx, dependance statique
// incontournable de tout ecran). Ignores jusqu ici (Phase 2 de roadmap_bundle_2026-08-31.md,
// point de transparence) ; comptes desormais dans le total reellement charge au demarrage.
const linkTags = [...html.matchAll(/<link\b[^>]*>/g)].map((match) => match[0])
const preloadSrcs = linkTags
  .filter((tag) => /rel\s*=\s*["']modulepreload["']/.test(tag))
  .map((tag) => tag.match(/href\s*=\s*["']([^"']+)["']/)?.[1])
  .filter((href) => href && href.includes('/assets/') && href.endsWith('.js'))

if (!existsSync(BUDGET_FILE)) fail(`${BUDGET_FILE} introuvable a la racine du projet`)
const budget = JSON.parse(readFileSync(BUDGET_FILE, 'utf-8'))

const entryBuffer = readFileSync(entryPath)
const entryBytes = entryBuffer.length
const gzipBytes = gzipSync(entryBuffer).length

const preloadFiles = preloadSrcs.map((src) => {
  const path = join(buildDir, src.replace(/^\//, ''))
  if (!existsSync(path)) fail(`chunk preload introuvable : ${path}`)
  const buffer = readFileSync(path)
  return { src, bytes: buffer.length, gzipBytes: gzipSync(buffer).length }
})

// Somme des gzip individuels : legere surestimation par rapport a un flux combine, mais c est
// la meme approximation deja documentee en Phase 2 — suffisante pour un garde-fou de regression.
const totalBytes = entryBytes + preloadFiles.reduce((sum, f) => sum + f.bytes, 0)
const totalGzipBytes = gzipBytes + preloadFiles.reduce((sum, f) => sum + f.gzipBytes, 0)

const kb = (bytes) => (bytes / 1000).toFixed(2)
const delta = (actual, reference) => {
  const diff = actual - reference
  const sign = diff > 0 ? '+' : ''
  const pct = reference === 0 ? 0 : (diff / reference) * 100
  return `${sign}${kb(diff)} kB (${sign}${pct.toFixed(1)} %)`
}

const checks = [
  { name: 'chunk d entree', actual: entryBytes, limit: budget.limits.entryBytes, base: budget.baseline.entryBytes },
  { name: 'chunk d entree gzip', actual: gzipBytes, limit: budget.limits.gzipBytes, base: budget.baseline.gzipBytes },
]

if (budget.limits.totalEntryBytes !== undefined) {
  checks.push({
    name: 'total demarrage (+ preload)',
    actual: totalBytes,
    limit: budget.limits.totalEntryBytes,
    base: budget.baseline.entryBytes,
  })
}
if (budget.limits.totalGzipBytes !== undefined) {
  checks.push({
    name: 'total demarrage gzip',
    actual: totalGzipBytes,
    limit: budget.limits.totalGzipBytes,
    base: budget.baseline.gzipBytes,
  })
}

const failures = checks.filter((check) => check.actual > check.limit)

if (asJson) {
  console.log(
    JSON.stringify(
      {
        buildDir,
        entryFile: entrySrc,
        entryBytes,
        gzipBytes,
        preloadFiles,
        totalBytes,
        totalGzipBytes,
        limits: budget.limits,
        baseline: budget.baseline,
        ok: failures.length === 0,
        failures: failures.map((check) => check.name),
      },
      null,
      2,
    ),
  )
  process.exit(failures.length === 0 ? 0 : 1)
}

console.log('')
console.log(`Budget bundle — ${buildDir}`)
console.log(`Chunk d entree : ${entrySrc}`)
if (preloadFiles.length > 0) {
  console.log(`Chunks precharges (modulepreload) : ${preloadFiles.map((f) => f.src).join(', ')}`)
}
console.log('')
for (const check of checks) {
  const status = check.actual > check.limit ? 'DEPASSE' : 'ok'
  console.log(
    `  ${check.name.padEnd(22)} ${kb(check.actual).padStart(9)} kB` +
      `  seuil ${kb(check.limit).padStart(9)} kB` +
      `  [${status}]`,
  )
  console.log(`  ${''.padEnd(22)} vs baseline ${budget.baseline.label ?? ''} : ${delta(check.actual, check.base)}`)
}
console.log('')

if (failures.length > 0) {
  console.error(
    `ECHEC — ${failures.length} seuil(s) depasse(s) : ${failures.map((check) => check.name).join(', ')}.\n` +
      `Reduire le bundle, ou ajuster ${BUDGET_FILE} en connaissance de cause.`,
  )
  process.exit(1)
}

console.log('Budget respecte.')
