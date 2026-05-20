'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, Team } from '@/lib/supabase'

const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
]

const emptyForm = {
  name: '', school: '', prefecture: '東京都', category: '男子' as '男子' | '女子',
  description: '', image_url: '', donation_goal: '',
}

export default function AdminTeamsPage() {
  const router = useRouter()
  const [teams, setTeams] = useState<Team[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/admin')
    })
    fetchTeams()
  }, [router])

  const fetchTeams = async () => {
    const { data } = await supabase.from('teams').select('*').order('created_at', { ascending: false })
    setTeams(data ?? [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      donation_goal: form.donation_goal ? parseInt(form.donation_goal, 10) : null,
      image_url: form.image_url || null,
    }

    if (editId) {
      await supabase.from('teams').update(payload).eq('id', editId)
      setMessage('更新しました')
    } else {
      await supabase.from('teams').insert(payload)
      setMessage('登録しました')
    }
    setForm(emptyForm)
    setEditId(null)
    setSaving(false)
    fetchTeams()
    setTimeout(() => setMessage(''), 3000)
  }

  const handleEdit = (team: Team) => {
    setEditId(team.id)
    setForm({
      name: team.name, school: team.school, prefecture: team.prefecture,
      category: team.category, description: team.description,
      image_url: team.image_url ?? '', donation_goal: team.donation_goal?.toString() ?? '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleToggle = async (team: Team) => {
    await supabase.from('teams').update({ is_active: !team.is_active }).eq('id', team.id)
    fetchTeams()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin')
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-extrabold">部活管理</h1>
        <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500 transition-colors">
          ログアウト
        </button>
      </div>

      {/* フォーム */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-10">
        <h2 className="font-bold text-lg mb-4">{editId ? '部活を編集' : '部活を新規登録'}</h2>
        {message && <p className="text-green-600 text-sm mb-3 font-medium">{message}</p>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: '部活名 *', key: 'name', placeholder: '○○高校男子ハンドボール部' },
            { label: '学校名 *', key: 'school', placeholder: '○○高校' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type="text" required
                value={(form as Record<string, string>)[key]}
                placeholder={placeholder}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">都道府県 *</label>
            <select
              value={form.prefecture}
              onChange={(e) => setForm({ ...form, prefecture: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {PREFECTURES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ *</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as '男子' | '女子' })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option>男子</option>
              <option>女子</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">目標金額（任意）</label>
            <input
              type="number" min={0}
              value={form.donation_goal}
              placeholder="300000"
              onChange={(e) => setForm({ ...form, donation_goal: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">画像URL（任意）</label>
            <input
              type="url"
              value={form.image_url}
              placeholder="https://..."
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">紹介文 *</label>
            <textarea
              required rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="sm:col-span-2 flex gap-3">
            <button
              type="submit" disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl transition-colors"
            >
              {saving ? '保存中...' : (editId ? '更新する' : '登録する')}
            </button>
            {editId && (
              <button
                type="button"
                onClick={() => { setEditId(null); setForm(emptyForm) }}
                className="border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 一覧 */}
      <h2 className="font-bold text-lg mb-4">登録済み部活一覧（{teams.length} 件）</h2>
      <div className="space-y-3">
        {teams.map((team) => (
          <div
            key={team.id}
            className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between gap-4"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{team.name}</p>
              <p className="text-sm text-gray-500">{team.prefecture} · {team.category}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                team.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {team.is_active ? '公開中' : '非公開'}
              </span>
              <button
                onClick={() => handleEdit(team)}
                className="text-sm text-blue-600 hover:underline"
              >
                編集
              </button>
              <button
                onClick={() => handleToggle(team)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                {team.is_active ? '非公開にする' : '公開する'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
