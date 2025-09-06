import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Text } from '~/components/ui/text';
import { Form } from '~/types'; // Hata: 'Report' idi, 'Form' olarak düzeltildi
import { useTheme } from '~/hooks/useTheme';
import { Clock } from 'lucide-react-native';

// Bileşenin alacağı propları tanımla
interface ReportCardProps {
  report: Form; // Hata: 'Report' idi, 'Form' olarak düzeltildi
  onImagePress: (index: number) => void;
}

export default function ReportCard({ report, onImagePress }: ReportCardProps) {
  const { colors } = useTheme();
  
  // Zaman formatlama fonksiyonu
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <View className="mb-4 rounded-xl p-4" style={{ backgroundColor: colors.surface }}>
      {/* Kartın üst kısmı */}
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-lg font-bold" style={{ color: colors.text }}>
            {report.title}
          </Text>
          <Text className="text-sm" style={{ color: colors.textSecondary }}>
            Barkod: {report.barcode}
          </Text>
        </View>
        <Text 
          className="text-xs font-semibold px-2 py-1 rounded-full" 
          style={{ 
            backgroundColor: report.status === 'Tamamlandı' ? colors.success + '20' : colors.warning + '20',
            color: report.status === 'Tamamlandı' ? colors.success : colors.warning,
          }}
        >
          {report.status}
        </Text>
      </View>

      {/* Kartın orta kısmı */}
      <View className="my-3">
        <Text style={{ color: colors.text }}>{report.note}</Text>
        <Text style={{ color: colors.textSecondary, marginTop: 4 }}>
          Hata: {report.errorCode.code} - {report.errorCode.description}
        </Text>
      </View>

      {/* Fotoğraflar */}
      {report.photos && report.photos.length > 0 && (
        <View className="flex-row flex-wrap">
          {report.photos.map((uri, index) => (
            <TouchableOpacity key={index} onPress={() => onImagePress(index)}>
              <Image 
                source={{ uri }} 
                className="w-16 h-16 rounded-lg mr-2 mb-2" 
              />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Kartın alt kısmı */}
      <View className="flex-row items-center mt-2 pt-2 border-t" style={{ borderColor: colors.border }}>
        <Clock size={14} color={colors.textSecondary} />
        <Text className="ml-2 text-xs" style={{ color: colors.textSecondary }}>
          {formatDate(report.createdAt)}
        </Text>
      </View>
    </View>
  );
}