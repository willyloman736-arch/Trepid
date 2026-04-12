import clsx, { ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export const fmtMoney = (n: number): string =>
  `${n >= 0 ? '+' : '-'}$${Math.abs(n).toFixed(2)}`

export const fmtTime = (date: string | Date = new Date()): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toTimeString().slice(0, 5)
}

export const fmtClock = (totalSeconds: number): string => {
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0')
  const ss = String(Math.floor(totalSeconds % 60)).padStart(2, '0')
  return `${mm}:${ss}`
}

export const uid = (): string =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`

export const clamp = (n: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, n))
