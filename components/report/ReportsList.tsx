import React from 'react';
// 1. Gerekli tipleri react-native'den import et
import { FlatList, View, RefreshControl, RefreshControlProps } from 'react-native'; 
import { Text } from '~/components/ui/text';
import ReportCard from '~/components/ReportCard';
import { Form } from '~/types';
import { useTheme } from '~/hooks/useTheme';

// Bileşenin alacağı propları tanımla
interface ReportsListProps {
  data: Form[];
  onImagePress: (uris: string[], index: number) => void;
  // 2. refreshControl'ün tipini ReactElement<RefreshControlProps> olarak düzelt
  refreshControl: React.ReactElement<RefreshControlProps>; 
}

export default function ReportsList({ data, onImagePress, refreshControl }: ReportsListProps) {
  const { colors } = useTheme();

  // ==========================================================
  // AŞAĞIDAKİ TÜM TASARIM KODUN (JSX) TAMAMEN AYNI KALDI
  // ==========================================================
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <ReportCard 
          report={item}
          onImagePress={(index) => onImagePress(item.photos, index)} 
        />
      )}
      ListEmptyComponent={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
          <Text style={{ color: colors.textSecondary }}>Henüz rapor bulunmuyor.</Text>
        </View>
      }
      refreshControl={refreshControl}
    />
  );
}