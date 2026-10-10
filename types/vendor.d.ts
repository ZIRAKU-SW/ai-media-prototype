// scripts/x など VM 専用ツールが使う外部モジュールの型スタブ。
// これらはアプリ本体からは import されず、package.json にも含めない
// （next build の型チェックを通すためだけの宣言）。
// 実体が必要な環境では各マシン側で別途インストールする。
declare module 'playwright' {
  export const chromium: any
  export type BrowserContext = any
  export type Page = any
}
declare module '@cursor/sdk' {
  export const Agent: any
  export class CursorAgentError extends Error {}
}
declare module 'rss-parser' {
  const Parser: any
  export default Parser
}
declare module 'twitter-api-v2' {
  export const TwitterApi: any
}
