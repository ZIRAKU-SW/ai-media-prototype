# 開発コンソールの使い方（@oceanos/dev-console）

このドキュメントはライブラリ同梱の**正式な操作仕様**です。実装とバージョンを一致させてください。

## 送信

- **Mac:** ⌘ + Enter
- **Windows / Linux:** Ctrl + Enter
- **Enter 単体:** 改行のみ（送信しない）

## 画像の添付

- 入力欄にフォーカスした状態で **Ctrl+V / ⌘+V**（スクリーンショット可）
- 送信前にサムネイルプレビューが表示される
- 送信後、サーバー `data/dev-console/uploads/` に保存し、エージェントが Read で参照
- **ファイルのドラッグ＆ドロップは未対応**（v0.1）

## レイアウト

- **左パネル**（会話タブ）と **右パネル**（変更ファイル・diff）の境界を **ドラッグ** で幅調整
- 左: 180〜400px、右: 最小 280px（中央チャット最小幅 280px を確保）
- 幅は **localStorage** に保存（`{storagePrefix}_dev_console_*`）
- ヘッダー **⟨ / ⟩** で左パネル表示/非表示

## 会話

- 左で複数タブ（会話）を保持 — localStorage に保存
- 失敗時 **再試行** バー（通信エラー・502 再起動中など）

## デプロイ

- ヘッダー **「完了後に自動ビルド」** で ON/OFF
- 手動: 右パネルからビルド・本番反映（`scripts/dev-console-build.sh`）
- ビルド中は 502 リトライでポーリング継続

## 認証（任意）

- `.env` の `DEV_CONSOLE_PASSWORD` 設定時、POST に `x-dev-token` 必須
- トークンはブラウザ localStorage（`{storagePrefix}_dev_console_token`）
