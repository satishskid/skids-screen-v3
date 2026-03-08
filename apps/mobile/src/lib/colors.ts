// Tailwind color class to hex mapping
// Backward-compatible exports — new code should import from '../theme' directly

import { colors, getColorHex } from '../theme'

export { getColorHex }

// COLORS matches the original property names used by existing components
export const COLORS = {
  primary: colors.primary,
  primaryDark: colors.primaryDark,
  primaryLight: colors.primaryLight,
  background: colors.background,
  surface: colors.surface,
  textPrimary: colors.text,
  textSecondary: colors.textSecondary,
  textMuted: colors.textMuted,
  border: colors.border,
  success: colors.success,
  warning: colors.warning,
  error: colors.danger,
  white: colors.white,
} as const
