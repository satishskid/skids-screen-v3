// Reusable module card with icon, name, duration
// Used in Home tab module grid and Screen tab module selection

import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { getColorHex, COLORS } from '../lib/colors'
import type { ModuleConfig } from '../lib/modules'

interface ModuleCardProps {
  module: ModuleConfig
  onPress?: () => void
  selected?: boolean
  disabled?: boolean
}

export function ModuleCard({ module, onPress, selected = false, disabled = false }: ModuleCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        selected && styles.cardSelected,
        disabled && styles.cardDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: getColorHex(module.color) },
          disabled && styles.iconDisabled,
        ]}
      >
        <Text style={styles.iconText}>{module.name.charAt(0)}</Text>
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {module.name}
      </Text>
      <Text style={styles.duration}>{module.duration}</Text>
      {selected && <View style={styles.checkmark}><Text style={styles.checkmarkText}>{'✓'}</Text></View>}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    margin: 4,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    minWidth: 90,
    maxWidth: '33%',
  },
  cardSelected: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: '#eff6ff',
  },
  cardDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  iconDisabled: {
    opacity: 0.4,
  },
  iconText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
  },
  name: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  duration: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  checkmark: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: COLORS.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
})
