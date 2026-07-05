import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { handleError } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    const authUser = requireAuth(req)

    const [
      user,
      supplier,
      contractorProfile,
      fieldReporter,
      alerts,
      estimates,
      contractorReviews,
      supplierReviews,
      rfqs,
      stockAlerts,
      forumThreads,
      forumReplies,
      apiKeys,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: authUser.id },
        select: { id: true, name: true, phone: true, email: true, role: true, createdAt: true, updatedAt: true },
      }),
      prisma.supplier.findUnique({ where: { userId: authUser.id } }),
      prisma.contractor.findUnique({ where: { userId: authUser.id } }),
      prisma.fieldReporter.findUnique({ where: { userId: authUser.id }, include: { reports: true } }),
      prisma.alert.findMany({ where: { userId: authUser.id } }),
      prisma.estimate.findMany({ where: { userId: authUser.id } }),
      prisma.contractorReview.findMany({ where: { userId: authUser.id } }),
      prisma.supplierReview.findMany({ where: { userId: authUser.id } }),
      prisma.rFQ.findMany({ where: { userId: authUser.id } }),
      prisma.stockAlert.findMany({ where: { userId: authUser.id } }),
      prisma.forumThread.findMany({ where: { userId: authUser.id } }),
      prisma.forumReply.findMany({ where: { userId: authUser.id } }),
      prisma.apiKey.findMany({ where: { userId: authUser.id } }),
    ])

    const exportData = {
      exportedAt: new Date().toISOString(),
      note: 'This is a complete export of your personal data held by BuildPriceGambia, provided under GDPR Article 15 (right of access).',
      account: user,
      supplierProfile: supplier,
      contractorProfile,
      fieldReporterProfile: fieldReporter,
      priceAlerts: alerts,
      estimates,
      contractorReviewsWritten: contractorReviews,
      supplierReviewsWritten: supplierReviews,
      rfqRequests: rfqs,
      stockAlerts,
      forumThreads,
      forumReplies,
      apiKeys,
    }

    return new Response(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="buildpricegambia-data-export-${authUser.id}.json"`,
      },
    })
  } catch (e) {
    return handleError(e)
  }
}
