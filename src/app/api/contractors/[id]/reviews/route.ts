export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getTokenFromRequest } from '@/lib/auth'
import { ok, err, handleError } from '@/lib/api'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getTokenFromRequest(req)
    if (!user) return err('Sign in to leave a review', 401)

    const { rating, comment, projectType } = await req.json()
    if (!rating || rating < 1 || rating > 5) return err('rating must be 1–5')

    const contractor = await prisma.contractor.findUnique({ where: { id: params.id } })
    if (!contractor) return err('Contractor not found', 404)

    // Prevent self-review
    if (contractor.userId === user.id) return err('You cannot review your own profile', 403)

    // Upsert — update if the user already left one
    const review = await prisma.contractorReview.upsert({
      where:  { contractorId_userId: { contractorId: params.id, userId: user.id } },
      update: { rating, comment: comment ?? '', projectType: projectType ?? '' },
      create: { contractorId: params.id, userId: user.id, rating, comment: comment ?? '', projectType: projectType ?? '' },
      include: { user: { select: { name: true } } },
    })

    // Recalculate avg and count
    const agg = await prisma.contractorReview.aggregate({
      where: { contractorId: params.id },
      _avg:   { rating: true },
      _count: { rating: true },
    })
    await prisma.contractor.update({
      where: { id: params.id },
      data:  { avgRating: Math.round((agg._avg.rating ?? 0) * 10) / 10, reviewCount: agg._count.rating },
    })

    return ok(review, 201)
  } catch (e) { return handleError(e) }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getTokenFromRequest(req)
    if (!user) return err('Unauthorized', 401)

    await prisma.contractorReview.deleteMany({
      where: { contractorId: params.id, userId: user.id },
    })

    const agg = await prisma.contractorReview.aggregate({
      where: { contractorId: params.id },
      _avg:   { rating: true },
      _count: { rating: true },
    })
    await prisma.contractor.update({
      where: { id: params.id },
      data:  { avgRating: Math.round((agg._avg.rating ?? 0) * 10) / 10, reviewCount: agg._count.rating },
    })

    return ok({ deleted: true })
  } catch (e) { return handleError(e) }
}
