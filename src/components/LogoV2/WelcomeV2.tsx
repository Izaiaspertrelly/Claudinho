/**
 * Claudinho: Simplified welcome banner showing a cute pixel-art baby
 * mascot and the version. Replaces the original Claude Code ASCII art.
 */
import React from 'react'
import { Box, Text } from 'src/ink.js'

const WELCOME_V2_WIDTH = 58

// Cute pixel-art baby mascot (small, fits in the welcome box)
const BABY_MASCOT = [
  '       ▄▄▄▄▄▄▄▄       ',
  '      █  ▀▀  ▀▀ █     ',
  '     █            █   ',
  '     █  ●    ●   █    ',
  '     █     ︶     █    ',
  '      █▄  ▂▂  ▄█      ',
  '     █  ▀▀▀▀▀▀  █     ',
  '    █▄▄█▀    ▀█▄▄█    ',
  '      █▄      ▄█      ',
  '       ▀▀    ▀▀       ',
]

const BABY_COLOR = 'magenta'

export function WelcomeV2() {
  const version = MACRO.DISPLAY_VERSION ?? MACRO.VERSION
  return (
    <Box
      flexDirection="column"
      width={WELCOME_V2_WIDTH}
      paddingX={1}
    >
      <Text>
        <Text color="claude" bold>
          Welcome to Claudinho{' '}
        </Text>
        <Text dimColor>v{version}</Text>
      </Text>
      <Text dimColor>
        {'─'.repeat(WELCOME_V2_WIDTH - 2)}
      </Text>
      {BABY_MASCOT.map((line, i) => (
        <Text key={i} color={BABY_COLOR}>
          {line}
        </Text>
      ))}
      <Text dimColor>
        {'─'.repeat(WELCOME_V2_WIDTH - 2)}
      </Text>
      <Text dimColor>
        {' '.repeat(Math.max(0, (WELCOME_V2_WIDTH - 28) / 2))}
        any model · every tool · zero limits
      </Text>
    </Box>
  )
}
