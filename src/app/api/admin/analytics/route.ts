import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getTokenFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = getTokenFromRequest(req)
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ ok: false }, { status: 401 })

  const days = Number(new URL(req.url).searchParams.get('days') ?? '30')
  const since = new Date(Date.now() - days * 86400000)

  const [totalViews, uniqueSessionsRaw, topPages, topSearches, deviceBreakdown, locationBreakdown, topSearchesByLocation, dailyViews, adStats] = await Promise.all([
    prisma.pageView.count({ where: { createdAt: { gte: since } } }),
    prisma.pageView.findMany({ where: { createdAt: { gte: since } }, select: { sessionId: true }, distinct: ['sessionId'] }),
    prisma.pageView.groupBy({ by: ['page'], where: { createdAt: { gte: since } }, _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 10 }),
    prisma.searchEvent.groupBy({ by: ['query'], where: { createdAt: { gte: since } }, _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 10 }),
    prisma.pageView.groupBy({ by: ['device'], where: { createdAt: { gte: since } }, _count: { id: true } }),
    prisma.pageView.groupBy({ by: ['location'], where: { createdAt: { gte: since }, location: { not: null } }, _count: { id: true }, orderBy: { _count: { id: 'desc' } } }),
    prisma.searchEvent.groupBy({ by: ['location', 'query'], where: { createdAt: { gte: since }, location: { not: null } }, _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 20 }),
    // daily views for chart (last N days)
    prisma.$queryRaw`
      SELECT DATE("createdAt") as date, COUNT(*) as views
      FROM "PageView"
      WHERE "createdAt" >= ${since}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `,
    prisma.promotedListing.findMany({
      select: {
        id: true, headline: true, impressions: true, clicks: true,
        spent: true, budget: true, active: true,
        supplier: { select: { name: true } },
      },
      orderBy: { impressions: 'desc' },
      take: 10,
    }),
  ])

  return NextResponse.json({
    ok: true,
    data: {
      totalViews,
      uniqueVisitors: uniqueSessionsRaw.length,
      topPages: topPages.map(p => ({ page: p.page, views: p._count.id })),
      topSearches: topSearches.map(s => ({ query: s.query, count: s._count.id })),
      deviceBreakdown: deviceBreakdown.map(d => ({ device: d.device ?? 'unknown', count: d._count.id })),
      locationBreakdown: locationBreakdown.map(l => ({ location: l.location ?? 'unknown', count: l._count.id })),
      topSearchesByLocation: topSearchesByLocation.map(s => ({ location: s.location, query: s.query, count: s._count.id })),
      dailyViews,
      adStats,
    },
  })
}
