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
    prisma.material.upsert({ where: { id: 'mat-cement-opc' },   update: {}, create: { id: 'mat-cement-opc',   name: 'OPC Cement 42.5',       categoryId: cement.id } }),
    prisma.material.upsert({ where: { id: 'mat-cement-ppc' },   update: {}, create: { id: 'mat-cement-ppc',   name: 'PPC Cement 32.5',       categoryId: cement.id } }),
    prisma.material.upsert({ where: { id: 'mat-blocks-6in' },   update: {}, create: { id: 'mat-blocks-6in',   name: 'Concrete Blocks 6 inch', categoryId: cement.id } }),
    prisma.material.upsert({ where: { id: 'mat-rebar-12' },     update: {}, create: { id: 'mat-rebar-12',     name: 'Rebar 12mm',         categoryId: steel.id } }),
    prisma.material.upsert({ where: { id: 'mat-rebar-16' },     update: {}, create: { id: 'mat-rebar-16',     name: 'Rebar 16mm',         categoryId: steel.id } }),
    prisma.material.upsert({ where: { id: 'mat-sand-sharp' },   update: {}, create: { id: 'mat-sand-sharp',   name: 'Sharp Sand',         categoryId: sand.id } }),
    prisma.material.upsert({ where: { id: 'mat-gravel' },       update: {}, create: { id: 'mat-gravel',       name: 'Gravel / Chippings', categoryId: sand.id } }),
    prisma.material.upsert({ where: { id: 'mat-timber-2x4' },  update: {}, create: { id: 'mat-timber-2x4',   name: 'Timber 2×4 inch',    categoryId: timber.id } }),
    prisma.material.upsert({ where: { id: 'mat-plywood' },      update: {}, create: { id: 'mat-plywood',      name: 'Plywood 18mm',       categoryId: timber.id } }),
    prisma.material.upsert({ where: { id: 'mat-zinc-sheet' },   update: {}, create: { id: 'mat-zinc-sheet',   name: 'Zinc Roof Sheet',    categoryId: roofing.id } }),
    prisma.material.upsert({ where: { id: 'mat-pvc-pipe' },     update: {}, create: { id: 'mat-pvc-pipe',     name: 'PVC Pipe 4 inch',    categoryId: plumbing.id } }),
    prisma.material.upsert({ where: { id: 'mat-wire-2.5' },     update: {}, create: { id: 'mat-wire-2.5',     name: 'Electrical Wire 2.5mm', categoryId: electrical.id } }),
    prisma.material.upsert({ where: { id: 'mat-paint-emulsion'}, update: {}, create: { id: 'mat-paint-emulsion', name: 'Emulsion Paint 20L', categoryId: paint.id } }),
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
    { name: 'Banjul Building Supplies', phone: '2201001001', location: 'Banjul', contact: '+220 100 1001' },
    { name: 'Serrekunda Hardware Store', phone: '2201002002', location: 'Serrekunda', contact: '+220 100 2002' },
    { name: 'Bakau Construction Depot', phone: '2201003003', location: 'Bakau', contact: '+220 100 3003' },
  ]

  const priceSeeds: Array<{ suppIdx: number; matId: string; price: number; unit: string }> = [
    // Banjul
    { suppIdx: 0, matId: 'mat-blocks-6in',   price: 28,   unit: 'block' },
    { suppIdx: 0, matId: 'mat-cement-opc',   price: 750,  unit: 'bag (50kg)' },
    { suppIdx: 0, matId: 'mat-cement-ppc',   price: 700,  unit: 'bag (50kg)' },
    { suppIdx: 0, matId: 'mat-rebar-12',     price: 2800, unit: 'ton' },
    { suppIdx: 0, matId: 'mat-sand-sharp',   price: 1200, unit: 'm³' },
    { suppIdx: 0, matId: 'mat-zinc-sheet',   price: 320,  unit: 'sheet (8ft)' },
    // Serrekunda
    { suppIdx: 1, matId: 'mat-blocks-6in',   price: 26,   unit: 'block' },
    { suppIdx: 1, matId: 'mat-cement-opc',   price: 730,  unit: 'bag (50kg)' },
    { suppIdx: 1, matId: 'mat-cement-ppc',   price: 690,  unit: 'bag (50kg)' },
    { suppIdx: 1, matId: 'mat-rebar-12',     price: 2750, unit: 'ton' },
    { suppIdx: 1, matId: 'mat-rebar-16',     price: 3100, unit: 'ton' },
    { suppIdx: 1, matId: 'mat-gravel',       price: 1500, unit: 'm³' },
    { suppIdx: 1, matId: 'mat-timber-2x4',   price: 85,   unit: 'piece (12ft)' },
    { suppIdx: 1, matId: 'mat-paint-emulsion', price: 1850, unit: 'bucket (20L)' },
    // Bakau
    { suppIdx: 2, matId: 'mat-cement-opc',   price: 760,  unit: 'bag (50kg)' },
    { suppIdx: 2, matId: 'mat-rebar-16',     price: 3050, unit: 'ton' },
    { suppIdx: 2, matId: 'mat-plywood',      price: 650,  unit: 'sheet' },
    { suppIdx: 2, matId: 'mat-pvc-pipe',     price: 180,  unit: 'length (6m)' },
    { suppIdx: 2, matId: 'mat-wire-2.5',     price: 420,  unit: 'roll (100m)' },
    { suppIdx: 2, matId: 'mat-zinc-sheet',   price: 305,  unit: 'sheet (8ft)' },
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

  await prisma.activityLog.create({ data: { action: 'SEED', details: 'Database seeded successfully' } })
  console.log('✅ Seed complete')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
