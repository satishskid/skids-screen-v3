// Module screen — shows module info, capture UI, and observation saving
// Handles photo/video/audio/value/form capture types with appropriate UI

import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native'
import { colors, spacing, borderRadius, fontSize, fontWeight, shadow, getColorHex } from '../theme'
import { useAuth } from '../lib/AuthContext'
import { apiCall } from '../lib/api'
import { MODULE_CONFIGS, getModuleConfig } from '../lib/modules'
import type { ModuleConfig } from '../lib/modules'
import type { ModuleType } from '../lib/types'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'

type RootStackParamList = {
  Module: { moduleType: ModuleType; campaignCode?: string; childId?: string }
}

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Module'>
  route: RouteProp<RootStackParamList, 'Module'>
}

// Emoji map for icons
const ICON_EMOJI: Record<string, string> = {
  Ruler: '\u{1F4CF}', Scale: '\u{2696}\u{FE0F}', Heart: '\u{2764}\u{FE0F}',
  Droplet: '\u{1FA78}', UserCheck: '\u{1F9D1}\u{200D}\u{2695}\u{FE0F}',
  Sparkles: '\u{2728}', EyeExternal: '\u{1F441}', Eye: '\u{1F440}',
  Ear: '\u{1F442}', Headphones: '\u{1F3A7}', Nose: '\u{1F443}',
  Tooth: '\u{1F9B7}', Throat: '\u{1F444}', Neck: '\u{1F9E3}',
  Mic: '\u{1F3A4}', Abdomen: '\u{1F9CD}', Scan: '\u{1F50D}',
  Hand: '\u{270B}', Spine: '\u{1F9B4}', Activity: '\u{1F3C3}',
  Lymph: '\u{1F52C}', Brain: '\u{1F9E0}', Shield: '\u{1F6E1}',
  Stethoscope: '\u{1FA7A}', Apple: '\u{1F34E}', Pill: '\u{1F48A}',
}

const CAPTURE_TYPE_LABELS: Record<string, string> = {
  photo: 'Photo Capture',
  video: 'Video Capture',
  audio: 'Audio Recording',
  value: 'Manual Value Entry',
  form: 'Form Entry',
}

export function ModuleScreen({ navigation, route }: Props) {
  const { moduleType, campaignCode, childId } = route.params
  const { token } = useAuth()

  const moduleConfig = getModuleConfig(moduleType)

  const [notes, setNotes] = useState('')
  const [valueInput, setValueInput] = useState('')
  const [captureStarted, setCaptureStarted] = useState(false)
  const [saving, setSaving] = useState(false)

  if (!moduleConfig) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Module "{moduleType}" not found.</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const bgColor = getColorHex(moduleConfig.color)
  const emoji = ICON_EMOJI[moduleConfig.icon] || '\u{1F3E5}'

  const handleSaveObservation = async () => {
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        moduleType,
        campaignCode: campaignCode || undefined,
        childId: childId || undefined,
        notes: notes.trim() || undefined,
        timestamp: new Date().toISOString(),
        captureMetadata: {
          captureType: moduleConfig.captureType,
          platform: Platform.OS,
        },
      }

      // Include value for value-type modules
      if (moduleConfig.captureType === 'value' && valueInput.trim()) {
        payload.value = parseFloat(valueInput) || valueInput.trim()
      }

      await apiCall('/api/observations', {
        method: 'POST',
        token: token || undefined,
        body: JSON.stringify(payload),
      })

      Alert.alert(
        'Observation Saved',
        `${moduleConfig.name} observation has been recorded.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      )
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save observation'
      Alert.alert('Error', message)
    } finally {
      setSaving(false)
    }
  }

  const renderCaptureUI = () => {
    if (moduleConfig.captureType === 'value') {
      return (
        <View style={styles.captureSection}>
          <Text style={styles.captureSectionTitle}>Enter Value</Text>
          <TextInput
            style={styles.valueInput}
            placeholder={`Enter ${moduleConfig.name.toLowerCase()} value`}
            placeholderTextColor={colors.textMuted}
            value={valueInput}
            onChangeText={setValueInput}
            keyboardType="decimal-pad"
          />
          {moduleConfig.type === 'height' && (
            <Text style={styles.unitHint}>Value in centimeters (cm)</Text>
          )}
          {moduleConfig.type === 'weight' && (
            <Text style={styles.unitHint}>Value in kilograms (kg)</Text>
          )}
          {moduleConfig.type === 'spo2' && (
            <Text style={styles.unitHint}>Value in percentage (%)</Text>
          )}
          {moduleConfig.type === 'hemoglobin' && (
            <Text style={styles.unitHint}>Value in g/dL</Text>
          )}
          {moduleConfig.type === 'bp' && (
            <Text style={styles.unitHint}>Systolic/Diastolic in mmHg</Text>
          )}
          {moduleConfig.type === 'muac' && (
            <Text style={styles.unitHint}>Value in centimeters (cm)</Text>
          )}
        </View>
      )
    }

    if (moduleConfig.captureType === 'form') {
      return (
        <View style={styles.captureSection}>
          <Text style={styles.captureSectionTitle}>Form Entry</Text>
          <View style={styles.formPlaceholder}>
            <Text style={styles.formPlaceholderIcon}>{emoji}</Text>
            <Text style={styles.formPlaceholderText}>
              {moduleConfig.name} form fields will appear here.{'\n'}
              Use the notes section below to record your observations.
            </Text>
          </View>
        </View>
      )
    }

    // Photo, Video, Audio capture
    return (
      <View style={styles.captureSection}>
        <Text style={styles.captureSectionTitle}>
          {CAPTURE_TYPE_LABELS[moduleConfig.captureType] || 'Capture'}
        </Text>

        {!captureStarted ? (
          <TouchableOpacity
            style={[styles.startCaptureButton, { backgroundColor: bgColor }]}
            onPress={() => setCaptureStarted(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.startCaptureEmoji}>
              {moduleConfig.captureType === 'photo'
                ? '\u{1F4F7}'
                : moduleConfig.captureType === 'video'
                ? '\u{1F3AC}'
                : '\u{1F3A4}'}
            </Text>
            <Text style={styles.startCaptureText}>Start Capture</Text>
            <Text style={styles.startCaptureHint}>
              {moduleConfig.cameraFacing === 'user'
                ? 'Front camera'
                : moduleConfig.cameraFacing === 'environment'
                ? 'Rear camera'
                : 'Default camera'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.capturePreview}>
            <View style={[styles.cameraPlaceholder, { borderColor: bgColor }]}>
              <Text style={styles.cameraPlaceholderEmoji}>{emoji}</Text>
              <Text style={styles.cameraPlaceholderText}>
                Camera preview for {moduleConfig.name}
              </Text>
              <Text style={styles.cameraPlaceholderHint}>
                {moduleConfig.captureType === 'photo'
                  ? 'Tap to capture photo'
                  : moduleConfig.captureType === 'video'
                  ? 'Recording in progress...'
                  : 'Recording audio...'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.captureActionButton}
              onPress={() => setCaptureStarted(false)}
            >
              <Text style={styles.captureActionText}>Done Capturing</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Module Info Header */}
        <View style={styles.moduleHeader}>
          <View style={[styles.moduleIconLarge, { backgroundColor: bgColor }]}>
            <Text style={styles.moduleEmojiLarge}>{emoji}</Text>
          </View>
          <View style={styles.moduleHeaderInfo}>
            <Text style={styles.moduleName}>{moduleConfig.name}</Text>
            <Text style={styles.moduleDescription}>{moduleConfig.description}</Text>
          </View>
        </View>

        {/* Module Details */}
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>{moduleConfig.duration}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Capture Type</Text>
            <View style={[styles.captureTypeBadge, { backgroundColor: bgColor + '20' }]}>
              <Text style={[styles.captureTypeText, { color: bgColor }]}>
                {moduleConfig.captureType}
              </Text>
            </View>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Ages</Text>
            <Text style={styles.detailValue}>
              {moduleConfig.recommendedAge.join(', ')}
            </Text>
          </View>
        </View>

        {/* Capture UI */}
        {renderCaptureUI()}

        {/* Notes */}
        <View style={styles.notesSection}>
          <Text style={styles.notesSectionTitle}>Observation Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Enter any clinical observations, findings, or notes..."
            placeholderTextColor={colors.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSaveObservation}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Save Observation</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: fontSize.md,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  backButtonText: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.base,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  // Module header
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  moduleIconLarge: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  moduleEmojiLarge: {
    fontSize: 30,
  },
  moduleHeaderInfo: {
    flex: 1,
  },
  moduleName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  moduleDescription: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  // Details row
  detailsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
  captureTypeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  captureTypeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
  },
  // Capture section
  captureSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  captureSectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  // Value input
  valueInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: fontSize.xl,
    color: colors.text,
    textAlign: 'center',
    minHeight: 64,
    fontWeight: fontWeight.bold,
  },
  unitHint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  // Form placeholder
  formPlaceholder: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  formPlaceholderIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  formPlaceholderText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Camera capture
  startCaptureButton: {
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },
  startCaptureEmoji: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  startCaptureText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  startCaptureHint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  capturePreview: {
    gap: spacing.md,
  },
  cameraPlaceholder: {
    backgroundColor: '#1a1a2e',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 240,
    borderWidth: 2,
  },
  cameraPlaceholderEmoji: {
    fontSize: 50,
    marginBottom: spacing.md,
  },
  cameraPlaceholderText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
  cameraPlaceholderHint: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  captureActionButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  captureActionText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  // Notes
  notesSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  notesSectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  notesInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
    color: colors.text,
    minHeight: 120,
    lineHeight: 22,
  },
  // Save button
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    ...shadow.md,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
})
