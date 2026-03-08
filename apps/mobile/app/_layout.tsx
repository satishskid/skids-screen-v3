// Root layout — expo-router entry point
// Controls navigation between auth and main tabs groups

import React, { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSession } from '../src/lib/auth'

export default function RootLayout() {
  const { data: session, isPending } = useSession()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (isPending) return

    const inAuthGroup = segments[0] === '(auth)'

    if (!session?.user && !inAuthGroup) {
      // Not signed in, redirect to login
      router.replace('/(auth)/login')
    } else if (session?.user && inAuthGroup) {
      // Signed in, redirect to main tabs
      router.replace('/(tabs)')
    }
  }, [session, isPending, segments])

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  )
}
