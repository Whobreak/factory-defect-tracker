import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Modal, 
  FlatList, 
  TextInput,
  Alert,
  SafeAreaView,
  Image,
  ScrollView,
  StatusBar
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Plus, Camera as CameraIcon, QrCode, X, Check } from 'lucide-react-native';

interface Report {
  id: string;
  productName: string;
  barcode: string;
  errorCode: string;
  description: string;
  photo: string | null;
  date: string;
}

interface ErrorCode {
  code: string;
  description: string;
}

export default function HomeScreen() {
  const [reports, setReports] = useState<Report[]>([
    // Örnek veri
    {
      id: '1',
      productName: 'Ürün A',
      barcode: '1234567890123',
      errorCode: 'E001',
      description: 'Paketleme hatası tespit edildi',
      photo: null,
      date: '2024-08-25 14:30'
    }
  ]);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [newReport, setNewReport] = useState({
    productName: '',
    barcode: '',
    errorCode: '',
    description: '',
    photo: null as string | null,
    date: ''
  });
  
  const [showCamera, setShowCamera] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [cameraRef, setCameraRef] = useState<any>(null);

  const [permission, requestPermission] = useCameraPermissions();

  // Hata kodları listesi
  const errorCodes: ErrorCode[] = [
    { code: 'E001', description: 'Paketleme Hatası' },
    { code: 'E002', description: 'Kalite Kontrol Hatası' },
    { code: 'E003', description: 'Etiketleme Hatası' },
    { code: 'E004', description: 'Boyut Hatası' },
    { code: 'E005', description: 'Renk Hatası' },
    { code: 'E006', description: 'Yüzey Hatası' },
    { code: 'E007', description: 'Montaj Hatası' }
  ];

  // Modal açma
  const openModal = async () => {
    if (!permission) {
      return;
    }
    
    if (!permission.granted) {
      const newPermission = await requestPermission();
      if (!newPermission.granted) {
        Alert.alert('İzin Gerekli', 'Kamera kullanımı için izin vermeniz gerekiyor.');
        return;
      }
    }

    setModalVisible(true);
    // Mevcut tarih ve saati al
    const now = new Date();
    const currentDateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setNewReport({
      productName: '',
      barcode: '',
      errorCode: '',
      description: '',
      photo: null,
      date: currentDateTime
    });
  };

  // Fotoğraf çekme
  const takePicture = async () => {
    if (cameraRef) {
      try {
        const photo = await cameraRef.takePictureAsync();
        setNewReport({ ...newReport, photo: photo.uri });
        setShowCamera(false);
      } catch (error) {
        console.log('Fotoğraf çekme hatası:', error);
        Alert.alert('Hata', 'Fotoğraf çekilemedi.');
      }
    }
  };

  // Barkod tarama
  const handleBarCodeScanned = (scanningResult: any) => {
    setNewReport({ ...newReport, barcode: scanningResult.data });
    setShowBarcodeScanner(false);
    Alert.alert('Barkod Tarandı', `Barkod: ${scanningResult.data}`);
  };

  // Rapor kaydetme
  const saveReport = () => {
    if (!newReport.barcode || !newReport.errorCode) {
      Alert.alert('Hata', 'Barkod ve hata kodu zorunludur!');
      return;
    }

    const report: Report = {
      id: Date.now().toString(),
      ...newReport,
      productName: newReport.productName || `Ürün-${newReport.barcode.slice(-4)}`
    };

    setReports([report, ...reports]);
    setNewReport({
      productName: '',
      barcode: '',
      errorCode: '',
      description: '',
      photo: null,
      date: ''
    });
    setModalVisible(false);
    Alert.alert('Başarılı', 'Hata raporu kaydedildi!');
  };

  // Modal kapatma
  const closeModal = () => {
    setModalVisible(false);
    setNewReport({
      productName: '',
      barcode: '',
      errorCode: '',
      description: '',
      photo: null,
      date: ''
    });
  };

  // Rapor listesi render
  const renderReportItem = ({ item }: { item: Report }) => (
    <View style={styles.reportItem}>
      <View style={styles.reportHeader}>
        <Text style={styles.productName}>{item.productName}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
      <View style={styles.reportDetails}>
        <Text style={styles.barcode}>Barkod: {item.barcode}</Text>
        <Text style={styles.errorCode}>Hata: {item.errorCode}</Text>
        {item.description && (
          <Text style={styles.description}>{item.description}</Text>
        )}
      </View>
      {item.photo && (
        <Image source={{ uri: item.photo }} style={styles.reportPhoto} />
      )}
    </View>
  );

  // Hata kodu seçici
  const ErrorCodeSelector = () => (
    <View style={styles.errorCodeContainer}>
      <Text style={styles.label}>Hata Kodu Seç *</Text>
      <ScrollView style={styles.errorCodeList} showsVerticalScrollIndicator={false}>
        {errorCodes.map((error) => (
          <TouchableOpacity
            key={error.code}
            style={[
              styles.errorCodeItem,
              newReport.errorCode === error.code && styles.selectedErrorCode
            ]}
            onPress={() => setNewReport({ ...newReport, errorCode: error.code })}
          >
            <Text style={[
              styles.errorCodeText,
              newReport.errorCode === error.code && styles.selectedErrorCodeText
            ]}>
              {error.code} - {error.description}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Hata Raporları</Text>
        <Text style={styles.subtitle}>
          {reports.length} rapor kayıtlı
        </Text>
      </View>
      
      {/* Rapor listesi */}
      {reports.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Henüz hata raporu yok</Text>
          <Text style={styles.emptyStateSubtext}>
            Yeni rapor eklemek için + butonuna basın
          </Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          renderItem={renderReportItem}
          style={styles.reportList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.reportListContent}
        />
      )}

      {/* FAB - Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={openModal}>
        <Plus color="#ffffff" size={28} />
      </TouchableOpacity>

      {/* Modal - Yeni rapor ekleme */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
          
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal} style={styles.headerButton}>
              <X color="#ef4444" size={24} />
              <Text style={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>Yeni Hata Raporu</Text>
            
            <TouchableOpacity onPress={saveReport} style={styles.headerButton}>
              <Check color="#22c55e" size={24} />
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Fotoğraf çekme */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Ürün Fotoğrafı</Text>
              <TouchableOpacity 
                style={styles.photoButton}
                onPress={() => setShowCamera(true)}
              >
                <CameraIcon color="#ffffff" size={20} />
                <Text style={styles.photoButtonText}>Fotoğraf Çek</Text>
              </TouchableOpacity>
              {newReport.photo && (
                <View style={styles.photoPreviewContainer}>
                  <Image source={{ uri: newReport.photo }} style={styles.previewPhoto} />
                  <TouchableOpacity 
                    style={styles.removePhotoButton}
                    onPress={() => setNewReport({ ...newReport, photo: null })}
                  >
                    <X color="#ffffff" size={16} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Barkod tarama */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Barkod *</Text>
              <View style={styles.barcodeContainer}>
                <TextInput
                  style={styles.barcodeInput}
                  value={newReport.barcode}
                  onChangeText={(text) => setNewReport({ ...newReport, barcode: text })}
                  placeholder="Barkod numarasını girin"
                  placeholderTextColor="#94a3b8"
                />
                <TouchableOpacity 
                  style={styles.scanButton}
                  onPress={() => setShowBarcodeScanner(true)}
                >
                  <QrCode color="#ffffff" size={20} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Hata kodu seçimi */}
            <ErrorCodeSelector />

            {/* Ürün adı */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Ürün Adı (Opsiyonel)</Text>
              <TextInput
                style={styles.textInput}
                value={newReport.productName}
                onChangeText={(text) => setNewReport({ ...newReport, productName: text })}
                placeholder="Ürün adını girin"
                placeholderTextColor="#94a3b8"
              />
            </View>

            {/* Açıklama */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Açıklama (Opsiyonel)</Text>
              <TextInput
                style={styles.textArea}
                value={newReport.description}
                onChangeText={(text) => setNewReport({ ...newReport, description: text })}
                placeholder="Hata açıklaması yazın..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Tarih (otomatik) */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Tarih ve Saat</Text>
              <View style={styles.dateContainer}>
                <Text style={styles.dateText}>{newReport.date}</Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Kamera Modal */}
      {showCamera && permission?.granted && (
        <Modal visible={showCamera} animationType="slide">
          <CameraView 
            style={styles.camera} 
            facing="back"
            ref={setCameraRef}
          >
            <View style={styles.cameraOverlay}>
              <View style={styles.cameraHeader}>
                <TouchableOpacity
                  style={styles.cameraCloseButton}
                  onPress={() => setShowCamera(false)}
                >
                  <X color="#ffffff" size={24} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.cameraButtonContainer}>
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={takePicture}
                >
                  <View style={styles.cameraButtonInner} />
                </TouchableOpacity>
              </View>
            </View>
          </CameraView>
        </Modal>
      )}

      {/* Barkod Tarayıcı Modal */}
      {showBarcodeScanner && permission?.granted && (
        <Modal visible={showBarcodeScanner} animationType="slide">
          <CameraView
            style={styles.barcodeScanner}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ["qr", "ean13", "ean8", "code128", "code39", "code93", "upc_a", "upc_e"]
            }}
            onBarcodeScanned={handleBarCodeScanned}
          >
            <View style={styles.scannerOverlay}>
              <View style={styles.scannerHeader}>
                <TouchableOpacity
                  style={styles.scannerCloseButton}
                  onPress={() => setShowBarcodeScanner(false)}
                >
                  <X color="#ffffff" size={24} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.scannerCenter}>
                <View style={styles.scannerFrame} />
                <Text style={styles.scannerText}>Barkodu çerçevenin içine tutun</Text>
              </View>
            </View>
          </CameraView>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  header: {
    backgroundColor: '#0f172a',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
  reportList: {
    flex: 1,
  },
  reportListContent: {
    padding: 16,
  },
  reportItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  date: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 8,
  },
  reportDetails: {
    marginBottom: 8,
  },
  barcode: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  errorCode: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  reportPhoto: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#22d3ee',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  cancelButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#22c55e',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  photoButton: {
    backgroundColor: '#059669',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  photoButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  photoPreviewContainer: {
    position: 'relative',
    marginTop: 12,
  },
  previewPhoto: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    padding: 4,
  },
  barcodeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  barcodeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
    fontFamily: 'monospace',
  },
  scanButton: {
    backgroundColor: '#f59e0b',
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 56,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
  },
  errorCodeContainer: {
    marginBottom: 24,
  },
  errorCodeList: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 8,
  },
  errorCodeItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedErrorCode: {
    borderColor: '#22d3ee',
    backgroundColor: '#ecfeff',
  },
  errorCodeText: {
    fontSize: 14,
    color: '#4b5563',
  },
  selectedErrorCodeText: {
    color: '#0891b2',
    fontWeight: '600',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    height: 100,
    color: '#1f2937',
  },
  dateContainer: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dateText: {
    fontSize: 16,
    color: '#64748b',
    fontFamily: 'monospace',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  cameraHeader: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cameraCloseButton: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  cameraButtonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 50,
  },
  cameraButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 4,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
  },
  barcodeScanner: {
    flex: 1,
  },
  scannerOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scannerHeader: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  scannerCloseButton: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  scannerCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#22d3ee',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  scannerText: {
    fontSize: 16,
    color: '#ffffff',
    marginTop: 20,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 8,
  },
});