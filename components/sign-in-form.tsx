// import { SocialConnections } from '~/components/social-connections'; // eklenecek  mi karar vericez
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
import { Pressable, type TextInput, View } from 'react-native';
import { router } from "expo-router";

export function SignInForm() {
  const passwordInputRef = React.useRef<TextInput>(null);

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  function onSubmit() {
    // TODO: Submit form and navigate to protected screen if successful
    //(Swagger, Firebase vs.)
    // şimdilik sahte başarılı login kabul edelim
    const success = true;

    if (success) {
      // Giriş başarılı → ana sayfaya yönlendir
        router.replace("/home"); 
  } else {
    console.log("Login failed");
  }
  }

  return (
    <View className="gap-6">
      <Card className="border-border/0 sm:border-border shadow-none sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-left">Uygulamaya giriş yapin</CardTitle>
          <CardDescription className="text-center sm:text-left">
            Tekrar Hoşgeldiniz! Lütfen giriş yapin.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="gap-6">
            <View className="gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="*****@gmail.com"
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
                onSubmitEditing={onEmailSubmitEditing}
                returnKeyType="next"
                submitBehavior="submit"
              />
            </View>
            <View className="gap-1.5">
              <View className="flex-row items-center">
                <Label htmlFor="password">Şifre</Label>
                <Button
                  variant="link"
                  size="sm"
                  className="web:h-fit ml-auto h-4 px-1 py-0 sm:h-4"
                  onPress={() => {
                    // TODO: Navigate to forgot password screen
                    //router.push("/forgot-password");
                  }}>
                  <Text className="font-normal leading-4">Şifrenizi mi unuttunuz?</Text>
                </Button>
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
          <Text className="text-center text-sm">
            Hesabiniz yok mu?{' '}
            <Pressable
              onPress={() => {
                // TODO: Navigate to sign up screen
                router.push("/sign-up");
              }}>
              <Text className="text-sm underline underline-offset-4">Kaydol</Text>
            </Pressable>
          </Text>
          {/* <View className="flex-row items-center">
            <Separator className="flex-1" />
            <Text className="text-muted-foreground px-4 text-sm">or</Text>
            <Separator className="flex-1" />
          </View>
          <SocialConnections /> */}
        </CardContent>
      </Card>
    </View>
  );
}
