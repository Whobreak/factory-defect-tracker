import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { User } from 'lucide-react-native';
import { useAuth } from '~/contexts/AuthContext';
import { useTheme } from '~/hooks/useTheme';
import { Text } from '~/components/ui/text';
import { LineService } from '~/services/line.service';
import { LineDto } from '~/types';

export default function HeaderBadge() {
  const { colors } = useTheme();
  const { user } = useAuth();

  const [lines, setLines] = useState<LineDto[]>([]);
  const [selectedLine, setSelectedLine] = useState<LineDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLines = async () => {
      setIsLoading(true);
      try {
        const response = await LineService.getLines();
        setLines(response.data);
        if (response.data.length > 0) {
          // Varsayılan olarak ilk bandı seç
          setSelectedLine(response.data[0]); 
        }
      } catch (error) {
        console.error("Çalışma bantları alınamadı:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLines();
  }, []);

  // BURASI SENİN ORİJİNAL TASARIMIN
  return (
    <View
      // İkon kaldırıldığı için sondaki boşluk (pr-4) azaltılabilir veya kaldırılabilir.
      className="flex-row items-center gap-x-4 rounded-full p-2 pr-3" 
      style={{ backgroundColor: colors.surface }}
    >
      {/* Profil İkonu */}
      <View
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: colors.primary }}
      >
        <User size={24} color="white" />
      </View>

      {/* Kullanıcı ve Hat Bilgisi */}
      <View>
        <Text className="text-base font-bold" style={{ color: colors.text }}>
          {user?.username || 'Kullanıcı Adı'}
        </Text>
        <Text className="text-sm" style={{ color: colors.textSecondary }}>
          {isLoading ? (
            'Yükleniyor...'
          ) : (
            selectedLine ? selectedLine.name : 'Hat Seçilmedi'
          )}
        </Text>
      </View>
      
      {/* Hat değiştirme ikonu ve butonu kaldırıldı. */}
    </View>
  );
}