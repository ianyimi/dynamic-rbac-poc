export const USER_ROLES = {
  admin: "admin",
  user: "user",
} as const;
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const AUTH_PROVIDERS = {
  apple: "apple",
  atlassian: "atlassian",
  cognito: "cognito",
  discord: "discord",
  dropbox: "dropbox",
  facebook: "facebook",
  figma: "figma",
  github: "github",
  gitlab: "gitlab",
  google: "google",
  huggingface: "huggingface",
  kakao: "kakao",
  kick: "kick",
  line: "line",
  linear: "linear",
  linkedin: "linkedin",
  microsoft: "microsoft",
  naver: "naver",
  notion: "notion",
  paypal: "paypal",
  reddit: "reddit",
  roblox: "roblox",
  salesforce: "salesforce",
  slack: "slack",
  spotify: "spotify",
  tiktok: "tiktok",
  twitch: "twitch",
  twitter: "twitter",
  vk: "vk",
  zoom: "zoom",
} as const;
export type AuthProvider = (typeof AUTH_PROVIDERS)[keyof typeof AUTH_PROVIDERS];


