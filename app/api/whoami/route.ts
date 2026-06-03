import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Returns the outbound IP the server is using for upstream calls.
 * Useful when whitelisting an IP at Binance — note that on Vercel
 * serverless this IP is NOT stable across cold starts / regions.
 */
export async function GET() {
  try {
    const r = await fetch('https://api.ipify.org?format=json', {
      cache: 'no-store',
    })
    const data = await r.json()
    return NextResponse.json({
      outboundIp: data.ip,
      region: process.env.VERCEL_REGION || null,
      runtime: 'nodejs',
      note: 'Serverless outbound IPs are dynamic — whitelisting a single value will not be stable.',
    })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Failed to fetch IP' },
      { status: 500 }
    )
  }
}
