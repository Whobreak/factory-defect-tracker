// app/(tabs)/home.tsx - Modal kısmı düzeltildi
import { useEffect, useMemo, useState } from "react";
import { View, Text, Modal, StatusBar, Dimensions, RefreshControl, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Report } from "~/services/mock";
import { fetchForms, mapFormToReport, createFormWithPhotos, fetchErrorCodes, fetchLines } from "~/services/forms";
import { useTheme } from "~/hooks/useTheme";
import HeaderBadge from "~/components/HeaderBadge";
import FloatingButton from "~/components/FloatingButton";
import ReportsList from "~/components/report/ReportsList";
import ReportFormModal from "~/components/report/ReportFormModal";
import PhotoPreviewModal from "~/components/report/PhotoPreviewModal";
import { flushQueueIfOnline, subscribeQueueFlush } from "~/services/offlineQueue";
import { BarChart3, Clock, CheckCircle2, TrendingUp } from "lucide-react-native";
import { getUserName, getUserRole, getUserLine } from "~/services/storage";
import React from "react";

export default function EmployeeHomeScreen() {
  const { colors, isDark } = useTheme();
  const { width } = Dimensions.get('window');
  
  const [reports, setReports] = useState<Report[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [previewPhotos, setPreviewPhotos] = useState<string[] | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number>(0);
  const [username, setUsername] = React.useState("");
  const [userRole, setUserRole] = React.useState("");
  const [userLine, setUserLine] = React.useState("");

  // Load username, role and line from storage
  React.useEffect(() => {
    (async () => {
      const storedName = await getUserName();
      const storedRole = await getUserRole();
      const storedLine = await getUserLine();
      if (storedName) setUsername(storedName);
      if (storedRole) setUserRole(storedRole);
      if (storedLine) setUserLine(storedLine);
    })();
  }, []);

  // Fetch reports from API
  React.useEffect(() => {
    (async () => {
      try {
        const forms = await fetchForms();
        const mapped = forms.map(mapFormToReport);
        setReports(mapped);
      } catch (e) {
        console.error('Raporlar yüklenemedi:', e);
        // API başarısız olursa boş liste
        setReports([]);
      }
    })();
  }, []);

  // bağlantı değişince kuyruk boşalt
  useEffect(() => {
    subscribeQueueFlush();
    flushQueueIfOnline();
  }, []);

  // istatistikler
  const todayISO = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const { todayCount, totalCount, weekCount } = useMemo(() => {
    const mine = reports;
    const tCount = mine.length;
    const dCount = mine.filter((r) => r.createdAt.slice(0, 10) === todayISO).length;
    
    // Bu haftaki raporlar
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const wCount = mine.filter((r) => new Date(r.createdAt) >= weekStart).length;
    
    return { todayCount: dCount, totalCount: tCount, weekCount: wCount };
  }, [reports]);

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await flushQueueIfOnline();
    // Gerçek uygulamada API'den veri çek
    setTimeout(() => setRefreshing(false), 1000);
  };

  // ONLINE gönderim yolu
  function handleSubmitOnline(values: {
    barcode: string;
    productType: string;
    lineNumber: string;
    errorCode: any;
    note?: string;
    photos: string[];
  }) {
    (async () => {
      try {
        // Hata kodu objesini kontrol et
        if (!values.errorCode || !values.errorCode.id) {
          console.error('Geçerli bir hata kodu seçilmedi');
          return;
        }

        // Line ID'yi API'den bul
        let lineId = 1; // Varsayılan değer
        try {
          const lines = await fetchLines();
          const userLine = lines.find(line => line.name === values.lineNumber);
          if (userLine) {
            lineId = userLine.id;
          }
        } catch (error) {
          console.warn('Line bilgileri alınamadı, varsayılan ID kullanılıyor:', error);
        }

        // API'ye gönderilecek temizlenmiş veri
        const submissionData = {
          code: values.barcode,
          type: values.productType,
          name: values.productType, // veya form'dan gelen name
          productError: values.note,
          quantity: 1, // Varsayılan değer, form'dan alınabilir
          lineId: lineId,
          errorCodeId: values.errorCode.id, // ÖNEMLİ: Hata kodunun ID'si
        };

        // Online gönderim
        const created = await createFormWithPhotos(submissionData, values.photos);
        const mapped = mapFormToReport(created);
        setReports((prev) => [mapped, ...prev]);
        setFormVisible(false);
        
        Alert.alert("Başarılı", "Rapor başarıyla gönderildi");
      } catch (e: any) {
        const err = e as any;
        console.error('Form gönderimi hatası:', err?.response?.data || err?.message || err);
        Alert.alert("Hata", err?.response?.data?.message || err?.message || "Form gönderilemedi");
      }
    })();
  };

  const StatCard = ({ 
    title, 
    value, 
    subtitle,
    icon: Icon,
    color 
  }: {
    title: string;
    value: number;
    subtitle: string;
    icon: any;
    color: string;
  }) => (
    <View 
      className="flex-1 rounded-2xl p-4 mx-1 shadow-sm"
      style={{ backgroundColor: colors.surface }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View 
          className="w-10 h-10 rounded-xl items-center justify-center"
          style={{ backgroundColor: color + '20' }}
        >
          <Icon color={color} size={20} />
        </View>
        <Text 
          className="text-2xl font-bold"
          style={{ color: colors.text }}
        >
          {value}
        </Text>
      </View>
      <Text 
        className="text-sm font-medium mb-1"
        style={{ color: colors.text }}
      >
        {title}
      </Text>
      <Text 
        className="text-xs"
        style={{ color: colors.textSecondary }}
      >
        {subtitle}
      </Text>
    </View>
  );

  return (
    <SafeAreaView 
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      
      <View className="flex-1 px-4 pt-2">
        <HeaderBadge username={username} line={userLine} />

        {/* İstatistik kartları */}
        <View className="flex-row mb-4">
          <StatCard
            title="Bugün"
            value={todayCount}
            subtitle="Yeni rapor"
            icon={Clock}
            color={colors.primary}
          />
          <StatCard
            title="Bu Hafta"
            value={weekCount}
            subtitle="Toplam rapor"
            icon={TrendingUp}
            color={colors.accent}
          />
          <StatCard
            title="Toplam"
            value={totalCount}
            subtitle="Tüm raporlar"
            icon={BarChart3}
            color={colors.success}
          />
        </View>

        {/* Raporlar Başlık */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <CheckCircle2 color={colors.textSecondary} size={20} />
            <Text 
              className="text-lg font-semibold ml-2"
              style={{ color: colors.text }}
            >
              Son Raporlar
            </Text>
          </View>
          <Text 
            className="text-sm"
            style={{ color: colors.textSecondary }}
          >
            {reports.length} rapor
          </Text>
        </View>

        <ReportsList 
          data={reports} 
          onImagePress={(uris: string[], index: number) => {
            setPreviewPhotos(uris);
            setPreviewIndex(index);
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />

        {/* DÜZELTME: Daha temiz Modal implementasyonu */}
          <Modal 
            visible={formVisible} 
            transparent
            animationType={Platform.OS === 'ios' ? 'slide' : 'fade'}
            presentationStyle={Platform.OS === 'ios' ? 'overFullScreen' : undefined}
            statusBarTranslucent={Platform.OS === 'ios'}
            onRequestClose={() => setFormVisible(false)}
            hardwareAccelerated
          > 
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                <ReportFormModal
                  initialLineNumber={userLine}
                  onCancel={() => setFormVisible(false)}
                  onSubmitOnline={handleSubmitOnline}
                />
              </View>
            </View>
          </Modal>

        <FloatingButton onPress={() => setFormVisible(true)} />
        <PhotoPreviewModal 
          uris={previewPhotos || undefined}
          startIndex={previewIndex}
          onClose={() => setPreviewPhotos(null)}
        />
      </View>
    </SafeAreaView>
  );
}