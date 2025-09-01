import { SignInForm } from '~/components/sign-in-form';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function SignInScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAwareScrollView
        enableOnAndroid
        extraScrollHeight={20} // input odaklanınca biraz boşluk bırakır
        keyboardOpeningTime={0}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="flex-1 items-center justify-center p-4 py-8 sm:py-4 sm:p-6">
          <View className="w-full max-w-sm">
            <SignInForm />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
