import { prisma } from './db'

const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
const TOKEN = process.env.WHATSAPP_ACCESS_TOKEN

export async function sendWhatsAppMessage(to: string, text: string) {
  if (!PHONE_ID || !TOKEN) {
    console.log(`[WhatsApp mock] → ${to}: ${text}`)
    return
  }
  await fetch(`https://graph.facebook.com/v19.0/${PHONE_ID}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  })
}

export async function handleIncomingMessage(phone: string, body: string): Promise<string> {
  const text = body.trim().toLowerCase()

  if (text === 'menu' || text === 'hi' || text === 'hello' || text === 'start') {
    return `🏗️ *BuildPriceGambia*\n\nWelcome! Reply with a number:\n\n1️⃣ Check material price\n2️⃣ Find a supplier\n3️⃣ Set price alert\n\nOr type any material name (e.g. "cement")`
  }

  if (text === '1' || text === 'check price' || text === 'price') {
    return `📋 *Check a price*\n\nType the material name, e.g:\n• cement\n• rebar\n• sand\n• zinc sheet\n• timber`
  }

  if (text === '2' || text === 'supplier' || text === 'supplier info') {
    const suppliers = await prisma.supplier.findMany({
      where: { verified: true },
      take: 5,
      select: { name: true, location: true, contact: true },
    })
    const lines = suppliers.map(s => `• *${s.name}* — ${s.location}\n  📞 ${s.contact}`)
    return `🏪 *Verified Suppliers*\n\n${lines.join('\n\n')}\n\nVisit buildpricegambia.com for full list`
  }

  if (text === '3' || text === 'alert' || text === 'set alert') {
    return `🔔 *Price Alerts*\n\nTo set an alert, visit:\nbuildpricegambia.com/alerts\n\nOr reply:\nalert [material] [target price]\n\nExample: *alert cement 700*`
  }

  // Parse "alert cement 700"
  const alertMatch = text.match(/^alert\s+(.+?)\s+(\d+(?:\.\d+)?)$/)
  if (alertMatch) {
    const [, matName, priceStr] = alertMatch
    const material = await prisma.material.findFirst({
      where: { name: { contains: matName } },
    })
    if (!material) return `❌ Material "${matName}" not found. Try "cement", "rebar", or "sand".`
    return `✅ Alert set!\nWe'll notify you when *${material.name}* drops below *D${priceStr}*.\n\nTo manage alerts, visit buildpricegambia.com/alerts`
  }

  // Search for material prices
  const material = await prisma.material.findFirst({
    where: { name: { contains: text } },
    include: {
      prices: {
        where: { stockStatus: { not: 'OUT_OF_STOCK' } },
        include: { supplier: true },
        orderBy: { price: 'asc' },
        take: 5,
      },
    },
  })

  if (!material) {
    return `🔍 No results for "${body}".\n\nTry: cement, rebar, sand, timber, zinc sheet\n\nReply *menu* for options`
  }

  if (material.prices.length === 0) {
    return `📦 *${material.name}*\n\nNo prices listed right now.\nVisit buildpricegambia.com for updates`
  }

  const lowest = material.prices[0]
  const lines = material.prices.map(
    (p, i) => `${i + 1}. *D${p.price}/${p.unit}*\n   ${p.supplier.name} — ${p.supplier.location}`
  )

  return `💰 *${material.name} Prices*\n\n${lines.join('\n\n')}\n\n✅ Lowest: D${lowest.price}/${lowest.unit} at ${lowest.supplier.name}\n📞 ${lowest.supplier.contact}\n\nReply *menu* for more options`
}
