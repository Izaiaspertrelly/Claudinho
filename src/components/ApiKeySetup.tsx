import React, { useState } from 'react'
import { Box, Text } from '../ink.js'
import { Select } from './CustomSelect/select.js'
import TextInput from './TextInput.js'
import { saveGlobalConfig } from '../utils/config.js'

type Provider = 'openrouter' | 'anthropic' | 'openai' | 'gemini'

const PROVIDER_OPTIONS = [
  { label: 'OpenRouter (recommended — 200+ models)', value: 'openrouter' as Provider },
  { label: 'Anthropic (Claude models)', value: 'anthropic' as Provider },
  { label: 'OpenAI (GPT models)', value: 'openai' as Provider },
  { label: 'Google Gemini', value: 'gemini' as Provider },
]

const PROVIDER_ENV_MAP: Record<Provider, { keyEnv: string; baseUrlEnv?: string; baseUrl?: string; useFlag?: string }> = {
  openrouter: {
    keyEnv: 'OPENAI_API_KEY',
    baseUrlEnv: 'OPENAI_BASE_URL',
    baseUrl: 'https://openrouter.ai/api/v1',
    useFlag: 'CLAUDE_CODE_USE_OPENAI',
  },
  anthropic: {
    keyEnv: 'ANTHROPIC_API_KEY',
  },
  openai: {
    keyEnv: 'OPENAI_API_KEY',
    useFlag: 'CLAUDE_CODE_USE_OPENAI',
  },
  gemini: {
    keyEnv: 'GEMINI_API_KEY',
    useFlag: 'CLAUDE_CODE_USE_GEMINI',
  },
}

const PROVIDER_KEY_HINTS: Record<Provider, string> = {
  openrouter: 'sk-or-... (from openrouter.ai/keys)',
  anthropic: 'sk-ant-... (from console.anthropic.com)',
  openai: 'sk-... (from platform.openai.com)',
  gemini: 'AI... (from aistudio.google.com)',
}

type Props = {
  onDone(): void
}

type Step = 'select-provider' | 'enter-key' | 'success'

export function ApiKeySetup({ onDone }: Props): React.ReactNode {
  const [step, setStep] = useState<Step>('select-provider')
  const [provider, setProvider] = useState<Provider>('openrouter')
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState('')

  function handleProviderSelect(value: string) {
    setProvider(value as Provider)
    setStep('enter-key')
  }

  function handleKeySubmit(value: string) {
    const key = value.trim()
    if (!key) {
      setError('API key cannot be empty')
      return
    }

    // Save to global config
    const envConfig = PROVIDER_ENV_MAP[provider]
    const envVars: Record<string, string> = {
      [envConfig.keyEnv]: key,
    }
    if (envConfig.baseUrl && envConfig.baseUrlEnv) {
      envVars[envConfig.baseUrlEnv] = envConfig.baseUrl
    }
    if (envConfig.useFlag) {
      envVars[envConfig.useFlag] = '1'
    }

    // Apply to current process
    for (const [k, v] of Object.entries(envVars)) {
      process.env[k] = v
    }

    // Save to config for persistence
    saveGlobalConfig(current => ({
      ...current,
      claudinhoProvider: provider,
      claudinhoApiKey: key,
    }))

    setStep('success')
    // Auto-proceed after a brief moment
    setTimeout(onDone, 1500)
  }

  if (step === 'select-provider') {
    return (
      <Box flexDirection="column" gap={1} paddingLeft={1}>
        <Text bold>Choose your AI provider:</Text>
        <Select
          options={PROVIDER_OPTIONS}
          onChange={handleProviderSelect}
        />
        <Text dimColor>
          All providers require an API key. OpenRouter gives access to 200+ models.
        </Text>
      </Box>
    )
  }

  if (step === 'enter-key') {
    const hint = PROVIDER_KEY_HINTS[provider]
    return (
      <Box flexDirection="column" gap={1} paddingLeft={1}>
        <Text bold>
          Enter your {PROVIDER_OPTIONS.find(p => p.value === provider)?.label.split(' (')[0]} API key:
        </Text>
        <Text dimColor>Format: {hint}</Text>
        <Box>
          <Text>API Key: </Text>
          <TextInput
            value={apiKey}
            onChange={setApiKey}
            onSubmit={handleKeySubmit}
            mask="*"
          />
        </Box>
        {error ? <Text color="red">{error}</Text> : null}
        <Text dimColor>Press Enter to confirm</Text>
      </Box>
    )
  }

  // success
  return (
    <Box flexDirection="column" gap={1} paddingLeft={1}>
      <Text color="green" bold>
        API key saved successfully!
      </Text>
      <Text>
        Provider: {PROVIDER_OPTIONS.find(p => p.value === provider)?.label.split(' (')[0]}
      </Text>
      <Text dimColor>Starting Claudinho...</Text>
    </Box>
  )
}
