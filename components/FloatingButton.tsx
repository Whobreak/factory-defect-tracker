import React from "react";
import { TouchableOpacity, Text } from "react-native";

type Props = {
  onPress: () => void;
};

export default function FloatingButton({ onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="absolute bottom-6 right-6 bg-green-500 w-16 h-16 rounded-full justify-center items-center shadow-lg"
    >
      <Text className="text-white text-3xl font-bold">+</Text>
    </TouchableOpacity>
  );
}
