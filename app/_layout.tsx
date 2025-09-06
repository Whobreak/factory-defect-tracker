import '~/global.css';

import { DarkTheme, DefaultTheme, Theme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { ActivityIndicator, Appearance, Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NAV_THEME } from '~/lib/constants';
import { useColorScheme } from '~/lib/useColorScheme';
import { PortalHost } from '@rn-primitives/portal';
import { setAndroidNavigationBar } from '~/lib/android-navigation-bar';
import { AuthProvider, useAuth } from '~/contexts/AuthContext';
import { NetworkProvider } from '~/components/NetworkProvider';
import { useTheme } from '~/hooks/useTheme'; // Temanı kullanmak için hook'u import et

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Layout />
    </AuthProvider>
  );
}


function Layout() {
  const { isDarkColorScheme } = useColorScheme();
  const { isLoading } = useAuth();
  const { colors } = useTheme(); // Mevcut temanın renklerini al

 
  usePlatformSpecificSetup();

  // Kimlik doğrulama durumu kontrol edilirken, temanla uyumlu bir yükleme ekranı göster
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
        <NetworkProvider>
          <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
          
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>

          <PortalHost />
        </NetworkProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const useIsomorphicLayoutEffect =
  Platform.OS === 'web' && typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;

function usePlatformSpecificSetup() {
  useIsomorphicLayoutEffect(() => {
    if (Platform.OS === 'web') {
      document.documentElement.classList.add('bg-background');
    } else if (Platform.OS === 'android') {
      setAndroidNavigationBar(Appearance.getColorScheme() ?? 'light');
    }
  }, []);
}