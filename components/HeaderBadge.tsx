// components/HeaderBadge.tsx
import React from "react";
import { View, Text, Dimensions } from "react-native";
import { Building2, User, Zap } from "lucide-react-native";
import { useTheme } from "~/hooks/useTheme";

type Props = {
  name: string;
  line: string;
};

export default function HeaderBadge({ name, line }: Props) {
  const { colors, isDark } = useTheme();
  const { width } = Dimensions.get('window');
  
  // Responsive design - küçük ekranlarda daha kompakt
  const isSmallScreen = width < 350;

  return (
    <View 
      className={`rounded-2xl mb-4 shadow-lg overflow-hidden relative ${isSmallScreen ? 'mx-1' : 'mx-0'}`}
      style={{ backgroundColor: colors.surface }}
    >
      {/* Gradient background overlay */}
      <View 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundColor: colors.primary,
        }}
      />
      
      {/* Ana içerik */}
      <View className={`p-4 ${isSmallScreen ? 'p-3' : 'p-4'}`}>
        {/* Üst kısım - Hoşgeldin mesajı */}
        <View className="flex-row items-center mb-3">
          <View 
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: colors.primary }}
          >
            <User color={colors.primaryForeground} size={20} />
          </View>
          <View className="flex-1">
            <Text 
              className={`text-xs uppercase tracking-wider opacity-70 ${isSmallScreen ? 'text-xs' : 'text-sm'}`}
              style={{ color: colors.textSecondary }}
            >
              Hoşgeldin
            </Text>
            <Text 
              className={`font-bold ${isSmallScreen ? 'text-lg' : 'text-xl'}`}
              style={{ color: colors.text }}
              numberOfLines={1}
            >
              {name}
            </Text>
          </View>
        </View>

        {/* Alt kısım - Hat bilgisi */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View 
              className="w-8 h-8 rounded-lg items-center justify-center mr-3"
              style={{ backgroundColor: colors.surfaceSecondary }}
            >
              <Building2 color={colors.primary} size={16} />
            </View>
            <View>
              <Text 
                className="text-xs opacity-70"
                style={{ color: colors.textSecondary }}
              >
                Çalışma Hattı
              </Text>
              <Text 
                className={`font-semibold ${isSmallScreen ? 'text-sm' : 'text-base'}`}
                style={{ color: colors.text }}
              >
                {line}
              </Text>
            </View>
          </View>

          {/* Status indicator */}
          <View className="flex-row items-center">
            <View 
              className="w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: colors.success }}
            />
            <Text 
              className="text-xs font-medium"
              style={{ color: colors.textSecondary }}
            >
              Aktif
            </Text>
          </View>
        </View>

        {/* Decorative elements */}
        <View className="absolute top-0 right-0 w-20 h-20 opacity-5">
          <Zap 
            color={colors.primary} 
            size={80} 
            style={{ transform: [{ rotate: '15deg' }] }}
          />
        </View>
      </View>
    </View>
  );
}