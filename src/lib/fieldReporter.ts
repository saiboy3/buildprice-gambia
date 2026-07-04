import { prisma } from './db'

/**
 * Resolves a phone number to a durable FieldReporter identity.
 * - If the phone is already linked to a reporter, returns that reporter
 *   (ignores whatever name was typed this time — the canonical name only
 *   changes via admin edit, not a random re-submission).
 * - If the phone is new, creates a fresh FieldReporter + link.
 *
 * Duplicate people using a second/new phone number show up as a second
 * reporter until an admin notices and merges them — see mergeReporters().
 */
export async function resolveReporter(phone: string, name: string) {
  const existingLink = await prisma.fieldReporterPhone.findUnique({
    where: { phone },
    include: { reporter: true },
  })
  if (existingLink) return existingLink.reporter

  const reporter = await prisma.fieldReporter.create({
    data: {
      name,
      phones: { create: { phone } },
    },
  })
  return reporter
}

/** Look up a reporter's known name by phone, for prefill purposes (no creation). */
export async function lookupReporterName(phone: string): Promise<string | null> {
  const link = await prisma.fieldReporterPhone.findUnique({
    where: { phone },
    include: { reporter: true },
  })
  return link?.reporter.name ?? null
}

/** Merge `fromId` into `intoId`: moves all phones + reports, deletes the duplicate. */
export async function mergeReporters(intoId: string, fromId: string) {
  if (intoId === fromId) throw new Error('Cannot merge a reporter into itself')
  await prisma.$transaction([
    prisma.fieldReporterPhone.updateMany({ where: { reporterId: fromId }, data: { reporterId: intoId } }),
    prisma.fieldReport.updateMany({ where: { reporterId: fromId }, data: { reporterId: intoId } }),
    prisma.fieldReporter.delete({ where: { id: fromId } }),
  ])
}
