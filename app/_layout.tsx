import '~/global.css';

import { DarkTheme, DefaultTheme, Theme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { Appearance, Platform, Image } from 'react-native';
import { NAV_THEME } from '~/lib/constants';
import { useColorScheme } from '~/lib/useColorScheme';
import { PortalHost } from '@rn-primitives/portal';
import { ThemeToggle } from '~/components/ThemeToggle';
import { setAndroidNavigationBar } from '~/lib/android-navigation-bar';

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export { ErrorBoundary } from 'expo-router';

const usePlatformSpecificSetup = Platform.select({
  web: useSetWebBackgroundClassName,
  android: useSetAndroidNavigationBar,
  default: noop,
});

export default function RootLayout() {
  usePlatformSpecificSetup();
  const { isDarkColorScheme } = useColorScheme();

  return (
    <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
      <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />

      <Stack screenOptions={{ headerShown: false }}>
        {/* Ana ekran (app/index.tsx) */}
        <Stack.Screen
          name="(tabs)"
          options={{
            // Logo headerTitle olarak eklendi
            headerShown: true, // header görünür yapıldı
            headerTitle: () => (
              <Image
                source={{ uri: "https://i.ytimg.com/vi/fFTcHOFwfoQ/maxresdefault.jpg" }}
                style={{ width: 150, height: 50, resizeMode: 'contain' }}
              />
            ),
          }}
        />

        {/* ❌ sign-in ve sign-up buradan kaldırıldı */}
        {/* Onlar zaten (auth)/_layout.tsx altında var */}

        {/* Örn. login sonrası yönlendirilecek home ekranı */}
        <Stack.Screen name="home" options={{ title: 'Ana Sayfa' }} />
      </Stack>

      <PortalHost />
    </ThemeProvider>
  );
}

const useIsomorphicLayoutEffect =
  Platform.OS === 'web' && typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;

function useSetWebBackgroundClassName() {
  useIsomorphicLayoutEffect(() => {
    document.documentElement.classList.add('bg-background');
  }, []);
}

function useSetAndroidNavigationBar() {
  React.useLayoutEffect(() => {
    setAndroidNavigationBar(Appearance.getColorScheme() ?? 'light');
  }, []);
}

function noop() {}
