# 引き継ぎドキュメント（2026-07-11 更新）

新しいセッション・別モデルで作業を再開するときは、まずこのファイルを読むこと。
作業を進めたら **このファイルの「残作業」を必ず更新** すること。

## プロジェクト概要

全国の学生ハンドボール部に気軽に寄付できる Web プラットフォーム「ハンドボール部サポーター」。
方針: シンプルさ優先・段階的な機能追加。

- Frontend: Next.js 16 (App Router) + TypeScript + Tailwind CSS
- DB/Auth: Supabase (PostgreSQL + Supabase Auth)
- 決済: Stripe Checkout + Webhook
- ホスティング予定: Vercel
- GitHub: https://github.com/kkishi0724-os/handball-donation （GitHub アカウント: kkishi0724-os）

## 現在の状態

- MVP のコードは完成し、ビルドも通る（`npm run build` で確認済み）
- 2026-07-11 にセキュリティレビューを実施し、以下を修正済み（コミット `184fbc8`）:
  1. **RLS ポリシー追加**: `supabase/schema.sql` に authenticated（管理者）用の
     select/insert/update/delete ポリシーを追加。これがないと管理画面の全書き込みが RLS に拒否される
  2. **Webhook 二重計上防止**: Stripe が Webhook を再送しても寄付額が二重加算されないようにした
     （donations の insert が unique 制約で失敗したら加算をスキップ）
  3. **寄付 API の検証強化** (`app/donate/[teamId]/route.ts`): 金額は整数・100円〜100万円のみ、
     部活名はクライアント送信値でなく DB から取得、非公開・存在しない部活は 404
  4. **管理画面のエラー処理**: 保存失敗時に「更新しました」と出るバグを修正

- **⚠️ Supabase プロジェクトは消滅している**: `.env.local` の URL
  `https://xmymhinbvcoejqzpvsml.supabase.co` は DNS 解決できない（NXDOMAIN）。
  無料プランの長期停止により削除されたと思われる。**再作成が必要**（下記手順1）
- Stripe はテストモードのキー（`sk_test_...`）が `.env.local` に設定済み。
  Stripe アカウント自体は生きているはずだが、動作確認はできていない

## 残作業（上から順に）

### 1. Supabase プロジェクトの再作成
1. https://supabase.com に Google アカウント（kansaiohakasupport@gmail.com）でログイン
2. 新規プロジェクト作成（リージョン: Northeast Asia (Tokyo) 推奨）
3. SQL Editor で `supabase/schema.sql` の内容を全部貼り付けて実行
4. **Authentication → Sign In / Up →「Allow new users to sign up」をオフにする**
   （オンのままだと誰でもアカウントを作って管理者になれてしまう。必須）
5. Authentication → Users → Add user で管理者ユーザーを手動作成（メール+パスワード）
6. Project Settings → API keys から以下を `.env.local` に転記:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`（service_role。絶対にクライアントに出さない）
7. `npm run dev` で起動し、トップページにサンプル部活3件が出ること、
   `/admin` でログイン → 部活の新規登録・編集・公開切替ができることを確認

### 2. Stripe の動作確認（テストモード）
1. `.env.local` の Stripe キーが有効か確認（https://dashboard.stripe.com）
2. ローカルで Webhook をテストする場合: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
   で得られる `whsec_...` を `STRIPE_WEBHOOK_SECRET` に設定
3. 部活詳細ページから寄付 → テストカード `4242 4242 4242 4242` で決済 →
   寄付進捗バーに金額が反映されることを確認

### 3. Vercel デプロイ
1. https://vercel.com に GitHub（kkishi0724-os）でログイン → リポジトリを import
2. 環境変数（.env.local の全項目）を設定。`NEXT_PUBLIC_SITE_URL` は本番 URL にする
3. Stripe ダッシュボード → Webhooks で本番エンドポイント
   `https://<本番ドメイン>/api/webhooks/stripe` を登録し、`checkout.session.completed`
   イベントを購読。発行された signing secret を Vercel の `STRIPE_WEBHOOK_SECRET` に設定
4. 本番公開前に schema.sql 末尾のサンプルデータ3件を削除する

### 4. 公開後にやること（優先度低）
- 寄付時に応援メッセージ・寄付者名を入力できるようにする
  （donations テーブルに `donor_name`, `message` カラムは既にある。
  Checkout の custom_fields か、寄付前の入力フォームで収集して metadata で渡す）
- Stripe を本番モードに切り替え（要・事業者情報の登録）

## 補足メモ

- `lib/stripe.ts` はビルド時エラー回避のため遅延初期化（Proxy）になっている。触らないこと
- RLS の仕組み: 匿名(anon)は公開部活の閲覧のみ可。管理画面は anon キー + Auth ログイン
  （authenticated ロール）で書き込む。Webhook は service_role キーで RLS をバイパス
- 開発サーバーは `C:\Users\kyo\.claude\launch.json` の `handball-donation` エントリで起動できる
