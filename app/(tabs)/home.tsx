import React, { useState, useMemo, useCallback } from 'react';
import { View, StatusBar, RefreshControl, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { BarChart3, Clock, CheckCircle2, TrendingUp, Barcode } from 'lucide-react-native';

import { useTheme } from '~/hooks/useTheme';
import { FormService } from '~/services/formData.service';
import { Form } from '~/types';

import HeaderBadge from '~/components/HeaderBadge';
import FloatingButton from '~/components/FloatingButton';
import ReportsList from '~/components/report/ReportsList';
import ReportFormModal from '~/components/report/ReportFormModal';
import PhotoPreviewModal from '~/components/report/PhotoPreviewModal';
import { Text } from '~/components/ui/text';

export default function EmployeeHomeScreen() {
  const { colors, isDark } = useTheme();

  // State'ler
  const [reports, setReports] = useState<Form[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewPhotos, setPreviewPhotos] = useState<string[] | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number>(0);
  
  // Raporları API'den çekme fonksiyonu
  const fetchReports = async () => {
    try {
      // YENİ YAPI: Artık tek bir yerden, temiz bir şekilde formları çekiyoruz.
      const response = await FormService.getForms();
      setReports(response.data || []);
    } catch (e) {
      console.error('Raporlar yüklenemedi:', e);
      setReports([]); // Hata durumunda listeyi boşalt
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Ekran her açıldığında verileri yeniden çek
  useFocusEffect(
    useCallback(() => {
      if (!formVisible) { // Modal kapalıyken listeyi güncelle
        setLoading(true);
        fetchReports();
      }
    }, [formVisible])
  );

  // İstatistik hesaplamaları (Tasarımının bir parçası, aynen korundu)
  const { todayCount, totalCount, weekCount } = useMemo(() => {
    const todayISO = new Date().toISOString().slice(0, 10);
    const today = new Date();
    const dayOfWeek = today.getDay(); // Pazar = 0, Pzt = 1...
    const firstDayOfWeek = new Date(today.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1))); // Haftanın başlangıcı Pazartesi
    
    let tCount = reports.length;
    let dCount = reports.filter((r) => r.createdAt.slice(0, 10) === todayISO).length;
    let wCount = reports.filter((r) => new Date(r.createdAt) >= firstDayOfWeek).length;
    
    return { todayCount: dCount, totalCount: tCount, weekCount: wCount };
  }, [reports]);

  // Aşağı kaydırarak yenileme (Pull to refresh)
  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  // Yeni rapor başarıyla eklendiğinde
  const handleSubmissionSuccess = () => {
    setFormVisible(false);
    // useFocusEffect, modal kapandığında listeyi otomatik olarak yenileyecek.
  };

  // StatCard bileşeni (Tasarımının bir parçası, aynen korundu)
  const StatCard = ({ title, value, subtitle, icon: Icon, color }: any) => (
    <View className="flex-1 rounded-2xl p-4 mx-1 shadow-sm" style={{ backgroundColor: colors.surface }}>
      <View className="flex-row items-center justify-between mb-2">
        <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: color + '20' }}>
          <Icon color={color} size={20} />
        </View>
        <Text className="text-2xl font-bold" style={{ color: colors.text }}>{value}</Text>
      </View>
      <Text className="text-sm font-medium mb-1" style={{ color: colors.text }}>{title}</Text>
      <Text className="text-xs" style={{ color: colors.textSecondary }}>{subtitle}</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      
      <View className="flex-1 px-4 pt-2">
        {/* HeaderBadge artık kendi verisini kendi çektiği için prop'a ihtiyacı yok */}
        <HeaderBadge />

        {/* İstatistik kartları (Tasarımının bir parçası, aynen korundu) */}
        <View className="flex-row my-4">
          <StatCard title="Bugün" value={todayCount} subtitle="Yeni rapor" icon={Clock} color={colors.primary} />
          <StatCard title="Bu Hafta" value={weekCount} subtitle="Toplam rapor" icon={TrendingUp} color={colors.accent} />
          <StatCard title="Toplam" value={totalCount} subtitle="Tüm raporlar" icon={BarChart3} color={colors.success} />
        </View>

        {/* Raporlar Başlık (Tasarımının bir parçası, aynen korundu) */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <CheckCircle2 color={colors.textSecondary} size={20} />
            <Text className="text-lg font-semibold ml-2" style={{ color: colors.text }}>Son Raporlar</Text>
          </View>
          <Text className="text-sm" style={{ color: colors.textSecondary }}>{reports.length} rapor</Text>
        </View>

        {/* Yükleme ve Liste Alanı */}
        {loading && !refreshing ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ReportsList
            data={reports}
            onImagePress={(uris: string[], index: number) => {
              setPreviewPhotos(uris);
              setPreviewIndex(index);
            }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
          />
        )}
        
        {/* Buton ve Modallar (Tasarımının bir parçası, aynen korundu) */}
        <FloatingButton onPress={() => setFormVisible(true)} />
        
        <ReportFormModal
          visible={formVisible}
          onClose={() => setFormVisible(false)}
          onSubmitSuccess={handleSubmissionSuccess}
        />
        
        <PhotoPreviewModal
          uris={previewPhotos || undefined}
          startIndex={previewIndex}
          onClose={() => setPreviewPhotos(null)}
        />
      </View>
    </SafeAreaView>
  );
}