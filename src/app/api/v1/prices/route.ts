import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

async function validateApiKey(req: NextRequest): Promise<boolean> {
  const auth = req.headers.get('authorization') ?? ''
  const key = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!key) return false

  const record = await prisma.apiKey.findUnique({ where: { key } })
  if (!record || !record.active) return false

  await prisma.apiKey.update({ where: { id: record.id }, data: { lastUsed: new Date() } })
  return true
}

export async function GET(req: NextRequest) {
  try {
    const valid = await validateApiKey(req)
    if (!valid) {
      return NextResponse.json({ ok: false, message: 'Invalid API key' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const materialId = searchParams.get('materialId')
    const supplierId = searchParams.get('supplierId')

    const prices = await prisma.price.findMany({
      where: {
        ...(materialId ? { materialId } : {}),
        ...(supplierId ? { supplierId } : {}),
      },
      include: {
        material: { include: { category: { select: { name: true } } } },
        supplier: { select: { id: true, name: true, location: true, verified: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })
    return NextResponse.json({ ok: true, data: prices })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}
