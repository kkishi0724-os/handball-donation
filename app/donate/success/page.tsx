import Link from 'next/link'

export default function DonateSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="text-7xl mb-6">🎉</div>
      <h1 className="text-3xl font-extrabold mb-3 text-gray-900">ありがとうございます！</h1>
      <p className="text-gray-500 text-lg mb-8 max-w-md">
        あなたの応援が選手たちに届きます。<br />
        温かいご支援、本当にありがとうございました。
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <Link
          href="/teams"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-colors"
        >
          他の部活も応援する
        </Link>
        <Link
          href="/"
          className="border border-gray-200 text-gray-700 font-medium px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
        >
          トップへ戻る
        </Link>
      </div>
    </div>
  )
}
