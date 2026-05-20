import Link from 'next/link'
import { Team } from '@/lib/supabase'

type Props = { team: Team }

export default function TeamCard({ team }: Props) {
  const progressPct = team.donation_goal
    ? Math.min(Math.round((team.current_amount / team.donation_goal) * 100), 100)
    : null

  return (
    <Link href={`/teams/${team.id}`} className="block group">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
        <div className="h-40 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
          {team.image_url ? (
            <img src={team.image_url} alt={team.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-5xl">🤾</span>
          )}
        </div>
        <div className="p-4">
          <span className="inline-block text-xs font-medium bg-blue-50 text-blue-700 rounded-full px-2 py-0.5 mb-2">
            {team.prefecture} · {team.category}
          </span>
          <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {team.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{team.description}</p>
          {progressPct !== null && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>¥{team.current_amount.toLocaleString()}</span>
                <span>{progressPct}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                目標 ¥{team.donation_goal!.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
