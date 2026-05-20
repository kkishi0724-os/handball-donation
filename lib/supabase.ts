import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Team = {
  id: string
  name: string
  school: string
  prefecture: string
  category: '男子' | '女子'
  description: string
  image_url: string | null
  donation_goal: number | null
  current_amount: number
  is_active: boolean
  created_at: string
}

export type Donation = {
  id: string
  team_id: string
  amount: number
  donor_name: string | null
  message: string | null
  stripe_payment_id: string
  created_at: string
}
