import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Modal,
  Alert,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { enqueueReportIfOffline } from "~/services/offlineQueue";
import { createFormWithPhotos } from "~/services/forms";
import { useTheme } from "~/hooks/useTheme";
import { X, Camera, Package, AlertTriangle, FileText, Check } from "lucide-react-native";

type Props = {
  initialLineNumber: string;
  onCancel: () => void;
  onSubmitOnline: (formData: ReportFormData) => Promise<void>;
  visible?: boolean;
};

export type ReportFormData = {
  barcode: string;
  productType: string;
  lineNumber: string;
  errorCode: any;
  note?: string;
  photos: string[];
};

export default function ReportFormModal({
  initialLineNumber,
  onCancel,
  onSubmitOnline,
  visible = true,
}: Props) {
  const { colors } = useTheme();
  const [formData, setFormData] = useState<ReportFormData>({
    barcode: "",
    productType: "",
    lineNumber: initialLineNumber,
    errorCode: null,
    note: "",
    photos: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.barcode.trim()) {
      newErrors.barcode = "Barkod gereklidir";
    }
    if (!formData.productType.trim()) {
      newErrors.productType = "Ürün tipi gereklidir";
    }
    if (!formData.errorCode) {
      newErrors.errorCode = "Hata kodu gereklidir";
    }
    if (formData.photos.length === 0) {
      newErrors.photos = "En az bir fotoğraf gereklidir";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      base64: false,
    });

    if (!result.canceled) {
      setFormData({ ...formData, photos: [...formData.photos, result.assets[0].uri] });
      setErrors(prev => ({ ...prev, photos: "" }));
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Offline kontrolü
      const queued = await enqueueReportIfOffline(formData);

      if (queued) {
        Alert.alert(
          "Çevrimdışı",
          "Rapor internet bağlantısı sağlandığında otomatik gönderilecek."
        );
        onCancel();
      } else {
        // Online ise direkt API'ye fotoğraflarla gönder
        await createFormWithPhotos(formData, formData.photos);
        Alert.alert("Başarılı", "Rapor başarıyla gönderildi.");
        onCancel();
      }
    } catch (error) {
      Alert.alert("Hata", "Rapor gönderilirken bir hata oluştu");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onCancel]);

  const updateField = (field: keyof ReportFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onCancel}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Yeni Rapor
          </Text>
          <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
            <X color={colors.textSecondary} size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Barkod */}
          <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
              <Package color={colors.textSecondary} size={18} />
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Barkod *
              </Text>
            </View>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: errors.barcode ? colors.error : colors.border,
                  color: colors.text
                }
              ]}
              placeholder="Barkod girin"
              placeholderTextColor={colors.textMuted}
              value={formData.barcode}
              onChangeText={(text) => updateField("barcode", text)}
            />
            {errors.barcode && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.barcode}
              </Text>
            )}
          </View>

          {/* Ürün Tipi */}
          <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
              <Package color={colors.textSecondary} size={18} />
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Ürün Tipi *
              </Text>
            </View>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: errors.productType ? colors.error : colors.border,
                  color: colors.text
                }
              ]}
              placeholder="Ürün tipini girin"
              placeholderTextColor={colors.textMuted}
              value={formData.productType}
              onChangeText={(text) => updateField("productType", text)}
            />
            {errors.productType && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.productType}
              </Text>
            )}
          </View>

          {/* Hata Kodu */}
          <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
              <AlertTriangle color={colors.textSecondary} size={18} />
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Hata Kodu *
              </Text>
            </View>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: errors.errorCode ? colors.error : colors.border,
                  color: colors.text
                }
              ]}
              placeholder="Hata kodunu girin"
              placeholderTextColor={colors.textMuted}
              value={formData.errorCode?.code || ""}
              onChangeText={(text) => updateField("errorCode", { id: Date.now(), code: text })}
            />
            {errors.errorCode && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.errorCode}
              </Text>
            )}
          </View>

          {/* Not */}
          <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
              <FileText color={colors.textSecondary} size={18} />
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Not
              </Text>
            </View>
            <TextInput
              style={[
                styles.textArea,
                { 
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                  color: colors.text
                }
              ]}
              placeholder="Ek açıklama (isteğe bağlı)"
              placeholderTextColor={colors.textMuted}
              value={formData.note}
              onChangeText={(text) => updateField("note", text)}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Fotoğraflar */}
          <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
              <Camera color={colors.textSecondary} size={18} />
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Fotoğraflar *
              </Text>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosContainer}>
              {formData.photos.map((uri, index) => (
                <View key={index} style={styles.photoItem}>
                  <Image source={{ uri }} style={styles.photo} />
                  <TouchableOpacity
                    style={[styles.removePhoto, { backgroundColor: colors.error }]}
                    onPress={() => removePhoto(index)}
                  >
                    <X color="white" size={16} />
                  </TouchableOpacity>
                </View>
              ))}
              
              <TouchableOpacity
                style={[
                  styles.addPhotoButton,
                  { 
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: colors.border
                  }
                ]}
                onPress={pickImage}
              >
                <Camera color={colors.textMuted} size={24} />
                <Text style={[styles.addPhotoText, { color: colors.textMuted }]}>
                  Fotoğraf Ekle
                </Text>
              </TouchableOpacity>
            </ScrollView>
            
            {errors.photos && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.photos}
              </Text>
            )}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton, { backgroundColor: colors.surfaceSecondary }]}
            onPress={onCancel}
            disabled={isSubmitting}
          >
            <Text style={[styles.buttonText, { color: colors.textSecondary }]}>
              İptal
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.button,
              styles.submitButton,
              { 
                backgroundColor: isSubmitting ? colors.textMuted : colors.primary,
                opacity: isSubmitting ? 0.7 : 1
              }
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Check color="white" size={20} />
            )}
            <Text style={[styles.buttonText, { color: "white", marginLeft: 8 }]}>
              {isSubmitting ? "Gönderiliyor..." : "Gönder"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  photosContainer: {
    marginTop: 8,
  },
  photoItem: {
    marginRight: 12,
    position: 'relative',
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  removePhoto: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoButton: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  cancelButton: {
    // backgroundColor handled by style prop
  },
  submitButton: {
    // backgroundColor handled by style prop
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});