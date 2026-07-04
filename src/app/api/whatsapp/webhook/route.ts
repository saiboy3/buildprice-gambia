import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { handleIncomingMessage, sendWhatsAppMessage } from '@/lib/whatsapp'

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN ?? 'your-webhook-verify-token'
const APP_SECRET    = process.env.WHATSAPP_APP_SECRET

// Webhook verification (GET) — Meta calls this once to verify the endpoint
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode      = searchParams.get('hub.mode')
  const token     = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }

  return new NextResponse('Forbidden', { status: 403 })
}

/** Verify Meta's X-Hub-Signature-256 header against the raw request body. */
function isValidSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!APP_SECRET) {
    // Not configured yet — allow through but log loudly so it gets fixed before real traffic.
    console.warn('[WhatsApp webhook] WHATSAPP_APP_SECRET is not set — signature verification is DISABLED. Set it in Vercel env vars.')
    return true
  }
  if (!signatureHeader) return false

  const expected = 'sha256=' + crypto.createHmac('sha256', APP_SECRET).update(rawBody).digest('hex')
  const expectedBuf = Buffer.from(expected)
  const actualBuf   = Buffer.from(signatureHeader)
  if (expectedBuf.length !== actualBuf.length) return false
  return crypto.timingSafeEqual(expectedBuf, actualBuf)
}

// Incoming messages (POST)
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()

    if (!isValidSignature(rawBody, req.headers.get('x-hub-signature-256'))) {
      console.error('[WhatsApp webhook] Invalid signature — rejecting request')
      return NextResponse.json({ ok: false }, { status: 401 })
    }

    const body = JSON.parse(rawBody)

    const entry   = body?.entry?.[0]
    const changes = entry?.changes?.[0]
    const value   = changes?.value
    const message = value?.messages?.[0]

    if (!message) return NextResponse.json({ ok: true })

    const from     = message.from           // sender's phone number
    const text     = message.text?.body ?? ''
    const location = message.location       // { latitude, longitude } if the user shared their location

    if (!text && !location) return NextResponse.json({ ok: true })

    const reply = await handleIncomingMessage(from, text, location ? { lat: location.latitude, lng: location.longitude } : undefined)
    await sendWhatsAppMessage(from, reply)

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('WhatsApp webhook error', e)
    return NextResponse.json({ ok: false }, { status: 200 }) // always 200 to Meta
  }
}
