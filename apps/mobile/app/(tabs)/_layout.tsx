// Tabs layout — bottom tab navigation for the main app
// Five tabs: Home, Campaign, Screen, Sync, Profile

import React from 'react'
import { Tabs } from 'expo-router'
import { Text, StyleSheet } from 'react-native'
import { COLORS } from '../../src/lib/colors'

// Simple text-based tab icons since we're not pulling in an icon library
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: '\u2302',      // House
    Campaign: '\u2637',  // Group/Yin Yang as placeholder
    Screen: '\u25CE',    // Bullseye/camera
    Sync: '\u2601',      // Cloud
    Profile: '\u263A',   // Person/smiley
  }
  return (
    <Text style={[styles.icon, focused && styles.iconFocused]}>
      {icons[name] || '?'}
    </Text>
  )
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon name="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="campaign"
        options={{
          title: 'Campaign',
          tabBarIcon: ({ focused }) => <TabIcon name="Campaign" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="screen"
        options={{
          title: 'Screen',
          tabBarIcon: ({ focused }) => <TabIcon name="Screen" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="sync"
        options={{
          title: 'Sync',
          tabBarIcon: ({ focused }) => <TabIcon name="Sync" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon name="Profile" focused={focused} />,
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 6,
    paddingTop: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  icon: {
    fontSize: 22,
    color: COLORS.textMuted,
  },
  iconFocused: {
    color: COLORS.primary,
  },
})
