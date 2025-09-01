import * as NavigationBar from 'expo-navigation-bar';
import { Platform } from 'react-native';
// import { NAV_THEME } from '~/lib/constants';

export async function setAndroidNavigationBar(theme: 'light' | 'dark') {
  if (Platform.OS !== 'android') return;
  
  try {
    // Edge-to-edge modunda sadece button style ayarlanır
    // Background color sistem tarafından otomatik yönetilir
    await NavigationBar.setButtonStyleAsync(theme === 'dark' ? 'light' : 'dark');
  } catch (error) {
    console.log('Navigation bar configuration error:', error);
  }
}