import { prisma } from './db'
import { hashPassword } from './auth'
import crypto from 'crypto'

/**
 * Ensures a FieldReporter profile exists for an already-authenticated User
 * (web submissions — identity comes from a real logged-in account, not a
 * typed name/phone, so there's no duplicate-name ambiguity to resolve).
 */
export async function getOrCreateReporterForUser(userId: string) {
  const existing = await prisma.fieldReporter.findUnique({ where: { userId }, include: { user: true } })
  if (existing) return existing

  return prisma.fieldReporter.create({
    data: { userId },
    include: { user: true },
  })
}

/**
 * WhatsApp channel: the sender's phone number is verified by the WhatsApp
 * platform itself (Meta confirms SIM ownership at WhatsApp registration), so
 * it doubles as a legitimate account identifier without requiring a typed
 * password. Finds or creates a User for this phone, then ensures a linked
 * FieldReporter profile. A random unusable password is set — this account
 * exists to hold identity/history, not for password-based web login (that
 * would require a separate password-set step, not built yet).
 */
export async function getOrCreateReporterForPhone(phone: string, name: string) {
  let user = await prisma.user.findUnique({ where: { phone } })
  if (!user) {
    const randomPassword = crypto.randomBytes(24).toString('hex')
    user = await prisma.user.create({
      data: {
        name: name.slice(0, 100),
        phone,
        password: await hashPassword(randomPassword),
        role: 'USER',
      },
    })
  }

  const existing = await prisma.fieldReporter.findUnique({ where: { userId: user.id }, include: { user: true } })
  if (existing) return existing

  return prisma.fieldReporter.create({
    data: { userId: user.id },
    include: { user: true },
  })
}

/** Look up a known WhatsApp reporter's name by phone, for the "welcome back" recognition (no creation). */
export async function lookupUserNameByPhone(phone: string): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { phone }, select: { name: true } })
  return user?.name ?? null
}
