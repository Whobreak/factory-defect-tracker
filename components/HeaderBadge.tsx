import React from "react";
import { View, Text } from "react-native";

type Props = {
  name: string;
  line: string;
};

export default function HeaderBadge({ name, line }: Props) {
  return (
    <View className="bg-blue-500 p-4 rounded-2xl mb-4 shadow flex-row justify-between items-center">
      <Text className="text-white font-bold text-lg">{name}</Text>
      <Text className="text-white text-sm">Bant: {line}</Text>
    </View>
  );
}
