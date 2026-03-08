// SKIDS Screen V3 — React Native entry point
// Navigation: Auth Stack (Login/Signup) or Main Tabs (Home/Screening/Profile)

import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { View, Text, StyleSheet } from 'react-native'

import { AuthProvider, useAuth } from './src/lib/AuthContext'
import { colors, fontWeight } from './src/theme'

// Screens
import { LoginScreen } from './src/screens/LoginScreen'
import { SignupScreen } from './src/screens/SignupScreen'
import { CampaignsScreen } from './src/screens/CampaignsScreen'
import { CampaignDetailScreen } from './src/screens/CampaignDetailScreen'
import { RegisterChildScreen } from './src/screens/RegisterChildScreen'
import { ScreeningScreen } from './src/screens/ScreeningScreen'
import { ModuleScreen } from './src/screens/ModuleScreen'
import { ProfileScreen } from './src/screens/ProfileScreen'

import type { Campaign, ModuleType } from '@skids/shared'

// ---- Type definitions for navigation ----

type AuthStackParamList = {
  Login: undefined
  Signup: undefined
}

type HomeStackParamList = {
  Campaigns: undefined
  CampaignDetail: { campaign: Campaign }
  RegisterChild: { campaignCode: string }
  Screening: { campaignCode: string }
}

type ScreeningStackParamList = {
  ScreeningTab: undefined
  Module: { moduleType: ModuleType; campaignCode?: string; childId?: string }
}

type TabParamList = {
  HomeTab: undefined
  ScreeningTabNav: undefined
  ProfileTab: undefined
}

// ---- Navigators ----

const AuthStack = createNativeStackNavigator<AuthStackParamList>()
const HomeStack = createNativeStackNavigator<HomeStackParamList>()
const ScreeningStack = createNativeStackNavigator<ScreeningStackParamList>()
const Tab = createBottomTabNavigator<TabParamList>()

// ---- Tab icon components ----

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: '\u{1F3E0}',
    Screening: '\u{1FA7A}',
    Profile: '\u{1F464}',
  }
  return (
    <View style={tabIconStyles.container}>
      <Text style={[tabIconStyles.emoji, focused && tabIconStyles.emojiFocused]}>
        {icons[label] || '\u{2B50}'}
      </Text>
    </View>
  )
}

const tabIconStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
  },
  emoji: {
    fontSize: 22,
    opacity: 0.5,
  },
  emojiFocused: {
    opacity: 1,
  },
})

// ---- Stack navigators for each tab ----

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: fontWeight.bold },
        headerBackTitleVisible: false,
      }}
    >
      <HomeStack.Screen
        name="Campaigns"
        component={CampaignsScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="CampaignDetail"
        component={CampaignDetailScreen}
        options={({ route }) => ({
          title: route.params.campaign.name,
        })}
      />
      <HomeStack.Screen
        name="RegisterChild"
        component={RegisterChildScreen}
        options={{ title: 'Register Child' }}
      />
      <HomeStack.Screen
        name="Screening"
        component={ScreeningScreen as React.ComponentType<any>}
        options={{ title: 'Select Module' }}
      />
    </HomeStack.Navigator>
  )
}

function ScreeningStackNavigator() {
  return (
    <ScreeningStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: fontWeight.bold },
        headerBackTitleVisible: false,
      }}
    >
      <ScreeningStack.Screen
        name="ScreeningTab"
        component={ScreeningScreen}
        options={{ headerShown: false }}
      />
      <ScreeningStack.Screen
        name="Module"
        component={ModuleScreen}
        options={({ route }) => ({
          title: route.params.moduleType
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase()),
        })}
      />
    </ScreeningStack.Navigator>
  )
}

// ---- Auth navigator (not logged in) ----

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{ headerShown: false }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen
        name="Signup"
        component={SignupScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </AuthStack.Navigator>
  )
}

// ---- Main tab navigator (logged in) ----

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: fontWeight.semibold,
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Home" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ScreeningTabNav"
        component={ScreeningStackNavigator}
        options={{
          title: 'Screening',
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Screening" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Profile" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  )
}

// ---- Root navigation — switch between auth and main ----

function RootNavigator() {
  const { isAuthenticated } = useAuth()

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  )
}

// ---- App entry point ----

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  )
}
