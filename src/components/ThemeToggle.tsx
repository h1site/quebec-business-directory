'use client'

import { IconButton, Tooltip } from '@mui/material'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import { useColorMode } from '@/providers/ThemeRegistry'

export default function ThemeToggle() {
  const { mode, toggleMode } = useColorMode()

  return (
    <Tooltip title={mode === 'dark' ? 'Mode clair' : 'Mode sombre'}>
      <IconButton onClick={toggleMode} color="inherit" size="small">
        {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  )
}
