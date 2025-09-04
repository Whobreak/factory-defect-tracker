// app/(tabs)/home.tsx - Modal kısmı düzeltildi
import { useEffect, useMemo, useState } from "react";
import { View, Text, Modal, StatusBar, Dimensions, RefreshControl, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { mockReports, currentUser, addReport, Report } from "~/services/mock";
import { fetchForms, mapFormToReport, createForm, uploadPhotos } from "~/services/forms";
import { useTheme } from "~/hooks/useTheme";
import HeaderBadge from "~/components/HeaderBadge";
import FloatingButton from "~/components/FloatingButton";
import ReportsList from "~/components/report/ReportsList";
import ReportFormModal from "~/components/report/ReportFormModal";
import PhotoPreviewModal from "~/components/report/PhotoPreviewModal";
import { flushQueueIfOnline, subscribeQueueFlush } from "~/services/offlineQueue";
import { BarChart3, Clock, CheckCircle2, TrendingUp } from "lucide-react-native";
import { getUserName, getUserRole } from "~/services/storage";
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

  // Load username and role from storage
  React.useEffect(() => {
    (async () => {
      const storedName = await getUserName();
      const storedRole = await getUserRole();
      if (storedName) setUsername(storedName);
      if (storedRole) setUserRole(storedRole);
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
        // fallback to mock if api fails
        setReports(mockReports);
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
        // 1) Create Form
        const created = await createForm({
          code: values.barcode,
          type: values.productType,
          name: values.productType,
          productError: values.note || null,
          errorCodeId: values.errorCode?.id ?? null,
          // If you have lineId, map from lineNumber; else backend should infer
          formDate: new Date().toISOString(),
        });

        // 2) Upload photos if required by backend
        if (values.photos && values.photos.length > 0) {
          // Convert file path images to base64 if needed. If you already have base64 strings, pass directly.
          // Here we assume photos[] already hold base64 strings. If they are file URIs, we need to convert.
          await uploadPhotos({
            serialNumber: values.barcode,
            base64Images: values.photos,
            lengthUnit: undefined,
          });
        }

        // 3) Update list – refetch or prepend
        const mapped = mapFormToReport(created);
        setReports((prev) => [mapped, ...prev]);
        setFormVisible(false);
      } catch (e) {
        // fallback local add
        const newReport: Report = {
          id: Date.now(),
          barcode: values.barcode,
          productType: values.productType,
          lineNumber: values.lineNumber,
          errorCode: values.errorCode,
          note: values.note || "",
          photos: values.photos,
          createdAt: new Date().toISOString(),
          userId: currentUser.id,
        };
        addReport(newReport);
        setReports((prev) => [newReport, ...prev]);
        setFormVisible(false);
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
        <HeaderBadge username={username} line={currentUser.line} />

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
                  initialLineNumber={currentUser.line}
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