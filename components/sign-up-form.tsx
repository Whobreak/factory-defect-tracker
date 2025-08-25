// import { SocialConnections } from '~/components/social-connections';  // eklenecek  mi karar vericez
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
import { Pressable, TextInput, View } from 'react-native';
import { router } from 'expo-router';

export function SignUpForm() {
  const passwordInputRef = React.useRef<TextInput>(null);

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  function onSubmit() {
  const success = true; // Swagger’dan dönen response’a göre
  if (success) {
    router.replace("/home"); // Kayıt başarılı → ana sekmeli sayfaya yönlendir
  }
}

  return (
    <View className="gap-6">
      <Card className="border-border/0 sm:border-border shadow-none sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-left">Hesap oluştur</CardTitle>
          <CardDescription className="text-center sm:text-left">
            Hoş geldiniz! Başlamak için lütfen bilgileri doldurun.  
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="gap-6">
            <View className="gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="m@example.com"
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
            Zaten hesabin var mi?{' '}
            <Pressable
              onPress={() => {
                router.push("/sign-in");
              }}>
              <Text className="text-sm underline underline-offset-4">Giriş yap</Text>
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
