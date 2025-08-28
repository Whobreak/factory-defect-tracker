import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from "expo-camera";

interface ReportFormModalProps {
  initialLineNumber?: string;
  onCancel: () => void;
  onSubmitOnline: (values: {
    barcode: string;
    productType: string;
    lineNumber: string;
    errorCode: any;
    note?: string;
    photos: string[];
  }) => void;
}

export default function ReportFormModal({
  initialLineNumber,
  onCancel,
  onSubmitOnline,
}: ReportFormModalProps) {
  const [formData, setFormData] = useState({
    barcode: "",
    productType: "",
    lineNumber: initialLineNumber || "",
    errorCode: "",
    note: "",
    photos: [] as string[],
  });

  const [cameraMode, setCameraMode] = useState<"none" | "barcode" | "photo">(
    "none"
  );
  const [scanning, setScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  // Barkod okuma
  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (scanning) return;
    setScanning(true);
    setFormData((prev) => ({ ...prev, barcode: result.data }));
    setCameraMode("none");
    setTimeout(() => setScanning(false), 1000);
  };

  // Fotoğraf çekme
  const takePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ base64: true });
      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, photo.uri],
      }));
      setCameraMode("none");
    }
  };

  return (
    <View className="flex-1 bg-white rounded-2xl p-4">
      <ScrollView>
        <Text className="text-lg font-bold mb-3">Yeni Rapor</Text>

        {/* Barkod */}
        <Text className="text-gray-600">Barkod</Text>
        <View className="flex-row items-center mb-3">
          <TextInput
            className="flex-1 border p-2 rounded bg-gray-100"
            placeholder="Barkod okut veya yaz"
            value={formData.barcode}
            onChangeText={(t) => setFormData({ ...formData, barcode: t })}
          />
          <TouchableOpacity
            className="ml-2 p-2 bg-cyan-500 rounded"
            onPress={() => {
              if (!permission?.granted) {
                requestPermission();
              }
              setCameraMode("barcode");
            }}
          >
            <Text className="text-white">Oku</Text>
          </TouchableOpacity>
        </View>

        {/* Kamera - Barkod veya Fotoğraf */}
        {cameraMode !== "none" && (
          <View className="h-72 rounded overflow-hidden mb-3">
            <CameraView
              ref={cameraRef}
              style={{ flex: 1 }}
              facing="back"
              onBarcodeScanned={
                cameraMode === "barcode" ? handleBarcodeScanned : undefined
              }
            />
            {cameraMode === "photo" && (
              <TouchableOpacity
                className="absolute bottom-3 self-center px-6 py-2 bg-cyan-600 rounded-full"
                onPress={takePhoto}
              >
                <Text className="text-white text-lg">📸 Çek</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Ürün tipi */}
        <Text className="text-gray-600">Ürün Tipi</Text>
        <TextInput
          className="border p-2 rounded mb-3 bg-gray-100"
          placeholder="Ürün tipi girin"
          value={formData.productType}
          onChangeText={(t) => setFormData({ ...formData, productType: t })}
        />

        {/* Hat */}
        <Text className="text-gray-600">Hat</Text>
        <TextInput
          className="border p-2 rounded mb-3 bg-gray-100"
          placeholder="Hat numarası"
          value={formData.lineNumber}
          onChangeText={(t) => setFormData({ ...formData, lineNumber: t })}
        />

        {/* Hata Kodu */}
        <Text className="text-gray-600">Hata Kodu</Text>
        <TextInput
          className="border p-2 rounded mb-3 bg-gray-100"
          placeholder="Hata kodu"
          value={formData.errorCode}
          onChangeText={(t) => setFormData({ ...formData, errorCode: t })}
        />

        {/* Not */}
        <Text className="text-gray-600">Not</Text>
        <TextInput
          className="border p-2 rounded mb-3 bg-gray-100"
          placeholder="Ekstra not (opsiyonel)"
          value={formData.note}
          onChangeText={(t) => setFormData({ ...formData, note: t })}
        />

        {/* Fotoğraf */}
        <Text className="text-gray-600">Fotoğraflar</Text>
        <ScrollView horizontal className="mb-3">
          {formData.photos.map((uri, idx) => (
            <Image
              key={idx}
              source={{ uri }}
              className="w-24 h-24 mr-2 rounded"
            />
          ))}
          <TouchableOpacity
            className="w-24 h-24 bg-cyan-200 rounded items-center justify-center"
            onPress={() => {
              if (!permission?.granted) {
                requestPermission();
              }
              setCameraMode("photo");
            }}
          >
            <Text className="text-cyan-700 text-2xl">+</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Kaydet / İptal */}
        <View className="flex-row justify-end mt-4">
          <TouchableOpacity
            className="px-4 py-2 bg-gray-400 rounded mr-2"
            onPress={onCancel}
          >
            <Text className="text-white">İptal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="px-4 py-2 bg-cyan-600 rounded"
            onPress={() => onSubmitOnline(formData)}
          >
            <Text className="text-white">Kaydet</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
