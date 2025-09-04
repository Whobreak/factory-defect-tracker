import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { getAccessToken } from "~/services/storage";

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await getAccessToken();
      setIsLoggedIn(!!token);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsLoggedIn(false);
    }
  };

  // Show loading state while checking auth
  if (isLoggedIn === null) {
    return null; // or a loading spinner
  }

  if (isLoggedIn) {
    return <Redirect href="/(tabs)/home" />;
  } else {
    return <Redirect href="/(auth)/sign-in" />;
  }
}
