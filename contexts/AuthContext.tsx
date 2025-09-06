import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthService } from '~/services/auth.service';
import { useRouter, useSegments } from 'expo-router';

// User tipini projenin ihtiyacına göre genişletebilirsin
interface User {
  username: string | null;
  role: string | null;
}

interface AuthContextType {
  user: User | null;
  signIn: (credentials: { username: string; password: string }) => Promise<void>;
  signOut: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Bu hook, Context'e kolayca erişim sağlar
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Bu Provider, tüm uygulamayı sarmalayarak auth state'ini sağlar
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Uygulama açıldığında depolamadan auth durumunu kontrol et (initAuthFromStorage)
    const checkAuthStatus = async () => {
      try {
        const token = await AuthService.getToken();
        if (token) {
          const username = await AuthService.getUsername();
          const role = await AuthService.getRole();
          setUser({ username, role });
        }
      } catch (error) {
        console.error('Auth durumu yüklenemedi:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (isLoading) return; // Yükleme bitene kadar yönlendirme yapma

    const inAuthGroup = segments[0] === '(auth)';

    if (user && inAuthGroup) {
      // Giriş yapmış ve auth sayfasındaysa ana ekrana yönlendir
      router.replace('/(tabs)/home');
    } else if (!user && !inAuthGroup) {
      // Giriş yapmamış ve auth sayfasında değilse giriş ekranına yönlendir
      router.replace('/(auth)/sign-in');
    }
  }, [user, isLoading, segments]);

  const signIn = async (credentials: { username: string; password: string }) => {
    const data = await AuthService.login(credentials);
    // Token ve kullanıcı bilgileri AuthService tarafından SecureStore'a kaydedildi.
    // Şimdi sadece state'i güncelleyelim.
    setUser({ username: data.username, role: data.role });
    router.replace('/(tabs)/home');
  };

  const signOut = async () => {
    await AuthService.logout();
    setUser(null);
    router.replace('/(auth)/sign-in');
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};