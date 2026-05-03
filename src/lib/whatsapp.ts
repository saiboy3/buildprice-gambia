import { prisma } from './db'

const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
const TOKEN    = process.env.WHATSAPP_ACCESS_TOKEN

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

// ─── Quick mini-estimator ────────────────────────────────────────────────────

async function quickEstimate(sizeM2: number): Promise<string> {
  // Fetch market prices for key materials
  const [cement, blocks, sand, zinc] = await Promise.all([
    prisma.price.findFirst({ where: { material: { name: { contains: 'cement' } }, stockStatus: { not: 'OUT_OF_STOCK' } }, orderBy: { price: 'asc' } }),
    prisma.price.findFirst({ where: { material: { name: { contains: 'block' } }, stockStatus: { not: 'OUT_OF_STOCK' } }, orderBy: { price: 'asc' } }),
    prisma.price.findFirst({ where: { material: { name: { contains: 'sand' } }, stockStatus: { not: 'OUT_OF_STOCK' } }, orderBy: { price: 'asc' } }),
    prisma.price.findFirst({ where: { material: { name: { contains: 'zinc' } }, stockStatus: { not: 'OUT_OF_STOCK' } }, orderBy: { price: 'asc' } }),
  ])

  // Very rough rule of thumb: D 12,000–18,000 per m² for basic Gambian construction
  const low  = Math.round(sizeM2 * 12000 / 1000) * 1000
  const high = Math.round(sizeM2 * 18000 / 1000) * 1000

  // Estimate key materials from prices if available
  const cementCost = cement ? `D${cement.price}/${cement.unit}` : 'unavailable'
  const blockCost  = blocks ? `D${blocks.price}/${blocks.unit}` : 'unavailable'

  return (
    `📐 *Quick Estimate — ${sizeM2} m²*\n\n` +
    `Estimated budget range:\n` +
    `🔽 Basic:    D${low.toLocaleString()}\n` +
    `🔼 Standard: D${high.toLocaleString()}\n\n` +
    `Current market prices:\n` +
    `• Cement: ${cementCost}\n` +
    `• Blocks: ${blockCost}\n\n` +
    `📊 For detailed BOQ visit:\nbuildpricegambia.com/estimator\n\n` +
    `_Prices based on current listings_`
  )
}

// ─── Main message handler ────────────────────────────────────────────────────

export async function handleIncomingMessage(phone: string, body: string): Promise<string> {
  const text = body.trim().toLowerCase()

  // ── Greetings / Menu ──────────────────────────────────────────────────────
  if (['menu', 'hi', 'hello', 'start', 'help', '0'].includes(text)) {
    return (
      `🏗️ *BuildPriceGambia*\n\n` +
      `Welcome! Reply with a number:\n\n` +
      `1️⃣ Check material price\n` +
      `2️⃣ Find a supplier\n` +
      `3️⃣ Find a contractor\n` +
      `4️⃣ Quick cost estimate\n` +
      `5️⃣ Set price alert\n` +
      `6️⃣ Browse guides\n\n` +
      `Or type any material name (e.g. *cement*, *rebar*)`
    )
  }

  // ── Option 1: Check price ─────────────────────────────────────────────────
  if (['1', 'check price', 'price'].includes(text)) {
    return (
      `📋 *Check a price*\n\n` +
      `Type the material name:\n` +
      `• cement\n• rebar\n• sand\n• zinc sheet\n• timber\n• blocks\n• gravel\n\n` +
      `Or type: *find [material] [location]*\nExample: *find cement Banjul*`
    )
  }

  // ── Option 2: Supplier list ───────────────────────────────────────────────
  if (['2', 'supplier', 'supplier info', 'suppliers'].includes(text)) {
    const suppliers = await prisma.supplier.findMany({
      where: { verified: true },
      take: 5,
      select: { name: true, location: true, contact: true },
      orderBy: { name: 'asc' },
    })
    const lines = suppliers.map(s => `• *${s.name}* — ${s.location}\n  📞 ${s.contact}`)
    return (
      `🏪 *Verified Suppliers (top 5)*\n\n${lines.join('\n\n')}\n\n` +
      `Full list: buildpricegambia.com/suppliers`
    )
  }

  // ── Option 3: Contractor search ───────────────────────────────────────────
  if (['3', 'contractor', 'contractors', 'find contractor'].includes(text)) {
    const contractors = await prisma.contractor.findMany({
      where: { verified: true },
      take: 5,
      select: { name: true, specialty: true, location: true, contact: true, avgRating: true },
      orderBy: { avgRating: 'desc' },
    })
    if (contractors.length === 0) {
      return `No verified contractors listed yet. Visit buildpricegambia.com/contractors to register.`
    }
    const lines = contractors.map(c =>
      `• *${c.name}* (${c.specialty}) — ${c.location}\n  ⭐ ${c.avgRating > 0 ? c.avgRating.toFixed(1) : 'No reviews'} | 📞 ${c.contact}`
    )
    return (
      `👷 *Top Verified Contractors*\n\n${lines.join('\n\n')}\n\n` +
      `Full directory: buildpricegambia.com/contractors\n\n` +
      `Reply: *contractor [specialty]* for filtered results\nExample: *contractor mason*`
    )
  }

  // ── Option 4: Quick estimate ──────────────────────────────────────────────
  if (['4', 'estimate', 'cost estimate', 'how much'].includes(text)) {
    return (
      `📐 *Quick Cost Estimate*\n\n` +
      `Reply with your floor area in square metres:\n\n` +
      `*estimate 80* → estimate for 80 m²\n\n` +
      `Not sure of size? Common sizes:\n` +
      `• 2-bedroom: ~70–100 m²\n` +
      `• 3-bedroom: ~110–150 m²\n` +
      `• 4-bedroom: ~160–220 m²\n\n` +
      `For detailed BOQ: buildpricegambia.com/estimator`
    )
  }

  // ── Option 5: Price alert ─────────────────────────────────────────────────
  if (['5', 'alert', 'set alert', 'price alert'].includes(text)) {
    return (
      `🔔 *Price Alerts*\n\n` +
      `Set an alert:\n*alert [material] [price]*\n\nExamples:\n• alert cement 700\n• alert rebar 35000\n• alert sand 1500\n\n` +
      `Manage all alerts: buildpricegambia.com/alerts`
    )
  }

  // ── Option 6: Guides ─────────────────────────────────────────────────────
  if (['6', 'guide', 'guides', 'how to', 'howto'].includes(text)) {
    const guides = await prisma.materialGuide.findMany({
      where: { published: true },
      take: 5,
      select: { title: true, slug: true },
      orderBy: { createdAt: 'desc' },
    })
    if (guides.length === 0) {
      return `📚 Guides coming soon! Visit buildpricegambia.com/guides`
    }
    const lines = guides.map(g => `• ${g.title}\n  buildpricegambia.com/guides/${g.slug}`)
    return `📚 *Latest Guides*\n\n${lines.join('\n\n')}`
  }

  // ── "estimate [size]" command ─────────────────────────────────────────────
  const estimateMatch = text.match(/^estimate\s+(\d+(?:\.\d+)?)/)
  if (estimateMatch) {
    const sizeM2 = parseFloat(estimateMatch[1])
    if (sizeM2 < 10 || sizeM2 > 2000) {
      return `Please enter a valid area between 10 and 2000 m².`
    }
    return await quickEstimate(sizeM2)
  }

  // ── "find [material] [location]" command ──────────────────────────────────
  const findMatch = text.match(/^find\s+(.+?)\s+(?:in\s+)?(.+)$/)
  if (findMatch) {
    const [, matQuery, locQuery] = findMatch
    const prices = await prisma.price.findMany({
      where: {
        stockStatus: { not: 'OUT_OF_STOCK' },
        material: { name: { contains: matQuery } },
        supplier: { location: { contains: locQuery }, verified: true },
      },
      include: {
        material: { select: { name: true } },
        supplier: { select: { name: true, location: true, contact: true } },
      },
      orderBy: { price: 'asc' },
      take: 5,
    })

    if (prices.length === 0) {
      return (
        `🔍 No results for *${matQuery}* in *${locQuery}*.\n\n` +
        `Try searching without location:\nType *${matQuery}*\n\n` +
        `Or check buildpricegambia.com/search?q=${encodeURIComponent(matQuery)}`
      )
    }

    const lines = prices.map(
      p => `• D${p.price}/${p.unit} at *${p.supplier.name}* (${p.supplier.location})\n  📞 ${p.supplier.contact}`
    )
    return `📍 *${prices[0].material.name} near ${locQuery}*\n\n${lines.join('\n\n')}`
  }

  // ── "contractor [specialty]" command ─────────────────────────────────────
  const contractorMatch = text.match(/^contractor\s+(.+)$/)
  if (contractorMatch) {
    const specialty = contractorMatch[1]
    const contractors = await prisma.contractor.findMany({
      where: {
        verified: true,
        specialty: { contains: specialty },
      },
      take: 4,
      select: { name: true, specialty: true, location: true, contact: true, avgRating: true },
      orderBy: { avgRating: 'desc' },
    })
    if (contractors.length === 0) {
      return `No verified contractors found for "${specialty}". Visit buildpricegambia.com/contractors`
    }
    const lines = contractors.map(c =>
      `• *${c.name}* — ${c.location}\n  ${c.specialty} | ⭐ ${c.avgRating > 0 ? c.avgRating.toFixed(1) : '—'} | 📞 ${c.contact}`
    )
    return `👷 *${specialty} Contractors*\n\n${lines.join('\n\n')}`
  }

  // ── "alert [material] [price]" command ───────────────────────────────────
  const alertMatch = text.match(/^alert\s+(.+?)\s+(\d+(?:\.\d+)?)$/)
  if (alertMatch) {
    const [, matName, priceStr] = alertMatch
    const material = await prisma.material.findFirst({
      where: { name: { contains: matName } },
    })
    if (!material) {
      return `❌ Material "${matName}" not found. Try: cement, rebar, sand.`
    }
    return (
      `✅ *Alert noted!*\n\n` +
      `We'll send you a message when *${material.name}* drops below *D${priceStr}*.\n\n` +
      `To save this alert permanently, sign up at:\nbuildpricegambia.com/register\n\n` +
      `Type *menu* for more options`
    )
  }

  // ── Generic material search ───────────────────────────────────────────────
  const material = await prisma.material.findFirst({
    where: { name: { contains: text } },
    include: {
      prices: {
        where: { stockStatus: { not: 'OUT_OF_STOCK' } },
        include: { supplier: { select: { name: true, location: true, contact: true, verified: true } } },
        orderBy: { price: 'asc' },
        take: 5,
      },
    },
  })

  if (!material) {
    return (
      `🔍 No results for "*${body.trim()}*".\n\n` +
      `Try: cement, rebar, sand, timber, zinc sheet, blocks\n\n` +
      `Reply *menu* for all options\n` +
      `Or search: buildpricegambia.com/search?q=${encodeURIComponent(body.trim())}`
    )
  }

  if (material.prices.length === 0) {
    return `📦 *${material.name}*\n\nNo prices listed right now.\nCheck buildpricegambia.com for updates`
  }

  const lowest = material.prices[0]
  const lines  = material.prices.map(
    (p, i) => `${i + 1}. D${p.price}/${p.unit}\n   ${p.supplier.verified ? '✅' : ''}${p.supplier.name} — ${p.supplier.location}`
  )

  return (
    `💰 *${material.name} Prices*\n\n` +
    `${lines.join('\n\n')}\n\n` +
    `✅ Best price: *D${lowest.price}/${lowest.unit}* at ${lowest.supplier.name}\n` +
    `📞 ${lowest.supplier.contact}\n\n` +
    `📊 Full comparison: buildpricegambia.com/search?q=${encodeURIComponent(material.name)}\n\n` +
    `Reply *menu* for more options`
  )
}
