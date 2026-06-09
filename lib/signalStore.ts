import { promises as fs } from 'fs'
import path from 'path'
import {
  DUMMY_SIGNALS,
  timeAgo,
  type Signal,
  type SignalSide,
  type SignalStatus,
} from './signals'

const FILE = path.join(process.cwd(), '.data', 'signals.json')
const TTL_MS = 24 * 60 * 60 * 1000

/** On-disk shape: a Signal minus the derived `createdAgo`, plus timestamps. */
export interface StoredSignal extends Omit<Signal, 'createdAgo'> {
  createdAt: number
  updatedAt: number
}

/**
 * Payload accepted by POST /api/signals. Server manages id/createdAt/createdAgo,
 * and `current` / `pnlPercent` / `targetsHit` default if omitted.
 */
export interface SignalInput {
  pair: string
  side: SignalSide
  status: SignalStatus
  leverage: number
  confidence: number
  entry: number
  targets: number[]
  stopLoss: number
  thesis: string
  reasons: string[]
  invalidation: string
  timeframe: string
  current?: number
  pnlPercent?: number
  targetsHit?: number
}

export class ValidationError extends Error {}

/** Stable id from pair + side, also used as the detail-page route param. */
export function deriveId(pair: string, side: string): string {
  return `${pair}-${side}`.toLowerCase().replace(/[^a-z0-9-]/g, '')
}

async function writeRaw(rows: StoredSignal[]): Promise<void> {
  await fs.mkdir(path.dirname(FILE), { recursive: true })
  await fs.writeFile(FILE, JSON.stringify(rows, null, 2), 'utf8')
}

async function readRaw(): Promise<StoredSignal[]> {
  try {
    const txt = await fs.readFile(FILE, 'utf8')
    const arr = JSON.parse(txt)
    return Array.isArray(arr) ? arr : []
  } catch (e: any) {
    if (e?.code === 'ENOENT') {
      const seeded = seed()
      await writeRaw(seeded)
      return seeded
    }
    return []
  }
}

function prune(rows: StoredSignal[]): StoredSignal[] {
  const cutoff = Date.now() - TTL_MS
  return rows.filter((r) => r.createdAt >= cutoff)
}

function toSignal(r: StoredSignal): Signal {
  const { createdAt, updatedAt, ...rest } = r
  return { ...rest, createdAgo: timeAgo(updatedAt || createdAt) }
}

/** Seed the store from the bundled dummy signals on first run. */
function seed(): StoredSignal[] {
  const now = Date.now()
  return DUMMY_SIGNALS.map((s, i) => {
    const { createdAgo, ...rest } = s
    const ts = now - i * 7 * 60 * 1000
    return { ...rest, id: deriveId(s.pair, s.side), createdAt: ts, updatedAt: ts }
  })
}

export async function listSignals(): Promise<Signal[]> {
  const rows = await readRaw()
  const pruned = prune(rows)
  if (pruned.length !== rows.length) await writeRaw(pruned)
  return pruned
    .slice()
    .sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt))
    .map(toSignal)
}

export async function getSignalById(id: string): Promise<Signal | undefined> {
  const found = prune(await readRaw()).find((r) => r.id === id)
  return found ? toSignal(found) : undefined
}

export async function upsertSignal(input: unknown): Promise<Signal> {
  const clean = validate(input)
  const rows = prune(await readRaw())
  const id = deriveId(clean.pair, clean.side)
  const now = Date.now()
  const idx = rows.findIndex((r) => r.id === id)

  const row: StoredSignal = {
    id,
    pair: clean.pair.toUpperCase(),
    side: clean.side,
    status: clean.status,
    leverage: clean.leverage,
    confidence: clean.confidence,
    entry: clean.entry,
    targets: clean.targets,
    stopLoss: clean.stopLoss,
    current: clean.current ?? clean.entry,
    pnlPercent: clean.pnlPercent ?? 0,
    targetsHit: clean.targetsHit ?? 0,
    thesis: clean.thesis,
    reasons: clean.reasons,
    invalidation: clean.invalidation,
    timeframe: clean.timeframe,
    createdAt: idx >= 0 ? rows[idx].createdAt : now,
    updatedAt: now,
  }

  if (idx >= 0) rows[idx] = row
  else rows.push(row)
  await writeRaw(rows)
  return toSignal(row)
}

export async function deleteSignal(id: string): Promise<boolean> {
  const rows = await readRaw()
  const next = rows.filter((r) => r.id !== id)
  const changed = next.length !== rows.length
  if (changed) await writeRaw(next)
  return changed
}

function validate(b: any): SignalInput {
  if (!b || typeof b !== 'object') throw new ValidationError('Body must be a JSON object')

  const str = (k: string): string => {
    const v = b[k]
    if (typeof v !== 'string' || !v.trim()) throw new ValidationError(`"${k}" must be a non-empty string`)
    return v.trim()
  }
  const numb = (k: string): number => {
    const v = typeof b[k] === 'string' ? parseFloat(b[k]) : b[k]
    if (typeof v !== 'number' || !isFinite(v)) throw new ValidationError(`"${k}" must be a number`)
    return v
  }
  const optNum = (k: string): number | undefined => {
    if (b[k] === undefined || b[k] === null) return undefined
    return numb(k)
  }

  const side = String(b.side).toUpperCase()
  if (side !== 'LONG' && side !== 'SHORT') throw new ValidationError('"side" must be LONG or SHORT')

  const status = String(b.status).toLowerCase()
  if (!['active', 'pending', 'closed'].includes(status))
    throw new ValidationError('"status" must be active, pending or closed')

  if (!Array.isArray(b.targets) || b.targets.length === 0)
    throw new ValidationError('"targets" must be a non-empty array of numbers')
  const targets = b.targets.map((t: any) => {
    const n = typeof t === 'string' ? parseFloat(t) : t
    if (typeof n !== 'number' || !isFinite(n)) throw new ValidationError('"targets" must contain only numbers')
    return n
  })

  if (!Array.isArray(b.reasons) || b.reasons.some((r: any) => typeof r !== 'string'))
    throw new ValidationError('"reasons" must be an array of strings')

  return {
    pair: str('pair').toUpperCase(),
    side: side as SignalSide,
    status: status as SignalStatus,
    leverage: numb('leverage'),
    confidence: numb('confidence'),
    entry: numb('entry'),
    targets,
    stopLoss: numb('stopLoss'),
    thesis: str('thesis'),
    reasons: b.reasons as string[],
    invalidation: str('invalidation'),
    timeframe: str('timeframe'),
    current: optNum('current'),
    pnlPercent: optNum('pnlPercent'),
    targetsHit: optNum('targetsHit'),
  }
}
