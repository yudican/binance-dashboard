import { NextRequest, NextResponse } from 'next/server'
import {
  ValidationError,
  deleteSignal,
  listSignals,
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

// DELETE /api/signals?id=<id> -> remove one signal
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id query param' }, { status: 400 })
  const removed = await deleteSignal(id)
  if (!removed) return NextResponse.json({ error: 'Signal not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
