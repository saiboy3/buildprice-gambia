export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getTokenFromRequest } from '@/lib/auth'
import { ok, err, handleError } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const specialty  = searchParams.get('specialty') ?? ''
    const location   = searchParams.get('location') ?? ''
    const verifiedOnly = searchParams.get('verified') === 'true'
    const minRating  = parseFloat(searchParams.get('min_rating') ?? '0') || 0

    const contractors = await prisma.contractor.findMany({
      where: {
        ...(specialty    ? { specialty: { contains: specialty, mode: 'insensitive' } } : {}),
        ...(location     ? { location:  { contains: location,  mode: 'insensitive' } } : {}),
        ...(verifiedOnly ? { verified: true } : {}),
        ...(minRating    ? { avgRating: { gte: minRating } } : {}),
      },
      orderBy: [{ verified: 'desc' }, { avgRating: 'desc' }, { reviewCount: 'desc' }],
      include: { reviews: { take: 2, orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true } } } } },
    })

    return ok(contractors)
  } catch (e) { return handleError(e) }
}

export async function POST(req: NextRequest) {
  try {
    const user = getTokenFromRequest(req)
    if (!user) return err('Sign in to register as a contractor', 401)

    const { name, specialty, location, contact, bio, yearsExp } = await req.json()
    if (!name || !specialty || !location || !contact) return err('name, specialty, location and contact are required')

    // One profile per user
    const existing = await prisma.contractor.findUnique({ where: { userId: user.id } })
    if (existing) return err('You already have a contractor profile', 409)

    const contractor = await prisma.contractor.create({
      data: { name, specialty, location, contact, bio: bio ?? '', yearsExp: yearsExp ?? 0, userId: user.id },
    })
    await prisma.user.update({ where: { id: user.id }, data: { role: 'CONTRACTOR' } })

    return ok(contractor, 201)
  } catch (e) { return handleError(e) }
}
