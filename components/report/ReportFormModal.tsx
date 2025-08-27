import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Alert,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { BarCodeScanner } from "expo-barcode-scanner";
import { ErrorCode, mockErrorCodes } from "~/lib/mock";
import { enqueueReportIfOffline } from "~/lib/offlineQueue";

type ReportFormValues = {
  barcode: string;
  productType: string;
  lineNumber: string;
  errorCode: ErrorCode;
  note?: string;
  photos: string[];
};

type Props = {
  initialLineNumber: string;
  onCancel: () => void;
  onSubmitOnline: (values: ReportFormValues) => void; // online ise hemen gönder
};

export default function ReportFormModal({ initialLineNumber, onCancel, onSubmitOnline }: Props) {
  // form state
  const [barcode, setBarcode] = useState("");
  const [productType, setProductType] = useState("");
  const [lineNumber, setLineNumber] = useState(initialLineNumber);
  const [errorCode, setErrorCode] = useState<ErrorCode | null>(null);
  const [errorSearch, setErrorSearch] = useState("");
  const [note, setNote] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [preview, setPreview] = useState<string | null>(null);

  // modallar
  const [scannerVisible, setScannerVisible] = useState(false);

  // izinler
  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const cam = await ImagePicker.requestCameraPermissionsAsync();
        const bar = await BarCodeScanner.requestPermissionsAsync();
        if (cam.status !== "granted") {
          Alert.alert("Uyarı", "Kamera izni verilmedi.");
        }
        if (bar.status !== "granted") {
          Alert.alert("Uyarı", "Barkod okuyucu izni verilmedi.");
        }
      }
    })();
  }, []);

  const filteredCodes = useMemo(
    () =>
      mockErrorCodes.filter(
        (c) =>
          c.code.toLowerCase().includes(errorSearch.toLowerCase()) ||
          c.description.toLowerCase().includes(errorSearch.toLowerCase())
      ),
    [errorSearch]
  );

  async function takePhoto() {
    if (photos.length >= 5) {
      Alert.alert("Limit", "En fazla 5 fotoğraf ekleyebilirsiniz (5).");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setPhotos((prev) => [...prev, result.assets[0].uri]);
    }
  }

  function removePhoto(uri: string) {
    setPhotos((prev) => prev.filter((p) => p !== uri));
  }

  function reset() {
    setBarcode("");
    setProductType("");
    setLineNumber(initialLineNumber);
    setErrorCode(null);
    setErrorSearch("");
    setNote("");
    setPhotos([]);
    setPreview(null);
  }

  async function handleSave() {
    if (!barcode || !productType || !lineNumber || !errorCode || photos.length === 0) {
      Alert.alert(
        "Eksik Bilgi",
        "Barkod, ürün türü, bant, hata kodu zorunlu ve en az 1 fotoğraf çekmelisiniz."
      );
      return;
    }

    const payload: ReportFormValues = {
      barcode,
      productType,
      lineNumber,
      errorCode,
      note,
      photos,
    };

    // Online ise onSubmitOnline çağır; offline ise kuyruğa ekle (ve kullanıcıyı bilgilendir)
    const queued = await enqueueReportIfOffline(payload);
    if (!queued) {
      // online gönderim
      onSubmitOnline(payload);
      Alert.alert("Başarılı", "Rapor gönderildi.");
    } else {
      Alert.alert(
        "Çevrimdışı Kaydedildi",
        "İnternet yokken kaydedildi. Bağlantı gelince otomatik yüklenecek."
      );
    }

    reset();
    onCancel();
  }

  return (
    <View className="flex-1 bg-white p-4 rounded-t-2xl mt-auto">
      <Text className="text-xl font-bold mb-4">Yeni Hata Raporu</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Barkod */}
        <Text className="text-gray-700 mb-1">Ürün Barkodu</Text>
        <View className="flex-row mb-3">
          <TextInput
            value={barcode}
            onChangeText={setBarcode}
            className="border border-gray-300 p-3 rounded-xl flex-1 mr-2"
            placeholder="Barkodu tara veya yaz"
            // Donanım barkod okuyucu klavye gibi yazarsa otomatik dolar
          />
          <TouchableOpacity
            onPress={() => setScannerVisible(true)}
            className="bg-slate-800 px-3 rounded-xl justify-center"
          >
            <Text className="text-white">Tara</Text>
          </TouchableOpacity>
        </View>

        {/* Ürün türü */}
        <Text className="text-gray-700 mb-1">Ürün Türü</Text>
        <TextInput
          value={productType}
          onChangeText={setProductType}
          className="border border-gray-300 p-3 rounded-xl mb-3"
          placeholder="Örn: Motor Parçası"
        />

        {/* Bant */}
        <Text className="text-gray-700 mb-1">Bant Numarası</Text>
        <TextInput
          value={lineNumber}
          onChangeText={setLineNumber}
          className="border border-gray-300 p-3 rounded-xl mb-3"
          placeholder="Örn: A1, Bant 3..."
        />

        {/* Hata kodu arama */}
        <Text className="text-gray-700 mb-1">Hata Kodu Ara / Seç</Text>
        <TextInput
          value={errorSearch}
          onChangeText={setErrorSearch}
          className="border border-gray-300 p-3 rounded-xl mb-2"
          placeholder="E101, lehim, montaj..."
        />
        <View style={{ maxHeight: 160 }} className="mb-3">
          <ScrollView>
            {filteredCodes.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => setErrorCode(item)}
                className={`p-3 rounded-xl mb-2 ${
                  errorCode?.id === item.id ? "bg-cyan-500" : "bg-gray-200"
                }`}
              >
                <Text className={errorCode?.id === item.id ? "text-white font-semibold" : "text-gray-800 font-semibold"}>
                  {item.code}
                </Text>
                <Text className={errorCode?.id === item.id ? "text-white" : "text-gray-600"}>
                  {item.description}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Opsiyonel açıklama */}
        <Text className="text-gray-700 mb-1">Açıklama (opsiyonel)</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          className="border border-gray-300 p-3 rounded-xl mb-3"
          placeholder="Kısa açıklama"
          multiline
        />

        {/* Fotoğraflar */}
        <Text className="text-gray-700 mb-2">Fotoğraflar (min 1 • max 5)</Text>
        <View className="flex-row flex-wrap">
          {photos.map((uri) => (
            <View key={uri} className="mr-2 mb-2">
              <TouchableOpacity onPress={() => setPreview(uri)}>
                <Image source={{ uri }} className="w-20 h-20 rounded-xl border border-gray-300" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => removePhoto(uri)}
                className="bg-red-500 rounded-xl mt-1 py-1"
              >
                <Text className="text-white text-center text-xs">Sil</Text>
              </TouchableOpacity>
            </View>
          ))}
          {photos.length < 5 && (
            <TouchableOpacity
              onPress={takePhoto}
              className="w-20 h-20 bg-gray-200 rounded-xl items-center justify-center"
            >
              <Text className="text-2xl">📷</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Önizleme Modal */}
        <Modal visible={!!preview} transparent animationType="fade">
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setPreview(null)}
            className="flex-1 bg-black/85 justify-center items-center"
          >
            {preview ? (
              <Image source={{ uri: preview }} className="w-80 h-96 rounded-xl" resizeMode="contain" />
            ) : null}
            <Text className="text-white mt-3">Kapatmak için dokun</Text>
          </TouchableOpacity>
        </Modal>

        {/* Aksiyonlar */}
        <View className="flex-row mt-5">
          <TouchableOpacity onPress={onCancel} className="flex-1 bg-gray-400 p-4 rounded-xl mr-2">
            <Text className="text-center text-white font-semibold">İptal</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} className="flex-1 bg-green-600 p-4 rounded-xl ml-2">
            <Text className="text-center text-white font-semibold">Gönder</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Barkod Tarama Modal */}
      <Modal visible={scannerVisible} animationType="slide">
        <View className="flex-1 bg-black">
          <BarCodeScanner
            style={{ flex: 1 }}
            onBarCodeScanned={({ data }) => {
              setBarcode(String(data));
              setScannerVisible(false);
            }}
          />
          <TouchableOpacity
            onPress={() => setScannerVisible(false)}
            className="absolute top-10 right-4 bg-red-600 px-3 py-2 rounded-xl"
          >
            <Text className="text-white font-semibold">Kapat</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
