import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'

const MIN_AMOUNT = 100
const MAX_AMOUNT = 1_000_000

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params

  let amount: unknown
  try {
    ;({ amount } = await request.json())
  } catch {
    return NextResponse.json({ error: 'リクエストが不正です' }, { status: 400 })
  }

  if (
    typeof amount !== 'number' ||
    !Number.isInteger(amount) ||
    amount < MIN_AMOUNT ||
    amount > MAX_AMOUNT
  ) {
    return NextResponse.json(
      { error: '金額は100円以上100万円以下の整数で入力してください' },
      { status: 400 }
    )
  }

  // 部活名はクライアント送信値を信用せず DB から取得する
  // （RLS により非公開の部活は取得できない → 寄付も不可になる）
  const { data: team } = await supabase
    .from('teams')
    .select('name, is_active')
    .eq('id', teamId)
    .single()

  if (!team || !team.is_active) {
    return NextResponse.json({ error: '部活が見つかりません' }, { status: 404 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'jpy',
          unit_amount: amount,
          product_data: {
            name: `${team.name} への応援寄付`,
            description: '学生ハンドボール部サポート',
          },
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${siteUrl}/donate/success`,
    cancel_url: `${siteUrl}/teams/${teamId}`,
    metadata: { teamId, amount: String(amount) },
  })

  return NextResponse.json({ url: session.url })
}
