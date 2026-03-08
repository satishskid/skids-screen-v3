// Campaign detail — shows campaign info, stats, registered children
// Entry point for registering new children and starting screenings

import React, { useState, useCallback, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, spacing, borderRadius, fontSize, fontWeight, shadow } from '../theme'
import { useAuth } from '../lib/AuthContext'
import { apiCall } from '../lib/api'
import type { Campaign, Child } from '@skids/shared'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'

type RootStackParamList = {
  CampaignDetail: { campaign: Campaign }
  RegisterChild: { campaignCode: string }
  Screening: { campaignCode: string }
}

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CampaignDetail'>
  route: RouteProp<RootStackParamList, 'CampaignDetail'>
}

interface CampaignStats {
  childrenCount: number
  observationsCount: number
  reviewsCount: number
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  active: { bg: '#dcfce7', text: '#166534' },
  completed: { bg: '#dbeafe', text: '#1e40af' },
  archived: { bg: '#f1f5f9', text: '#475569' },
  paused: { bg: '#fef3c7', text: '#92400e' },
}

export function CampaignDetailScreen({ navigation, route }: Props) {
  const { campaign } = route.params
  const { token } = useAuth()
  const insets = useSafeAreaInsets()

  const [stats, setStats] = useState<CampaignStats>({
    childrenCount: campaign.totalChildren || 0,
    observationsCount: 0,
    reviewsCount: 0,
  })
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchCampaignData = useCallback(async () => {
    try {
      // Fetch children for this campaign
      const childData = await apiCall<{ children?: Child[]; data?: Child[] }>(
        `/api/campaigns/${campaign.code}/children`,
        { token: token || undefined }
      ).catch(() => ({ children: [] as Child[] }))

      const childList =
        childData.children || childData.data || (Array.isArray(childData) ? childData : [])
      setChildren(childList as Child[])

      // Fetch campaign stats
      const statsData = await apiCall<{
        observations?: number
        reviews?: number
        children?: number
      }>(
        `/api/campaigns/${campaign.code}/stats`,
        { token: token || undefined }
      ).catch(() => ({}))

      setStats({
        childrenCount: statsData.children || (childList as Child[]).length || campaign.totalChildren || 0,
        observationsCount: statsData.observations || 0,
        reviewsCount: statsData.reviews || 0,
      })
    } catch {
      // Keep defaults
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [campaign.code, campaign.totalChildren, token])

  useEffect(() => {
    fetchCampaignData()
  }, [fetchCampaignData])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchCampaignData()
  }, [fetchCampaignData])

  const statusStyle = STATUS_COLORS[campaign.status] || STATUS_COLORS.active

  const getLocationText = (): string => {
    if (campaign.location && typeof campaign.location === 'object') {
      const loc = campaign.location
      const parts = [loc.city, loc.state, loc.country].filter(Boolean)
      if (parts.length > 0) return parts.join(', ')
    }
    if (campaign.city) return campaign.city
    return campaign.schoolName || 'Not specified'
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
      >
        {/* Campaign Info Header */}
        <View style={styles.infoHeader}>
          <View style={styles.titleRow}>
            <Text style={styles.campaignName}>{campaign.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Code</Text>
              <Text style={styles.metaValue}>{campaign.code}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>School</Text>
              <Text style={styles.metaValue} numberOfLines={1}>
                {campaign.schoolName || 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Location</Text>
              <Text style={styles.metaValue} numberOfLines={1}>
                {getLocationText()}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Year</Text>
              <Text style={styles.metaValue}>{campaign.academicYear || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>
              {stats.childrenCount}
            </Text>
            <Text style={styles.statLabel}>Children{'\n'}Registered</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: colors.secondary }]}>
              {stats.observationsCount}
            </Text>
            <Text style={styles.statLabel}>Observations{'\n'}Done</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: colors.success }]}>
              {stats.reviewsCount}
            </Text>
            <Text style={styles.statLabel}>Reviews{'\n'}Completed</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate('RegisterChild', { campaignCode: campaign.code })
            }
            activeOpacity={0.8}
          >
            <Text style={styles.actionIcon}>{'+'}</Text>
            <Text style={styles.actionText}>Register Child</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonPrimary]}
            onPress={() =>
              navigation.navigate('Screening', { campaignCode: campaign.code })
            }
            activeOpacity={0.8}
          >
            <Text style={[styles.actionIcon, { color: colors.white }]}>{'>'}</Text>
            <Text style={[styles.actionText, { color: colors.white }]}>
              Start Screening
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent Children */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Recently Registered ({children.length})
          </Text>

          {loading ? (
            <View style={styles.loadingSection}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : children.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>
                No children registered yet. Tap "Register Child" to add the first one.
              </Text>
            </View>
          ) : (
            children.slice(0, 20).map((child) => (
              <View key={child.id} style={styles.childRow}>
                <View style={styles.childAvatar}>
                  <Text style={styles.childAvatarText}>
                    {child.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.childInfo}>
                  <Text style={styles.childName}>{child.name}</Text>
                  <Text style={styles.childMeta}>
                    {child.gender === 'male' ? 'M' : 'F'}
                    {child.dob ? ` | DOB: ${child.dob}` : ''}
                    {child.class ? ` | Class ${child.class}` : ''}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  infoHeader: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  campaignName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: fontSize.base,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
    ...shadow.sm,
  },
  statNumber: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.extrabold,
  },
  statLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
    lineHeight: 16,
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    paddingHorizontal: spacing.md,
    minHeight: 56,
    gap: spacing.sm,
    ...shadow.sm,
  },
  actionButtonPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  actionIcon: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  actionText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  loadingSection: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptySection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  childAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  childAvatarText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  childMeta: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
})
