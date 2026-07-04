import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getTokenFromRequest } from '@/lib/auth'
import { ok, err, handleError } from '@/lib/api'

// "My contractor profile" — scoped to the authenticated user. Creation still
// goes through POST /api/contractors (kept as-is); this route covers
// fetching-mine and editing, which didn't exist before at all.
export async function GET(req: NextRequest) {
  try {
    const user = getTokenFromRequest(req)
    if (!user) return err('Sign in required', 401)
    const contractor = await prisma.contractor.findUnique({ where: { userId: user.id } })
    return ok(contractor)
  } catch (e) {
    return handleError(e)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = getTokenFromRequest(req)
    if (!user) return err('Sign in required', 401)

    const existing = await prisma.contractor.findUnique({ where: { userId: user.id } })
    if (!existing) return err('No contractor profile yet — create one first', 404)

    const { name, specialty, location, contact, bio, yearsExp } = await req.json()

    const contractor = await prisma.contractor.update({
      where: { id: existing.id },
      data: {
        ...(name ? { name: name.slice(0, 100) } : {}),
        ...(specialty ? { specialty: specialty.slice(0, 100) } : {}),
        ...(location ? { location: location.slice(0, 100) } : {}),
        ...(contact ? { contact: contact.slice(0, 50) } : {}),
        ...(bio !== undefined ? { bio: String(bio).slice(0, 1000) } : {}),
        ...(yearsExp !== undefined ? { yearsExp: Math.max(0, Math.min(60, Number(yearsExp) || 0)) } : {}),
      },
    })
    return ok(contractor)
  } catch (e) {
    return handleError(e)
  }
}
