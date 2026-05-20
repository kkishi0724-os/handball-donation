import Link from 'next/link'
import { supabase, Team } from '@/lib/supabase'
import TeamCard from '@/components/TeamCard'

export const dynamic = 'force-dynamic'

async function getRecentTeams(): Promise<Team[]> {
  const { data } = await supabase
    .from('teams')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(3)
  return data ?? []
}

export default async function HomePage() {
  const teams = await getRecentTeams()

  return (
    <div>
      {/* ヒーロー */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold mb-4 leading-tight">
            全国の学生ハンドボール部を、<br />あなたの応援で支えよう。
          </h1>
          <p className="text-blue-100 text-lg mb-8">
            ユニフォーム代、遠征費、練習器具——<br />
            気軽な寄付が、子どもたちの夢を後押しします。
          </p>
          <Link
            href="/teams"
            className="inline-block bg-white text-blue-700 font-bold px-8 py-3 rounded-xl shadow hover:bg-blue-50 transition-colors text-lg"
          >
            部活を探して応援する →
          </Link>
        </div>
      </section>

      {/* 使い方 */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold text-center mb-10">3ステップで応援できる</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {[
            { step: '1', icon: '🔍', title: '部活を探す', desc: '都道府県や学校名から気になるチームを検索' },
            { step: '2', icon: '💌', title: '金額を選ぶ', desc: '500円から応援可能。メッセージも添えられます' },
            { step: '3', icon: '🎉', title: '寄付完了', desc: 'カード決済で安全に完了。応援が届きます！' },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="text-4xl mb-3">{icon}</div>
              <div className="text-xs font-bold text-blue-500 mb-1">STEP {step}</div>
              <h3 className="font-bold text-lg mb-2">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 最新の部活 */}
      {teams.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 pb-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">新しく登録された部活</h2>
            <Link href="/teams" className="text-blue-600 text-sm font-medium hover:underline">
              すべて見る →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {teams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
