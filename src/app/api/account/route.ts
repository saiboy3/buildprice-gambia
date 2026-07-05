import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, comparePassword } from '@/lib/auth'
import { ok, err, handleError, log } from '@/lib/api'

export async function DELETE(req: NextRequest) {
  try {
    const authUser = requireAuth(req)
    const { password } = await req.json().catch(() => ({}))
    if (!password) return err('Enter your password to confirm account deletion', 400)

    const user = await prisma.user.findUnique({ where: { id: authUser.id } })
    if (!user) return err('Not found', 404)

    const valid = await comparePassword(password, user.password)
    if (!valid) return err('Incorrect password', 401)

    await log('SELF_DELETE_ACCOUNT', authUser.id, user.phone)
    await prisma.user.delete({ where: { id: authUser.id } })

    return ok({ deleted: true })
  } catch (e) {
    return handleError(e)
  }
}
