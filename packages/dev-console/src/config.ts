import type { ChatMsg } from "./client/types";

/** localStorage キー（storagePrefix ごとに分離） */
export type DevConsoleStorageKeys = {
  sessions: string;
  rightWidth: string;
  leftWidth: string;
  leftVisible: string;
  autoDeploy: string;
  token: string;
};

export type DevConsoleApiPaths = {
  chat: string;
  upload: string;
  deploy: string;
};

export type DevConsoleBranding = {
  /** ヘッダー上段（例: Sensor-Data-AI · Dev） */
  eyebrow: string;
  /** ヘッダータイトル */
  title: string;
  /** 戻るリンク */
  backHref: string;
  backLabel?: string;
};

/**
 * 開発コンソール設定 — サイトごとに渡す。UX 定数（リサイズ幅・ショートカット等）はライブラリ内で固定。
 */
export type DevConsoleConfig = {
  /** localStorage 名前空間（例: "sensor" → sensor_dev_console_sessions_v1） */
  storagePrefix: string;
  /** 絶対 URL または basePath 付き（例: /sensor/api/dev/chat） */
  api: DevConsoleApiPaths;
  branding: DevConsoleBranding;
  /** 初回ウェルカム（assistant メッセージ） */
  welcomeText: string;
  /** ヘッダー「自動デプロイ」初期 ON/OFF（未指定時 true） */
  autoDeployDefault?: boolean;
};

export function createStorageKeys(prefix: string): DevConsoleStorageKeys {
  const p = prefix.replace(/[^a-zA-Z0-9_-]/g, "_");
  return {
    sessions: `${p}_dev_console_sessions_v1`,
    rightWidth: `${p}_dev_console_right_width`,
    leftWidth: `${p}_dev_console_left_width`,
    leftVisible: `${p}_dev_console_left_visible`,
    autoDeploy: `${p}_dev_console_auto_deploy`,
    token: `${p}_dev_console_token`,
  };
}

export function welcomeMessage(text: string): ChatMsg {
  return { role: "assistant", text };
}

/** サーバー側（API ルート）— 環境変数または明示指定 */
export type DevConsoleServerConfig = {
  projectRoot: string;
  pythonModule: string;
  pythonPath?: string;
  buildScriptPath?: string;
};

export function resolveServerConfig(overrides?: Partial<DevConsoleServerConfig>): DevConsoleServerConfig {
  const projectRoot = overrides?.projectRoot ?? process.env.DEV_CONSOLE_PROJECT_ROOT ?? "";
  if (!projectRoot) {
    throw new Error(
      "DEV_CONSOLE_PROJECT_ROOT が未設定です。.env にプロジェクトルートを指定してください。",
    );
  }
  return {
    projectRoot,
    pythonModule:
      overrides?.pythonModule ??
      process.env.DEV_CONSOLE_PYTHON_MODULE ??
      "oceanos_dev_agent",
    pythonPath: overrides?.pythonPath ?? process.env.DEV_CONSOLE_PYTHON ?? "python3",
    buildScriptPath:
      overrides?.buildScriptPath ??
      process.env.DEV_CONSOLE_BUILD_SCRIPT,
  };
}
