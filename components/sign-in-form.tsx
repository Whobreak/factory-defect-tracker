import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Separator } from '~/components/ui/separator';
import { Text } from '~/components/ui/text';
import * as React from 'react';
import {  Dimensions, type TextInput, View } from 'react-native';
import { router } from "expo-router";
import { useTheme } from "~/hooks/useTheme";

export function SignInForm() {
  const { colors, isDark } = useTheme();
  const { width, height } = Dimensions.get('window');
  const passwordInputRef = React.useRef<TextInput>(null);

  function onUsernameSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  function onSubmit() {
    // TODO: Submit form and navigate to protected screen if successful
    //(Swagger, Firebase vs.)
    // şimdilik sahte başarılı login kabul edelim
    const success = true;

    if (success) {
      // Giriş başarılı → ana sayfaya yönlendir
        router.replace("/(tabs)/home"); 
  } else {
    console.error("Login failed");
  }
  }

  return (
    <View className="mt-36">
      <Card className="border-border/6 sm:border-border shadow-none sm:shadow-sm sm:shadow-blue/5">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-left">Uygulamaya giriş yapin</CardTitle>
          <CardDescription className="text-center sm:text-left">
            Tekrar Hoşgeldiniz! Lütfen giriş yapin.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="gap-6">
            <View className="gap-1.5">
              <Label htmlFor="username">Kullanıcı Adı</Label>
              <Input
                id="username"
                placeholder="Mehmet Yılmaz"
                keyboardType="default"
                autoComplete="username"
                autoCapitalize="none"
                onSubmitEditing={onUsernameSubmitEditing}
                returnKeyType="next"
                submitBehavior="submit"
              />
            </View>
            <View className="gap-1.5">
              <View className="flex-row items-center">
                <Label htmlFor="password">Şifre</Label>           
              </View>
              <Input
                ref={passwordInputRef}
                id="password"
                secureTextEntry
                returnKeyType="send"
                onSubmitEditing={onSubmit}
              />
            </View>
            <Button className="w-full" onPress={onSubmit}>
              <Text>Devam</Text>
            </Button>
          </View>      
          <Separator />
        </CardContent>
      </Card>
    </View>
  );
}
