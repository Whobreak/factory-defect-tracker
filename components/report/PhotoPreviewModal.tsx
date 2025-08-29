import React from "react";
import { View, Image, Text } from "react-native";


type PhotoPreviewModalProps = {
uri: string | null;
onClose: () => void;
};


export default function PhotoPreviewModal({ uri, onClose }: PhotoPreviewModalProps) {
if (!uri) return null;


return (
<View className="flex-1 bg-black/90 justify-center items-center">
<Image source={{ uri }} className="w-80 h-96 rounded-xl" resizeMode="contain" />
<Text
onPress={onClose}
className="absolute top-10 right-5 bg-red-500 p-2 rounded-lg text-white z-50"
>
Kapat ✖
</Text>
</View>
);
}