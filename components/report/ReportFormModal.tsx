<<<<<<< Updated upstream
// components/report/ReportFormModal.tsx
import React, { useState, useRef } from "react";
=======
import React, { useState, useRef, useCallback } from "react";
>>>>>>> Stashed changes
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from "expo-camera";
import { 
  X, 
  Camera, 
  QrCode, 
  AlertCircle, 
  Check,
  Loader,
  Trash2
} from "lucide-react-native";
import { useTheme } from "~/hooks/useTheme";

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

interface FormErrors {
  barcode?: string;
  productType?: string;
  lineNumber?: string;
  errorCode?: string;
  photos?: string;
}

export default function ReportFormModal({
  initialLineNumber,
  onCancel,
  onSubmitOnline,
}: ReportFormModalProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [formData, setFormData] = useState({
    barcode: "",
    productType: "",
    lineNumber: initialLineNumber || "",
    errorCode: "",
    note: "",
    photos: [] as string[],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraMode, setCameraMode] = useState<"none" | "barcode" | "photo">("none");
  const [scanning, setScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  // --- Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.barcode.trim()) {
      newErrors.barcode = "Barkod gereklidir";
    } else if (formData.barcode.length < 3) {
      newErrors.barcode = "Barkod en az 3 karakter olmalıdır";
    }

    if (!formData.productType.trim()) {
      newErrors.productType = "Ürün tipi gereklidir";
    }

    if (!formData.lineNumber.trim()) {
      newErrors.lineNumber = "Bant numarası gereklidir";
    }

    if (!formData.errorCode.trim()) {
      newErrors.errorCode = "Hata kodu gereklidir";
    }

    if (formData.photos.length === 0) {
      newErrors.photos = "En az bir fotoğraf gereklidir";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Barcode
  const handleBarcodeScanned = useCallback((result: BarcodeScanningResult) => {
    if (scanning) return;
    setScanning(true);
    setFormData((prev) => ({ ...prev, barcode: result.data }));
    setErrors(prev => ({ ...prev, barcode: undefined }));
    setCameraMode("none");
    setTimeout(() => setScanning(false), 1000);
  }, [scanning]);

  // --- Photo
  const takePhoto = useCallback(async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ 
          base64: false,
          quality: 0.8 
        });
        setFormData((prev) => ({
          ...prev,
          photos: [...prev.photos, photo.uri],
        }));
        setErrors(prev => ({ ...prev, photos: undefined }));
        setCameraMode("none");
      } catch (error) {
        Alert.alert("Hata", "Fotoğraf çekilirken bir hata oluştu");
      }
    }
  }, []);

  const removePhoto = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  }, []);

  // --- Submit
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 400)); // Simulated delay
      onSubmitOnline(formData);
    } catch (error) {
      Alert.alert("Hata", "Rapor gönderilirken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSubmitOnline]);

  // --- Input change
  const handleInputChange = useCallback((field: keyof typeof formData) => {
    return (value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      setErrors(prev => ({ ...prev, [field]: undefined }));
    };
  }, []);

  // --- Open camera
  const openCamera = useCallback((mode: "barcode" | "photo") => {
    return async () => {
      if (!permission?.granted) {
        await requestPermission();
      }
      setCameraMode(mode);
    };
  }, [permission, requestPermission]);

  // --- Reusable Input
  const InputField = ({ 
    label, 
    value, 
    onChangeText, 
    placeholder, 
    error, 
    multiline = false,
    required = false 
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    error?: string;
    multiline?: boolean;
    required?: boolean;
  }) => (
    <View className="mb-4">
      <View className="flex-row items-center mb-2">
        <Text 
          className="text-sm font-medium"
          style={{ color: colors.text }}
        >
          {label}
        </Text>
        {required && (
          <Text className="ml-1 text-red-500">*</Text>
        )}
      </View>
      <TextInput
        className={`p-4 rounded-xl border ${error ? 'border-red-400' : 'border-transparent'} ${multiline ? 'h-24' : 'h-12'}`}
        style={{ 
          backgroundColor: colors.surfaceSecondary,
          color: colors.text,
          textAlignVertical: multiline ? 'top' : 'center'
        }}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        returnKeyType={multiline ? "default" : "next"}
        submitBehavior={multiline ? "blurAndSubmit" : "submit"}
      />
      {error && (
        <View className="flex-row items-center mt-1">
          <AlertCircle color={colors.error} size={16} />
          <Text 
            className="ml-1 text-sm"
            style={{ color: colors.error }}
          >
            {error}
          </Text>
        </View>
      )}
    </View>
  );

  // useCallback ile değiştirilmiş input 
  const handleInputChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }, []);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}
      >
        <View 
          className="flex-1 rounded-t-3xl overflow-hidden"
          style={{ backgroundColor: colors.background }}
        >
          {/* Header */}
          <View 
            className="flex-row items-center justify-between p-6 pb-4 border-b"
            style={{ borderBottomColor: colors.border, paddingTop: 8 }}
          >
            <Text 
              className="text-xl font-bold"
              style={{ color: colors.text }}
            >
              Yeni Rapor
            </Text>
            <TouchableOpacity
              onPress={onCancel}
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.surfaceSecondary }}
            >
              <X color={colors.textSecondary} size={20} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            className="flex-1 px-6"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="on-drag"
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            {/* Barkod */}
            <View className="mb-4 mt-4">
              <View className="flex-row items-center mb-2">
                <Text 
                  className="text-sm font-medium"
                  style={{ color: colors.text }}
                >
                  Barkod
                </Text>
                <Text className="ml-1 text-red-500">*</Text>
              </View>
              <View className="flex-row items-center">
                <TextInput
                  className={`flex-1 p-4 rounded-xl border mr-3 ${errors.barcode ? 'border-red-400' : 'border-transparent'}`}
                  style={{ 
                    backgroundColor: colors.surfaceSecondary,
                    color: colors.text
                  }}
                  placeholder="Barkod okut veya manuel gir"
                  placeholderTextColor={colors.textMuted}
                  value={formData.barcode}
                  onChangeText={handleInputChange("barcode")}
                  returnKeyType="next"
                  submitBehavior="submit"
                />
                <TouchableOpacity
                  className="w-12 h-12 rounded-xl items-center justify-center"
                  style={{ backgroundColor: colors.primary }}
                  onPress={openCamera("barcode")}
                >
                  <QrCode color={colors.primaryForeground} size={20} />
                </TouchableOpacity>
              </View>
              {errors.barcode && (
                <View className="flex-row items-center mt-1">
                  <AlertCircle color={colors.error} size={16} />
                  <Text 
                    className="ml-1 text-sm"
                    style={{ color: colors.error }}
                  >
                    {errors.barcode}
                  </Text>
                </View>
              )}
            </View>

<<<<<<< Updated upstream
          {/* Form Fields */}
          <InputField
            label="Ürün Tipi"
            value={formData.productType}
            onChangeText={(t) => handleInputChange("productType", t)}
            placeholder="Ürün tipini girin"
            error={errors.productType}
            required
          />

          <InputField
            label="Hat Numarası"
            value={formData.lineNumber}
            onChangeText={(t) => handleInputChange("lineNumber", t)}
            placeholder="Hat numarasını girin"
            error={errors.lineNumber}
            required
          />

          <InputField
            label="Hata Kodu"
            value={formData.errorCode}
            onChangeText={(t) => handleInputChange("errorCode", t)}
            placeholder="Hata kodunu girin"
            error={errors.errorCode}
            required
          />

          <InputField
            label="Not"
            value={formData.note}
            onChangeText={(t) => handleInputChange("note", t)}
            placeholder="Ek açıklama (isteğe bağlı)"
            multiline
          />

          {/* Fotoğraflar */}
          <View className="mb-6">
            <View className="flex-row items-center mb-2">
              <Text 
                className="text-sm font-medium"
                style={{ color: colors.text }}
              >
                Fotoğraflar
              </Text>
              <Text className="ml-1 text-red-500">*</Text>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              className="mb-2"
            >
              {formData.photos.map((uri, idx) => (
                <View key={idx} className="mr-3 relative">
                  <Image
                    source={{ uri }}
                    className="w-24 h-24 rounded-xl"
                  />
                  <TouchableOpacity
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full items-center justify-center"
                    style={{ backgroundColor: colors.error }}
                    onPress={() => removePhoto(idx)}
                  >
                    <Trash2 color="white" size={12} />
                  </TouchableOpacity>
                </View>
              ))}
              
              <TouchableOpacity
                className="w-24 h-24 rounded-xl items-center justify-center border-2 border-dashed"
                style={{ borderColor: colors.border, backgroundColor: colors.surfaceSecondary }}
                onPress={() => {
                  if (!permission?.granted) {
                    requestPermission();
=======
            {/* Kamera Görünümü */}
            {cameraMode !== "none" && (
              <View className="h-80 rounded-2xl overflow-hidden mb-6 relative">
                <CameraView
                  ref={cameraRef}
                  style={{ flex: 1 }}
                  facing="back"
                  barcodeScannerSettings={{
                    barcodeTypes: ["qr", "ean13", "ean8", "code128"],
                  }}
                  onBarcodeScanned={
                    cameraMode === "barcode" ? handleBarcodeScanned : undefined
>>>>>>> Stashed changes
                  }
                />
                <View className="absolute inset-0 bg-black/20" />
                {cameraMode === "barcode" && (
                  <View className="absolute inset-0 items-center justify-center">
                    <View 
                      className="w-64 h-64 border-2 border-white rounded-2xl"
                      style={{ borderStyle: 'dashed' }}
                    />
                    <Text className="text-white text-center mt-4 font-medium">
                      Barkodu kameraya tutun
                    </Text>
                  </View>
                )}
                {cameraMode === "photo" && (
                  <TouchableOpacity
                    className="absolute bottom-6 self-center w-16 h-16 rounded-full border-4 border-white items-center justify-center"
                    style={{ backgroundColor: colors.primary }}
                    onPress={takePhoto}
                  >
                    <Camera color="white" size={24} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 items-center justify-center"
                  onPress={() => setCameraMode("none")}
                >
                  <X color="white" size={20} />
                </TouchableOpacity>
              </View>
            )}

            {/* Form Fields */}
            <InputField
              label="Ürün Tipi"
              value={formData.productType}
              onChangeText={handleInputChange("productType")}
              placeholder="Ürün tipini girin"
              error={errors.productType}
              required
            />

            <InputField
              label="Bant Numarası"
              value={formData.lineNumber}
              onChangeText={handleInputChange("lineNumber")}
              placeholder="Bant numarasını girin"
              error={errors.lineNumber}
              required
            />

            <InputField
              label="Hata Kodu"
              value={formData.errorCode}
              onChangeText={handleInputChange("errorCode")}
              placeholder="Hata kodunu girin"
              error={errors.errorCode}
              required
            />

            <InputField
              label="Not"
              value={formData.note}
              onChangeText={handleInputChange("note")}
              placeholder="Ek açıklama (isteğe bağlı)"
              multiline
            />

            {/* Fotoğraflar */}
            <View className="mb-6">
              <View className="flex-row items-center mb-2">
                <Text 
                  className="text-sm font-medium"
                  style={{ color: colors.text }}
                >
                  Fotoğraflar
                </Text>
                <Text className="ml-1 text-red-500">*</Text>
              </View>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                className="mb-2"
                keyboardShouldPersistTaps="always"
              >
                {formData.photos.map((uri, idx) => (
                  <View key={idx} className="mr-3 relative">
                    <Image
                      source={{ uri }}
                      className="w-24 h-24 rounded-xl"
                    />
                    <TouchableOpacity
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full items-center justify-center"
                      style={{ backgroundColor: colors.error }}
                      onPress={() => removePhoto(idx)}
                    >
                      <Trash2 color="white" size={12} />
                    </TouchableOpacity>
                  </View>
                ))}
                
                <TouchableOpacity
                  className="w-24 h-24 rounded-xl items-center justify-center border-2 border-dashed"
                  style={{ borderColor: colors.border, backgroundColor: colors.surfaceSecondary }}
                  onPress={openCamera("photo")}
                >
                  <Camera color={colors.textMuted} size={24} />
                  <Text 
                    className="text-xs mt-1 text-center"
                    style={{ color: colors.textMuted }}
                  >
                    Ekle
                  </Text>
                </TouchableOpacity>
              </ScrollView>
              
              {errors.photos && (
                <View className="flex-row items-center">
                  <AlertCircle color={colors.error} size={16} />
                  <Text 
                    className="ml-1 text-sm"
                    style={{ color: colors.error }}
                  >
                    {errors.photos}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Action Buttons (Safe bottom) */}
          <SafeAreaView edges={['bottom']}>
            <View 
              className="flex-row justify-between p-6 pt-4 border-t"
              style={{ borderTopColor: colors.border, paddingBottom: Math.max(8, insets.bottom) }}
            >
              <TouchableOpacity
                className="flex-1 py-4 rounded-xl mr-3 items-center"
                style={{ backgroundColor: colors.surfaceSecondary }}
                onPress={onCancel}
                disabled={isSubmitting}
              >
                <Text 
                  className="font-medium"
                  style={{ color: colors.textSecondary }}
                >
                  İptal
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-1 py-4 rounded-xl items-center flex-row justify-center"
                style={{ 
                  backgroundColor: isSubmitting ? colors.textMuted : colors.primary,
                  opacity: isSubmitting ? 0.7 : 1
                }}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader color={colors.primaryForeground} size={20} />
                ) : (
                  <Check color={colors.primaryForeground} size={20} />
                )}
                <Text 
                  className="font-medium ml-2"
                  style={{ color: colors.primaryForeground }}
                >
                  {isSubmitting ? "Gönderiliyor..." : "Rapor Oluştur"}
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}