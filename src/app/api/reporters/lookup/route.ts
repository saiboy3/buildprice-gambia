import { NextRequest } from 'next/server'
import { ok, err, handleError } from '@/lib/api'
import { lookupReporterName } from '@/lib/fieldReporter'

const PHONE_RE = /^\+?\d{7,15}$/

export async function GET(req: NextRequest) {
  try {
    const phone = new URL(req.url).searchParams.get('phone') ?? ''
    if (!PHONE_RE.test(phone)) return err('A valid phone number is required')
    const name = await lookupReporterName(phone.trim())
    return ok({ name })
  } catch (e) {
    return handleError(e)
  }
}
