import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { ok, err, handleError } from '@/lib/api'
import { isRateLimited, getClientIp } from '@/lib/rateLimit'
import { resolveReporter } from '@/lib/fieldReporter'

const PHONE_RE = /^\+?\d{7,15}$/

export async function POST(req: NextRequest) {
  try {
    const { reporterName, reporterPhone, materialId, materialLabel, price, unit, location, supplierName, photoNote } = await req.json()

    if (!reporterPhone || !PHONE_RE.test(reporterPhone)) return err('A valid phone number is required')
    if (!reporterName || typeof reporterName !== 'string' || !reporterName.trim()) return err('Your name is required')
    if (!materialLabel || typeof materialLabel !== 'string') return err('Material is required')
    if (typeof price !== 'number' || price <= 0) return err('Enter a valid price')
    if (!unit || typeof unit !== 'string') return err('Unit is required')
    if (!location || typeof location !== 'string') return err('Location is required')

    // Generous but bounded — legitimate field reporters may submit many entries a day.
    const ip = getClientIp(req)
    const [phoneLimited, ipLimited] = await Promise.all([
      isRateLimited(`field-report:phone:${reporterPhone}`, 50, 24 * 60 * 60 * 1000),
      isRateLimited(`field-report:ip:${ip}`, 100, 60 * 60 * 1000),
    ])
    if (phoneLimited || ipLimited) return err('Submission limit reached. Please try again later.', 429)

    const phone = reporterPhone.trim()
    const reporter = await resolveReporter(phone, reporterName.trim().slice(0, 100))

    await prisma.fieldReport.create({
      data: {
        reporterId: reporter.id,
        reporterName: reporterName.trim().slice(0, 100),
        reporterPhone: phone,
        materialId: typeof materialId === 'string' ? materialId : null,
        materialLabel: materialLabel.slice(0, 100),
        price,
        unit: unit.slice(0, 50),
        location: location.slice(0, 100),
        supplierName: typeof supplierName === 'string' ? supplierName.slice(0, 100) : null,
        photoNote: typeof photoNote === 'string' ? photoNote.slice(0, 300) : null,
      },
    })

    const totalCount = await prisma.fieldReport.count({ where: { reporterId: reporter.id } })

    return ok({ totalCount, reporterName: reporter.name }, 201)
  } catch (e) {
    return handleError(e)
  }
}
