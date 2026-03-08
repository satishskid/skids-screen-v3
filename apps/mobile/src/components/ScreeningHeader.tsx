// Consistent header bar with SKIDS branding
// Used across all main screens for visual consistency

import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { COLORS } from '../lib/colors'
import { APP_VERSION } from '../lib/constants'

interface ScreeningHeaderProps {
  showVersion?: boolean
  subtitle?: string
  rightElement?: React.ReactNode
}

export function ScreeningHeader({ showVersion = true, subtitle, rightElement }: ScreeningHeaderProps) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <View style={styles.leftSection}>
        <Text style={styles.brand}>
          <Text style={styles.brandBold}>SKIDS</Text>
          <Text style={styles.brandLight}> screen</Text>
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.rightSection}>
        {showVersion && (
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>v{APP_VERSION}</Text>
          </View>
        )}
        {rightElement}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  leftSection: {
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brand: {
    fontSize: 22,
  },
  brandBold: {
    fontWeight: '900',
    color: COLORS.white,
  },
  brandLight: {
    fontWeight: '300',
    color: 'rgba(255,255,255,0.7)',
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  versionBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  versionText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
})
