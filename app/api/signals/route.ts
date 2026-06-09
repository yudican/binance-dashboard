import { NextRequest, NextResponse } from 'next/server'
import {
  ValidationError,
  deleteSignal,
  listSignals,
  updateProgress,
  upsertSignal,
} from '@/lib/signalStore'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/signals -> active (non-expired) signals, newest first
export async function GET() {
  const signals = await listSignals()
  return NextResponse.json({ signals })
}

// POST /api/signals -> upsert one signal (replace if same pair+side exists)
export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  try {
    const signal = await upsertSignal(body)
    return NextResponse.json({ signal }, { status: 201 })
  } catch (e: any) {
    if (e instanceof ValidationError) {
      return NextResponse.json({ error: e.message }, { status: 400 })
    }
    return NextResponse.json({ error: e?.message || 'Failed to save signal' }, { status: 500 })
  }
}

// PATCH /api/signals -> persist live progress (TP reached / stop hit)
// Body: { id: string, targetsHit?: number, stopHit?: boolean }
export async function PATCH(req: NextRequest) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const id = typeof body?.id === 'string' ? body.id : ''
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const targetsHit =
    typeof body?.targetsHit === 'number' && isFinite(body.targetsHit) ? body.targetsHit : undefined
  const stopHit = body?.stopHit === true

  const signal = await updateProgress(id, { targetsHit, stopHit })
  if (!signal) return NextResponse.json({ error: 'Signal not found' }, { status: 404 })
  return NextResponse.json({ signal })
}

// DELETE /api/signals?id=<id> -> remove one signal
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id query param' }, { status: 400 })
  const removed = await deleteSignal(id)
  if (!removed) return NextResponse.json({ error: 'Signal not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
