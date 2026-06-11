-- ============================================================
-- AIビジネスメディア — Supabase スキーマ
-- ============================================================

-- カテゴリ
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  color text default '#3B82F6',
  created_at timestamptz default now()
);

-- タグ
create table tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz default now()
);

-- ユーザープロフィール（auth.usersを拡張）
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  avatar_url text,
  is_member boolean default false,
  -- 顧客セグメント用アンケート（2026-06-11 追加）
  company_name text,
  company_size text,   -- 個人 / 2-10名 / 11-50名 / 51-300名 / 301名以上
  job_role text,       -- 経営者・役員 / 部門責任者 / 会社員 / 個人事業主 / その他
  interest text,       -- ai-adoption / dev-partner / learning / side-business
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 記事
create table articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  thumbnail_url text,
  category_id uuid references categories(id),
  author_id uuid references profiles(id),
  is_published boolean default false,
  is_members_only boolean default false,
  reading_time_minutes int default 5,
  view_count int default 0,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 記事タグ（中間テーブル）
create table article_tags (
  article_id uuid references articles(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (article_id, tag_id)
);

-- 閲覧履歴
create table article_views (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references articles(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  viewed_at timestamptz default now()
);

-- ブックマーク
create table bookmarks (
  user_id uuid references profiles(id) on delete cascade,
  article_id uuid references articles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, article_id)
);

-- メルマガ登録
create table newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  is_active boolean default true,
  subscribed_at timestamptz default now()
);

-- 問い合わせ
create table inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  inquiry_type text not null, -- 'dx_support' | 'system_dev' | 'seminar' | 'other'
  message text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table profiles enable row level security;
alter table articles enable row level security;
alter table article_views enable row level security;
alter table bookmarks enable row level security;
alter table newsletter_subscribers enable row level security;
alter table inquiries enable row level security;

-- profiles: 本人のみ更新可、全員が読み取り可
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_update" on profiles for update using (auth.uid() = id);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);

-- articles: 公開記事は全員読み取り可、会員限定記事は認証済みのみ
create policy "articles_select_public" on articles
  for select using (is_published = true and is_members_only = false);

-- 会員限定: ログイン済みユーザーなら閲覧可（プロトタイプ仕様。
-- 有料会員制にする場合は profiles.is_member 条件に戻す）
create policy "articles_select_members" on articles
  for select using (
    is_published = true
    and is_members_only = true
    and auth.uid() is not null
  );

-- bookmarks: 本人のみ操作可
create policy "bookmarks_all" on bookmarks
  for all using (auth.uid() = user_id);

-- newsletter: 誰でも登録可
create policy "newsletter_insert" on newsletter_subscribers
  for insert with check (true);

-- inquiries: 誰でも送信可
create policy "inquiries_insert" on inquiries
  for insert with check (true);

-- ============================================================
-- 閲覧数カウント関数
-- ============================================================
create or replace function increment_view_count(article_slug text)
returns void as $$
  update articles set view_count = view_count + 1 where slug = article_slug;
$$ language sql security definer;

-- ============================================================
-- プロフィール自動作成トリガー
-- ============================================================
-- 注意: auth サービスから呼ばれるため search_path 指定が必須
-- （無いと profiles を解決できず signup が「Database error saving new user」で失敗する）
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, company_name, company_size, job_role, interest)
  values (
    new.id,
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'company_name',
    new.raw_user_meta_data->>'company_size',
    new.raw_user_meta_data->>'job_role',
    new.raw_user_meta_data->>'interest'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- 初期データ（カテゴリ）
-- ============================================================
insert into categories (name, slug, description, color) values
  ('AI活用ガイド',       'ai-guide',       'AIツールの使い方・業務別活用法',             '#3B82F6'),
  ('DX・業務改善',       'dx-improvement', '中小企業の業務効率化・自動化事例',           '#10B981'),
  ('1人社長・副業・起業', 'solo-business',  '少人数でのAI事業構築事例',                   '#8B5CF6'),
  ('AIニュース・トレンド', 'ai-news',       '最新動向をビジネス目線で解説',               '#F59E0B'),
  ('実験室・開発ブログ', 'lab',            '実際に作って試した検証コンテンツ',           '#EF4444'),
  ('ツール比較',         'tools',          'おすすめAIツール・プロンプト・テンプレート', '#6B7280');
