import { AlertTriangle, Info, ShieldAlert } from 'lucide-react'

type FraudAlert = {
  id:         string
  title:      string
  body:       string
  severity:   'INFO' | 'WARNING' | 'CRITICAL'
  active:     boolean
  createdAt:  string
  material?:  { name: string } | null
}

async function getAlerts(): Promise<FraudAlert[]> {
  try {
    const res  = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/fraud-alerts`, {
      next: { revalidate: 300 },
    })
    const json = await res.json()
    return json.ok ? (json.data as FraudAlert[]).filter(a => a.active) : []
  } catch {
    return []
  }
}

const SEVERITY_STYLE = {
  INFO:     { bg: 'bg-blue-50 border-blue-200',    icon: Info,         iconCls: 'text-blue-500',   badge: 'bg-blue-100 text-blue-700' },
  WARNING:  { bg: 'bg-amber-50 border-amber-200',  icon: AlertTriangle,iconCls: 'text-amber-500',  badge: 'bg-amber-100 text-amber-700' },
  CRITICAL: { bg: 'bg-red-50 border-red-200',      icon: ShieldAlert,  iconCls: 'text-red-500',    badge: 'bg-red-100 text-red-700' },
}

export default async function FraudAlertsPage() {
  const alerts = await getAlerts()

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2 flex items-center gap-2">
          <ShieldAlert size={28} className="text-red-500" />
          Fraud Alerts
        </h1>
        <p className="text-gray-500">Active alerts about suspicious activity, price manipulation, and scams in the Gambian construction market.</p>
      </div>

      {alerts.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <ShieldAlert size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No active fraud alerts</p>
          <p className="text-sm mt-1">The market appears clean. Check back regularly.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map(alert => {
            const style = SEVERITY_STYLE[alert.severity]
            const Icon  = style.icon
            return (
              <div key={alert.id} className={`border rounded-2xl p-5 ${style.bg}`}>
                <div className="flex items-start gap-3">
                  <Icon size={20} className={`${style.iconCls} shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h2 className="font-bold text-gray-900">{alert.title}</h2>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
                        {alert.severity}
                      </span>
                      {alert.material && (
                        <span className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                          {alert.material.name}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{alert.body}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Posted {new Date(alert.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center mt-8">
        To report suspicious activity, contact us via the platform. Alerts are reviewed and updated regularly.
      </p>
    </div>
  )
}
