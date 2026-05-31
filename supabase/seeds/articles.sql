-- ============================================================
-- モック記事データ（8本）
-- 参考元:
--   https://www.skillupai.com/blog/for-business/generative-ai-business/
--   https://www.matrixflow.net/case-study/161/
-- ============================================================

-- カテゴリIDは実行環境に合わせて変更してください
-- select id, slug from categories; で確認できます

insert into articles (title, slug, excerpt, thumbnail_url, category_id, is_published, reading_time_minutes, view_count, published_at)
select
  v.title, v.slug, v.excerpt, v.thumbnail_url,
  c.id as category_id,
  true, v.reading_time_minutes, v.view_count,
  v.published_at::timestamptz
from (values
  ('【2026年最新】生成AIをビジネスで活用する方法｜用途別に徹底解説',
   'generative-ai-business-guide-2026',
   '生成AIは急速に進化し、ビジネス現場での活用が広がっています。文章生成・画像生成・音声AI・コード生成・データ分析の用途別に今すぐ使える活用方法を解説します。',
   'https://placehold.co/800x450/0d2b6b/4fc3f7?text=生成AI活用ガイド',
   'ai-guide', 12, 3240, '2026-05-28T09:00:00Z'),

  ('ChatGPT・Claude・Gemini 徹底比較｜あなたのビジネスに最適なのはどれ？',
   'chatgpt-claude-gemini-comparison',
   '三大AIツールを料金・機能・得意分野の観点から徹底比較。どれを選べばいいか迷っている方必見の完全ガイドです。',
   'https://placehold.co/800x450/6B7280/ffffff?text=AI比較',
   'tools', 8, 5120, '2026-05-27T09:00:00Z'),

  ('議事録作成をAIで完全自動化する方法｜今日から使えるプロンプト付き',
   'ai-meeting-minutes-automation',
   '会議のたびに議事録作成に30分〜1時間かかっていませんか？Whisper×ChatGPTを使った完全自動化フローを公開します。',
   'https://placehold.co/800x450/10B981/ffffff?text=議事録AI自動化',
   'ai-guide', 7, 4380, '2026-05-26T09:00:00Z'),

  ('在庫管理を自動化して在庫ロスを80%削減した小売業のDX事例',
   'retail-dx-inventory-automation',
   '従業員20名の小売業がAIで在庫管理を自動化し、在庫ロスを80%削減・発注業務を週10時間削減した実例を公開します。',
   'https://placehold.co/800x450/10B981/ffffff?text=DX事例',
   'dx-improvement', 6, 2870, '2026-05-25T09:00:00Z'),

  ('1人社長がChatGPTだけで月商100万を達成した全手順',
   'solo-president-chatgpt-100man',
   '副業から独立して1年、ChatGPTを活用して月商100万円を達成したフリーランスコンサルタントの実例。使ったプロンプトと業務フローを全公開します。',
   'https://placehold.co/800x450/8B5CF6/ffffff?text=1人社長+AI',
   'solo-business', 10, 6890, '2026-05-24T09:00:00Z'),

  ('営業メール作成ツールを30分で作ってみた【実験室 #01】',
   'lab-sales-email-tool-30min',
   'Claude APIとNext.jsで「業種・課題を入力すると営業メールが自動生成されるツール」を実際に30分で作りました。コードと使用感を全公開します。',
   'https://placehold.co/800x450/EF4444/ffffff?text=実験室+01',
   'lab', 9, 7240, '2026-05-23T09:00:00Z'),

  ('【2026年最新】AIが変える意外な世界｜匂い生成・犬語翻訳・ロボット僧侶まで',
   'ai-surprising-usecases-2026',
   '2026年のAIは匂いを作り、犬の言葉を翻訳し、ロボット僧侶が悩み相談に応じています。最新の驚き事例15選を紹介。',
   'https://placehold.co/800x450/F59E0B/ffffff?text=AIトレンド2026',
   'ai-news', 8, 4560, '2026-05-22T09:00:00Z'),

  ('おすすめAIツール30選【2026年最新版】業務別に徹底比較',
   'best-ai-tools-2026',
   '2026年版、ビジネスで使えるAIツール30選を業務カテゴリ別に厳選。文章生成・画像生成・音声・コード・データ分析まで実際に検証してまとめました。',
   'https://placehold.co/800x450/6B7280/ffffff?text=AIツール30選',
   'tools', 15, 8920, '2026-05-20T09:00:00Z')

) as v(title, slug, excerpt, thumbnail_url, cat_slug, reading_time_minutes, view_count, published_at)
join categories c on c.slug = v.cat_slug
on conflict (slug) do nothing;
