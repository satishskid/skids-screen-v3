// Campaigns screen (Home tab) — list of campaigns the nurse is part of
// Card-based layout with status badges, pull-to-refresh, FAB for creation

import React, { useState, useCallback, useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  Platform,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, spacing, borderRadius, fontSize, fontWeight, shadow } from '../theme'
import { useAuth } from '../lib/AuthContext'
import { apiCall } from '../lib/api'
import type { Campaign } from '../lib/types'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

type RootStackParamList = {
  Campaigns: undefined
  CampaignDetail: { campaign: Campaign }
}

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Campaigns'>
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  active: { bg: '#dcfce7', text: '#166534' },
  completed: { bg: '#dbeafe', text: '#1e40af' },
  archived: { bg: '#f1f5f9', text: '#475569' },
  paused: { bg: '#fef3c7', text: '#92400e' },
}

export function CampaignsScreen({ navigation }: Props) {
  const { token } = useAuth()
  const insets = useSafeAreaInsets()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Create campaign form state
  const [newName, setNewName] = useState('')
  const [newSchool, setNewSchool] = useState('')
  const [newCity, setNewCity] = useState('')
  const [creating, setCreating] = useState(false)

  const fetchCampaigns = useCallback(async () => {
    try {
      const data = await apiCall<{ campaigns?: Campaign[]; data?: Campaign[] }>(
        '/api/campaigns',
        { token: token || undefined }
      )
      const list = data.campaigns || data.data || (Array.isArray(data) ? data : [])
      setCampaigns(list as Campaign[])
    } catch (err) {
      console.warn('Failed to fetch campaigns:', err)
      setCampaigns([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [token])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchCampaigns()
  }, [fetchCampaigns])

  const handleCreateCampaign = async () => {
    if (!newName.trim()) {
      Alert.alert('Required', 'Please enter a campaign name.')
      return
    }

    setCreating(true)
    try {
      await apiCall('/api/campaigns', {
        method: 'POST',
        token: token || undefined,
        body: JSON.stringify({
          name: newName.trim(),
          schoolName: newSchool.trim() || 'Field Screening',
          campaignType: 'school',
          academicYear: '2025-26',
          location: {
            city: newCity.trim() || undefined,
          },
        }),
      })

      setShowCreateModal(false)
      setNewName('')
      setNewSchool('')
      setNewCity('')
      fetchCampaigns()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create campaign'
      Alert.alert('Error', message)
    } finally {
      setCreating(false)
    }
  }

  const getStatusStyle = (status: string) =>
    STATUS_COLORS[status] || STATUS_COLORS.active

  const getLocationText = (campaign: Campaign): string => {
    if (campaign.location && typeof campaign.location === 'object') {
      const loc = campaign.location
      const parts = [loc.city, loc.state, loc.country].filter(Boolean)
      if (parts.length > 0) return parts.join(', ')
    }
    if (campaign.city) return campaign.city
    return campaign.schoolName || 'No location'
  }

  const renderCampaignCard = ({ item }: { item: Campaign }) => {
    const statusStyle = getStatusStyle(item.status)
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('CampaignDetail', { campaign: item })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
          </View>

          <Text style={styles.cardCode}>Code: {item.code}</Text>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.cardInfoRow}>
            <Text style={styles.cardInfoIcon}>{'📍'}</Text>
            <Text style={styles.cardInfoText} numberOfLines={1}>
              {getLocationText(item)}
            </Text>
          </View>

          <View style={styles.cardInfoRow}>
            <Text style={styles.cardInfoIcon}>{'🏫'}</Text>
            <Text style={styles.cardInfoText} numberOfLines={1}>
              {item.schoolName || 'N/A'}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.childCount}>
            <Text style={styles.childCountNumber}>{item.totalChildren || 0}</Text>
            <Text style={styles.childCountLabel}>Children</Text>
          </View>
          <Text style={styles.chevron}>{'>'}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading campaigns...</Text>
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
          <Text style={styles.headerSubtitle}>Your Campaigns</Text>
        </View>
        <View style={styles.versionBadge}>
          <Text style={styles.versionText}>v3.0</Text>
        </View>
      </View>

      {/* Campaign List */}
      <FlatList
        data={campaigns}
        keyExtractor={(item) => item.code}
        renderItem={renderCampaignCard}
        contentContainerStyle={[
          styles.listContent,
          campaigns.length === 0 && styles.emptyContainer,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>{'📋'}</Text>
            <Text style={styles.emptyTitle}>No campaigns yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first campaign to start screening children
            </Text>
          </View>
        }
      />

      {/* FAB — Create Campaign */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 24 }]}
        onPress={() => setShowCreateModal(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Create Campaign Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Campaign</Text>
            <Text style={styles.modalSubtitle}>
              Set up a new screening campaign
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Campaign Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Delhi Public School Screening"
                placeholderTextColor={colors.textMuted}
                value={newName}
                onChangeText={setNewName}
                editable={!creating}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>School Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Delhi Public School"
                placeholderTextColor={colors.textMuted}
                value={newSchool}
                onChangeText={setNewSchool}
                editable={!creating}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>City</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. New Delhi"
                placeholderTextColor={colors.textMuted}
                value={newCity}
                onChangeText={setNewCity}
                editable={!creating}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCreateModal(false)}
                disabled={creating}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.createButton, creating && styles.buttonDisabled]}
                onPress={handleCreateCampaign}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.createButtonText}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.base,
    color: colors.textSecondary,
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
  versionBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  versionText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadow.sm,
  },
  cardHeader: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  cardCode: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  cardBody: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  cardInfoIcon: {
    fontSize: fontSize.base,
    marginRight: spacing.sm,
    width: 20,
  },
  cardInfoText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: '#fafbfc',
  },
  childCount: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  childCountNumber: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.extrabold,
    color: colors.primary,
    marginRight: spacing.xs,
  },
  childCountLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  chevron: {
    fontSize: fontSize.xl,
    color: colors.textMuted,
    fontWeight: fontWeight.bold,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.lg,
  },
  fabText: {
    fontSize: 30,
    color: colors.white,
    fontWeight: fontWeight.normal,
    marginTop: -2,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadow.lg,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
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
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  cancelButton: {
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 52,
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  createButton: {
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    minHeight: 52,
    justifyContent: 'center',
    ...shadow.sm,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
})
