'use client'

import { useState } from 'react'

type Props = { teamId: string; teamName: string }

const AMOUNTS = [500, 1000, 3000, 5000, 10000]

export default function DonationButton({ teamId, teamName }: Props) {
  const [selected, setSelected] = useState<number>(1000)
  const [custom, setCustom] = useState('')
  const [loading, setLoading] = useState(false)

  const finalAmount = custom ? parseInt(custom, 10) : selected

  const handleDonate = async () => {
    if (!finalAmount || finalAmount < 100) return
    setLoading(true)
    try {
      const res = await fetch(`/donate/${teamId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalAmount, teamName }),
      })
      const { url } = await res.json()
      window.location.href = url
    } catch {
      alert('エラーが発生しました。もう一度お試しください。')
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <h2 className="font-bold text-lg text-gray-900 mb-4">この部活を応援する</h2>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {AMOUNTS.map((a) => (
          <button
            key={a}
            onClick={() => { setSelected(a); setCustom('') }}
            className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
              selected === a && !custom
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400'
            }`}
          >
            ¥{a.toLocaleString()}
          </button>
        ))}
        <input
          type="number"
          placeholder="金額を入力"
          value={custom}
          min={100}
          onChange={(e) => { setCustom(e.target.value); setSelected(0) }}
          className="col-span-3 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <button
        onClick={handleDonate}
        disabled={loading || !finalAmount || finalAmount < 100}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
      >
        {loading ? '処理中...' : `¥${(finalAmount || 0).toLocaleString()} 寄付する`}
      </button>
      <p className="text-xs text-gray-400 mt-3 text-center">
        クレジットカードで安全に決済（Stripe）
      </p>
    </div>
  )
}
