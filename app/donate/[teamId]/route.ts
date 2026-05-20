import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params
  const { amount, teamName } = await request.json()

  if (!amount || amount < 100) {
    return NextResponse.json({ error: '金額は100円以上で入力してください' }, { status: 400 })
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
            name: `${teamName} への応援寄付`,
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
