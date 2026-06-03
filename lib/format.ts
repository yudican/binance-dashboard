export const num = (n: string | number | null | undefined) => {
  if (n === null || n === undefined) return 0
  return parseFloat(String(n)) || 0
}

export const fmt = (n: string | number | null | undefined, dec = 2) => {
  const v = num(n)
  return v.toLocaleString('en-US', {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  })
}

export const fmtSign = (n: string | number | null | undefined, dec = 2) => {
  const v = num(n)
  const sign = v > 0 ? '+' : v < 0 ? '-' : ''
  return (
    sign +
    Math.abs(v).toLocaleString('en-US', {
      minimumFractionDigits: dec,
      maximumFractionDigits: dec,
    })
  )
}

export const fmtTime = (ts: number) => {
  const d = new Date(ts)
  const date = d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  return `${date} ${time}`
}

export const fmtDate = (ts: number) => {
  const d = new Date(ts)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export const fmtMoney = (n: string | number | null | undefined, dec = 2) => {
  const v = num(n)
  const sign = v > 0 ? '+' : v < 0 ? '-' : ''
  return (
    sign +
    '$' +
    Math.abs(v).toLocaleString('en-US', {
      minimumFractionDigits: dec,
      maximumFractionDigits: dec,
    })
  )
}

export const fmtCompact = (n: number) => {
  if (!isFinite(n) || n === 0) return '0'
  const abs = Math.abs(n)
  const sign = n >= 0 ? '+' : '-'
  if (abs >= 1_000_000) return sign + (abs / 1_000_000).toFixed(1) + 'M'
  if (abs >= 1_000) return sign + (abs / 1_000).toFixed(1) + 'k'
  if (abs >= 10) return sign + abs.toFixed(0)
  return sign + abs.toFixed(1)
}

export const fmtPct = (n: number, dec = 2) =>
  (n >= 0 ? '+' : '') + n.toFixed(dec) + '%'

export const startOfDay = (d: Date | number) => {
  const dt = new Date(d)
  dt.setHours(0, 0, 0, 0)
  return dt.getTime()
}

export const endOfDay = (d: Date | number) => {
  const dt = new Date(d)
  dt.setHours(23, 59, 59, 999)
  return dt.getTime()
}

export const daysAgo = (n: number) => Date.now() - n * 24 * 60 * 60 * 1000

export const sameDay = (a: number, b: number) => {
  const d1 = new Date(a)
  const d2 = new Date(b)
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}
