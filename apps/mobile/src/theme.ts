// SKIDS Screen V3 — Design system tokens
// Professional medical look with large touch targets for tablet use

export const colors = {
  primary: '#2563eb',       // blue-600
  primaryDark: '#1d4ed8',   // blue-700
  primaryLight: '#3b82f6',  // blue-500
  secondary: '#0891b2',     // cyan-600
  success: '#16a34a',       // green-600
  warning: '#ea580c',       // orange-600
  danger: '#dc2626',        // red-600
  background: '#f8fafc',    // slate-50
  surface: '#ffffff',
  text: '#0f172a',          // slate-900
  textSecondary: '#64748b', // slate-500
  textMuted: '#94a3b8',     // slate-400
  border: '#e2e8f0',        // slate-200
  borderLight: '#f1f5f9',   // slate-100
  white: '#ffffff',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.5)',
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
} as const

export const fontSize = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 34,
} as const

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
  black: '900' as const,
}

// Shadow preset for card elevation
export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
} as const

// Tailwind color class to hex mapping (from ModuleConfig.color)
export const TAILWIND_HEX_MAP: Record<string, string> = {
  'bg-blue-600': '#2563eb',
  'bg-blue-500': '#3b82f6',
  'bg-green-600': '#16a34a',
  'bg-green-500': '#22c55e',
  'bg-red-500': '#ef4444',
  'bg-red-600': '#dc2626',
  'bg-red-700': '#b91c1c',
  'bg-rose-600': '#e11d48',
  'bg-rose-500': '#f43f5e',
  'bg-amber-600': '#d97706',
  'bg-slate-500': '#64748b',
  'bg-cyan-500': '#06b6d4',
  'bg-yellow-500': '#eab308',
  'bg-indigo-600': '#4f46e5',
  'bg-indigo-500': '#6366f1',
  'bg-lime-500': '#84cc16',
  'bg-sky-500': '#0ea5e9',
  'bg-teal-500': '#14b8a6',
  'bg-teal-600': '#0d9488',
  'bg-violet-500': '#8b5cf6',
  'bg-orange-500': '#f97316',
  'bg-pink-500': '#ec4899',
  'bg-emerald-600': '#059669',
  'bg-emerald-500': '#10b981',
  'bg-fuchsia-500': '#d946ef',
  'bg-purple-500': '#a855f7',
}

export function getColorHex(twClass: string): string {
  return TAILWIND_HEX_MAP[twClass] || '#6b7280'
}
