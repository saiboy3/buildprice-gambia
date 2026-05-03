import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const projects = await prisma.contractorProject.findMany({
      where: { contractorId: params.id },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ ok: true, data: projects })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tokenUser = requireAuth(req, ['CONTRACTOR'])

    if (tokenUser.contractorId !== params.id) {
      return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 })
    }

    const { title, description, photoUrls, location, completedAt } = await req.json()
    if (!title) {
      return NextResponse.json({ ok: false, message: 'title is required' }, { status: 400 })
    }

    const project = await prisma.contractorProject.create({
      data: {
        contractorId: params.id,
        title,
        description,
        photoUrls: photoUrls ?? [],
        location,
        completedAt: completedAt ? new Date(completedAt) : undefined,
      },
    })
    return NextResponse.json({ ok: true, data: project }, { status: 201 })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, message: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tokenUser = requireAuth(req, ['CONTRACTOR'])

    if (tokenUser.contractorId !== params.id) {
      return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    if (!projectId) {
      return NextResponse.json({ ok: false, message: 'projectId is required' }, { status: 400 })
    }

    const project = await prisma.contractorProject.findUnique({ where: { id: projectId } })
    if (!project || project.contractorId !== params.id) {
      return NextResponse.json({ ok: false, message: 'Project not found or forbidden' }, { status: 404 })
    }

    await prisma.contractorProject.delete({ where: { id: projectId } })
    return NextResponse.json({ ok: true, data: { deleted: true } })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, message: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}
