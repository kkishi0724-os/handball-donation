import { notFound } from 'next/navigation'
import { supabase, Team, Donation } from '@/lib/supabase'
import DonationButton from '@/components/DonationButton'

export const dynamic = 'force-dynamic'

async function getTeam(id: string): Promise<Team | null> {
  const { data } = await supabase
    .from('teams')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()
  return data
}

async function getRecentDonations(teamId: string): Promise<Donation[]> {
  const { data } = await supabase
    .from('donations')
    .select('*')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false })
    .limit(5)
  return data ?? []
}

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [team, donations] = await Promise.all([getTeam(id), getRecentDonations(id)])

  if (!team) notFound()

  const progressPct = team.donation_goal
    ? Math.min(Math.round((team.current_amount / team.donation_goal) * 100), 100)
    : null

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* メインコンテンツ */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <div className="h-56 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              {team.image_url ? (
                <img src={team.image_url} alt={team.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-8xl">🤾</span>
              )}
            </div>
            <div className="p-6">
              <div className="flex gap-2 mb-3">
                <span className="text-xs bg-blue-50 text-blue-700 rounded-full px-2 py-0.5 font-medium">
                  {team.prefecture}
                </span>
                <span className="text-xs bg-gray-50 text-gray-600 rounded-full px-2 py-0.5 font-medium">
                  {team.category}
                </span>
              </div>
              <h1 className="text-2xl font-extrabold mb-1">{team.name}</h1>
              <p className="text-gray-500 text-sm mb-4">{team.school}</p>

              {progressPct !== null && (
                <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                  <div className="flex justify-between text-sm font-medium mb-2">
                    <span className="text-blue-800">集まった金額</span>
                    <span className="text-blue-800">{progressPct}%</span>
                  </div>
                  <div className="h-2 bg-blue-100 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-blue-700">
                      ¥{team.current_amount.toLocaleString()}
                    </span>
                    <span className="text-blue-500">
                      目標 ¥{team.donation_goal!.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              <h2 className="font-bold text-lg mb-2">部活について</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{team.description}</p>
            </div>
          </div>

          {/* 応援メッセージ一覧 */}
          {donations.length > 0 && (
            <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-bold text-lg mb-4">最近の応援メッセージ</h2>
              <ul className="space-y-3">
                {donations.map((d) => (
                  <li key={d.id} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{d.donor_name ?? '匿名さん'}</span>
                      <span className="text-blue-600 font-bold">¥{d.amount.toLocaleString()}</span>
                    </div>
                    {d.message && (
                      <p className="text-sm text-gray-600 mt-1">"{d.message}"</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 寄付ウィジェット */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <DonationButton teamId={team.id} teamName={team.name} />
          </div>
        </div>
      </div>
    </div>
  )
}
