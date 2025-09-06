import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, X, PlusCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';

import { useTheme } from '~/hooks/useTheme';
import { Text } from '~/components/ui/text';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import PhotoPreviewModal from './PhotoPreviewModal';

import { FormService } from '~/services/formData.service';
import { ErrorCodeService } from '~/services/errorCode.service';
import { useNetwork } from '~/components/NetworkProvider';
import { ErrorCodeDto, CreateFormPayload, RNFile } from '~/types';

interface ReportFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

export default function ReportFormModal({
  visible,
  onClose,
  onSubmitSuccess,
}: ReportFormModalProps) {
  const { colors } = useTheme();
  const { isConnected } = useNetwork();

  const [form, setForm] = useState<Omit<CreateFormPayload, 'ErrorCodeId' | 'Photos' | 'LineId'>>({
    Code: '',
    Type: 'Üretim',
    Name: '',
    ProductError: '',
    Quantity: 1,
  });
  const [selectedErrorCode, setSelectedErrorCode] = useState<ErrorCodeDto | null>(null);
  const [photos, setPhotos] = useState<RNFile[]>([]);
  
  const [errorCodes, setErrorCodes] = useState<ErrorCodeDto[]>([]);
  const [loadingErrorCodes, setLoadingErrorCodes] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<RNFile | null>(null);

  useEffect(() => {
    if (visible) {
      const fetchErrorCodes = async () => {
        setLoadingErrorCodes(true);
        try {
          const response = await ErrorCodeService.getErrorCodes();
          setErrorCodes(response.data);
        } catch (error) {
          console.error('Hata kodları alınamadı:', error);
          Alert.alert('Hata', 'Hata kodları listesi yüklenemedi.');
        } finally {
          setLoadingErrorCodes(false);
        }
      };
      fetchErrorCodes();
    }
  }, [visible]);

  const errorCodeDataSet = useMemo(() => {
    return errorCodes.map((item) => ({
      id: item.id.toString(),
      title: `${item.code} - ${item.description}`,
    }));
  }, [errorCodes]);
  
  const handleInputChange = (field: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const pickImage = async (useCamera: boolean) => {
    const action = useCamera ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
    const result = await action({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const newPhoto: RNFile = {
        uri: asset.uri,
        name: asset.fileName || `photo_${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      };
      setPhotos((prev) => [...prev, newPhoto]);
    }
  };

  const removePhoto = (uri: string) => {
    setPhotos((prev) => prev.filter((photo) => photo.uri !== uri));
  };

  const handleSubmit = async () => {
    if (!form.Code || !form.Name || !form.ProductError || !selectedErrorCode) {
      Alert.alert('Eksik Bilgi', 'Lütfen tüm zorunlu alanları doldurun.');
      return;
    }
    
    setIsSubmitting(true);
    
    const finalFormData: CreateFormPayload = {
      ...form,
      ErrorCodeId: selectedErrorCode.id,
      LineId: 1, 
      Photos: photos.map(p => p.uri),
    };

    try {
      await FormService.submitForm(finalFormData, photos);
      
      const successMessage = isConnected
        ? 'Rapor başarıyla gönderildi!'
        : 'İnternet bağlantısı yok. Rapor kaydedildi ve bağlantı kurulduğunda gönderilecek.';
      
      Alert.alert('Başarılı', successMessage);
      
      onSubmitSuccess();
      resetForm();
    } catch (error) {
      console.error('Form gönderme hatası:', error);
      Alert.alert('Hata', 'Rapor gönderilirken bir sorun oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({ Code: '', Type: 'Üretim', Name: '', ProductError: '', Quantity: 1 });
    setSelectedErrorCode(null);
    setPhotos([]);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={resetForm}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <KeyboardAwareScrollView>
          <View style={{ padding: 20 }}>
            {/* ... Diğer tüm tasarım kodların burada ... */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }}>
                Yeni Hata Raporu
              </Text>
              <TouchableOpacity onPress={resetForm}>
                <X size={28} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <Label style={{ color: colors.text, marginBottom: 5 }}>Ürün Kodu</Label>
            <Input value={form.Code} onChangeText={(val) => handleInputChange('Code', val)} placeholder="Ürün kodunu girin" />

            <Label style={{ color: colors.text, marginTop: 15, marginBottom: 5 }}>Ürün Adı</Label>
            <Input value={form.Name} onChangeText={(val) => handleInputChange('Name', val)} placeholder="Ürün adını girin" />
            
            <Label style={{ color: colors.text, marginTop: 15, marginBottom: 5 }}>Hatalı Ürün</Label>
            <Input value={form.ProductError} onChangeText={(val) => handleInputChange('ProductError', val)} placeholder="Hatalı olan ürünü belirtin" />

            <Label style={{ color: colors.text, marginTop: 15, marginBottom: 5 }}>Hata Kodu</Label>
            <AutocompleteDropdown
              loading={loadingErrorCodes}
              clearOnFocus={false}
              closeOnBlur={true}
              closeOnSubmit={false}
              onSelectItem={(item) => {
                if (item) {
                  const foundErrorCode = errorCodes.find(ec => ec.id.toString() === item.id);
                  setSelectedErrorCode(foundErrorCode || null);
                } else {
                  setSelectedErrorCode(null);
                }
              }}
              dataSet={errorCodeDataSet}
              textInputProps={{
                placeholder: 'Hata kodu veya açıklamasıyla arayın...',
                autoCorrect: false,
                autoCapitalize: 'none',
                style: {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 8,
                  paddingLeft: 18,
                },
              }}
              suggestionsListContainerStyle={{ backgroundColor: colors.surface, }}
              renderItem={(item) => (
                <Text style={{ color: colors.text, padding: 15 }}>{item.title}</Text>
              )}
            />

            <Label style={{ color: colors.text, marginTop: 15, marginBottom: 5 }}>Adet</Label>
            <Input value={String(form.Quantity)} onChangeText={(val) => handleInputChange('Quantity', parseInt(val) || 1)} keyboardType="numeric" />

            <Label style={{ color: colors.text, marginTop: 20, marginBottom: 10 }}>Fotoğraflar</Label>
            <ScrollView horizontal>
              {photos.map((photo) => (
                <TouchableOpacity key={photo.uri} onLongPress={() => removePhoto(photo.uri)} onPress={() => setPreviewPhoto(photo)}>
                  <Image source={{ uri: photo.uri }} style={{ width: 80, height: 80, borderRadius: 8, marginRight: 10 }} />
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={() => Alert.alert('Fotoğraf Ekle', '', [{ text: 'Kamera', onPress: () => pickImage(true) }, { text: 'Galeri', onPress: () => pickImage(false) }, { text: 'İptal', style: 'cancel' }])}
                style={{ width: 80, height: 80, borderRadius: 8, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' }}
              >
                <PlusCircle size={32} color={colors.primary} />
              </TouchableOpacity>
            </ScrollView>

            <Button
              onPress={handleSubmit}
              disabled={isSubmitting}
              style={{ marginTop: 30, backgroundColor: colors.primary, height: 50, justifyContent: 'center' }}
            >
              {isSubmitting ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Kaydet</Text>}
            </Button>
          </View>
        </KeyboardAwareScrollView>
        
        {/* DÜZELTİLMİŞ NİHAİ SATIR */}
        {previewPhoto && <PhotoPreviewModal uri={previewPhoto.uri} onClose={() => setPreviewPhoto(null)} />}
        
      </SafeAreaView>
    </Modal>
  );
}