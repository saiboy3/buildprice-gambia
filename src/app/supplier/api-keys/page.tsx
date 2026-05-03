'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context'
import { useRouter } from 'next/navigation'
import { Key, Plus, Trash2, ToggleLeft, ToggleRight, Loader2, Copy, Check } from 'lucide-react'
import clsx from 'clsx'

type ApiKey = {
  id:       string
  label:    string
  key:      string
  active:   boolean
  lastUsed: string | null
  createdAt: string
}

export default function ApiKeysPage() {
  const { isSupplier, token } = useAuth()
  const router = useRouter()

  const [keys,     setKeys]     = useState<ApiKey[]>([])
  const [loading,  setLoading]  = useState(true)
  const [label,    setLabel]    = useState('')
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')
  const [copied,   setCopied]   = useState<string | null>(null)

  useEffect(() => {
    if (!isSupplier) { router.push('/login'); return }
    load()
  }, [isSupplier])

  const load = async () => {
    setLoading(true)
    const res  = await fetch('/api/api-keys', { headers: { Authorization: `Bearer ${token}` } })
    const json = await res.json()
    if (json.ok) setKeys(json.data)
    setLoading(false)
  }

  const createKey = async () => {
    if (!label.trim()) { setError('Label is required.'); return }
    setSaving(true); setError('')
    const res  = await fetch('/api/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ label }),
    })
    const json = await res.json()
    if (!json.ok) { setError(json.error ?? 'Failed to create key.'); setSaving(false); return }
    setLabel(''); setSaving(false); load()
  }

  const toggleActive = async (id: string, active: boolean) => {
    await fetch(`/api/api-keys?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ active: !active }),
    })
    load()
  }

  const deleteKey = async (id: string) => {
    if (!confirm('Delete this API key? This cannot be undone.')) return
    await fetch(`/api/api-keys?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    load()
  }

  const copyToClipboard = (key: string, id: string) => {
    navigator.clipboard.writeText(key).then(() => {
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const maskKey = (key: string) => key.length > 12
    ? `${key.slice(0, 8)}${'•'.repeat(key.length - 12)}${key.slice(-4)}`
    : '••••••••'

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Loader2 size={28} className="animate-spin text-primary-500" /></div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Key size={22} className="text-primary-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage API keys for programmatic access to BuildPrice Gambia.</p>
        </div>
      </div>

      {/* Create new key */}
      <div className="card mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Create New Key</h2>
        <div className="flex gap-3">
          <input className="input flex-1" placeholder="Key label, e.g. ERP Integration"
            value={label} onChange={e => setLabel(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createKey()} />
          <button onClick={createKey} disabled={saving} className="btn-primary shrink-0">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Generate
          </button>
        </div>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </div>

      {/* Keys list */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Your Keys ({keys.length})</h2>
        {keys.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No API keys yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {keys.map(k => (
              <div key={k.id} className="py-4 flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{k.label}</span>
                    <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full',
                      k.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                      {k.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono">
                      {maskKey(k.key)}
                    </code>
                    <button onClick={() => copyToClipboard(k.key, k.id)}
                      className="text-gray-400 hover:text-primary-500 transition-colors"
                      title="Copy key">
                      {copied === k.id ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                    </button>
                  </div>
                  <div className="text-xs text-gray-400 mt-1 space-x-3">
                    <span>Created {new Date(k.createdAt).toLocaleDateString()}</span>
                    {k.lastUsed && <span>Last used {new Date(k.lastUsed).toLocaleDateString()}</span>}
                    {!k.lastUsed && <span>Never used</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleActive(k.id, k.active)}
                    className="text-gray-400 hover:text-primary-500 transition-colors"
                    title={k.active ? 'Deactivate' : 'Activate'}>
                    {k.active
                      ? <ToggleRight size={20} className="text-green-500" />
                      : <ToggleLeft size={20} />}
                  </button>
                  <button onClick={() => deleteKey(k.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-4">
        Keep your API keys secure. Do not share them publicly. Keys can be used to access price data via the BuildPrice Gambia API.
      </p>
    </div>
  )
}
