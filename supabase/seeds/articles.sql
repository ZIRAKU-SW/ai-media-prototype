-- ============================================================
-- モック記事データ（20本）
-- 参考元:
--   https://www.skillupai.com/blog/for-business/generative-ai-business/
--   https://www.matrixflow.net/case-study/161/
--   AIビジネスメディア_参考発信者メディア調査まとめ.pdf
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
  ('AIの回答が一般論からプロの答えに変わる「役割プロンプト」の型──4要素を埋めるだけ',
   'role-prompts-guide',
   '「マーケどうすれば?」に教科書回答しか返らないのは情報不足の安全運転。役割・読者・制約・出力形式の4要素で答えが一段プロに寄る実践ガイド。',
   'https://pbs.twimg.com/media/HKcmMk9boAE3j5O.png',
   'ai-guide', 6, 52, '2026-06-11T17:00:00Z'),

  ('「極めて喜びが伝わるカロリー計算アプリを作って」の一文で動くiOSアプリが出てきた',
   'fable-5-oneshot-ios-app',
   '感情的な抽象表現だけのワンショット指示でUI・ロジック・画面遷移まで生成、修正なしで動作。「たたき台の民主化」が変えるのは開発現場ではなく会議室。',
   'https://pbs.twimg.com/amplify_video_thumb/2064573130090389504/img/JI0uo6rrwhJJVQa8.jpg',
   'lab', 5, 67, '2026-06-11T16:50:00Z'),

  ('Obsidian×ClaudeでYouTube制作を丸ごと自動化──1本の台本が4媒体に分裂する複利の仕組み',
   'obsidian-claude-youtube-knowledge',
   '競合動画の文字起こしとコメントを放り込むだけで「何が刺さるか」のナレッジが育つ。YouTube→ショート→Xスレ→Telegramへ自動派生する構造を解説。',
   'https://pbs.twimg.com/amplify_video_thumb/2061144585057796100/img/OGj6FgPh4VngjKsf.jpg',
   'solo-business', 6, 71, '2026-06-11T16:40:00Z'),

  ('Fable 5×Hyperagent: 目標を渡すだけで数時間働く「自律エージェント」の実例3つ【会員限定】',
   'fable-5-hyperagent-autonomous',
   'NASAデータの小惑星可視化、100エーカーの施設設計、PDFからのパネル再現──人が触らず完結する働き方と、中小企業が今やるべき2つの準備を深掘り。',
   'https://pbs.twimg.com/amplify_video_thumb/2064407893022019584/img/vb-5Z-ZXaHQvzapN.jpg',
   'ai-news', 7, 28, '2026-06-11T16:00:00Z'),

  ('Fable 5がYouTube編集〜SNS投稿を一本通しで実行──「業務の塊」をAIに渡す設計図【会員限定】',
   'fable-5-youtube-pipeline',
   'ダウンロード→バズ検出→キャプション→リフレーム→予約投稿の5工程を1つのAIが連鎖実行。自社の「塊で渡せる業務」の見つけ方を編集部が解説。',
   'https://pbs.twimg.com/amplify_video_thumb/2064569986702553088/img/NOKbGKboBn_6Xzn0.jpg',
   'lab', 7, 31, '2026-06-11T15:50:00Z'),

  ('MicrosoftがFable 5を採用、Copilotにも展開──「AIチーム」時代が中小企業に届く順番【会員限定】',
   'microsoft-adopts-fable-5',
   'FoundryとGitHub Copilotに「次世代の自律型AIエージェント」として導入。いつものOfficeにエージェントが入ってくる意味を深掘り解説。',
   'https://pbs.twimg.com/amplify_video_thumb/2064757396577431552/img/fXfTolMqXUz5ohoI.jpg',
   'ai-news', 6, 24, '2026-06-11T15:40:00Z'),

  ('Claude Fable 5、5つのUIワンショット生成に全合格──「コードを書かないデザイナー」の仕事が変わる',
   'fable-5-ui-oneshot-designer',
   'GSAP/Three.js込みの高品質UIが1プロンプトで。著名UI/UX教育者の検証全合格が示す「デザイン→実装」分業の崩壊と、発注側が知るべき3つの変化。',
   'https://pbs.twimg.com/amplify_video_thumb/2064717260200030208/img/rDa5YZj-oOnNzufl.jpg',
   'ai-news', 6, 44, '2026-06-11T15:00:00Z'),

  ('Obsidian×Claude Skillsで「第二の脳」を構築する──元OpenAI Karpathy式・3フォルダ最小実装',
   'obsidian-claude-skills-second-brain',
   '議事録もSlackも死蔵させない。AIを「コンパイラと図書館係」として動かし、自分の業務を覚え続けるナレッジベースを週末2日で立ち上げる手順。',
   'https://pbs.twimg.com/media/HIjfOY2bMAAqnvB.jpg',
   'ai-guide', 9, 58, '2026-06-11T13:00:00Z'),

  ('Claudeを最強化するMCPサーバー30選──「コピペ中継」を卒業する接続ガイド',
   'mcp-servers-30-selection',
   'DBの確認もSlack要約もGitHubのIssueも、人間が中継する必要はもうない。海外で130万回読まれたMCPサーバーまとめをビジネス目線で整理。',
   'https://pbs.twimg.com/media/HGPeW6ubsAAmNP-.jpg',
   'tools', 8, 72, '2026-06-11T12:50:00Z'),

  ('【超初心者向け】Claude Fable 5完全ガイド──何がすごいのか・いくらかかるのか・どう使うのか',
   'claude-fable-5-beginner-guide',
   'Opusの上「Mythos級」初の一般提供モデルを、公式発表ベースで分かりやすく解説。6月22日までの無料期間と、真価を体感するコピペ実験つき。',
   'https://pbs.twimg.com/media/HKZ5tkzagAAnGcX.jpg',
   'ai-guide', 9, 104, '2026-06-11T12:40:00Z'),

  ('Claude Code Skills徹底ガイド──AIに仕事のやり方を覚えさせる「判断の資産化」',
   'claude-code-skills-guide',
   '毎回のお膳立てを卒業。SKILL.mdファイル1つで「上司は3ページ読まない」のような自社ルールをAIにセットし、チームで共有して属人化を解消する。',
   'https://pbs.twimg.com/media/HGu1Vrab0AA9goz.jpg',
   'dx-improvement', 9, 66, '2026-06-11T12:30:00Z'),

  ('Claude Fable 5の実力と導入前の注意点──コスト3.6倍・ZDRなしでも使うべきか',
   'claude-fable-5-business-cautions',
   'シニアエンジニア水準91点の実力の裏で、トークン大食い・30日データ保持必須・ZDRなし。企業導入の判断に必要な情報を公式発表と実測値から整理。',
   'https://pbs.twimg.com/media/HKbuXPHaMAAavTJ.jpg',
   'ai-news', 8, 49, '2026-06-11T12:20:00Z'),

  ('デザイン画像1枚からLPを作る──Fable 5×画像生成AIの分業ワークフロー',
   'fable-5-lp-reproduction-workflow',
   'LP画像をNext.jsで再現させたら一致度が圧倒的。数値ゴール・自己検証ループ・素材生成まで設計した「AIへの仕事の任せ方」の型を実例プロンプト付きで。',
   'https://picsum.photos/seed/lp-workflow/800/450',
   'lab', 6, 38, '2026-06-11T12:10:00Z'),

  ('【2026年最新】生成AIをビジネスで活用する方法｜用途別に徹底解説',
   'generative-ai-business-guide-2026',
   '生成AIは急速に進化し、ビジネス現場での活用が広がっています。文章生成・画像生成・音声AI・コード生成・データ分析の用途別に今すぐ使える活用方法を解説します。',
   'https://picsum.photos/seed/ai001/800/450',
   'ai-guide', 12, 3240, '2026-05-28T09:00:00Z'),

  ('ChatGPT・Claude・Gemini 徹底比較｜あなたのビジネスに最適なのはどれ？',
   'chatgpt-claude-gemini-comparison',
   '三大AIツールを料金・機能・得意分野の観点から徹底比較。どれを選べばいいか迷っている方必見の完全ガイドです。',
   'https://picsum.photos/seed/ai002/800/450',
   'tools', 8, 5120, '2026-05-27T09:00:00Z'),

  ('議事録作成をAIで完全自動化する方法｜今日から使えるプロンプト付き',
   'ai-meeting-minutes-automation',
   '会議のたびに議事録作成に30分〜1時間かかっていませんか？Whisper×ChatGPTを使った完全自動化フローを公開します。',
   'https://picsum.photos/seed/ai003/800/450',
   'ai-guide', 7, 4380, '2026-05-26T09:00:00Z'),

  ('在庫管理を自動化して在庫ロスを80%削減した小売業のDX事例',
   'retail-dx-inventory-automation',
   '従業員20名の小売業がAIで在庫管理を自動化し、在庫ロスを80%削減・発注業務を週10時間削減した実例を公開します。',
   'https://picsum.photos/seed/ai004/800/450',
   'dx-improvement', 6, 2870, '2026-05-25T09:00:00Z'),

  ('1人社長がChatGPTだけで月商100万を達成した全手順',
   'solo-president-chatgpt-100man',
   '副業から独立して1年、ChatGPTを活用して月商100万円を達成したフリーランスコンサルタントの実例。使ったプロンプトと業務フローを全公開します。',
   'https://picsum.photos/seed/ai005/800/450',
   'solo-business', 10, 6890, '2026-05-24T09:00:00Z'),

  ('営業メール作成ツールを30分で作ってみた【実験室 #01】',
   'lab-sales-email-tool-30min',
   'Claude APIとNext.jsで「業種・課題を入力すると営業メールが自動生成されるツール」を実際に30分で作りました。コードと使用感を全公開します。',
   'https://picsum.photos/seed/ai006/800/450',
   'lab', 9, 7240, '2026-05-23T09:00:00Z'),

  ('【2026年最新】AIが変える意外な世界｜匂い生成・犬語翻訳・ロボット僧侶まで',
   'ai-surprising-usecases-2026',
   '2026年のAIは匂いを作り、犬の言葉を翻訳し、ロボット僧侶が悩み相談に応じています。最新の驚き事例15選を紹介。',
   'https://picsum.photos/seed/ai007/800/450',
   'ai-news', 8, 4560, '2026-05-22T09:00:00Z'),

  ('おすすめAIツール30選【2026年最新版】業務別に徹底比較',
   'best-ai-tools-2026',
   '2026年版、ビジネスで使えるAIツール30選を業務カテゴリ別に厳選。文章生成・画像生成・音声・コード・データ分析まで実際に検証してまとめました。',
   'https://picsum.photos/seed/ai008/800/450',
   'tools', 15, 8920, '2026-05-20T09:00:00Z'),

  -- ▼ 参考発信者調査PDFから追加（2026-06-01）
  -- ▼ ENTERPRISE_WEB_AGENT_COST.md を記事化（2026-06-01）
  ('席課金 vs 社内Webエージェント｜企業AIコストを最大97%削減する方法【2026年試算】',
   'enterprise-ai-cost-web-agent-vs-seat',
   'ChatGPT・Claude・Cursor Teamsなど席課金型との比較試算。社内WebにCursor APIを1本通すだけで、5〜100人規模のAIコストを65〜97%削減できる理由を徹底解説します。',
   'https://picsum.photos/seed/ai012/800/450',
   'lab', 10, 980, '2026-06-01T12:00:00Z'),
  ('無料AIツールだけで営業資料・SNS投稿・議事録を作る方法【コスト0円】',
   'free-ai-tools-sales-content',
   'ChatGPT・Canva AI・Notion AIなど無料プランのみで、営業資料・SNS投稿・議事録の3つを全部作る実践ガイド。月額0円でも十分すぎるほど使えます。',
   'https://picsum.photos/seed/ai009/800/450',
   'ai-guide', 8, 1840, '2026-06-01T09:00:00Z'),

  ('社長がAIを使うと最初に手放せる業務5つ｜経営者目線の導入ガイド',
   'president-ai-first-tasks',
   '毎日AIを使う経営者が実証済み。社長業の中でAIに任せると劇的に楽になる業務5選と、最初の一歩の踏み出し方を解説します。',
   'https://picsum.photos/seed/ai010/800/450',
   'solo-business', 7, 2340, '2026-06-01T10:00:00Z'),

  ('中小企業がAI導入で最初にやるべき3つの業務改善',
   'sme-ai-adoption-first-steps',
   'AI導入に失敗する会社の共通点は「何から始めるか」を間違えること。中小企業が最初に着手すべき3つの業務改善と、無理なく定着させる手順を解説します。',
   'https://picsum.photos/seed/ai011/800/450',
   'dx-improvement', 6, 1620, '2026-06-01T11:00:00Z'),

  -- ▼ 2026-06-11 追加（Fable 5特集・8本）
  ('【速報解説】Claude Fable 5登場──「Mythos-class」史上最高性能モデルは何がすごいのか',
   'claude-fable-5-overview',
   'Anthropicが公開した過去最高性能のAIモデル「Fable 5」。仕事の任せ方が本質的に変わると言われる新モデルの要点を速報解説。',
   'https://pbs.twimg.com/media/HIdxS1PbEAA23lz.jpg',
   'ai-news', 5, 120, '2026-06-11T09:40:00Z'),

  ('Claude Fable 5は「高すぎる」のか？──サブエージェント分業でコストを抑える使い方',
   'claude-fable-5-subagent-strategy',
   '1タスク数万円という衝撃のコスト。それでも最強モデルを実務で使うために、安いモデルで設計し高いモデルで実行する「エージェントチーム」戦略を解説。',
   'https://pbs.twimg.com/media/HKc9eg5b0AAyQvn.jpg',
   'ai-guide', 7, 95, '2026-06-11T09:35:00Z'),

  ('Anthropic公式が明かすFable 5の真の使い方──プロンプトではなく「自己修正ループ」を設計せよ【翻訳解説】',
   'fable-5-self-correction-loops',
   'Anthropic社員Lance Martin氏の技術記事を翻訳解説。ゴール設定・検証サブエージェント・メモリ活用でFable 5の性能を最大限引き出す。',
   'https://pbs.twimg.com/media/HKYnS0Za8AA_BoV.jpg',
   'ai-news', 9, 88, '2026-06-11T09:30:00Z'),

  ('Anthropicが「31人分のAI社員」を無料公開──中小企業は採用の前に業務のAI化を',
   'anthropic-31-ai-skills',
   '請求書追跡、契約書レビュー、営業資料作成…実務スキル31種が公式公開。「作業を手伝うAI」から「仕事を任せるAI」への転換点。',
   'https://pbs.twimg.com/media/HKYAtFVbIAAnxNK.jpg',
   'dx-improvement', 6, 76, '2026-06-11T09:25:00Z'),

  ('Claude Fable 5×NotebookLM活用術──「究極の頭脳」に「最強の知識」を接続する',
   'claude-fable-5-notebooklm',
   '史上最強モデルの弱点は「あなたの会社のことを知らない」こと。NotebookLMと組み合わせて自社専用AIに変える活用術。',
   'https://pbs.twimg.com/media/HKeTevybUAAgzLM.jpg',
   'tools', 8, 64, '2026-06-11T09:20:00Z'),

  ('Claudeを「完全自動運転」にする14ステップ──/loopとRoutinesで自動化スタックを組む【海外記事翻訳】',
   'claude-autopilot-14-steps',
   '月200ドル払ってChatGPTの有料版のように使っていないか？海外で話題のClaude自動化スタック構築ガイドを日本語で全解説。',
   'https://pbs.twimg.com/media/HKD8XW4W0AAHp-f.jpg',
   'ai-guide', 12, 59, '2026-06-11T09:15:00Z'),

  ('上場企業CEOも実践──高コストなFable 5を「一文のプロンプト」で実用的に使う',
   'kubell-ceo-fable-5-prompt',
   'kubell（旧Chatwork）山本CEOの投稿が話題に。メインセッションは設計とレビューに専念させ、実装はOpus/Sonnetに切り出す分業プロンプトとは。',
   'https://picsum.photos/seed/fable-prompt/800/450',
   'ai-news', 4, 47, '2026-06-11T09:10:00Z'),

  ('【保存版】AIエージェントで会社を経営する手順──リサーチ・コンテンツ・事務をAIに任せる',
   'ai-agent-company-management',
   '「AIに任せてるつもりで結局全部自分でやってる」を卒業。東大AIエージェントラボSwarmによる、経営業務をAIに任せる実践手順。',
   'https://pbs.twimg.com/media/HHtptx_a8AARAev.jpg',
   'solo-business', 10, 31, '2026-06-11T09:05:00Z'),

  ('Claude Fable 5で会社員が副業月30万円を目指す──AIを「戦略責任者」として雇う4ステップ',
   'claude-fable-5-side-business',
   '市場分析も商品設計も未来予測もAIに任せ、自分は実行だけ。「考えるAI」Fable 5で副業の役割分担が逆転する具体的な手順を解説。',
   'https://pbs.twimg.com/media/HKcStMIaUAAww-M.jpg',
   'solo-business', 8, 42, '2026-06-11T09:45:00Z')

) as v(title, slug, excerpt, thumbnail_url, cat_slug, reading_time_minutes, view_count, published_at)
join categories c on c.slug = v.cat_slug
on conflict (slug) do update set
  thumbnail_url = excluded.thumbnail_url,
  title = excluded.title,
  excerpt = excluded.excerpt;

-- 会員限定フラグ（2026-06-11）
update articles set is_members_only = true where slug in ('fable-5-hyperagent-autonomous','fable-5-youtube-pipeline','microsoft-adopts-fable-5');
