// Screening screen (main tab) — grid of 30 screening modules
// Grouped by category with colored cards matching each module's color

import React, { useMemo } from 'react'
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MODULE_CONFIGS } from '@skids/shared'
import type { ModuleConfig, ModuleType } from '@skids/shared'
import { colors, spacing, borderRadius, fontSize, fontWeight, shadow, getColorHex } from '../theme'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

type RootStackParamList = {
  ScreeningTab: undefined
  Module: { moduleType: ModuleType; campaignCode?: string }
}

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ScreeningTab'>
}

// Map module icons to emoji for display
const ICON_EMOJI_MAP: Record<string, string> = {
  Ruler: '\u{1F4CF}',
  Scale: '\u{2696}\u{FE0F}',
  Heart: '\u{2764}\u{FE0F}',
  Droplet: '\u{1FA78}',
  UserCheck: '\u{1F9D1}\u{200D}\u{2695}\u{FE0F}',
  Sparkles: '\u{2728}',
  EyeExternal: '\u{1F441}',
  Eye: '\u{1F440}',
  Ear: '\u{1F442}',
  Headphones: '\u{1F3A7}',
  Nose: '\u{1F443}',
  Tooth: '\u{1F9B7}',
  Throat: '\u{1F444}',
  Neck: '\u{1F9E3}',
  Mic: '\u{1F3A4}',
  Abdomen: '\u{1F9CD}',
  Scan: '\u{1F50D}',
  Hand: '\u{270B}',
  Spine: '\u{1F9B4}',
  Activity: '\u{1F3C3}',
  Lymph: '\u{1F52C}',
  Brain: '\u{1F9E0}',
  Shield: '\u{1F6E1}',
  Stethoscope: '\u{1FA7A}',
  Apple: '\u{1F34E}',
  Pill: '\u{1F48A}',
}

function getIconEmoji(iconName: string): string {
  return ICON_EMOJI_MAP[iconName] || '\u{1F3E5}'
}

// Group label mapping
const GROUP_LABELS: Record<string, string> = {
  vitals: 'Vitals & Measurements',
  head_to_toe: 'Head-to-Toe Examination',
}

interface SectionData {
  title: string
  data: ModuleConfig[][]
}

export function ScreeningScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets()

  // Group modules by category and chunk into rows of 3 for grid layout
  const sections = useMemo<SectionData[]>(() => {
    const groups: Record<string, ModuleConfig[]> = {}

    MODULE_CONFIGS.forEach((mod) => {
      const group = mod.group || 'other'
      if (!groups[group]) groups[group] = []
      groups[group].push(mod)
    })

    return Object.entries(groups).map(([key, modules]) => {
      // Chunk into rows of 3
      const rows: ModuleConfig[][] = []
      for (let i = 0; i < modules.length; i += 3) {
        rows.push(modules.slice(i, i + 3))
      }
      return {
        title: GROUP_LABELS[key] || key,
        data: rows,
      }
    })
  }, [])

  const renderModuleCard = (mod: ModuleConfig) => {
    const bgColor = getColorHex(mod.color)
    return (
      <TouchableOpacity
        key={mod.type}
        style={styles.moduleCard}
        onPress={() => navigation.navigate('Module', { moduleType: mod.type })}
        activeOpacity={0.75}
      >
        <View style={[styles.moduleIconContainer, { backgroundColor: bgColor }]}>
          <Text style={styles.moduleEmoji}>{getIconEmoji(mod.icon)}</Text>
        </View>
        <Text style={styles.moduleName} numberOfLines={2}>
          {mod.name}
        </Text>
        <Text style={styles.moduleDescription} numberOfLines={2}>
          {mod.description}
        </Text>
        <View style={styles.moduleMeta}>
          <View style={[styles.captureTypeBadge, { backgroundColor: bgColor + '20' }]}>
            <Text style={[styles.captureTypeText, { color: bgColor }]}>
              {mod.captureType}
            </Text>
          </View>
          <Text style={styles.moduleDuration}>{mod.duration}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  const renderRow = ({ item }: { item: ModuleConfig[] }) => {
    return (
      <View style={styles.row}>
        {item.map(renderModuleCard)}
        {/* Fill remaining space if row has fewer than 3 items */}
        {item.length < 3 &&
          Array.from({ length: 3 - item.length }).map((_, i) => (
            <View key={`spacer-${i}`} style={styles.moduleCardSpacer} />
          ))}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View>
          <Text style={styles.headerTitle}>
            <Text style={styles.brandBold}>SKIDS</Text>
            <Text style={styles.brandLight}> screen</Text>
          </Text>
          <Text style={styles.headerSubtitle}>Screening Modules</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{MODULE_CONFIGS.length} modules</Text>
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item, index) => `row-${index}`}
        renderItem={renderRow}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
        stickySectionHeadersEnabled={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: fontSize.xl,
  },
  brandBold: {
    fontWeight: fontWeight.black,
    color: colors.white,
  },
  brandLight: {
    fontWeight: fontWeight.normal,
    color: 'rgba(255,255,255,0.7)',
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  listContent: {
    paddingHorizontal: spacing.sm,
  },
  sectionHeader: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
  },
  moduleCard: {
    flex: 1,
    backgroundColor: colors.surface,
    margin: spacing.xs,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 160,
    ...shadow.sm,
  },
  moduleCardSpacer: {
    flex: 1,
    margin: spacing.xs,
  },
  moduleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  moduleEmoji: {
    fontSize: 22,
  },
  moduleName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  moduleDescription: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 16,
    flex: 1,
  },
  moduleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  captureTypeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  captureTypeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
  },
  moduleDuration: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
})
