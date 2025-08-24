import { Redirect } from "expo-router";

// TODO: Burada gerçek auth durumunu kontrol et (örn. async storage / context / api)
const isLoggedIn = false; // şimdilik sahte kontrol

export default function Index() {
  if (isLoggedIn) {
    return <Redirect href="/(main)" />;
  } else {
    return <Redirect href="/(auth)/sign-in" />;
  }
}
