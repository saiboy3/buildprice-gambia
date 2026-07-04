import { prisma } from './db'

/**
 * Resolves a user's supplier ID by looking up the Supplier row directly,
 * rather than trusting `user.supplierId` from the JWT payload — that value
 * is only as fresh as the last login, so a supplier who creates their profile
 * (e.g. via the profile setup wizard) without logging back in would otherwise
 * get "no supplier profile" errors on every supplier-scoped endpoint.
 */
export async function getMySupplierId(userId: string): Promise<string | null> {
  const supplier = await prisma.supplier.findUnique({ where: { userId }, select: { id: true } })
  return supplier?.id ?? null
}
