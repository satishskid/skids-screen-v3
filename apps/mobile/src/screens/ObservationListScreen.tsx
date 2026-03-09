// Observation list for a campaign — used by doctors to review observations
// Shows observation cards with module type, status, and child info

import React, { useState, useCallback, useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native'
import { colors, spacing, borderRadius, fontSize, fontWeight, shadow, getColorHex } from '../theme'
import { useAuth } from '../lib/AuthContext'
import { apiCall } from '../lib/api'
import { getModuleName, getModuleConfig } from '../lib/modules'
import type { Observation } from '../lib/types'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'

type ParamList = {
  ObservationList: { campaignCode: string; campaignName: string }
  DoctorReview: { observation: Observation }
}

interface Props {
  navigation: NativeStackNavigationProp<ParamList, 'ObservationList'>
  route: RouteProp<ParamList, 'ObservationList'>
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#fef3c7', text: '#92400e' },
  approved: { bg: '#dcfce7', text: '#166534' },
  referred: { bg: '#fee2e2', text: '#991b1b' },
  follow_up: { bg: '#dbeafe', text: '#1e40af' },
  retake: { bg: '#fce7f3', text: '#9d174d' },
}

export function ObservationListScreen({ navigation, route }: Props) {
  const { campaignCode, campaignName } = route.params
  const { token } = useAuth()
  const [observations, setObservations] = useState<Observation[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchObservations = useCallback(async () => {
    try {
      const data = await apiCall<{ observations?: Observation[]; data?: Observation[] }>(
        `/api/observations?campaign_code=${campaignCode}`,
        { token: token || undefined }
      )
      const list = data.observations || data.data || (Array.isArray(data) ? data : [])
      setObservations(list as Observation[])
    } catch {
      setObservations([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [campaignCode, token])

  useEffect(() => {
    fetchObservations()
  }, [fetchObservations])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchObservations()
  }, [fetchObservations])

  const renderObservation = ({ item }: { item: Observation }) => {
    const config = getModuleConfig(item.moduleType)
    const bgColor = config ? getColorHex(config.color) : '#6b7280'
    const status = item.reviewStatus || 'pending'
    const statusStyle = STATUS_COLORS[status] || STATUS_COLORS.pending

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('DoctorReview', { observation: item })}
        activeOpacity={0.7}
      >
        <View style={styles.cardRow}>
          <View style={[styles.moduleIcon, { backgroundColor: bgColor }]}>
            <Text style={styles.moduleIconText}>
              {getModuleName(item.moduleType).charAt(0)}
            </Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{getModuleName(item.moduleType)}</Text>
            <Text style={styles.cardMeta}>
              {new Date(item.timestamp).toLocaleDateString()}
              {item.childId ? ` | Child: ${item.childId.slice(0, 8)}...` : ''}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {status.replace('_', ' ')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading observations...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerInfo}>
        <Text style={styles.headerLabel}>Campaign</Text>
        <Text style={styles.headerValue}>{campaignName}</Text>
        <Text style={styles.headerCount}>
          {observations.length} observation{observations.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={observations}
        keyExtractor={(item) => item.id}
        renderItem={renderObservation}
        contentContainerStyle={[
          styles.listContent,
          observations.length === 0 && styles.emptyContainer,
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
            <Text style={styles.emptyIcon}>{'\u{1F50D}'}</Text>
            <Text style={styles.emptyTitle}>No observations yet</Text>
            <Text style={styles.emptySubtitle}>
              Observations will appear here once nurses complete screenings
            </Text>
          </View>
        }
      />
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
  headerInfo: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  headerLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginTop: spacing.xs,
  },
  headerCount: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadow.sm,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moduleIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  moduleIconText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  cardMeta: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    textTransform: 'capitalize',
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
})
