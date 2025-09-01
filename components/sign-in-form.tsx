import * as React from "react";
import { type TextInput, StyleSheet, View, StatusBar, Platform, KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTheme } from "~/hooks/useTheme";
import { User, Lock } from "lucide-react-native";
import { Image } from "expo-image";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Text } from "~/components/ui/text";

export function SignInForm() {
  const { colors, isDark } = useTheme();
  const passwordInputRef = React.useRef<TextInput>(null);

  function onUsernameSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  function onSubmit() {
    const success = true;
    if (success) {
      router.replace("/(tabs)/home");
    } else {
      console.error("Login failed");
    }
  }

  const blurhash =
    "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

  const LogoHeader = () => (
    <View className="items-center justify-center">
      <Image
        source={require("~/assets/images/sersimwhite.png")}
        style={styles.logo}
        placeholder={{ blurhash }}
        contentFit="contain"
        transition={1000}
      />
      <Text
        className="text-3xl font-bold text-center mb-3 mt-6"
        style={{ color: colors.text }}
      >
        Tekrar Hoşgeldiniz
      </Text>
      <Text
        className="text-lg text-center font-semibold"
        style={{ color: colors.textSecondary }}
      >
        SERSİM
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
        translucent={false}
      />

      {/* Klavye açıldığında iOS için padding ekler */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0} 
      >
        <View className="flex-1 px-6 justify-center">
          <View className="mb-6">
            <LogoHeader />
          </View>

          <Card
            className="border-0 shadow-lg mx-auto w-full max-w-sm"
            style={{
              backgroundColor: colors.surface,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <CardHeader>
              <CardTitle
                className="text-center text-2xl font-bold"
                style={{ color: colors.text }}
              >
                Uygulamaya giriş yapın
              </CardTitle>
              <CardDescription
                className="text-center"
                style={{ color: colors.textSecondary }}
              >
                Lütfen bilgilerinizi girin
              </CardDescription>
            </CardHeader>

            <CardContent className="gap-6">
              <View className="gap-6">
                {/* Username */}
                <View className="gap-1.5">
                  <View className="flex-row items-center mb-2">
                    <User color={colors.textSecondary} size={18} />
                    <Label
                      htmlFor="username"
                      className="ml-2"
                      style={{ color: colors.text }}
                    >
                      Kullanıcı Adı
                    </Label>
                  </View>
                  <Input
                    id="username"
                    placeholder="Mehmet Yılmaz"
                    autoComplete="username"
                    autoCapitalize="none"
                    onSubmitEditing={onUsernameSubmitEditing}
                    returnKeyType="next"
                    className="h-12 text-base"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.text,
                    }}
                  />
                </View>

                {/* Password */}
                <View className="gap-1.5">
                  <View className="flex-row items-center mb-2">
                    <Lock color={colors.textSecondary} size={18} />
                    <Label
                      htmlFor="password"
                      className="ml-2 text-base font-medium"
                      style={{ color: colors.text }}
                    >
                      Şifre
                    </Label>
                  </View>
                  <Input
                    ref={passwordInputRef}
                    id="password"
                    placeholder="••••••••"
                    secureTextEntry
                    returnKeyType="send"
                    onSubmitEditing={onSubmit}
                    className="h-12 text-base"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.text,
                    }}
                  />
                </View>

                {/* Button */}
                <Button
                  className="w-full rounded-2xl h-14"
                  style={{
                    backgroundColor: colors.primary,
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 4,
                  }}
                  onPress={onSubmit}
                >
                  <Text className="text-lg font-bold" style={{ color: "white" }}>
                    Devam Et
                  </Text>
                </Button>
              </View>

              <Separator style={{ backgroundColor: colors.border, opacity: 0.5 }} />
            </CardContent>
          </Card>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
});
