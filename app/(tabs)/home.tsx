// app/(tabs)/home.tsx
import { useEffect, useMemo, useState } from "react";
import { View, Text, Modal, StatusBar, Dimensions, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { mockReports, currentUser, addReport, Report } from "~/lib/mock";
import { useTheme } from "~/hooks/useTheme";

import HeaderBadge from "~/components/HeaderBadge";
import FloatingButton from "~/components/FloatingButton";
import ReportsList from "~/components/report/ReportsList";
import ReportFormModal from "~/components/report/ReportFormModal";
import { flushQueueIfOnline, subscribeQueueFlush } from "~/lib/offlineQueue";
import { BarChart3, Clock, CheckCircle2, TrendingUp } from "lucide-react-native";

export default function EmployeeHomeScreen() {
  const { colors, isDark } = useTheme();
  const { width } = Dimensions.get('window');
  
  const [reports, setReports] = useState<Report[]>(
    mockReports.filter((r) => r.userId === currentUser.id)
  );
  const [formVisible, setFormVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // bağlantı değişince kuyruk boşalt
  useEffect(() => {
    subscribeQueueFlush();
    flushQueueIfOnline();
  }, []);

  // istatistikler
  const todayISO = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const { todayCount, totalCount, weekCount } = useMemo(() => {
    const mine = mockReports.filter((r) => r.userId === currentUser.id);
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
        <HeaderBadge name={currentUser.name} line={currentUser.line} />

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
          onImagePress={() => {}}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />

        <Modal 
          visible={formVisible} 
          transparent 
          animationType="slide"
          statusBarTranslucent
        >
          <View className="flex-1 bg-black/50 justify-end">
            <ReportFormModal
              initialLineNumber={currentUser.line}
              onCancel={() => setFormVisible(false)}
              onSubmitOnline={handleSubmitOnline}
            />
          </View>
        </Modal>

        <FloatingButton onPress={() => setFormVisible(true)} />
      </View>
    </SafeAreaView>
  );
}