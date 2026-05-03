'use client'

import { useState, useMemo } from 'react'
import { Calculator, TrendingDown, DollarSign, Calendar } from 'lucide-react'

type Props = { totalCost: number }

function fmt(n: number) {
  return 'D' + Math.round(n).toLocaleString('en-US')
}

export default function FinancingCalculator({ totalCost }: Props) {
  const [downPct,       setDownPct]       = useState(20)
  const [interestRate,  setInterestRate]  = useState(12)
  const [termYears,     setTermYears]     = useState(15)

  const { loanAmount, monthlyPayment, totalPaid, totalInterest } = useMemo(() => {
    const downPayment  = totalCost * (downPct / 100)
    const loanAmount   = totalCost - downPayment
    const monthlyRate  = interestRate / 100 / 12
    const numPayments  = termYears * 12
    let monthlyPayment: number
    if (monthlyRate === 0) {
      monthlyPayment = loanAmount / numPayments
    } else {
      monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))
        / (Math.pow(1 + monthlyRate, numPayments) - 1)
    }
    const totalPaid    = monthlyPayment * numPayments + downPayment
    const totalInterest = totalPaid - totalCost
    return { loanAmount, monthlyPayment, totalPaid, totalInterest }
  }, [totalCost, downPct, interestRate, termYears])

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-5">
        <Calculator size={20} className="text-primary-500" />
        <h2 className="text-lg font-bold text-gray-900">Financing Calculator</h2>
      </div>

      {/* Project cost display */}
      <div className="bg-primary-50 rounded-xl px-4 py-3 mb-6 text-center">
        <p className="text-xs text-primary-600 font-medium mb-0.5">Project Cost</p>
        <p className="text-2xl font-extrabold text-primary-700">{fmt(totalCost)}</p>
      </div>

      {/* Controls */}
      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between text-xs font-medium text-gray-600 mb-1.5">
            <span>Down Payment</span>
            <span className="text-primary-600">{downPct}% — {fmt(totalCost * downPct / 100)}</span>
          </div>
          <input
            type="range" min={5} max={50} step={5}
            value={downPct} onChange={e => setDownPct(Number(e.target.value))}
            className="w-full accent-primary-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-0.5">
            <span>5%</span><span>50%</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-medium text-gray-600 mb-1.5">
            <span>Interest Rate (Annual)</span>
            <span className="text-primary-600">{interestRate}%</span>
          </div>
          <input
            type="range" min={6} max={25} step={0.5}
            value={interestRate} onChange={e => setInterestRate(Number(e.target.value))}
            className="w-full accent-primary-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-0.5">
            <span>6%</span><span>25%</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-medium text-gray-600 mb-1.5">
            <span>Loan Term</span>
            <span className="text-primary-600">{termYears} years</span>
          </div>
          <input
            type="range" min={5} max={25} step={1}
            value={termYears} onChange={e => setTermYears(Number(e.target.value))}
            className="w-full accent-primary-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-0.5">
            <span>5 yr</span><span>25 yr</span>
          </div>
        </div>
      </div>

      {/* Key metric */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-4 text-center text-white mb-5">
        <p className="text-sm font-medium opacity-80 mb-1">Estimated Monthly Payment</p>
        <p className="text-4xl font-extrabold">{fmt(monthlyPayment)}</p>
        <p className="text-xs opacity-70 mt-1">per month for {termYears} years</p>
      </div>

      {/* Breakdown table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-gray-100">
            {[
              { icon: DollarSign,   label: 'Down payment',   value: fmt(totalCost * downPct / 100), sub: `${downPct}% of project cost` },
              { icon: DollarSign,   label: 'Loan amount',    value: fmt(loanAmount),                sub: `${100 - downPct}% financed` },
              { icon: Calendar,     label: 'Loan term',      value: `${termYears} years`,            sub: `${termYears * 12} payments` },
              { icon: TrendingDown, label: 'Total interest', value: fmt(totalInterest),             sub: `at ${interestRate}% p.a.` },
              { icon: DollarSign,   label: 'Total paid',     value: fmt(totalPaid),                 sub: 'including down payment' },
            ].map(({ icon: Icon, label, value, sub }) => (
              <tr key={label} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Icon size={14} className="text-gray-400 shrink-0" />
                    <div>
                      <p className="font-medium text-gray-800">{label}</p>
                      <p className="text-xs text-gray-400">{sub}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-bold text-gray-900 whitespace-nowrap">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 mt-3 text-center">
        Estimates only. Actual loan terms vary by lender. Consult a financial institution for official rates.
      </p>
    </div>
  )
}
