-- ============================================================
-- 学生ハンドボール部 寄付プラットフォーム — テーブル定義
-- Supabase の「SQL Editor」に貼り付けて実行してください
-- ============================================================

-- 部活情報テーブル
create table if not exists teams (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  school          text not null,
  prefecture      text not null,
  category        text not null check (category in ('男子', '女子')),
  description     text not null default '',
  image_url       text,
  donation_goal   integer,
  current_amount  integer not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

-- 寄付履歴テーブル
create table if not exists donations (
  id                 uuid primary key default gen_random_uuid(),
  team_id            uuid not null references teams(id) on delete cascade,
  amount             integer not null,
  donor_name         text,
  message            text,
  stripe_payment_id  text not null unique,
  created_at         timestamptz not null default now()
);

-- インデックス（検索を速くする）
create index if not exists teams_prefecture_idx on teams(prefecture);
create index if not exists teams_category_idx on teams(category);
create index if not exists donations_team_id_idx on donations(team_id);

-- ============================================================
-- Row Level Security（RLS）
-- 誰でも読める、書き込みは管理者のみ
-- ============================================================

alter table teams enable row level security;
alter table donations enable row level security;

-- 全員が公開中の部活を読める
create policy "誰でも公開部活を閲覧可" on teams
  for select using (is_active = true);

-- 全員が寄付履歴を読める
create policy "誰でも寄付履歴を閲覧可" on donations
  for select using (true);

-- Service Role（サーバーサイドAPI）は全操作可能
-- （Supabase の service_role キーを使う API ルートが自動でバイパス）

-- ============================================================
-- Stripe Webhook から呼び出す関数（current_amount を加算）
-- ============================================================

create or replace function increment_donation(p_team_id uuid, p_amount integer)
returns void language sql security definer as $$
  update teams set current_amount = current_amount + p_amount where id = p_team_id;
$$;

-- ============================================================
-- サンプルデータ（動作確認用。本番では削除してください）
-- ============================================================

insert into teams (name, school, prefecture, category, description, donation_goal) values
  ('○○高校男子ハンドボール部', '○○高校', '東京都', '男子', '創部30年の伝統校。全国大会出場を目指して日々練習中です。新しいユニフォームのご支援をよろしくお願いします！', 300000),
  ('△△大学女子ハンドボール部', '△△大学', '大阪府', '女子', '関西リーグで活躍中の女子チームです。遠征費用のご支援をいただけると大変助かります。', 200000),
  ('□□高校女子ハンドボール部', '□□高校', '北海道', '女子', '北海道の強豪校。道大会優勝を目指して頑張っています！', 150000);
