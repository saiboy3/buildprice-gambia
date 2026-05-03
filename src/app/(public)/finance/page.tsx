'use client'

import { useState } from 'react'
import FinancingCalculator from '@/components/FinancingCalculator'
import { Building2, Info, Landmark, Home } from 'lucide-react'

export default function FinancePage() {
  const [customCost, setCustomCost] = useState(1200000)
  const [inputVal,   setInputVal]   = useState('1200000')

  const handleCostChange = (v: string) => {
    setInputVal(v)
    const n = parseFloat(v.replace(/,/g, ''))
    if (!isNaN(n) && n > 0) setCustomCost(n)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Construction Financing in The Gambia</h1>
        <p className="text-gray-500">Understand your financing options and estimate monthly payments for your build project.</p>
      </div>

      {/* Custom cost input */}
      <div className="card mb-8">
        <label className="text-sm font-semibold text-gray-700 mb-2 block">Enter Your Project Cost (D)</label>
        <input
          type="number"
          className="input max-w-xs"
          value={inputVal}
          onChange={e => handleCostChange(e.target.value)}
          min={100000}
          step={50000}
          placeholder="e.g. 1200000"
        />
        <p className="text-xs text-gray-400 mt-1">Typical 3-bedroom home in Greater Banjul: D 800,000 – D 2,500,000</p>
      </div>

      {/* Calculator */}
      <div className="mb-10">
        <FinancingCalculator totalCost={customCost} />
      </div>

      {/* Educational content */}
      <h2 className="text-xl font-bold text-gray-900 mb-5">Financing Options in The Gambia</h2>

      <div className="grid md:grid-cols-2 gap-5 mb-8">
        {[
          {
            icon: Landmark,
            title: 'SSHFC – Social Security & Housing Finance Corporation',
            color: 'bg-blue-50 border-blue-200',
            iconColor: 'text-blue-500',
            points: [
              'Primary government-backed housing finance institution',
              'Loans available to SSHFC contributors',
              'Interest rates typically 12–15% per annum',
              'Terms up to 20 years for residential construction',
              'Requires land title and building permit',
            ],
          },
          {
            icon: Building2,
            title: 'Commercial Banks',
            color: 'bg-amber-50 border-amber-200',
            iconColor: 'text-amber-500',
            points: [
              'Trust Bank, GTBank, Access Bank offer mortgage products',
              'Interest rates: 18–25% per annum (variable)',
              'Down payment requirements: 20–30%',
              'Terms typically 10–15 years',
              'Requires formal employment or business income proof',
            ],
          },
          {
            icon: Home,
            title: 'Informal / Family Finance',
            color: 'bg-green-50 border-green-200',
            iconColor: 'text-green-500',
            points: [
              'Most common approach for Gambians in diaspora',
              'Gradual construction — "build as you can afford"',
              'No interest costs but longer completion timelines',
              'Diaspora remittances play a significant role',
              'Requires disciplined savings or remittance schedule',
            ],
          },
          {
            icon: Info,
            title: 'Key Requirements',
            color: 'bg-purple-50 border-purple-200',
            iconColor: 'text-purple-500',
            points: [
              'Registered land title (deed of conveyance)',
              'Approved building plan from the local authority',
              'Bill of Quantities (BOQ) from a registered quantity surveyor',
              'Income verification (payslips, bank statements)',
              'National ID or passport',
            ],
          },
        ].map(({ icon: Icon, title, color, iconColor, points }) => (
          <div key={title} className={`rounded-xl border p-5 ${color}`}>
            <div className="flex items-center gap-2 mb-3">
              <Icon size={18} className={iconColor} />
              <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
            </div>
            <ul className="space-y-1.5">
              {points.map(p => (
                <li key={p} className="text-sm text-gray-700 flex gap-2">
                  <span className="text-gray-400 shrink-0">•</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-700">Disclaimer: </span>
          The calculator and information on this page are for educational purposes only.
          Actual loan terms, interest rates, and eligibility criteria vary by institution.
          Always consult directly with your bank or SSHFC for official guidance.
        </p>
      </div>
    </div>
  )
}
