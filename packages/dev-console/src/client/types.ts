export type ChatAttachment = {
  url: string;
  name?: string;
};

export type ChatMsg = {
  role: "user" | "assistant" | "system";
  text: string;
  attachments?: ChatAttachment[];
  changedFiles?: string[];
  diff?: string;
  needsBuild?: boolean;
};

/** 失敗した依頼をそのまま再送するためのコンテキスト */
export type DevRetryContext = {
  message: string;
  imagePaths: string[];
};
