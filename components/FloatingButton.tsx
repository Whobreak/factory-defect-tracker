// components/FloatingButton.tsx
import React from "react";
import { TouchableOpacity, Text, Animated } from "react-native";
import { Plus } from "lucide-react-native";
import { useTheme } from "~/hooks/useTheme";

type Props = {
  onPress: () => void;
};

export default function FloatingButton({ onPress }: Props) {
  const { colors } = useTheme();
  const scaleValue = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      className="absolute bottom-6 right-6 shadow-lg"
      style={{
        transform: [{ scale: scaleValue }],
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className="w-16 h-16 rounded-full items-center justify-center elevation-8"
        style={{ 
          backgroundColor: colors.primary,
          shadowColor: colors.primary,
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.3,
          shadowRadius: 12,
        }}
      >
        {/* Glow effect */}
        <div 
          className="absolute inset-0 rounded-full opacity-20"
          style={{ 
            backgroundColor: colors.primary,
            filter: 'blur(8px)',
            transform: `scale(${1.1})`
          }} 
        />
        
        <Plus 
          color={colors.primaryForeground} 
          size={28} 
          strokeWidth={2.5}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}