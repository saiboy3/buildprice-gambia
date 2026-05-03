'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context'
import Link from 'next/link'
import { Star, Users, Briefcase, Phone, MapPin, ShieldCheck, Loader2, CheckCircle, XCircle } from 'lucide-react'
import clsx from 'clsx'

type Lead = {
  id: string
  name: string
  phone: string
  message: string
  status: 'NEW' | 'CONTACTED' | 'CLOSED'
  createdAt: string
}

type ContractorProfile = {
  id: string; name: string; specialty: string; location: string
  contact: string; verified: boolean; avgRating: number; reviewCount: number; bio: string
}

const STATUS_COLORS: Record<string, string> = {
  NEW:       'bg-blue-100 text-blue-700',
  CONTACTED: 'bg-amber-100 text-amber-700',
  CLOSED:    'bg-gray-100 text-gray-500',
}

export default function ContractorDashboard() {
  const { user, token } = useAuth()

  const [profile,  setProfile]  = useState<ContractorProfile | null>(null)
  const [leads,    setLeads]    = useState<Lead[]>([])
  const [loading,  setLoading]  = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const contractorId = user?.contractorId

  const load = async () => {
    if (!contractorId) return
    setLoading(true)
    try {
      const [profRes, leadsRes] = await Promise.all([
        fetch(`/api/contractors/${contractorId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/contractors/${contractorId}/leads`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
      const profJson  = await profRes.json()
      const leadsJson = await leadsRes.json()
      if (profJson.ok)  setProfile(profJson.data)
      if (leadsJson.ok) setLeads(leadsJson.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [contractorId])

  const updateLeadStatus = async (leadId: string, status: string) => {
    setUpdating(leadId)
    await fetch(`/api/contractors/${contractorId}/leads?id=${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    })
    setUpdating(null)
    load()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={28} className="animate-spin text-primary-500" />
    </div>
  )

  const totalLeads = leads.length
  const newLeads   = leads.filter(l => l.status === 'NEW').length

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Contractor Dashboard</h1>

      {/* Profile card */}
      {profile && (
        <div className="card mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-gray-900">{profile.name}</h2>
                {profile.verified && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    <ShieldCheck size={12} /> Verified
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-1">
                <span className="flex items-center gap-1"><MapPin size={13} /> {profile.location}</span>
                <span className="flex items-center gap-1"><Phone size={13} /> {profile.contact}</span>
                <span className="flex items-center gap-1">
                  <Star size={13} className="text-amber-400 fill-amber-400" />
                  {profile.avgRating > 0 ? profile.avgRating.toFixed(1) : '—'}
                  <span className="text-gray-400">({profile.reviewCount} reviews)</span>
                </span>
              </div>
              {profile.bio && <p className="text-sm text-gray-500 mt-2">{profile.bio}</p>}
            </div>
            <Link href={`/contractors/${contractorId}`} className="btn-secondary text-sm">
              View public profile →
            </Link>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total leads',     value: totalLeads,                    icon: Users },
          { label: 'New leads',       value: newLeads,                      icon: Users },
          { label: 'Total reviews',   value: profile?.reviewCount ?? 0,     icon: Star },
          { label: 'Avg rating',      value: profile?.avgRating?.toFixed(1) ?? '—', icon: Star },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="card text-center">
            <Icon size={20} className="mx-auto text-primary-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="flex gap-3 mb-6">
        <Link href="/contractor/projects" className="btn-primary text-sm">
          <Briefcase size={14} /> Manage Projects
        </Link>
      </div>

      {/* Leads */}
      <div className="card">
        <h2 className="font-bold text-gray-900 mb-4">Leads {totalLeads > 0 && <span className="text-gray-400 font-normal">({totalLeads})</span>}</h2>
        {leads.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No leads yet. Your profile will attract inquiries once listed.</p>
        ) : (
          <div className="space-y-3">
            {leads.map(lead => (
              <div key={lead.id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{lead.name}</p>
                    <a href={`tel:${lead.phone}`} className="text-sm text-primary-600 hover:underline">{lead.phone}</a>
                    {lead.message && <p className="text-sm text-gray-500 mt-1 max-w-xl">{lead.message}</p>}
                    <p className="text-xs text-gray-400 mt-1">{new Date(lead.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={clsx('text-xs font-semibold px-2.5 py-1 rounded-full', STATUS_COLORS[lead.status])}>
                      {lead.status}
                    </span>
                    {lead.status !== 'CONTACTED' && (
                      <button
                        onClick={() => updateLeadStatus(lead.id, 'CONTACTED')}
                        disabled={updating === lead.id}
                        className="text-xs btn-secondary py-1 px-2"
                      >
                        {updating === lead.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                        Mark contacted
                      </button>
                    )}
                    {lead.status !== 'CLOSED' && (
                      <button
                        onClick={() => updateLeadStatus(lead.id, 'CLOSED')}
                        disabled={updating === lead.id}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded-lg flex items-center gap-1"
                      >
                        <XCircle size={12} /> Close
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
