import { NextResponse } from 'next/server'
import { prisma } from './db'
import { AuthError } from './auth'

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status })
}

export function err(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status })
}

export function handleError(e: unknown) {
  if (e instanceof AuthError) return err(e.message, e.status)
  console.error(e)
  return err('Internal server error', 500)
}

export async function log(action: string, userId?: string, details?: string) {
  await prisma.activityLog.create({ data: { action, userId, details } }).catch(() => {})
}
