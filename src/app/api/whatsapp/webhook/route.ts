import { NextRequest, NextResponse } from 'next/server'
import { handleIncomingMessage, sendWhatsAppMessage } from '@/lib/whatsapp'

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN ?? 'your-webhook-verify-token'

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

// Incoming messages (POST)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const entry   = body?.entry?.[0]
    const changes = entry?.changes?.[0]
    const value   = changes?.value
    const message = value?.messages?.[0]

    if (!message) return NextResponse.json({ ok: true })

    const from = message.from           // sender's phone number
    const text = message.text?.body ?? ''

    if (!text) return NextResponse.json({ ok: true })

    const reply = await handleIncomingMessage(from, text)
    await sendWhatsAppMessage(from, reply)

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('WhatsApp webhook error', e)
    return NextResponse.json({ ok: false }, { status: 200 }) // always 200 to Meta
  }
}
