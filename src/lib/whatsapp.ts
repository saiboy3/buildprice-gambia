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

type Lang = 'en' | 'wo'
type Ctx = Record<string, any>

const GAMBIA_LOCATIONS = ['Banjul', 'Serrekunda', 'Bakau', 'Brikama', 'Farafenni', 'Basse']
const UNITS = ['Bag', 'Block', 'Sheet', 'Ton', 'm³', 'Piece']
const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']

// ─── Session persistence ──────────────────────────────────────────────────────

async function getSession(phone: string) {
  return prisma.whatsAppSession.upsert({
    where: { phone },
    update: {},
    create: { phone },
  })
}

async function setSession(phone: string, state: string, context: Ctx = {}, language?: Lang) {
  await prisma.whatsAppSession.update({
    where: { phone },
    data: { state, context: JSON.stringify(context), ...(language ? { language } : {}) },
  })
}

function parseCtx(raw: string): Ctx {
  try { return JSON.parse(raw) } catch { return {} }
}

// ─── Bilingual strings ────────────────────────────────────────────────────────

function t(lang: Lang, en: string, wo: string): string {
  return lang === 'wo' ? wo : en
}

function mainMenu(lang: Lang): string {
  return t(lang,
    `🏗️ *BuildPriceGambia*\n\n` +
    `1️⃣ Check Material Price\n` +
    `2️⃣ Supplier Info\n` +
    `3️⃣ Find a Contractor\n` +
    `4️⃣ Set a Price Alert\n` +
    `5️⃣ 📸 Report a Price\n` +
    `6️⃣ 💬 Contact Support\n` +
    `7️⃣ Quick Cost Estimate\n` +
    `8️⃣ Guides\n\n` +
    `Or type a material name directly (e.g. "cement")\n` +
    `🌐 Type *wolof* for Wolof, *english* for English`,

    `🏗️ *BuildPriceGambia*\n\n` +
    `1️⃣ Xam Prix jumtukaay\n` +
    `2️⃣ Xibaar Jëfandikukat\n` +
    `3️⃣ Sëtu Bëgg-bëgg\n` +
    `4️⃣ Def Alert Prix\n` +
    `5️⃣ 📸 Yónnee Prix bu Bees\n` +
    `6️⃣ 💬 Wax ak Support\n` +
    `7️⃣ Liggéey Bu Gaaw\n` +
    `8️⃣ Xam-xam yi\n\n` +
    `Walla bindal tur jumtukaay bi (misaal "ciment")\n` +
    `🌐 Bindal *english* ngir Angale`
  )
}

async function getCategories() {
  return prisma.category.findMany({ orderBy: { createdAt: 'asc' } })
}

function letteredCategoryList(categories: { name: string }[]): string {
  return categories.map((c, i) => `${LETTERS[i]}) ${c.name}`).join('\n')
}

function numberedList(items: string[]): string {
  return items.map((item, i) => `${i + 1}) ${item}`).join('\n')
}

// ─── Main handler ──────────────────────────────────────────────────────────────

export async function handleIncomingMessage(phone: string, body: string): Promise<string> {
  const raw  = body.trim()
  const text = raw.toLowerCase()
  const session = await getSession(phone)
  const lang: Lang = (session.language as Lang) ?? 'en'

  // ── Global navigation — always takes priority, escapes any flow ──────────
  if (['menu', 'hi', 'hello', 'start', 'help', '0'].includes(text)) {
    await setSession(phone, 'MENU')
    return mainMenu(lang)
  }
  if (['wolof', 'wolof please', 'wo'].includes(text)) {
    await setSession(phone, 'MENU', {}, 'wo')
    return mainMenu('wo')
  }
  if (['english', 'en'].includes(text)) {
    await setSession(phone, 'MENU', {}, 'en')
    return mainMenu('en')
  }

  // ── If mid-flow, route to the flow handler first ─────────────────────────
  if (session.state !== 'MENU') {
    const reply = await handleFlowStep(phone, session.state, parseCtx(session.context), raw, lang)
    if (reply !== null) return reply
    // handler returned null → fall through to idle-menu handling below
  }

  // ── Idle menu: numbered options + power commands ─────────────────────────
  if (['1', 'check price', 'price'].includes(text)) return startCheckPrice(phone, lang)
  if (['2', 'supplier', 'supplier info', 'suppliers'].includes(text)) return startSupplierInfo(phone, lang)
  if (['3', 'contractor', 'contractors', 'find contractor'].includes(text)) return listContractors(lang)
  if (['4', 'alert', 'set alert', 'price alert'].includes(text)) return startAlertFlow(phone, lang)
  if (['5', 'report', 'report price', 'report a price'].includes(text)) return startReportPrice(phone, lang)
  if (['6', 'support', 'contact support'].includes(text)) return startSupport(phone, lang)
  if (['7', 'estimate', 'cost estimate', 'how much'].includes(text)) return estimatePrompt(lang)
  if (['8', 'guide', 'guides', 'how to', 'howto'].includes(text)) return listGuides(lang)

  const estimateMatch = text.match(/^estimate\s+(\d+(?:\.\d+)?)/)
  if (estimateMatch) return quickEstimate(parseFloat(estimateMatch[1]), lang)

  const findMatch = text.match(/^find\s+(.+?)\s+(?:in\s+)?(.+)$/)
  if (findMatch) return findMaterialNear(findMatch[1], findMatch[2], lang)

  const contractorMatch = text.match(/^contractor\s+(.+)$/)
  if (contractorMatch) return contractorsBySpecialty(contractorMatch[1], lang)

  const alertMatch = text.match(/^alert\s+(.+?)\s+(\d+(?:\.\d+)?)$/)
  if (alertMatch) return acknowledgeAlert(alertMatch[1], alertMatch[2], lang)

  return genericMaterialSearch(raw, lang)
}

/** Returns a reply string if the flow handled the input, or null to fall back to idle-menu matching. */
async function handleFlowStep(phone: string, state: string, ctx: Ctx, raw: string, lang: Lang): Promise<string | null> {
  const text = raw.trim().toLowerCase()

  switch (state) {
    case 'AWAIT_CATEGORY_FOR_PRICE':
    case 'AWAIT_ALERT_CATEGORY':
    case 'AWAIT_FIELD_CATEGORY': {
      const categories = await getCategories()
      const idx = LETTERS.indexOf(text)
      if (idx < 0 || idx >= categories.length) {
        return t(lang, 'Please reply with a letter from the list, e.g. "a".', 'Bindal benn lëttar ci lëkkël bi, misaal "a".')
      }
      const category = categories[idx]
      const materials = await prisma.material.findMany({ where: { categoryId: category.id }, orderBy: { name: 'asc' } })
      if (materials.length === 0) {
        return t(lang, 'No materials found in this category yet.', 'Amul jumtukaay ci kategori bii.')
      }
      const nextState =
        state === 'AWAIT_CATEGORY_FOR_PRICE' ? 'AWAIT_MATERIAL_FOR_PRICE' :
        state === 'AWAIT_ALERT_CATEGORY' ? 'AWAIT_MATERIAL_FOR_ALERT' : 'AWAIT_FIELD_MATERIAL'
      await setSession(phone, nextState, { materialIds: materials.map(m => m.id) })
      const header = t(lang, `📋 *${category.name}*\n\nReply with a number:`, `📋 *${category.name}*\n\nBindal benn limit:`)
      return `${header}\n\n${numberedList(materials.map(m => m.name))}`
    }

    case 'AWAIT_MATERIAL_FOR_PRICE': {
      const idx = parseInt(text) - 1
      const materialIds: string[] = ctx.materialIds ?? []
      if (isNaN(idx) || idx < 0 || idx >= materialIds.length) {
        return t(lang, 'Please reply with a valid number from the list.', 'Bindal benn limit bu am ci lëkkël bi.')
      }
      return showMaterialPrice(phone, materialIds[idx], lang)
    }

    case 'AWAIT_PRICE_ACTION': {
      if (['compare', 'compare prices', '1'].includes(text)) return showAllPrices(ctx.materialId, lang)
      if (['alert', 'set alert', '2'].includes(text)) {
        await setSession(phone, 'AWAIT_ALERT_TARGET', ctx)
        return t(lang,
          `🔔 Reply with your target price (just the number).\nWe'll note it when *${ctx.materialName}* drops to that price or below.`,
          `🔔 Bindal prix bi nga bëgg (limit rekk).\nDinaa ko yëg bu *${ctx.materialName}* wàcc ci prix boobu walla ci suuf.`
        )
      }
      return null // fall through to idle-menu (e.g. "menu" already handled globally)
    }

    case 'AWAIT_ALERT_TARGET': {
      const target = parseFloat(text)
      if (isNaN(target) || target <= 0) {
        return t(lang, 'Please reply with a valid number, e.g. "700".', 'Bindal benn limit bu am, misaal "700".')
      }
      await setSession(phone, 'MENU')
      return t(lang,
        `✅ *Alert noted!* We'll try to notify you when *${ctx.materialName}* drops to D${target} or below.\n\n` +
        `To make alerts fully automatic, create a free account at buildprice-gambia.vercel.app/register\n\n` +
        `Type *menu* for more options.`,
        `✅ *Nangu nañu sa alert!* Dinaa jéem yëgël la bu *${ctx.materialName}* wàcc ci D${target} walla ci suuf.\n\n` +
        `Ngir alert yi dox ci seen bopp, bindal sa kontë ci buildprice-gambia.vercel.app/register\n\n` +
        `Bindal *menu* ngir yeneen.`
      )
    }

    case 'AWAIT_MATERIAL_FOR_ALERT': {
      const idx = parseInt(text) - 1
      const materialIds: string[] = ctx.materialIds ?? []
      if (isNaN(idx) || idx < 0 || idx >= materialIds.length) {
        return t(lang, 'Please reply with a valid number from the list.', 'Bindal benn limit bu am ci lëkkël bi.')
      }
      const material = await prisma.material.findUnique({ where: { id: materialIds[idx] } })
      if (!material) return t(lang, 'Material not found.', 'Jumtukaay bii nekkul.')
      await setSession(phone, 'AWAIT_ALERT_TARGET', { materialId: material.id, materialName: material.name })
      return t(lang,
        `🔔 Reply with your target price for *${material.name}* (just the number).`,
        `🔔 Bindal prix bi nga bëgg *${material.name}* (limit rekk).`
      )
    }

    case 'AWAIT_SUPPLIER_QUERY': {
      const suppliers = await prisma.supplier.findMany({
        where: { OR: [{ name: { contains: raw } }, { location: { contains: raw } }] },
        take: 8,
        orderBy: { name: 'asc' },
      })
      if (suppliers.length === 0) {
        return t(lang,
          `🔍 No suppliers found for "${raw}". Try a location like "Banjul", or type *menu*.`,
          `🔍 Amul jëfandikukat ngir "${raw}". Jéemal fan misaal "Banjul", walla bindal *menu*.`
        )
      }
      await setSession(phone, 'AWAIT_SUPPLIER_DETAIL', { supplierIds: suppliers.map(s => s.id) })
      const lines = suppliers.map((s, i) => `${i + 1}) *${s.name}*${s.verified ? ' ✅' : ''} — ${s.location}`)
      return t(lang,
        `🏪 *Suppliers matching "${raw}"*\n\n${lines.join('\n')}\n\nReply with a number for details, or *0* for menu.`,
        `🏪 *Jëfandikukat yu jeggi "${raw}"*\n\n${lines.join('\n')}\n\nBindal benn limit ngir xam lu ëpp, walla *0* ngir menu.`
      )
    }

    case 'AWAIT_SUPPLIER_DETAIL': {
      const idx = parseInt(text) - 1
      const supplierIds: string[] = ctx.supplierIds ?? []
      if (isNaN(idx) || idx < 0 || idx >= supplierIds.length) {
        return t(lang, 'Please reply with a valid number, or *0* for menu.', 'Bindal benn limit bu am, walla *0* ngir menu.')
      }
      const supplier = await prisma.supplier.findUnique({ where: { id: supplierIds[idx] } })
      if (!supplier) return t(lang, 'Supplier not found.', 'Jëfandikukat bii nekkul.')
      return t(lang,
        `🏪 *${supplier.name}*${supplier.verified ? ' ✅ Verified' : ''}\n📍 ${supplier.location}\n📞 ${supplier.contact}\n\n` +
        `Type *menu* for more options.`,
        `🏪 *${supplier.name}*${supplier.verified ? ' ✅ Doonte' : ''}\n📍 ${supplier.location}\n📞 ${supplier.contact}\n\n` +
        `Bindal *menu* ngir yeneen.`
      )
    }

    case 'AWAIT_FIELD_MATERIAL': {
      const idx = parseInt(text) - 1
      const materialIds: string[] = ctx.materialIds ?? []
      if (idx === -1 && text === '0') {
        await setSession(phone, 'AWAIT_FIELD_MATERIAL_OTHER')
        return t(lang, 'Type the material name:', 'Bindal tur jumtukaay bi:')
      }
      if (isNaN(idx) || idx < 0 || idx >= materialIds.length) {
        return t(lang, 'Reply with a number from the list, or *0* for something else.', 'Bindal benn limit ci lëkkël bi, walla *0* ngir yeneen.')
      }
      const material = await prisma.material.findUnique({ where: { id: materialIds[idx] } })
      if (!material) return t(lang, 'Material not found.', 'Jumtukaay bii nekkul.')
      await setSession(phone, 'AWAIT_FIELD_PRICE', { materialId: material.id, materialLabel: material.name })
      return t(lang, `💰 What price did you see for *${material.name}*? (number only, in Dalasi)`, `💰 Ñaata la prix *${material.name}* nga gis? (limit rekk, ci Dalasi)`)
    }

    case 'AWAIT_FIELD_MATERIAL_OTHER': {
      if (!raw) return t(lang, 'Please type the material name.', 'Bindal tur jumtukaay bi.')
      await setSession(phone, 'AWAIT_FIELD_PRICE', { materialLabel: raw })
      return t(lang, `💰 What price did you see for *${raw}*? (number only, in Dalasi)`, `💰 Ñaata la prix *${raw}* nga gis? (limit rekk, ci Dalasi)`)
    }

    case 'AWAIT_FIELD_PRICE': {
      const price = parseFloat(text)
      if (isNaN(price) || price <= 0) return t(lang, 'Please reply with a valid number.', 'Bindal benn limit bu am.')
      await setSession(phone, 'AWAIT_FIELD_UNIT', { ...ctx, price })
      return t(lang,
        `📦 Per what unit?\n\n${numberedList(UNITS)}`,
        `📦 Ci lu ñuy jàppale?\n\n${numberedList(UNITS)}`
      )
    }

    case 'AWAIT_FIELD_UNIT': {
      const idx = parseInt(text) - 1
      if (isNaN(idx) || idx < 0 || idx >= UNITS.length) {
        return t(lang, 'Reply with a number from the list.', 'Bindal benn limit ci lëkkël bi.')
      }
      await setSession(phone, 'AWAIT_FIELD_LOCATION', { ...ctx, unit: UNITS[idx] })
      return t(lang,
        `📍 Where did you see this price?\n\n${numberedList(GAMBIA_LOCATIONS)}`,
        `📍 Fan nga gis prix bii?\n\n${numberedList(GAMBIA_LOCATIONS)}`
      )
    }

    case 'AWAIT_FIELD_LOCATION': {
      const idx = parseInt(text) - 1
      if (isNaN(idx) || idx < 0 || idx >= GAMBIA_LOCATIONS.length) {
        return t(lang, 'Reply with a number from the list.', 'Bindal benn limit ci lëkkël bi.')
      }
      const location = GAMBIA_LOCATIONS[idx]
      await prisma.fieldReport.create({
        data: {
          reporterPhone: phone,
          materialId: ctx.materialId ?? null,
          materialLabel: ctx.materialLabel,
          price: ctx.price,
          unit: ctx.unit,
          location,
        },
      })
      const totalCount = await prisma.fieldReport.count({ where: { reporterPhone: phone } })
      await setSession(phone, 'MENU')
      return t(lang,
        `✅ *Thank you!* Your price report has been submitted for review.\n\n` +
        `You've now submitted ${totalCount} price report${totalCount !== 1 ? 's' : ''} via WhatsApp.\n\n` +
        `Type *menu* for more options.`,
        `✅ *Jërëjëf!* Sa xibaar prix yónnee nañu ko ngir xool.\n\n` +
        `Yónnee nga leegi ${totalCount} xibaar prix ci WhatsApp.\n\n` +
        `Bindal *menu* ngir yeneen.`
      )
    }

    case 'AWAIT_SUPPORT_MSG': {
      if (!raw || raw.length < 3) {
        return t(lang, 'Please type a bit more detail about your question or issue.', 'Bindal lu ëpp ci sa laaj walla problem bi.')
      }
      await prisma.feedback.create({
        data: { message: raw.slice(0, 2000), contact: phone, role: 'whatsapp', page: 'whatsapp-bot' },
      })
      await setSession(phone, 'MENU')
      return t(lang,
        `✅ Thanks! Our team will review your message and may reach out within 24 hours.\n\nType *menu* for more options.`,
        `✅ Jërëjëf! Sunuy équipe dinañu xool sa xibaar te man ñaa lañ ci diir 24 waxtu.\n\nBindal *menu* ngir yeneen.`
      )
    }

    default:
      return null
  }
}

// ─── Flow starters ──────────────────────────────────────────────────────────

async function startCheckPrice(phone: string, lang: Lang): Promise<string> {
  const categories = await getCategories()
  await setSession(phone, 'AWAIT_CATEGORY_FOR_PRICE')
  return t(lang,
    `📋 *Check a Price*\n\nWhat type of material?\n\n${letteredCategoryList(categories)}`,
    `📋 *Xam Prix*\n\nLan xeetu jumtukaay?\n\n${letteredCategoryList(categories)}`
  )
}

async function startAlertFlow(phone: string, lang: Lang): Promise<string> {
  const categories = await getCategories()
  await setSession(phone, 'AWAIT_ALERT_CATEGORY')
  return t(lang,
    `🔔 *Set a Price Alert*\n\nWhich category is the material in?\n\n${letteredCategoryList(categories)}`,
    `🔔 *Def Alert Prix*\n\nCi ban kategori jumtukaay bi nekk?\n\n${letteredCategoryList(categories)}`
  )
}

async function startSupplierInfo(phone: string, lang: Lang): Promise<string> {
  await setSession(phone, 'AWAIT_SUPPLIER_QUERY')
  return t(lang,
    `🏪 *Supplier Info*\n\nEnter a supplier name or location (e.g. "Banjul").`,
    `🏪 *Xibaar Jëfandikukat*\n\nBindal tur jëfandikukat wala fan (misaal "Banjul").`
  )
}

async function startReportPrice(phone: string, lang: Lang): Promise<string> {
  const categories = await getCategories()
  await setSession(phone, 'AWAIT_FIELD_CATEGORY')
  return t(lang,
    `📸 *Report a Price*\n\nHelp us track real prices — takes about a minute.\n\nWhat type of material?\n\n${letteredCategoryList(categories)}`,
    `📸 *Yónnee Prix bu Bees*\n\nDimbali ñu xam prix yu dëgg — dafay yagg ab simili minute.\n\nLan xeetu jumtukaay?\n\n${letteredCategoryList(categories)}`
  )
}

async function startSupport(phone: string, lang: Lang): Promise<string> {
  await setSession(phone, 'AWAIT_SUPPORT_MSG')
  return t(lang,
    `💬 *Contact Support*\n\nPlease type your question or issue. Our team will reply within 24 hours.`,
    `💬 *Wax ak Support*\n\nBindal sa laaj walla problem bi. Sunuy équipe dinañu la ñaan ci diir 24 waxtu.`
  )
}

// ─── Feature handlers (no session needed) ────────────────────────────────────

async function showMaterialPrice(phone: string, materialId: string, lang: Lang): Promise<string> {
  const material = await prisma.material.findUnique({
    where: { id: materialId },
    include: {
      prices: {
        where: { stockStatus: { not: 'OUT_OF_STOCK' } },
        include: { supplier: { select: { name: true, location: true, contact: true, verified: true } } },
        orderBy: { price: 'asc' },
        take: 5,
      },
    },
  })
  if (!material || material.prices.length === 0) {
    await setSession(phone, 'MENU')
    return t(lang, `📦 No prices listed for this material right now.`, `📦 Amul prix ci jumtukaay bii leegi.`)
  }
  const lowest = material.prices[0]
  await setSession(phone, 'AWAIT_PRICE_ACTION', { materialId, materialName: material.name })
  return t(lang,
    `💰 *${material.name}*\n\n✅ Best price: *D${lowest.price}/${lowest.unit}*\n${lowest.supplier.verified ? '✅ ' : ''}${lowest.supplier.name} — ${lowest.supplier.location}\n📞 ${lowest.supplier.contact}\n\n` +
    `Reply:\n1) Compare all suppliers\n2) Set a price alert\nOr type *menu*`,
    `💰 *${material.name}*\n\n✅ Prix bu gëna baax: *D${lowest.price}/${lowest.unit}*\n${lowest.supplier.verified ? '✅ ' : ''}${lowest.supplier.name} — ${lowest.supplier.location}\n📞 ${lowest.supplier.contact}\n\n` +
    `Bindal:\n1) Séen jëfandikukat yépp\n2) Def alert prix\nWalla bindal *menu*`
  )
}

async function showAllPrices(materialId: string, lang: Lang): Promise<string> {
  const material = await prisma.material.findUnique({
    where: { id: materialId },
    include: {
      prices: {
        where: { stockStatus: { not: 'OUT_OF_STOCK' } },
        include: { supplier: { select: { name: true, location: true, contact: true, verified: true } } },
        orderBy: { price: 'asc' },
        take: 8,
      },
    },
  })
  if (!material) return t(lang, 'Material not found.', 'Jumtukaay bii nekkul.')
  const lines = material.prices.map((p, i) => `${i + 1}. D${p.price}/${p.unit}\n   ${p.supplier.verified ? '✅' : ''}${p.supplier.name} — ${p.supplier.location}`)
  return t(lang,
    `📊 *${material.name} — all suppliers*\n\n${lines.join('\n\n')}\n\nType *menu* for more options.`,
    `📊 *${material.name} — jëfandikukat yépp*\n\n${lines.join('\n\n')}\n\nBindal *menu* ngir yeneen.`
  )
}

async function listContractors(lang: Lang): Promise<string> {
  const contractors = await prisma.contractor.findMany({
    where: { verified: true },
    take: 5,
    select: { name: true, specialty: true, location: true, contact: true, avgRating: true },
    orderBy: { avgRating: 'desc' },
  })
  if (contractors.length === 0) {
    return t(lang, `No verified contractors listed yet.`, `Amul bëgg-bëgg yu doonte leegi.`)
  }
  const lines = contractors.map(c =>
    `• *${c.name}* (${c.specialty}) — ${c.location}\n  ⭐ ${c.avgRating > 0 ? c.avgRating.toFixed(1) : '—'} | 📞 ${c.contact}`
  )
  return t(lang,
    `👷 *Top Verified Contractors*\n\n${lines.join('\n\n')}\n\n` +
    `Reply: *contractor [specialty]* for filtered results (e.g. "contractor mason")\nOr type *menu*`,
    `👷 *Bëgg-bëgg yu Gëna Doonte*\n\n${lines.join('\n\n')}\n\n` +
    `Bindal: *contractor [specialty]* ngir séen (misaal "contractor mason")\nWalla bindal *menu*`
  )
}

async function contractorsBySpecialty(specialty: string, lang: Lang): Promise<string> {
  const contractors = await prisma.contractor.findMany({
    where: { verified: true, specialty: { contains: specialty } },
    take: 4,
    select: { name: true, specialty: true, location: true, contact: true, avgRating: true },
    orderBy: { avgRating: 'desc' },
  })
  if (contractors.length === 0) {
    return t(lang, `No verified contractors found for "${specialty}".`, `Amul bëgg-bëgg ngir "${specialty}".`)
  }
  const lines = contractors.map(c =>
    `• *${c.name}* — ${c.location}\n  ${c.specialty} | ⭐ ${c.avgRating > 0 ? c.avgRating.toFixed(1) : '—'} | 📞 ${c.contact}`
  )
  return `👷 *${specialty}*\n\n${lines.join('\n\n')}`
}

function estimatePrompt(lang: Lang): string {
  return t(lang,
    `📐 *Quick Cost Estimate*\n\nReply with your floor area in square metres:\n\n*estimate 80* → estimate for 80 m²\n\n` +
    `Common sizes:\n• 2-bedroom: ~70–100 m²\n• 3-bedroom: ~110–150 m²\n• 4-bedroom: ~160–220 m²`,
    `📐 *Liggéey Bu Gaaw*\n\nBindal ñaata m² sa kër:\n\n*estimate 80* → ngir 80 m²\n\n` +
    `Yëriñ yi dañuy gëna am:\n• 2-chambre: ~70–100 m²\n• 3-chambre: ~110–150 m²\n• 4-chambre: ~160–220 m²`
  )
}

async function quickEstimate(sizeM2: number, lang: Lang): Promise<string> {
  if (sizeM2 < 10 || sizeM2 > 2000) {
    return t(lang, `Please enter a valid area between 10 and 2000 m².`, `Bindal ab m² bu am, digg 10 ak 2000.`)
  }
  const [cement, blocks] = await Promise.all([
    prisma.price.findFirst({ where: { material: { name: { contains: 'cement' } }, stockStatus: { not: 'OUT_OF_STOCK' } }, orderBy: { price: 'asc' } }),
    prisma.price.findFirst({ where: { material: { name: { contains: 'block' } }, stockStatus: { not: 'OUT_OF_STOCK' } }, orderBy: { price: 'asc' } }),
  ])
  const low  = Math.round(sizeM2 * 12000 / 1000) * 1000
  const high = Math.round(sizeM2 * 18000 / 1000) * 1000
  const cementCost = cement ? `D${cement.price}/${cement.unit}` : t(lang, 'unavailable', 'amul')
  const blockCost  = blocks ? `D${blocks.price}/${blocks.unit}` : t(lang, 'unavailable', 'amul')

  return t(lang,
    `📐 *Quick Estimate — ${sizeM2} m²*\n\nEstimated budget range:\n🔽 Basic: D${low.toLocaleString()}\n🔼 Standard: D${high.toLocaleString()}\n\n` +
    `Current market prices:\n• Cement: ${cementCost}\n• Blocks: ${blockCost}\n\n` +
    `📊 For a detailed breakdown visit:\nbuildprice-gambia.vercel.app/estimator`,
    `📐 *Liggéey Bu Gaaw — ${sizeM2} m²*\n\nBudget yu ñuy naan:\n🔽 Basic: D${low.toLocaleString()}\n🔼 Standard: D${high.toLocaleString()}\n\n` +
    `Prix yu leegi:\n• Ciment: ${cementCost}\n• Blocks: ${blockCost}\n\n` +
    `📊 Ngir lu gëna xóot dem ci:\nbuildprice-gambia.vercel.app/estimator`
  )
}

async function listGuides(lang: Lang): Promise<string> {
  const guides = await prisma.materialGuide.findMany({
    where: { published: true },
    take: 5,
    select: { title: true, slug: true },
    orderBy: { createdAt: 'desc' },
  })
  if (guides.length === 0) {
    return t(lang, `📚 Guides coming soon! Visit buildprice-gambia.vercel.app/guides`, `📚 Xam-xam yi ñëw! Dem ci buildprice-gambia.vercel.app/guides`)
  }
  const lines = guides.map(g => `• ${g.title}\n  buildprice-gambia.vercel.app/guides/${g.slug}`)
  return t(lang, `📚 *Latest Guides*\n\n${lines.join('\n\n')}`, `📚 *Xam-xam yu Bees*\n\n${lines.join('\n\n')}`)
}

async function findMaterialNear(matQuery: string, locQuery: string, lang: Lang): Promise<string> {
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
    return t(lang,
      `🔍 No results for *${matQuery}* in *${locQuery}*.\n\nTry searching without location: type *${matQuery}*`,
      `🔍 Amul ci *${matQuery}* ci *${locQuery}*.\n\nJéemal bindal rekk *${matQuery}*`
    )
  }
  const lines = prices.map(p => `• D${p.price}/${p.unit} at *${p.supplier.name}* (${p.supplier.location})\n  📞 ${p.supplier.contact}`)
  return `📍 *${prices[0].material.name} near ${locQuery}*\n\n${lines.join('\n\n')}`
}

function acknowledgeAlert(matName: string, priceStr: string, lang: Lang): string {
  return t(lang,
    `✅ *Alert noted!* We'll try to notify you when *${matName}* drops to D${priceStr} or below.\n\n` +
    `To make alerts fully automatic, create a free account at buildprice-gambia.vercel.app/register\n\n` +
    `Type *menu* for more options.`,
    `✅ *Nangu nañu sa alert!* Dinaa jéem yëgël la bu *${matName}* wàcc ci D${priceStr} walla ci suuf.\n\n` +
    `Ngir alert yi dox ci seen bopp, bindal sa kontë ci buildprice-gambia.vercel.app/register\n\n` +
    `Bindal *menu* ngir yeneen.`
  )
}

async function genericMaterialSearch(query: string, lang: Lang): Promise<string> {
  const material = await prisma.material.findFirst({
    where: { name: { contains: query } },
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
    return t(lang,
      `🔍 No results for "*${query}*".\n\nTry: cement, rebar, sand, timber, zinc sheet, blocks\n\nReply *menu* for all options`,
      `🔍 Amul ngir "*${query}*".\n\nJéemal: ciment, fer, saab, bois, zinc, blocks\n\nBindal *menu* ngir yeneen`
    )
  }
  if (material.prices.length === 0) {
    return t(lang, `📦 *${material.name}*\n\nNo prices listed right now.`, `📦 *${material.name}*\n\nAmul prix leegi.`)
  }

  const lowest = material.prices[0]
  const lines  = material.prices.map(
    (p, i) => `${i + 1}. D${p.price}/${p.unit}\n   ${p.supplier.verified ? '✅' : ''}${p.supplier.name} — ${p.supplier.location}`
  )

  return t(lang,
    `💰 *${material.name} Prices*\n\n${lines.join('\n\n')}\n\n` +
    `✅ Best price: *D${lowest.price}/${lowest.unit}* at ${lowest.supplier.name}\n📞 ${lowest.supplier.contact}\n\n` +
    `Reply *menu* for more options`,
    `💰 *Prix ${material.name}*\n\n${lines.join('\n\n')}\n\n` +
    `✅ Prix bu gëna baax: *D${lowest.price}/${lowest.unit}* ci ${lowest.supplier.name}\n📞 ${lowest.supplier.contact}\n\n` +
    `Bindal *menu* ngir yeneen`
  )
}
