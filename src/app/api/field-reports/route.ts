import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { ok, err, handleError } from '@/lib/api'
import { isRateLimited, getClientIp } from '@/lib/rateLimit'
import { getOrCreateReporterForUser, getReporterStats } from '@/lib/fieldReporter'
import { computeConfidence, initialStatusForConfidence } from '@/lib/confidence'

export async function POST(req: NextRequest) {
  try {
    // Identity comes from the authenticated account, not client-supplied
    // name/phone — common Gambian name combinations repeat often enough that
    // typed-in identity would be ambiguous, and a real account can't be
    // impersonated the way a typed phone number can.
    const authUser = requireAuth(req)

    const { materialId, materialLabel, price, unit, location, lat, lng, supplierName, photoNote } = await req.json()

    if (!materialLabel || typeof materialLabel !== 'string') return err('Material is required')
    if (typeof price !== 'number' || price <= 0) return err('Enter a valid price')
    if (!unit || typeof unit !== 'string') return err('Unit is required')
    if (!location || typeof location !== 'string') return err('Location is required')
    if (lat !== undefined && (typeof lat !== 'number' || lat < -90 || lat > 90)) return err('Invalid latitude')
    if (lng !== undefined && (typeof lng !== 'number' || lng < -180 || lng > 180)) return err('Invalid longitude')

    // Generous but bounded — legitimate field reporters may submit many entries a day.
    const ip = getClientIp(req)
    const [userLimited, ipLimited] = await Promise.all([
      isRateLimited(`field-report:user:${authUser.id}`, 50, 24 * 60 * 60 * 1000),
      isRateLimited(`field-report:ip:${ip}`, 100, 60 * 60 * 1000),
    ])
    if (userLimited || ipLimited) return err('Submission limit reached. Please try again later.', 429)

    const reporter = await getOrCreateReporterForUser(authUser.id)
    const stats = await getReporterStats(reporter.id)
    const confidence = computeConfidence(stats)
    const status = initialStatusForConfidence(confidence)

    const report = await prisma.fieldReport.create({
      data: {
        reporterId: reporter.id,
        materialId: typeof materialId === 'string' ? materialId : null,
        materialLabel: materialLabel.slice(0, 100),
        price,
        unit: unit.slice(0, 50),
        location: location.slice(0, 100),
        lat: typeof lat === 'number' ? lat : null,
        lng: typeof lng === 'number' ? lng : null,
        supplierName: typeof supplierName === 'string' ? supplierName.slice(0, 100) : null,
        photoNote: typeof photoNote === 'string' ? photoNote.slice(0, 300) : null,
        confidence,
        status,
      },
    })

    const totalCount = await prisma.fieldReport.count({ where: { reporterId: reporter.id } })

    return ok({ totalCount, reporterName: reporter.user.name, confidence: report.confidence, status: report.status }, 201)
  } catch (e) {
    return handleError(e)
  }
}
