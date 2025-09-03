import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '~/hooks/useTheme';
import { Search, Filter, Users } from 'lucide-react-native';
import HeaderBadge from '~/components/HeaderBadge';
import ReportsList from '~/components/report/ReportsList';
import { mockReports, Report } from '~/lib/mock';
import { getUserName } from '~/lib/storage';

export default function AdminDashboard() {
  const { colors, isDark } = useTheme();
  const [username, setUsername] = useState("");
  const [allReports, setAllReports] = useState<Report[]>(mockReports);
  const [filteredReports, setFilteredReports] = useState<Report[]>(mockReports);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Load username from storage
  useEffect(() => {
    (async () => {
      const storedName = await getUserName();
      if (storedName) setUsername(storedName);
    })();
  }, []);

  // Filter reports based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredReports(allReports);
    } else {
      const filtered = allReports.filter(report => 
        report.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.productType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.note?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredReports(filtered);
    }
  }, [searchQuery, allReports]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setAllReports(mockReports);
      setRefreshing(false);
    }, 1000);
  };

  return (
    <SafeAreaView 
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <View className="flex-1 px-4 pt-2">
        <HeaderBadge username={username} line="Admin Panel" />

        {/* Search Bar */}
        <View className="mb-4">
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
            <Search color={colors.textSecondary} size={20} />
            <TextInput
              className="flex-1 ml-3 text-base"
              placeholder="Raporlarda ara (barkod, ürün tipi, not)"
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ color: colors.text }}
            />
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row mb-4">
          <View className="flex-1 bg-blue-100 rounded-xl p-4 mr-2">
            <Text className="text-2xl font-bold text-blue-600">
              {filteredReports.length}
            </Text>
            <Text className="text-sm text-blue-600">Toplam Rapor</Text>
          </View>
          <View className="flex-1 bg-green-100 rounded-xl p-4 ml-2">
            <Text className="text-2xl font-bold text-green-600">
              {allReports.length}
            </Text>
            <Text className="text-sm text-green-600">Tüm Raporlar</Text>
          </View>
        </View>

        {/* Reports List */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Users color={colors.textSecondary} size={20} />
              <Text 
                className="text-lg font-semibold ml-2"
                style={{ color: colors.text }}
              >
                Tüm Kullanıcı Raporları
              </Text>
            </View>
            <Text 
              className="text-sm"
              style={{ color: colors.textSecondary }}
            >
              {filteredReports.length} rapor
            </Text>
          </View>

          <ReportsList 
            data={filteredReports} 
            onImagePress={(uris: string[], index: number) => {
              // Handle image preview
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
        </View>
      </View>
    </SafeAreaView>
  );
}
