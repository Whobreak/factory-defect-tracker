import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Report } from "~/lib/mock";

type Props = {
  report: Report;
  onImagePress: (uri: string) => void;
};

export default function ReportCard({ report, onImagePress }: Props) {
  return (
    <View className="bg-white rounded-2xl shadow p-4 mb-3">
      <Text className="text-gray-800 font-bold mb-1">
        Barkod: {report.barcode}
      </Text>
      <Text className="text-gray-600 mb-1">
        Ürün: {report.productType}
      </Text>
      <Text className="text-gray-600 mb-1">
        Bant: {report.lineNumber}
      </Text>
      <Text className="text-gray-600 mb-1">
        Hata: {report.errorCode.code} - {report.errorCode.description}
      </Text>
      {report.note ? (
        <Text className="text-gray-500 italic mb-2">"{report.note}"</Text>
      ) : null}

      {/* Fotoğraflar */}
      <View className="flex-row flex-wrap">
        {report.photos.map((uri, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onImagePress(uri)}
            className="mr-2 mb-2"
          >
            <Image
              source={{ uri }}
              className="w-20 h-20 rounded-lg border border-gray-300"
            />
          </TouchableOpacity>
        ))}
      </View>

      <Text className="text-xs text-gray-400 mt-2">
        {new Date(report.createdAt).toLocaleString()}
      </Text>
    </View>
  );
}
