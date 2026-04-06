/**
 * Claudinho: OAuth flow replaced with API key setup.
 * This file retains the ConsoleOAuthFlow export name so existing imports work.
 */
import React from 'react'
import { ApiKeySetup } from './ApiKeySetup.js'

type Props = {
  onDone(): void
  startingMessage?: string
  mode?: 'login' | 'setup-token'
  forceLoginMethod?: 'claudeai' | 'console'
}

export function ConsoleOAuthFlow({ onDone }: Props): React.ReactNode {
  return <ApiKeySetup onDone={onDone} />
}
