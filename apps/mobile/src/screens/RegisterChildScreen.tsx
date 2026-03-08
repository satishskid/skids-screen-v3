// Register child form — collects name, DOB, gender, parent info
// POSTs to /api/children with campaign_id from route params

import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { colors, spacing, borderRadius, fontSize, fontWeight, shadow } from '../theme'
import { useAuth } from '../lib/AuthContext'
import { apiCall } from '../lib/api'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'

type RootStackParamList = {
  RegisterChild: { campaignCode: string }
}

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RegisterChild'>
  route: RouteProp<RootStackParamList, 'RegisterChild'>
}

export function RegisterChildScreen({ navigation, route }: Props) {
  const { campaignCode } = route.params
  const { token } = useAuth()

  const [name, setName] = useState('')
  const [dob, setDob] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | ''>('')
  const [parentName, setParentName] = useState('')
  const [parentPhone, setParentPhone] = useState('')
  const [className, setClassName] = useState('')
  const [section, setSection] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter the child\'s name.')
      return
    }
    if (!gender) {
      Alert.alert('Required', 'Please select gender.')
      return
    }

    setSaving(true)
    try {
      await apiCall('/api/children', {
        method: 'POST',
        token: token || undefined,
        body: JSON.stringify({
          name: name.trim(),
          dob: dob.trim() || undefined,
          gender,
          parentName: parentName.trim() || undefined,
          parentPhone: parentPhone.trim() || undefined,
          class: className.trim() || undefined,
          section: section.trim() || undefined,
          campaignCode,
        }),
      })

      Alert.alert('Success', `${name.trim()} has been registered.`, [
        { text: 'Register Another', onPress: resetForm },
        { text: 'Done', onPress: () => navigation.goBack() },
      ])
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to register child'
      Alert.alert('Error', message)
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setName('')
    setDob('')
    setGender('')
    setParentName('')
    setParentPhone('')
    setClassName('')
    setSection('')
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Campaign badge */}
        <View style={styles.campaignBadge}>
          <Text style={styles.campaignBadgeText}>Campaign: {campaignCode}</Text>
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Register Child</Text>
          <Text style={styles.formSubtitle}>
            Enter the child's details for screening
          </Text>

          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Child's Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Aarav Patel"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              editable={!saving}
            />
          </View>

          {/* Date of Birth */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date of Birth</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textMuted}
              value={dob}
              onChangeText={setDob}
              keyboardType="numbers-and-punctuation"
              editable={!saving}
            />
          </View>

          {/* Gender */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Gender *</Text>
            <View style={styles.genderRow}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 'male' && styles.genderButtonActive,
                ]}
                onPress={() => setGender('male')}
                disabled={saving}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    gender === 'male' && styles.genderButtonTextActive,
                  ]}
                >
                  Male
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 'female' && styles.genderButtonActive,
                ]}
                onPress={() => setGender('female')}
                disabled={saving}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    gender === 'female' && styles.genderButtonTextActive,
                  ]}
                >
                  Female
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Class & Section */}
          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
              <Text style={styles.inputLabel}>Class</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 5"
                placeholderTextColor={colors.textMuted}
                value={className}
                onChangeText={setClassName}
                editable={!saving}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Section</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. A"
                placeholderTextColor={colors.textMuted}
                value={section}
                onChangeText={setSection}
                autoCapitalize="characters"
                editable={!saving}
              />
            </View>
          </View>

          {/* Parent Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Parent/Guardian Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Rajesh Patel"
              placeholderTextColor={colors.textMuted}
              value={parentName}
              onChangeText={setParentName}
              autoCapitalize="words"
              editable={!saving}
            />
          </View>

          {/* Parent Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Parent Phone</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. +91 98765 43210"
              placeholderTextColor={colors.textMuted}
              value={parentPhone}
              onChangeText={setParentPhone}
              keyboardType="phone-pad"
              editable={!saving}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Register Child</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  campaignBadge: {
    backgroundColor: '#eff6ff',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  campaignBadgeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  formTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  formSubtitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs + 2,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: fontSize.md,
    color: colors.text,
    minHeight: 52,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  genderRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  genderButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  genderButtonActive: {
    backgroundColor: '#eff6ff',
    borderColor: colors.primary,
    borderWidth: 2,
  },
  genderButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  genderButtonTextActive: {
    color: colors.primary,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    minHeight: 56,
    ...shadow.sm,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
})
