// Small stat display card (number + label)
// Used on Home tab for quick stats overview

import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { COLORS } from '../lib/colors'

interface StatCardProps {
  value: string | number
  label: string
  color?: string
}

export function StatCard({ value, label, color = COLORS.primary }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    alignItems: 'center',
    margin: 4,
  },
  value: {
    fontSize: 28,
    fontWeight: '800',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
})
