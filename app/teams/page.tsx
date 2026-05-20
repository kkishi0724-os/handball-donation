import { Suspense } from 'react'
import { supabase, Team } from '@/lib/supabase'
import TeamCard from '@/components/TeamCard'
import SearchFilter from '@/components/SearchFilter'

export const dynamic = 'force-dynamic'

type SearchParams = { q?: string; prefecture?: string; category?: string }

async function getTeams(params: SearchParams): Promise<Team[]> {
  let query = supabase
    .from('teams')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (params.prefecture) query = query.eq('prefecture', params.prefecture)
  if (params.category) query = query.eq('category', params.category)
  if (params.q) query = query.or(`name.ilike.%${params.q}%,school.ilike.%${params.q}%`)

  const { data } = await query
  return data ?? []
}

export default async function TeamsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const teams = await getTeams(params)

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold mb-2">部活を探す</h1>
      <p className="text-gray-500 mb-6">全国のハンドボール部を応援しよう</p>
      <Suspense>
        <SearchFilter />
      </Suspense>
      {teams.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🔍</div>
          <p>条件に一致する部活が見つかりませんでした。</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{teams.length} 件</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {teams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
