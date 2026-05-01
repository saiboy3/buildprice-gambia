import { prisma } from './db'
import { sendWhatsAppMessage } from './whatsapp'

export async function checkAndFireAlerts(materialId: string, newPrice: number) {
  const alerts = await prisma.alert.findMany({
    where: { materialId, active: true, triggered: false, material: {} },
    include: { user: true, material: true },
  })

  for (const alert of alerts) {
    if (newPrice <= alert.targetPrice) {
      await sendWhatsAppMessage(
        alert.user.phone,
        `🔔 *Price Alert!*\n\n*${alert.material.name}* is now *D${newPrice}*\n(Your target: D${alert.targetPrice})\n\nCheck suppliers at buildpricegambia.com`
      )
      await prisma.alert.update({ where: { id: alert.id }, data: { triggered: true, active: false } })
    }
  }
}
