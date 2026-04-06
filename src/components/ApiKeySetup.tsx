import React, { useState } from 'react'
import { Box, Text } from '../ink.js'
import { useTerminalSize } from '../hooks/useTerminalSize.js'
import { Select } from './CustomSelect/select.js'
import TextInput from './TextInput.js'
import { saveGlobalConfig } from '../utils/config.js'

type Provider = 'openrouter' | 'anthropic' | 'openai' | 'gemini'

const PROVIDER_OPTIONS = [
  { label: 'OpenRouter (recommended — 200+ models)', value: 'openrouter' },
  { label: 'Anthropic (Claude models)', value: 'anthropic' },
  { label: 'OpenAI (GPT models)', value: 'openai' },
  { label: 'Google Gemini', value: 'gemini' },
]

const PROVIDER_KEY_HINTS: Record<Provider, string> = {
  openrouter: 'sk-or-...  (get one at https://openrouter.ai/keys)',
  anthropic: 'sk-ant-...  (get one at https://console.anthropic.com)',
  openai: 'sk-...  (get one at https://platform.openai.com)',
  gemini: 'AI...  (get one at https://aistudio.google.com)',
}

const PROVIDER_LABELS: Record<Provider, string> = {
  openrouter: 'OpenRouter',
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  gemini: 'Google Gemini',
}

// Curated model catalog per provider. First entry is the default.
const MODEL_CATALOG: Record<
  Provider,
  { label: string; value: string }[]
> = {
  openrouter: [
    { label: 'Claude Sonnet 4.5 (recommended)', value: 'anthropic/claude-sonnet-4.5' },
    { label: 'Claude Opus 4.1', value: 'anthropic/claude-opus-4.1' },
    { label: 'Claude 3.5 Sonnet', value: 'anthropic/claude-3.5-sonnet' },
    { label: 'GPT-4o', value: 'openai/gpt-4o' },
    { label: 'GPT-4o mini', value: 'openai/gpt-4o-mini' },
    { label: 'o1', value: 'openai/o1' },
    { label: 'Gemini 2.0 Flash', value: 'google/gemini-2.0-flash-exp' },
    { label: 'Gemini 1.5 Pro', value: 'google/gemini-pro-1.5' },
    { label: 'Llama 3.3 70B', value: 'meta-llama/llama-3.3-70b-instruct' },
    { label: 'DeepSeek Chat', value: 'deepseek/deepseek-chat' },
    { label: 'DeepSeek R1', value: 'deepseek/deepseek-r1' },
    { label: 'Qwen 2.5 Coder 32B', value: 'qwen/qwen-2.5-coder-32b-instruct' },
    { label: 'Mistral Large', value: 'mistralai/mistral-large' },
    { label: 'Custom — digitar manualmente', value: '__custom__' },
  ],
  anthropic: [
    { label: 'Claude Sonnet 4.5 (recommended)', value: 'claude-sonnet-4-5' },
    { label: 'Claude Opus 4.1', value: 'claude-opus-4-1' },
    { label: 'Claude 3.5 Haiku', value: 'claude-3-5-haiku-latest' },
    { label: 'Custom — digitar manualmente', value: '__custom__' },
  ],
  openai: [
    { label: 'GPT-4o (recommended)', value: 'gpt-4o' },
    { label: 'GPT-4o mini', value: 'gpt-4o-mini' },
    { label: 'o1', value: 'o1' },
    { label: 'o1-mini', value: 'o1-mini' },
    { label: 'Custom — digitar manualmente', value: '__custom__' },
  ],
  gemini: [
    { label: 'Gemini 2.0 Flash (recommended)', value: 'gemini-2.0-flash' },
    { label: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro' },
    { label: 'Gemini 1.5 Flash', value: 'gemini-1.5-flash' },
    { label: 'Custom — digitar manualmente', value: '__custom__' },
  ],
}

type Props = {
  onDone(): void
}

type Step = 'select-provider' | 'enter-key' | 'select-model' | 'enter-custom-model' | 'success'

export function ApiKeySetup({ onDone }: Props): React.ReactNode {
  const [step, setStep] = useState<Step>('select-provider')
  const [provider, setProvider] = useState<Provider>('openrouter')
  const [apiKey, setApiKey] = useState('')
  const [keyCursor, setKeyCursor] = useState(0)
  const [customModel, setCustomModel] = useState('')
  const [modelCursor, setModelCursor] = useState(0)
  const [error, setError] = useState('')
  const { columns } = useTerminalSize()

  function applyEnvForProvider(p: Provider, key: string, model: string) {
    // Claudinho always routes "openrouter" through the OpenAI shim with
    // OpenRouter's base URL. Force-set the env vars here so this session
    // doesn't need a restart.
    switch (p) {
      case 'openrouter':
        process.env.OPENAI_API_KEY = key
        process.env.OPENAI_BASE_URL = 'https://openrouter.ai/api/v1'
        process.env.CLAUDE_CODE_USE_OPENAI = '1'
        process.env.OPENAI_MODEL = model
        break
      case 'openai':
        process.env.OPENAI_API_KEY = key
        process.env.CLAUDE_CODE_USE_OPENAI = '1'
        process.env.OPENAI_MODEL = model
        break
      case 'anthropic':
        process.env.ANTHROPIC_API_KEY = key
        process.env.ANTHROPIC_MODEL = model
        break
      case 'gemini':
        process.env.GEMINI_API_KEY = key
        process.env.CLAUDE_CODE_USE_GEMINI = '1'
        process.env.GEMINI_MODEL = model
        break
    }
  }

  function handleProviderSelect(value: string) {
    setProvider(value as Provider)
    setApiKey('')
    setKeyCursor(0)
    setStep('enter-key')
    setError('')
  }

  function handleKeyChange(value: string) {
    setApiKey(value)
    setKeyCursor(value.length)
  }

  function handleKeySubmit(value: string) {
    const key = value.trim()
    if (!key) {
      setError('A chave API não pode estar vazia')
      return
    }
    setError('')
    setStep('select-model')
  }

  function finalizeSetup(model: string) {
    applyEnvForProvider(provider, apiKey, model)
    saveGlobalConfig(current => ({
      ...(current as Record<string, unknown>),
      claudinhoProvider: provider,
      claudinhoApiKey: apiKey,
      claudinhoModel: model,
    }))
    setStep('success')
    setTimeout(onDone, 1200)
  }

  function handleModelSelect(value: string) {
    if (value === '__custom__') {
      setCustomModel('')
      setModelCursor(0)
      setStep('enter-custom-model')
      return
    }
    finalizeSetup(value)
  }

  function handleCustomModelChange(value: string) {
    setCustomModel(value)
    setModelCursor(value.length)
  }

  function handleCustomModelSubmit(value: string) {
    const model = value.trim()
    if (!model) {
      setError('O nome do modelo não pode estar vazio')
      return
    }
    setError('')
    finalizeSetup(model)
  }

  if (step === 'select-provider') {
    return (
      <Box flexDirection="column" gap={1} paddingX={1}>
        <Text bold>Bem-vindo ao Claudinho!</Text>
        <Text>Escolha seu provedor de IA:</Text>
        <Select options={PROVIDER_OPTIONS} onChange={handleProviderSelect} />
        <Text dimColor>Use ↑/↓ para navegar e Enter para selecionar.</Text>
      </Box>
    )
  }

  if (step === 'enter-key') {
    return (
      <Box flexDirection="column" gap={1} paddingX={1}>
        <Text bold>
          Insira sua chave API do {PROVIDER_LABELS[provider]}:
        </Text>
        <Text dimColor>Formato: {PROVIDER_KEY_HINTS[provider]}</Text>
        <Box borderStyle="round" borderColor="cyan" paddingX={1}>
          <Text>{'> '}</Text>
          <TextInput
            value={apiKey}
            onChange={handleKeyChange}
            onSubmit={handleKeySubmit}
            columns={Math.max(20, columns - 8)}
            focus={true}
            showCursor={true}
            cursorOffset={keyCursor}
            onChangeCursorOffset={setKeyCursor}
            placeholder="cole sua chave aqui"
          />
        </Box>
        {error ? <Text color="red">{error}</Text> : null}
        <Text dimColor>Pressione Enter para confirmar.</Text>
      </Box>
    )
  }

  if (step === 'select-model') {
    return (
      <Box flexDirection="column" gap={1} paddingX={1}>
        <Text bold>Escolha o modelo do {PROVIDER_LABELS[provider]}:</Text>
        <Text dimColor>
          Você pode trocar depois rodando /model dentro do Claudinho.
        </Text>
        <Select
          options={MODEL_CATALOG[provider]}
          onChange={handleModelSelect}
        />
        <Text dimColor>Use ↑/↓ para navegar e Enter para selecionar.</Text>
      </Box>
    )
  }

  if (step === 'enter-custom-model') {
    const placeholder =
      provider === 'openrouter'
        ? 'ex: anthropic/claude-sonnet-4.5'
        : provider === 'anthropic'
          ? 'ex: claude-sonnet-4-5'
          : provider === 'openai'
            ? 'ex: gpt-4o'
            : 'ex: gemini-2.0-flash'
    return (
      <Box flexDirection="column" gap={1} paddingX={1}>
        <Text bold>Digite o nome do modelo:</Text>
        <Text dimColor>{`Formato ${PROVIDER_LABELS[provider]}: ${placeholder}`}</Text>
        <Box borderStyle="round" borderColor="cyan" paddingX={1}>
          <Text>{'> '}</Text>
          <TextInput
            value={customModel}
            onChange={handleCustomModelChange}
            onSubmit={handleCustomModelSubmit}
            columns={Math.max(20, columns - 8)}
            focus={true}
            showCursor={true}
            cursorOffset={modelCursor}
            onChangeCursorOffset={setModelCursor}
            placeholder={placeholder}
          />
        </Box>
        {error ? <Text color="red">{error}</Text> : null}
        <Text dimColor>Pressione Enter para confirmar.</Text>
      </Box>
    )
  }

  return (
    <Box flexDirection="column" gap={1} paddingX={1}>
      <Text color="green" bold>
        ✓ Configuração salva com sucesso!
      </Text>
      <Text>Provedor: {PROVIDER_LABELS[provider]}</Text>
      <Text dimColor>Iniciando Claudinho...</Text>
    </Box>
  )
}
