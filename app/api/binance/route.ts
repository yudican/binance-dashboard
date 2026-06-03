import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BASE = 'https://fapi.binance.com'

export async function POST(req: NextRequest) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { path, params = {}, method = 'GET', signed = true } = body || {}
  const apiKey: string = body?.apiKey || process.env.BINANCE_API_KEY || ''
  const apiSecret: string = body?.apiSecret || process.env.BINANCE_API_SECRET || ''

  if (!path || typeof path !== 'string' || !path.startsWith('/fapi/')) {
    return NextResponse.json({ error: 'Invalid Binance path' }, { status: 400 })
  }
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing API key' }, { status: 401 })
  }
  if (signed && !apiSecret) {
    return NextResponse.json({ error: 'Missing API secret' }, { status: 401 })
  }

  const upperMethod = String(method).toUpperCase()

  const query = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue
    query.append(k, String(v))
  }

  if (signed) {
    query.append('timestamp', String(Date.now()))
    query.append('recvWindow', '6000')
    const signature = crypto.createHmac('sha256', apiSecret).update(query.toString()).digest('hex')
    query.append('signature', signature)
  }

  const qs = query.toString()
  const url = `${BASE}${path}${qs ? `?${qs}` : ''}`

  try {
    const res = await fetch(url, {
      method: upperMethod,
      headers: { 'X-MBX-APIKEY': apiKey },
      cache: 'no-store',
    })
    const text = await res.text()
    let data: any
    try {
      data = text ? JSON.parse(text) : {}
    } catch {
      data = { raw: text }
    }
    if (!res.ok) {
      return NextResponse.json(
        { error: data?.msg || data?.error || `Binance error ${res.status}` },
        { status: res.status }
      )
    }
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Network error contacting Binance' },
      { status: 502 }
    )
  }
}
