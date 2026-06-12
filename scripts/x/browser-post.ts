#!/usr/bin/env npx tsx
/**
 * X ブラウザ自動投稿（Playwright）
 * ※ X利用規約・BANリスクあり。PoC / 捨てアカウント想定。
 *
 * Usage:
 *   npx tsx scripts/x/browser-post.ts --text "投稿文"
 *   npx tsx scripts/x/browser-post.ts --solo-business-trial
 *   npx tsx scripts/x/browser-post.ts --solo-business-trial --dry-run
 */

import 'dotenv/config'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { randomUUID } from 'node:crypto'
import { chromium, type BrowserContext, type Page } from 'playwright'
import { appendPost } from './history'
import { SOLO_BUSINESS_TRIAL, buildArticleTweet } from './solo-business-posts'

const STATE_PATH = 'data/x-browser-state.json'
const SCREENSHOT_DIR = 'data/x-browser-screenshots'
const SITE_BASE = process.env.X_POST_SITE_URL ?? 'https://oceanosfleet.com/Ziraku/ziraku'
const DELAY_MS = Number(process.env.X_BROWSER_POST_DELAY_MS ?? 90_000)

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

async function screenshot(page: Page, name: string) {
  await mkdir(SCREENSHOT_DIR, { recursive: true })
  const path = `${SCREENSHOT_DIR}/${Date.now()}-${name}.png`
  await page.screenshot({ path, fullPage: true })
  console.log(`[browser] screenshot → ${path}`)
}

async function ensureLoggedIn(page: Page, context: BrowserContext): Promise<void> {
  const username = process.env.X_USERNAME ?? process.env.X_HANDLE?.replace('@', '')
  const password = process.env.X_PASSWORD

  if (!username || !password) {
    throw new Error('X_USERNAME と X_PASSWORD を .env に設定してください')
  }

  await page.goto('https://x.com/home', { waitUntil: 'domcontentloaded', timeout: 60_000 })
  await sleep(2500)

  if (!page.url().includes('/login') && !page.url().includes('/i/flow/login')) {
    const compose = page.locator('[data-testid="SideNav_NewTweet_Button"]')
    if (await compose.count() > 0) {
      console.log('[browser] 既存セッションでログイン済み')
      await context.storageState({ path: STATE_PATH })
      return
    }
  }

  console.log('[browser] ログイン開始…')
  await page.goto('https://x.com/i/flow/login', { waitUntil: 'domcontentloaded', timeout: 60_000 })
  await sleep(2000)

  // X の現行ログイン（2026-06 時点）は「ユーザー名 → 続ける → パスワード → 続ける」
  // の2段階。送信ボタンは両ステップとも『続ける』。
  // 注意点:
  //  - 同一フォームが手前モーダルと背景に重複描画される → 入力は最初の可視要素でOK
  //    （fill は value を直接セットするため、どちらでも続けるボタンが有効化される）
  //  - ボタンは *完全一致* で押す。`has-text("続ける")` は「電話番号で続ける」にも
  //    マッチして電話番号認証へ逸れる（実害が出た不具合）
  await sleep(1500)

  const clickContinue = async () => {
    const btn = page.getByRole('button', { name: '続ける', exact: true }).first()
    if (await btn.count()) { await btn.click(); return true }
    const en = page.getByRole('button', { name: /^(Next|Log in)$/ }).first()
    if (await en.count()) { await en.click(); return true }
    return false
  }

  // STEP 1: ユーザー名/メール
  const userInput = page
    .locator('input[name="username_or_email"], input[name="text"], input[autocomplete^="username"]')
    .first()
  await userInput.waitFor({ state: 'visible', timeout: 30_000 })
  await userInput.fill(username)
  await sleep(700)
  if (!(await clickContinue())) await userInput.press('Enter')
  await sleep(3500)

  // 追加のユーザー名確認（不審ログイン時のみ）
  const verifyInput = page.locator('input[data-testid="ocfEnterTextTextInput"]')
  if (await verifyInput.isVisible().catch(() => false)) {
    await verifyInput.fill(username)
    await clickContinue()
    await sleep(3000)
  }

  // STEP 2: パスワード
  const passInput = page.locator('input[name="password"]:visible, input[type="password"]:visible').first()
  await passInput.waitFor({ state: 'visible', timeout: 30_000 })
  await passInput.fill(password)
  await sleep(700)
  if (!(await clickContinue())) await passInput.press('Enter')
  await sleep(6000)

  // レート制限・認証失敗の検知
  const restricted = await page
    .getByText(/ログインを一時的に制限|temporarily limited|認証コード|verification code/i)
    .first()
    .isVisible()
    .catch(() => false)
  if (restricted) {
    await screenshot(page, 'login-restricted')
    throw new Error('Xにログインを一時制限されました（短時間の連続試行が原因。時間をおいて再実行してください）。または2FAコード要求の可能性')
  }
  if (page.url().includes('/flow/login') || page.url().includes('/onboarding/')) {
    await screenshot(page, 'login-failed')
    throw new Error('ログイン失敗（パスワード誤り・2FA・追加認証の可能性）。スクリーンショットを確認してください')
  }

  await page.goto('https://x.com/home', { waitUntil: 'domcontentloaded' })
  await sleep(2000)
  // 厳密判定: compose を開いてエディタが出るか（ボット検知で弾かれていないか）を確認
  await page.goto('https://x.com/compose/post', { waitUntil: 'domcontentloaded' })
  await sleep(2500)
  const editorReady = await page
    .locator('[data-testid="tweetTextarea_0"]')
    .first()
    .isVisible()
    .catch(() => false)
  if (!editorReady || page.url().includes('/flow/login') || page.url().includes('/onboarding/')) {
    await screenshot(page, 'login-incomplete')
    throw new Error('ログイン後 compose に到達できませんでした。スクリーンショットを確認してください（2FA・追加認証・セレクタ要調整の可能性）')
  }
  await context.storageState({ path: STATE_PATH })
  console.log('[browser] ログイン成功・compose到達確認、セッション保存')
}

async function postOne(page: Page, text: string): Promise<void> {
  await page.goto('https://x.com/compose/tweet', { waitUntil: 'domcontentloaded', timeout: 60_000 })
  await sleep(2000)

  const editor = page.locator('[data-testid="tweetTextarea_0"] div[contenteditable="true"], [role="textbox"][data-testid="tweetTextarea_0"]').first()
  await editor.waitFor({ state: 'visible', timeout: 30_000 })
  await editor.click()
  await sleep(500)
  await editor.fill(text)
  await sleep(1500)

  const postBtn = page.locator('[data-testid="tweetButton"], [data-testid="tweetButtonInline"]').first()
  await postBtn.waitFor({ state: 'visible', timeout: 15_000 })
  const disabled = await postBtn.getAttribute('aria-disabled')
  if (disabled === 'true') {
    await screenshot(page, 'post-button-disabled')
    throw new Error('投稿ボタンが無効（文字数超過またはUI変更）')
  }

  await postBtn.click()
  await sleep(4000)

  const toast = page.locator('text=ポストしました, text=Your post was sent, text=Post sent')
  if (await toast.count() === 0) {
    // トーストがなくても compose が閉じれば成功扱い
    if (page.url().includes('/compose')) {
      await screenshot(page, 'post-uncertain')
      console.warn('[browser] 投稿完了トースト未検出（投稿は成功している可能性あり）')
    }
  }
  console.log('[browser] 投稿完了')
}

async function main() {
  const argv = process.argv.slice(2)
  const dryRun = argv.includes('--dry-run')
  const soloTrial = argv.includes('--solo-business-trial')
  const textIdx = argv.indexOf('--text')
  const customText = textIdx >= 0 ? argv[textIdx + 1] : undefined

  let posts: { text: string; sourceHeadline: string }[] = []

  if (soloTrial) {
    posts = SOLO_BUSINESS_TRIAL.map(p => ({
      text: buildArticleTweet(p, SITE_BASE),
      sourceHeadline: p.title,
    }))
  } else if (customText) {
    posts = [{ text: customText, sourceHeadline: 'custom' }]
  } else {
    console.error('Usage:')
    console.error('  npx tsx scripts/x/browser-post.ts --solo-business-trial [--dry-run]')
    console.error('  npx tsx scripts/x/browser-post.ts --text "投稿文"')
    process.exit(1)
  }

  console.log(`[browser] ${posts.length} 件の投稿を準備`)
  for (const [i, p] of posts.entries()) {
    console.log(`--- [${i + 1}/${posts.length}] ---`)
    console.log(p.text)
    console.log(`(${p.text.length} chars)`)
  }

  if (dryRun) {
    console.log('[browser] dry-run 終了（投稿しません）')
    return
  }

  await mkdir(dirname(STATE_PATH), { recursive: true })

  const browser = await chromium.launch({
    headless: process.env.X_BROWSER_HEADLESS !== '0',
    slowMo: 80,
  })

  const context = await browser.newContext({
    locale: 'ja-JP',
    timezoneId: 'Asia/Tokyo',
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    storageState: await import('node:fs/promises').then(fs =>
      fs.access(STATE_PATH).then(() => STATE_PATH).catch(() => undefined),
    ),
  })

  const page = await context.newPage()

  try {
    await ensureLoggedIn(page, context)

    for (const [i, post] of posts.entries()) {
      if (i > 0) {
        console.log(`[browser] ${DELAY_MS / 1000}s 待機（連投防止）…`)
        await sleep(DELAY_MS)
      }
      await postOne(page, post.text)
      await appendPost({
        id: randomUUID(),
        slot: 'lunch',
        text: post.text,
        sourceHeadline: post.sourceHeadline,
        postedAt: new Date().toISOString(),
      })
    }

    await context.storageState({ path: STATE_PATH })
    console.log('[browser] 全投稿完了')
  } catch (err) {
    await screenshot(page, 'error')
    const msg = err instanceof Error ? err.message : String(err)
    await writeFile(`${SCREENSHOT_DIR}/last-error.txt`, msg, 'utf8').catch(() => {})
    throw err
  } finally {
    await browser.close()
  }
}

main().catch(err => {
  console.error('[browser] fatal:', err instanceof Error ? err.message : err)
  process.exit(1)
})
