import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { name: 'Cement & Concrete' }, update: {}, create: { name: 'Cement & Concrete' } }),
    prisma.category.upsert({ where: { name: 'Steel & Metal' },     update: {}, create: { name: 'Steel & Metal' } }),
    prisma.category.upsert({ where: { name: 'Sand & Aggregate' },  update: {}, create: { name: 'Sand & Aggregate' } }),
    prisma.category.upsert({ where: { name: 'Timber & Wood' },     update: {}, create: { name: 'Timber & Wood' } }),
    prisma.category.upsert({ where: { name: 'Roofing' },           update: {}, create: { name: 'Roofing' } }),
    prisma.category.upsert({ where: { name: 'Plumbing' },          update: {}, create: { name: 'Plumbing' } }),
    prisma.category.upsert({ where: { name: 'Electrical' },        update: {}, create: { name: 'Electrical' } }),
    prisma.category.upsert({ where: { name: 'Paint & Finishing' }, update: {}, create: { name: 'Paint & Finishing' } }),
  ])

  const [cement, steel, sand, timber, roofing, plumbing, electrical, paint] = categories

  // Materials
  const materials = await Promise.all([
    prisma.material.upsert({ where: { id: 'mat-cement-opc' },    update: {}, create: { id: 'mat-cement-opc',    name: 'OPC Cement 42.5',        categoryId: cement.id } }),
    prisma.material.upsert({ where: { id: 'mat-cement-ppc' },    update: {}, create: { id: 'mat-cement-ppc',    name: 'PPC Cement 32.5',        categoryId: cement.id } }),
    prisma.material.upsert({ where: { id: 'mat-blocks-6in' },    update: {}, create: { id: 'mat-blocks-6in',    name: 'Concrete Blocks 6 inch', categoryId: cement.id } }),
    prisma.material.upsert({ where: { id: 'mat-blocks-9in' },    update: {}, create: { id: 'mat-blocks-9in',    name: 'Concrete Blocks 9 inch', categoryId: cement.id } }),
    prisma.material.upsert({ where: { id: 'mat-ready-concrete' }, update: {}, create: { id: 'mat-ready-concrete', name: 'Ready-Mix Concrete',    categoryId: cement.id } }),
    prisma.material.upsert({ where: { id: 'mat-rebar-10' },      update: {}, create: { id: 'mat-rebar-10',      name: 'Rebar 10mm',             categoryId: steel.id } }),
    prisma.material.upsert({ where: { id: 'mat-rebar-12' },      update: {}, create: { id: 'mat-rebar-12',      name: 'Rebar 12mm',             categoryId: steel.id } }),
    prisma.material.upsert({ where: { id: 'mat-rebar-16' },      update: {}, create: { id: 'mat-rebar-16',      name: 'Rebar 16mm',             categoryId: steel.id } }),
    prisma.material.upsert({ where: { id: 'mat-binding-wire' },  update: {}, create: { id: 'mat-binding-wire',  name: 'Binding Wire',           categoryId: steel.id } }),
    prisma.material.upsert({ where: { id: 'mat-nails' },         update: {}, create: { id: 'mat-nails',         name: 'Assorted Nails (kg)',    categoryId: steel.id } }),
    prisma.material.upsert({ where: { id: 'mat-sand-sharp' },    update: {}, create: { id: 'mat-sand-sharp',    name: 'Sharp Sand',             categoryId: sand.id } }),
    prisma.material.upsert({ where: { id: 'mat-sand-fine' },     update: {}, create: { id: 'mat-sand-fine',     name: 'Fine/Plaster Sand',      categoryId: sand.id } }),
    prisma.material.upsert({ where: { id: 'mat-gravel' },        update: {}, create: { id: 'mat-gravel',        name: 'Gravel / Chippings',     categoryId: sand.id } }),
    prisma.material.upsert({ where: { id: 'mat-laterite' },      update: {}, create: { id: 'mat-laterite',      name: 'Laterite (fill material)', categoryId: sand.id } }),
    prisma.material.upsert({ where: { id: 'mat-timber-2x4' },    update: {}, create: { id: 'mat-timber-2x4',    name: 'Timber 2×4 inch',        categoryId: timber.id } }),
    prisma.material.upsert({ where: { id: 'mat-timber-2x2' },    update: {}, create: { id: 'mat-timber-2x2',    name: 'Timber 2×2 inch',        categoryId: timber.id } }),
    prisma.material.upsert({ where: { id: 'mat-plywood' },       update: {}, create: { id: 'mat-plywood',       name: 'Plywood 18mm',           categoryId: timber.id } }),
    prisma.material.upsert({ where: { id: 'mat-chipboard' },     update: {}, create: { id: 'mat-chipboard',     name: 'Chipboard 16mm',         categoryId: timber.id } }),
    prisma.material.upsert({ where: { id: 'mat-zinc-sheet' },    update: {}, create: { id: 'mat-zinc-sheet',    name: 'Zinc Roof Sheet',        categoryId: roofing.id } }),
    prisma.material.upsert({ where: { id: 'mat-aluzinc-sheet' }, update: {}, create: { id: 'mat-aluzinc-sheet', name: 'Aluzinc Roofing Sheet',  categoryId: roofing.id } }),
    prisma.material.upsert({ where: { id: 'mat-ridge-cap' },     update: {}, create: { id: 'mat-ridge-cap',     name: 'Ridge Cap',              categoryId: roofing.id } }),
    prisma.material.upsert({ where: { id: 'mat-pvc-pipe' },      update: {}, create: { id: 'mat-pvc-pipe',      name: 'PVC Pipe 4 inch',        categoryId: plumbing.id } }),
    prisma.material.upsert({ where: { id: 'mat-pvc-pipe-2' },    update: {}, create: { id: 'mat-pvc-pipe-2',    name: 'PVC Pipe 2 inch',        categoryId: plumbing.id } }),
    prisma.material.upsert({ where: { id: 'mat-water-tank' },    update: {}, create: { id: 'mat-water-tank',    name: 'Water Tank 1000L',       categoryId: plumbing.id } }),
    prisma.material.upsert({ where: { id: 'mat-wire-2.5' },      update: {}, create: { id: 'mat-wire-2.5',      name: 'Electrical Wire 2.5mm',  categoryId: electrical.id } }),
    prisma.material.upsert({ where: { id: 'mat-wire-1.5' },      update: {}, create: { id: 'mat-wire-1.5',      name: 'Electrical Wire 1.5mm',  categoryId: electrical.id } }),
    prisma.material.upsert({ where: { id: 'mat-socket' },        update: {}, create: { id: 'mat-socket',        name: 'Wall Socket & Switch',   categoryId: electrical.id } }),
    prisma.material.upsert({ where: { id: 'mat-paint-emulsion'}, update: {}, create: { id: 'mat-paint-emulsion', name: 'Emulsion Paint 20L',    categoryId: paint.id } }),
    prisma.material.upsert({ where: { id: 'mat-paint-gloss' },   update: {}, create: { id: 'mat-paint-gloss',   name: 'Gloss Paint 4L',         categoryId: paint.id } }),
    prisma.material.upsert({ where: { id: 'mat-floor-tile' },    update: {}, create: { id: 'mat-floor-tile',    name: 'Floor Tiles (per m²)',   categoryId: paint.id } }),
  ])

  // Admin user
  const adminHash = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? 'admin123', 10)
  await prisma.user.upsert({
    where: { phone: process.env.ADMIN_PHONE ?? '0000000000' },
    update: {},
    create: {
      name: 'System Admin',
      phone: process.env.ADMIN_PHONE ?? '0000000000',
      email: 'admin@buildpricegambia.com',
      password: adminHash,
      role: 'ADMIN',
    },
  })

  // Demo supplier accounts + prices
  const supplierSeeds = [
    { name: 'Banjul Building Supplies',   phone: '2201001001', location: 'Banjul',     contact: '+220 100 1001' },
    { name: 'Serrekunda Hardware Store',  phone: '2201002002', location: 'Serrekunda', contact: '+220 100 2002' },
    { name: 'Bakau Construction Depot',   phone: '2201003003', location: 'Bakau',      contact: '+220 100 3003' },
    { name: 'Brikama Materials Yard',     phone: '2201004004', location: 'Brikama',    contact: '+220 100 4004' },
    { name: 'Farafenni General Traders',  phone: '2201005005', location: 'Farafenni',  contact: '+220 100 5005' },
  ]

  const priceSeeds: Array<{ suppIdx: number; matId: string; price: number; unit: string }> = [
    // Banjul Building Supplies
    { suppIdx: 0, matId: 'mat-blocks-6in',     price: 28,   unit: 'block' },
    { suppIdx: 0, matId: 'mat-blocks-9in',     price: 38,   unit: 'block' },
    { suppIdx: 0, matId: 'mat-cement-opc',     price: 750,  unit: 'bag (50kg)' },
    { suppIdx: 0, matId: 'mat-cement-ppc',     price: 700,  unit: 'bag (50kg)' },
    { suppIdx: 0, matId: 'mat-rebar-10',       price: 2400, unit: 'ton' },
    { suppIdx: 0, matId: 'mat-rebar-12',       price: 2800, unit: 'ton' },
    { suppIdx: 0, matId: 'mat-sand-sharp',     price: 1200, unit: 'm³' },
    { suppIdx: 0, matId: 'mat-sand-fine',      price: 1350, unit: 'm³' },
    { suppIdx: 0, matId: 'mat-zinc-sheet',     price: 320,  unit: 'sheet (8ft)' },
    { suppIdx: 0, matId: 'mat-nails',          price: 95,   unit: 'kg' },
    { suppIdx: 0, matId: 'mat-water-tank',     price: 4200, unit: 'unit' },
    // Serrekunda Hardware Store
    { suppIdx: 1, matId: 'mat-blocks-6in',     price: 26,   unit: 'block' },
    { suppIdx: 1, matId: 'mat-cement-opc',     price: 730,  unit: 'bag (50kg)' },
    { suppIdx: 1, matId: 'mat-cement-ppc',     price: 690,  unit: 'bag (50kg)' },
    { suppIdx: 1, matId: 'mat-rebar-12',       price: 2750, unit: 'ton' },
    { suppIdx: 1, matId: 'mat-rebar-16',       price: 3100, unit: 'ton' },
    { suppIdx: 1, matId: 'mat-gravel',         price: 1500, unit: 'm³' },
    { suppIdx: 1, matId: 'mat-timber-2x4',     price: 85,   unit: 'piece (12ft)' },
    { suppIdx: 1, matId: 'mat-timber-2x2',     price: 55,   unit: 'piece (12ft)' },
    { suppIdx: 1, matId: 'mat-paint-emulsion', price: 1850, unit: 'bucket (20L)' },
    { suppIdx: 1, matId: 'mat-paint-gloss',    price: 620,  unit: 'tin (4L)' },
    { suppIdx: 1, matId: 'mat-floor-tile',     price: 450,  unit: 'm²' },
    { suppIdx: 1, matId: 'mat-binding-wire',   price: 110,  unit: 'kg' },
    // Bakau Construction Depot
    { suppIdx: 2, matId: 'mat-cement-opc',     price: 760,  unit: 'bag (50kg)' },
    { suppIdx: 2, matId: 'mat-rebar-16',       price: 3050, unit: 'ton' },
    { suppIdx: 2, matId: 'mat-plywood',        price: 650,  unit: 'sheet' },
    { suppIdx: 2, matId: 'mat-chipboard',      price: 480,  unit: 'sheet' },
    { suppIdx: 2, matId: 'mat-pvc-pipe',       price: 180,  unit: 'length (6m)' },
    { suppIdx: 2, matId: 'mat-pvc-pipe-2',     price: 95,   unit: 'length (6m)' },
    { suppIdx: 2, matId: 'mat-wire-2.5',       price: 420,  unit: 'roll (100m)' },
    { suppIdx: 2, matId: 'mat-wire-1.5',       price: 310,  unit: 'roll (100m)' },
    { suppIdx: 2, matId: 'mat-socket',         price: 65,   unit: 'piece' },
    { suppIdx: 2, matId: 'mat-zinc-sheet',     price: 305,  unit: 'sheet (8ft)' },
    { suppIdx: 2, matId: 'mat-aluzinc-sheet',  price: 480,  unit: 'sheet (8ft)' },
    // Brikama Materials Yard
    { suppIdx: 3, matId: 'mat-cement-opc',     price: 745,  unit: 'bag (50kg)' },
    { suppIdx: 3, matId: 'mat-blocks-6in',     price: 27,   unit: 'block' },
    { suppIdx: 3, matId: 'mat-sand-sharp',     price: 1100, unit: 'm³' },
    { suppIdx: 3, matId: 'mat-laterite',       price: 900,  unit: 'm³' },
    { suppIdx: 3, matId: 'mat-ready-concrete', price: 2600, unit: 'm³' },
    { suppIdx: 3, matId: 'mat-ridge-cap',      price: 210,  unit: 'piece (10ft)' },
    { suppIdx: 3, matId: 'mat-timber-2x4',     price: 80,   unit: 'piece (12ft)' },
    // Farafenni General Traders
    { suppIdx: 4, matId: 'mat-cement-opc',     price: 780,  unit: 'bag (50kg)' },
    { suppIdx: 4, matId: 'mat-cement-ppc',     price: 720,  unit: 'bag (50kg)' },
    { suppIdx: 4, matId: 'mat-rebar-12',       price: 2900, unit: 'ton' },
    { suppIdx: 4, matId: 'mat-zinc-sheet',     price: 335,  unit: 'sheet (8ft)' },
    { suppIdx: 4, matId: 'mat-gravel',         price: 1600, unit: 'm³' },
    { suppIdx: 4, matId: 'mat-paint-emulsion', price: 1950, unit: 'bucket (20L)' },
  ]

  const supplierRecords: any[] = []
  for (const s of supplierSeeds) {
    const hash = await bcrypt.hash('supplier123', 10)
    const user = await prisma.user.upsert({
      where: { phone: s.phone },
      update: {},
      create: { name: s.name, phone: s.phone, password: hash, role: 'SUPPLIER' },
    })
    const supplier = await prisma.supplier.upsert({
      where: { userId: user.id },
      update: {},
      create: { name: s.name, location: s.location, contact: s.contact, verified: true, userId: user.id },
    })
    supplierRecords.push(supplier)
  }

  for (const p of priceSeeds) {
    const supplier = supplierRecords[p.suppIdx]
    await prisma.price.upsert({
      where: { materialId_supplierId: { materialId: p.matId, supplierId: supplier.id } },
      update: { price: p.price, unit: p.unit },
      create: { materialId: p.matId, supplierId: supplier.id, price: p.price, unit: p.unit },
    })
  }

  // Demo contractors
  const contractorSeeds = [
    {
      phone: '2202001001', name: 'Omar Jallow Construction',
      specialty: 'General Contractor', location: 'Banjul',
      contact: '+220 200 1001', bio: 'Over 15 years building homes and commercial properties across Greater Banjul. Specialises in full turnkey residential builds.',
      yearsExp: 15, verified: true,
    },
    {
      phone: '2202002002', name: 'Lamin Touray Masonry',
      specialty: 'Masonry & Blockwork', location: 'Serrekunda',
      contact: '+220 200 2002', bio: 'Expert bricklayer and blockwork specialist. Fast, clean work with attention to structural integrity. Over 10 years of experience.',
      yearsExp: 10, verified: true,
    },
    {
      phone: '2202003003', name: 'Bakary Ceesay Roofing',
      specialty: 'Roofing', location: 'Bakau',
      contact: '+220 200 3003', bio: 'Specialist in corrugated zinc and flat roofing systems. Offers free site assessment and competitive rates.',
      yearsExp: 8, verified: false,
    },
    {
      phone: '2202004004', name: 'Fatou Drammeh Plumbing & Electrical',
      specialty: 'Plumbing', location: 'Kanifing',
      contact: '+220 200 4004', bio: 'Licensed plumber and electrician covering all of the Greater Banjul area. Residential and commercial.',
      yearsExp: 6, verified: true,
    },
    {
      phone: '2202005005', name: 'Modou Sowe Carpentry',
      specialty: 'Carpentry & Joinery', location: 'Brikama',
      contact: '+220 200 5005', bio: 'Custom doors, windows, and interior joinery. Sourcing timber locally to keep costs competitive.',
      yearsExp: 12, verified: false,
    },
    {
      phone: '2202006006', name: 'Ida Sanneh Tiling & Finishing',
      specialty: 'Tiling & Finishing', location: 'Farafenni',
      contact: '+220 200 6006', bio: 'Floor and wall tiling, screeding, and finishing work across North Bank Region. Neat, timely work at fair prices.',
      yearsExp: 7, verified: true,
    },
    {
      phone: '2202007007', name: 'Ebrima Bah Painting Services',
      specialty: 'Painting', location: 'Kanifing',
      contact: '+220 200 7007', bio: 'Interior and exterior painting for residential and commercial buildings. Free colour consultation on request.',
      yearsExp: 9, verified: true,
    },
  ]

  const reviewSeeds: Array<{ contractorIdx: number; rating: number; comment: string; projectType: string }> = [
    { contractorIdx: 0, rating: 5, comment: 'Omar built our 4-bedroom house on time and within budget. Highly recommend.', projectType: 'Residential Build' },
    { contractorIdx: 0, rating: 4, comment: 'Very professional, good communication throughout. Minor delay but well handled.', projectType: 'Commercial Extension' },
    { contractorIdx: 1, rating: 5, comment: 'Exceptional blockwork — straight walls and clean joints. Will use again.', projectType: 'Perimeter Wall' },
    { contractorIdx: 1, rating: 5, comment: 'Fast and affordable. Laid 2,000 blocks in 4 days with a small crew.', projectType: 'House Foundation & Walls' },
    { contractorIdx: 2, rating: 3, comment: 'Good work overall but took longer than quoted. Quality of finish was fine.', projectType: 'Roof Replacement' },
    { contractorIdx: 5, rating: 5, comment: 'Beautiful tiling work, very precise cuts around corners. Recommended.', projectType: 'Living Room Flooring' },
    { contractorIdx: 6, rating: 4, comment: 'Clean lines and even coats. Finished a 3-bedroom exterior in 2 days.', projectType: 'Exterior House Painting' },
    { contractorIdx: 3, rating: 5, comment: 'Fatou fixed our water supply issues in one day. Very knowledgeable.', projectType: 'Plumbing Repair' },
    { contractorIdx: 3, rating: 4, comment: 'Neat electrical installation, all within code. Prompt and polite.', projectType: 'New Build Wiring' },
  ]

  // Get admin user for review seeding (use as reviewer placeholder)
  const adminUser = await prisma.user.findUnique({ where: { phone: process.env.ADMIN_PHONE ?? '0000000000' } })

  const contractorRecords: any[] = []
  for (const c of contractorSeeds) {
    const hash = await bcrypt.hash('contractor123', 10)
    const user = await prisma.user.upsert({
      where:  { phone: c.phone },
      update: {},
      create: { name: c.name, phone: c.phone, password: hash, role: 'CONTRACTOR' },
    })
    const avgRating = reviewSeeds
      .filter((_, i) => contractorSeeds.indexOf(c) === _.contractorIdx)
      .reduce((s, r, _, arr) => s + r.rating / arr.length, 0)
    const reviewCount = reviewSeeds.filter(r => contractorSeeds.indexOf(c) === r.contractorIdx).length
    const contractor = await prisma.contractor.upsert({
      where:  { userId: user.id },
      update: { avgRating: Math.round(avgRating * 10) / 10, reviewCount },
      create: {
        name: c.name, specialty: c.specialty, location: c.location,
        contact: c.contact, bio: c.bio, yearsExp: c.yearsExp,
        verified: c.verified, verifiedAt: c.verified ? new Date() : null,
        avgRating: Math.round(avgRating * 10) / 10, reviewCount,
        userId: user.id,
      },
    })
    contractorRecords.push(contractor)
  }

  // Seed reviews (attributed to admin user as demo reviewer)
  if (adminUser) {
    for (const r of reviewSeeds) {
      const contractor = contractorRecords[r.contractorIdx]
      if (!contractor) continue
      await prisma.contractorReview.upsert({
        where:  { contractorId_userId: { contractorId: contractor.id, userId: adminUser.id + '_' + r.contractorIdx } },
        update: {},
        create: {
          rating: r.rating, comment: r.comment, projectType: r.projectType,
          contractorId: contractor.id, userId: adminUser.id,
        },
      }).catch(() => {}) // ignore duplicate key (admin can only have 1 review per contractor)
    }
  }

  // Forum threads + replies (attributed to the admin user as a demo poster)
  if (adminUser) {
    const forumSeeds: Array<{ id: string; title: string; body: string; categorySlug: string; pinned?: boolean; replies: string[] }> = [
      {
        id: 'forum-welcome',
        title: 'Welcome to the BuildPriceGambia Forum',
        body: 'Use this space to ask questions about material prices, get recommendations for suppliers and contractors, and share tips from your own building projects. Be respectful and keep posts relevant to construction in The Gambia.',
        categorySlug: 'general',
        pinned: true,
        replies: ['Great to have this — been looking for a place to compare notes with other builders.'],
      },
      {
        id: 'forum-cement-prices',
        title: 'Cement prices seem to jump around a lot — is that normal?',
        body: 'I have noticed OPC cement prices differ by as much as D50 per bag between Banjul and Serrekunda. Is this just supplier margin or does it track fuel/import costs?',
        categorySlug: 'estimating',
        replies: [
          'Mostly transport and import timing. Prices from container arrivals tend to dip right after a shipment clears customs.',
          'Also worth checking bulk discounts — most suppliers on here will drop 5% at 50+ bags.',
        ],
      },
      {
        id: 'forum-foundation-question',
        title: 'How deep should foundations be for a 2-storey house on sandy soil?',
        body: 'Planning a 2-storey residential build in Kanifing, soil is quite sandy. What foundation depth are people using and did you get a soil test done first?',
        categorySlug: 'estimating',
        replies: ['Get a soil test before anything else — it will save you money in the long run and most engineers in Greater Banjul can arrange one within a week.'],
      },
      {
        id: 'forum-supplier-recommend',
        title: 'Reliable supplier for zinc roofing sheets in Brikama area?',
        body: 'Need about 60 sheets of zinc roofing for a project in Brikama. Looking for someone with consistent stock and fair delivery pricing.',
        categorySlug: 'suppliers',
        replies: [],
      },
      {
        id: 'forum-import-duty',
        title: 'Any recent changes to import duty on rebar?',
        body: 'Curious if anyone has up to date information on import duty changes affecting steel/rebar pricing this year.',
        categorySlug: 'regulations',
        replies: [],
      },
    ]

    for (const t of forumSeeds) {
      const thread = await prisma.forumThread.upsert({
        where: { id: t.id },
        update: {},
        create: {
          id: t.id, title: t.title, body: t.body,
          categorySlug: t.categorySlug, pinned: t.pinned ?? false,
          views: Math.floor(Math.random() * 80) + 5,
          userId: adminUser.id,
        },
      })
      for (const replyBody of t.replies) {
        await prisma.forumReply.create({
          data: { body: replyBody, threadId: thread.id, userId: adminUser.id },
        }).catch(() => {})
      }
    }
  }

  // Published construction guides
  const guideSeeds = [
    {
      slug: 'how-to-estimate-cement-for-a-house',
      title: 'How to Estimate Cement Needed for a House in The Gambia',
      category: 'estimating',
      materialId: 'mat-cement-opc',
      content: `## Quick Rule of Thumb\n\nFor a standard block wall using 6-inch concrete blocks, budget roughly **1 bag of cement per 15–20 blocks laid** for mortar, plus additional cement for foundation and plastering.\n\n### Foundation\nA typical single-storey foundation for a 3-bedroom house uses **40–60 bags** of OPC cement, depending on soil conditions and foundation depth.\n\n### Plastering\nBudget about **1 bag per 4–5 m²** of wall surface for a standard plaster coat.\n\n### Buying tips\n- Compare OPC vs PPC pricing — PPC is often cheaper and suitable for non-structural work.\n- Bulk orders (50+ bags) usually qualify for a discount — ask your supplier directly.\n- Store cement off the ground and away from moisture; bags degrade quickly in humid conditions.`,
    },
    {
      slug: 'choosing-between-zinc-and-aluzinc-roofing',
      title: 'Zinc vs Aluzinc Roofing Sheets: Which Should You Choose?',
      category: 'roofing',
      materialId: 'mat-zinc-sheet',
      content: `## Zinc Roofing Sheets\nLower upfront cost, widely available across The Gambia. Prone to rust over time in coastal, high-humidity areas without a protective coating.\n\n## Aluzinc Roofing Sheets\nA steel core coated with an aluminum-zinc alloy — significantly better corrosion resistance, especially valuable near the coast (Banjul, Bakau, Kololi). Costs roughly 30-50% more than standard zinc but typically lasts 2-3x longer.\n\n### Our recommendation\nFor coastal properties or anywhere within a few kilometres of the ocean, the extra upfront cost of Aluzinc usually pays for itself within 5-7 years in reduced maintenance and replacement costs.`,
    },
    {
      slug: 'understanding-bulk-discounts',
      title: 'How to Negotiate Bulk Discounts With Suppliers',
      category: 'general',
      materialId: null,
      content: `Most verified suppliers on BuildPriceGambia offer bulk pricing, even if it is not listed publicly. A few tips:\n\n1. **Ask directly** — many discounts are only given when you ask, especially for orders of 50+ units.\n2. **Combine orders** — if you and a neighbour are both building, a combined order often crosses the bulk threshold.\n3. **Time your purchase** — prices often dip right after a new shipment clears customs.\n4. **Compare delivery costs too** — a slightly higher unit price with free delivery can beat a "cheaper" price with a high delivery fee.`,
    },
    {
      slug: 'basic-cost-estimate-checklist',
      title: 'A Basic Checklist Before You Start Estimating Your Build',
      category: 'estimating',
      materialId: null,
      content: `Before requesting quotes or using our Cost Estimator tool, gather:\n\n- Approximate floor area (m²) per storey\n- Number of storeys\n- Preferred wall material (6-inch or 9-inch blocks)\n- Roofing type (zinc, aluzinc, or tiles)\n- Whether you already have a soil test or engineering drawing\n\nHaving these ready will make your quotes from contractors far more accurate and comparable.`,
    },
  ]

  for (const g of guideSeeds) {
    await prisma.materialGuide.upsert({
      where: { slug: g.slug },
      update: {},
      create: {
        slug: g.slug, title: g.title, content: g.content,
        category: g.category, materialId: g.materialId, published: true,
      },
    })
  }

  await prisma.activityLog.create({ data: { action: 'SEED', details: 'Database seeded successfully' } })
  console.log('✅ Seed complete')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
