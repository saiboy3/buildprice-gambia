import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getTokenFromRequest } from '@/lib/auth'
import { ok, err, handleError } from '@/lib/api'
import { isRateLimited, getClientIp } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  try {
    const { message, page, contact, role } = await req.json()
    if (!message || typeof message !== 'string' || message.trim().length < 3) {
      return err('Please enter a message (at least 3 characters)')
    }
    if (message.length > 2000) return err('Message is too long (max 2000 characters)')

    const ip = getClientIp(req)
    if (await isRateLimited(`feedback:ip:${ip}`, 10, 60 * 60 * 1000)) {
      return err('Too many submissions. Please try again later.', 429)
    }

    const user = getTokenFromRequest(req)

    const feedback = await prisma.feedback.create({
      data: {
        message: message.trim().slice(0, 2000),
        page: typeof page === 'string' ? page.slice(0, 200) : null,
        contact: typeof contact === 'string' ? contact.slice(0, 200) : null,
        role: typeof role === 'string' ? role.slice(0, 50) : null,
        userId: user?.id,
      },
    })
    return ok({ id: feedback.id }, 201)
  } catch (e) {
    return handleError(e)
  }
}
