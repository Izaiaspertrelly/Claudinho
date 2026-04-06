/**
 * Claudinho: OAuth is disabled. This file retains the type/export signatures
 * so that existing imports don't break, but all Anthropic URLs are removed.
 */

export function fileSuffixForOauthConfig(): string {
  return ''
}

export const CLAUDE_AI_INFERENCE_SCOPE = 'user:inference' as const
export const CLAUDE_AI_PROFILE_SCOPE = 'user:profile' as const
export const OAUTH_BETA_HEADER = 'oauth-2025-04-20' as const

export const CONSOLE_OAUTH_SCOPES = [] as const
export const CLAUDE_AI_OAUTH_SCOPES = [] as const
export const ALL_OAUTH_SCOPES: string[] = []

type OauthConfig = {
  BASE_API_URL: string
  CONSOLE_AUTHORIZE_URL: string
  CLAUDE_AI_AUTHORIZE_URL: string
  CLAUDE_AI_ORIGIN: string
  TOKEN_URL: string
  API_KEY_URL: string
  ROLES_URL: string
  CONSOLE_SUCCESS_URL: string
  CLAUDEAI_SUCCESS_URL: string
  MANUAL_REDIRECT_URL: string
  CLIENT_ID: string
  OAUTH_FILE_SUFFIX: string
  MCP_PROXY_URL: string
  MCP_PROXY_PATH: string
}

export const MCP_CLIENT_METADATA_URL = ''

// Claudinho: All URLs are empty stubs — OAuth is not used.
const DISABLED_CONFIG: OauthConfig = {
  BASE_API_URL: '',
  CONSOLE_AUTHORIZE_URL: '',
  CLAUDE_AI_AUTHORIZE_URL: '',
  CLAUDE_AI_ORIGIN: '',
  TOKEN_URL: '',
  API_KEY_URL: '',
  ROLES_URL: '',
  CONSOLE_SUCCESS_URL: '',
  CLAUDEAI_SUCCESS_URL: '',
  MANUAL_REDIRECT_URL: '',
  CLIENT_ID: '',
  OAUTH_FILE_SUFFIX: '',
  MCP_PROXY_URL: '',
  MCP_PROXY_PATH: '',
}

export function getOauthConfig(): OauthConfig {
  return DISABLED_CONFIG
}
